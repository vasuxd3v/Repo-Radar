import { gunzipSync } from 'zlib';
import { Octokit } from '@octokit/rest';
import type { BobExplanation } from './types';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const README_NAMES = new Set(['readme.md', 'readme', 'readme.txt', 'readme.rst']);
const CODE_EXTS = new Set(['ts', 'tsx', 'js', 'jsx', 'py', 'rs', 'go', 'java', 'c', 'cpp', 'cs', 'rb', 'swift', 'kt']);
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.next', 'vendor', '__pycache__', 'coverage', '.cache']);
const SKIP_EXTS = new Set(['png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'woff', 'woff2', 'ttf', 'eot', 'lock', 'sum', 'mod', 'pdf', 'zip']);

function pickFiles(paths: string[]): string[] {
  const selected: string[] = [];

  const readme = paths.find((p) => README_NAMES.has(p.split('/').pop()?.toLowerCase() ?? ''));
  if (readme) selected.push(readme);

  for (const path of paths) {
    if (selected.length >= 4) break;
    if (selected.includes(path)) continue;

    const parts = path.split('/');
    const filename = parts[parts.length - 1];
    const ext = filename.split('.').pop()?.toLowerCase() ?? '';

    if (SKIP_EXTS.has(ext)) continue;
    if (parts.some((d) => SKIP_DIRS.has(d))) continue;
    if (!CODE_EXTS.has(ext)) continue;

    const isRoot = parts.length === 1;
    const isInSrcOrLib = parts.length >= 2 && (parts[0] === 'src' || parts[0] === 'lib');
    if (isRoot || isInSrcOrLib) selected.push(path);
  }

  return selected.slice(0, 4);
}

async function fetchFileContent(owner: string, repo: string, path: string): Promise<string> {
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${path}`;
  const headers: Record<string, string> = {};
  if (process.env.GITHUB_TOKEN) headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) return '';
    const text = await res.text();
    return text.length > 3000 ? text.slice(0, 3000) + '\n... [truncated]' : text;
  } catch {
    return '';
  }
}

// IBM Bob REST API call — no CLI needed, works on any hosting platform.
async function callBobAPI(system: string, userMessage: string): Promise<string> {
  const endpoint = (process.env.IBM_BOB_ENDPOINT || '').replace(/\/$/, '');
  const apiKey   = process.env.IBM_BOB_API_KEY || '';
  const model    = process.env.IBM_BOB_MODEL   || 'bob-v1';

  const res = await fetch(`${endpoint}/messages`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
    body:    JSON.stringify({
      model,
      max_tokens: 2048,
      system,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  const buf = Buffer.from(await res.arrayBuffer());
  let raw: string;
  try   { raw = gunzipSync(buf).toString('utf-8'); }
  catch { raw = buf.toString('utf-8'); }

  if (!res.ok) throw new Error(`Bob API ${res.status}: ${raw}`);

  const data = JSON.parse(raw);
  if (Array.isArray(data.content)) return data.content[0]?.text ?? raw;
  return data.completion ?? data.text ?? data.output ?? raw;
}

// Extract the first well-formed JSON object from Bob's output.
function extractJSON(raw: string): string {
  // Strip ANSI/VT escape sequences (terminal colors Bob Shell emits)
  const clean = raw
    .replace(/\x1B\[[0-9;]*[A-Za-z]/g, '')
    .replace(/\x1B\][^\x07]*\x07/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // other control chars
    .replace(/```json\n?|\n?```/g, '');

  // Walk character-by-character tracking brace depth and string context
  // so we correctly find the first complete {...} JSON object
  let start = -1;
  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = 0; i < clean.length; i++) {
    const c = clean[i];

    if (escape) { escape = false; continue; }
    if (c === '\\' && inString) { escape = true; continue; }
    if (c === '"') { inString = !inString; continue; }
    if (inString) continue;

    if (c === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (c === '}') {
      depth--;
      if (depth === 0 && start >= 0) {
        return clean.slice(start, i + 1);
      }
    }
  }

  // Fallback: simple first/last brace slice
  const first = clean.indexOf('{');
  const last = clean.lastIndexOf('}');
  return first >= 0 && last > first ? clean.slice(first, last + 1) : clean.trim();
}

async function getAIResponse(system: string, userMessage: string): Promise<string> {
  return callBobAPI(system, userMessage);
}

export async function explainRepository(
  repoOwner: string,
  repoName: string,
  userQuery: string,
  experienceLevel: string
): Promise<BobExplanation> {
  const fallback: BobExplanation = {
    overview: 'IBM Bob was unable to analyze this repository. Please try again.',
    architecture: '',
    keyPatterns: [],
    whereToStart: '',
    learningValue: '',
    bobNote: '',
  };

  try {
    const treeRes = await octokit.git.getTree({
      owner: repoOwner,
      repo: repoName,
      tree_sha: 'HEAD',
      recursive: '1',
    });

    const filePaths = treeRes.data.tree
      .filter((item) => item.type === 'blob')
      .map((item) => item.path ?? '')
      .filter(Boolean);

    const selectedFiles = pickFiles(filePaths);

    const fileContents = await Promise.all(
      selectedFiles.map(async (path) => ({
        path,
        content: await fetchFileContent(repoOwner, repoName, path),
      }))
    );

    const readmeEntry = fileContents.find((f) =>
      README_NAMES.has(f.path.split('/').pop()?.toLowerCase() ?? '')
    );
    const readme = readmeEntry?.content ?? '(no README)';
    const codeFiles = fileContents
      .filter((f) => f !== readmeEntry && f.content)
      .map((f) => `// ${f.path}\n${f.content}`)
      .join('\n\n---\n\n');

    const system = `You are IBM Bob, an expert code analyst and developer educator. A developer has found a GitHub repository and wants to understand it deeply. Explain this codebase clearly and honestly, matching the developer's experience level.

Respond with ONLY a valid JSON object in this exact format — no markdown, no preamble, no explanation outside the JSON:

{
  "overview": "2-3 sentences describing what this project does and why it exists",
  "architecture": "2-3 sentences describing how the code is structured and what the main components are",
  "keyPatterns": [
    { "name": "pattern name", "explanation": "1-2 sentences explaining this pattern and why it matters" }
  ],
  "whereToStart": "1-2 sentences telling the developer exactly which file to open first and why",
  "learningValue": "1-2 sentences on what a developer at this experience level will learn from studying this repo",
  "bobNote": "1 sentence of honest advice — what to watch out for, what is particularly well done, or what to skip"
}`;

    const userMessage = `Repository: ${repoOwner}/${repoName}
The developer searched for: "${userQuery}"
Their experience level: ${experienceLevel}

README:
${readme}

Code files:
${codeFiles || '(none fetched)'}

Explain this repository.`;

    const rawText = await getAIResponse(system, userMessage);
    const parsed = JSON.parse(extractJSON(rawText));

    return {
      overview: parsed.overview ?? '',
      architecture: parsed.architecture ?? '',
      keyPatterns: Array.isArray(parsed.keyPatterns) ? parsed.keyPatterns : [],
      whereToStart: parsed.whereToStart ?? '',
      learningValue: parsed.learningValue ?? '',
      bobNote: parsed.bobNote ?? '',
    };
  } catch (err) {
    console.error('[RepoRadar] explainRepository failed:', err);
    return fallback;
  }
}
