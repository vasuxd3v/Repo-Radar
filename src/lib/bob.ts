import { gunzipSync } from 'zlib';
import { fetchReadme, RepoResult, SearchParams } from './github';
import type { ScoredRepo, SearchFilters } from './types';

export interface SearchPlan {
  hardRequirements: string[];
  searchQueries:    string[];
  triageKeywords:   string[];
}

// IBM Bob REST API — works on Render, Vercel, Railway, anywhere.
export async function callBob(
  messages: Array<{ role: string; content: string }>,
  system:   string,
  maxTokens = 512
) {
  const endpoint = (process.env.IBM_BOB_ENDPOINT || '').replace(/\/$/, '');
  const apiKey   = process.env.IBM_BOB_API_KEY || '';
  const model    = process.env.IBM_BOB_MODEL   || 'bob-v1';

  if (!endpoint || !apiKey) throw new Error('IBM_BOB_ENDPOINT and IBM_BOB_API_KEY env vars are required');

  const res = await fetch(`${endpoint}/messages`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
    body:    JSON.stringify({ model, max_tokens: maxTokens, system, messages }),
  });

  const buf = Buffer.from(await res.arrayBuffer());
  let raw: string;
  try   { raw = gunzipSync(buf).toString('utf-8'); }
  catch { raw = buf.toString('utf-8'); }

  if (!res.ok) throw new Error(`Bob API ${res.status}: ${raw}`);

  const data = JSON.parse(raw);
  // Already in Anthropic format: { content: [{ type:'text', text:'...' }] }
  if (Array.isArray(data.content)) return data;
  // Flat text fallback
  const text = data.completion ?? data.text ?? data.output ?? raw;
  return { content: [{ type: 'text' as const, text: String(text) }] };
}

function extractJSON(raw: string): string {
  const clean = raw
    .replace(/\x1B\[[0-9;]*[A-Za-z]/g, '')
    .replace(/\x1B\][^\x07]*\x07/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/```json\n?|\n?```/g, '');

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
      if (depth === 0 && start >= 0) return clean.slice(start, i + 1);
    }
  }

  const first = clean.indexOf('{');
  const last = clean.lastIndexOf('}');
  return first >= 0 && last > first ? clean.slice(first, last + 1) : clean.trim();
}

// Step 1 + 2: Extract hard requirements and generate multi-angle search queries
export async function extractSearchPlan(filters: SearchFilters): Promise<SearchPlan> {
  const userContext = [
    filters.query          && `What I need: ${filters.query}`,
    filters.projectContext && `Project: ${filters.projectContext}`,
    filters.language       && `Language: ${filters.language}`,
    filters.platform       && `Platform: ${filters.platform}`,
    filters.scale          && `Scale: ${filters.scale}`,
    filters.purpose        && `Purpose: ${filters.purpose}`,
    `Experience level: ${filters.experience}`,
  ].filter(Boolean).join('\n');

  const system = `You are a GitHub search expert. Analyze a developer's request and produce a structured search plan.

Return ONLY valid JSON (no markdown, no preamble):
{
  "hardRequirements": string[],
  "searchQueries": string[],
  "triageKeywords": string[]
}

Rules for searchQueries:
- Map implied concepts (e.g. "25 min focus + 5 min break" → "pomodoro", "track expenses" → "budget tracker")
- Each query should be 2-4 words covering a DIFFERENT angle
- Use technical terms that appear in repo names, descriptions, or README files
- Never include the programming language name (filtered separately)
- Never use generic words: "simple", "project", "program", "tool", "app", "code", "example"

Example — for "python pomodoro timer with tkinter GUI and CSV session logging":
{
  "hardRequirements": ["Pomodoro 25/5 timer cycles", "GUI (tkinter or PyQt)", "CSV session history logging", "stats display"],
  "searchQueries": ["pomodoro timer tkinter", "pomodoro gui session csv", "pomodoro desktop stats tracker"],
  "triageKeywords": ["pomodoro", "timer", "focus"]
}`;

  const message = await callBob([{ role: 'user', content: userContext }], system, 600);
  const text = message.content[0].type === 'text' ? message.content[0].text : '{}';
  const parsed = JSON.parse(extractJSON(text));
  return {
    hardRequirements: Array.isArray(parsed.hardRequirements) ? parsed.hardRequirements : [],
    searchQueries: Array.isArray(parsed.searchQueries) && parsed.searchQueries.length > 0
      ? parsed.searchQueries.slice(0, 3)
      : [filters.query || filters.language || 'tool'],
    triageKeywords: Array.isArray(parsed.triageKeywords) ? parsed.triageKeywords : [],
  };
}

// Steps 4+5: Score candidates with requirement-fit-first rubric
export async function analyzeRepos(
  repos: RepoResult[],
  hardRequirements: string[],
  filters: SearchFilters,
  onStep: (msg: string) => void
): Promise<{ results: ScoredRepo[] }> {
  const candidates = repos.slice(0, 12);
  onStep(`Fetching READMEs for ${candidates.length} candidates...`);

  const reposWithReadmes = await Promise.all(
    candidates.map(async (repo) => ({
      ...repo,
      readme: await fetchReadme(repo.name),
    }))
  );

  onStep('Scoring with requirement-fit rubric...');

  const requirementsList = hardRequirements.length > 0
    ? hardRequirements.map((r, i) => `${i + 1}. ${r}`).join('\n')
    : '(infer from user context below)';

  const userContext = [
    filters.query          && `Goal: ${filters.query}`,
    filters.projectContext && `Project: ${filters.projectContext}`,
    filters.language       && `Language: ${filters.language}`,
    filters.platform       && `Platform: ${filters.platform}`,
    filters.scale          && `Scale: ${filters.scale}`,
    filters.purpose        && `Purpose: ${filters.purpose}`,
    `Experience: ${filters.experience}`,
  ].filter(Boolean).join('\n');

  const repoSummaries = reposWithReadmes
    .map((r, i) => `[${i}] ${r.name}
Stars: ${r.stars} | Language: ${r.language ?? 'unknown'} | Topics: ${r.topics.join(', ') || 'none'}
Description: ${r.description ?? 'none'}
Last updated: ${r.lastUpdated}
README (first 2000 chars):
${r.readme?.slice(0, 2000) ?? '(no README)'}
---`)
    .join('\n\n');

  const system = `You are evaluating GitHub repositories against specific hard requirements.

Hard requirements the user needs:
${requirementsList}

User context:
${userContext}

Score each repository using this rubric:

requirementFit (0-10) — HIGHEST PRIORITY, weight 0.40
  10 = all hard requirements already implemented
  7-9 = most requirements met, trivial gaps
  4-6 = some requirements met, significant gaps
  1-3 = wrong domain or fundamentally mismatched

effortToAdapt (0-10) — HIGH PRIORITY, weight 0.30
  10 = clear extension points, missing features trivial to add
  7-9 = clean code structure, moderate effort to extend
  4-6 = significant refactoring needed
  1-3 = essentially a full rewrite to match requirements

codeReadability (0-10) — MEDIUM, weight 0.20
  Clean structure, small surface area, sensible file layout, minimal dependencies

trustSignals (0-10) — LOW-MEDIUM, weight 0.10
  README quality, usage instructions, recent activity, runnable as-is

Composite = (requirementFit × 0.40) + (effortToAdapt × 0.30) + (codeReadability × 0.20) + (trustSignals × 0.10)

EXCLUDE any repo where requirementFit < 3.

For each included repo write:
- "explanation": 2-3 sentences on requirement fit and what is missing
- "whyLearnFrom": 1 sentence — best direct match or best base to extend?

Return ONLY a valid JSON array (no markdown fences):
[{"index":number,"scores":{"requirementFit":number,"effortToAdapt":number,"codeReadability":number,"trustSignals":number,"composite":number},"explanation":"...","whyLearnFrom":"..."}]`;

  try {
    const message = await callBob(
      [{ role: 'user', content: `Repositories to evaluate:\n\n${repoSummaries}` }],
      system,
      4096
    );

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '[]';
    const firstBracket = responseText.indexOf('[');
    const lastBracket = responseText.lastIndexOf(']');
    const cleaned = firstBracket >= 0 && lastBracket > firstBracket
      ? responseText.slice(firstBracket, lastBracket + 1)
      : responseText.replace(/```json\n?|\n?```/g, '').trim();

    const scored: Array<{
      index: number;
      scores: ScoredRepo['scores'];
      explanation: string;
      whyLearnFrom: string;
    }> = JSON.parse(cleaned);

    const results: ScoredRepo[] = scored
      .map(({ index, scores, explanation, whyLearnFrom }) => ({
        ...reposWithReadmes[index],
        scores,
        explanation,
        whyLearnFrom: whyLearnFrom ?? '',
      }))
      .filter(Boolean)
      .sort((a, b) => b.scores.composite - a.scores.composite)
      .slice(0, 8);

    onStep(`Done. Returning top ${results.length} repositories.`);
    return { results };
  } catch (err) {
    console.error('[RepoRadar] analyzeRepos failed:', err);
    onStep('Scoring failed — returning unscored candidates.');
    return {
      results: repos.slice(0, 8).map((r) => ({
        ...r,
        scores: { requirementFit: 5, effortToAdapt: 5, codeReadability: 5, trustSignals: 5, composite: 5 },
        explanation: 'Score unavailable.',
        whyLearnFrom: '',
      })),
    };
  }
}

// Keep parseSearchIntent exported for any legacy callers
export async function parseSearchIntent(query: string, _level: string): Promise<SearchParams> {
  const system = `You are a GitHub search expert. Convert a plain-English description into a GitHub search query.
Return ONLY valid JSON: { "query": string }
Map implied concepts (e.g. "25 min focus + 5 min break" → "pomodoro"). 2-4 precise technical keywords, no language names.`;
  try {
    const message = await callBob([{ role: 'user', content: query }], system, 256);
    const text = message.content[0].type === 'text' ? message.content[0].text : '{}';
    const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim());
    return { perPage: 20, ...parsed };
  } catch {
    return { query: query.split(' ').slice(0, 3).join(' '), perPage: 20 };
  }
}
