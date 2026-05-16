import { spawn } from 'child_process';
import { fetchReadme, RepoResult } from './github';
import type { ScoredRepo, SearchFilters } from './types';
import type { SearchPlan } from './bob';
export type { ScoredRepo, SearchFilters } from './types';

const CLAUDE_BIN = process.env.CLAUDE_BIN || `${process.env.HOME}/.local/bin/claude`;
const CLAUDE_TIMEOUT_MS = 150_000;

export async function callClaude(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      CLAUDE_BIN,
      ['-p', '--output-format', 'text', '--dangerously-skip-permissions'],
      { env: process.env }
    );

    let stdout = '';
    let stderr = '';

    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error('Claude CLI timed out after 150s'));
    }, CLAUDE_TIMEOUT_MS);

    child.stdout.on('data', (d) => { stdout += d.toString(); });
    child.stderr.on('data', (d) => { stderr += d.toString(); });

    child.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) resolve(stdout.trim());
      else reject(new Error(`Claude CLI exited ${code}: ${stderr.trim() || 'no output'}`));
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      reject(new Error(`Cannot start Claude CLI: ${err.message}`));
    });

    child.stdin.write(prompt);
    child.stdin.end();
  });
}

// ── step 1+2: search planning ───────────────────────────────────────────────

export async function extractSearchPlan(filters: SearchFilters): Promise<SearchPlan> {
  const context = [
    filters.query          && `What I need: ${filters.query}`,
    filters.projectContext && `Project: ${filters.projectContext}`,
    filters.language       && `Language: ${filters.language}`,
    filters.platform       && `Platform: ${filters.platform}`,
    filters.scale          && `Scale: ${filters.scale}`,
    filters.purpose        && `Purpose: ${filters.purpose}`,
    `Experience: ${filters.experience}`,
  ].filter(Boolean).join('\n');

  const prompt = `You are a GitHub search expert. Analyze this developer request and produce a structured search plan.

${context}

Return ONLY valid JSON (no markdown, no fences):
{
  "hardRequirements": string[],
  "searchQueries": string[],
  "triageKeywords": string[]
}

Rules for searchQueries:
- 2-3 queries each covering a DIFFERENT search angle, 2-4 words each
- Map implied concepts: "25 min focus + 5 min break" → "pomodoro", "track expenses" → "budget tracker"
- Use technical terms that appear in GitHub repo names/descriptions
- No language names, no generic words like "simple", "project", "program", "tool"

Example for a Python pomodoro timer with GUI and CSV logging:
{"hardRequirements":["Pomodoro 25/5 cycles","tkinter GUI","CSV session logging","stats display"],"searchQueries":["pomodoro timer tkinter","pomodoro gui session csv","pomodoro desktop tracker"],"triageKeywords":["pomodoro","timer","focus"]}`;

  try {
    const text = await callClaude(prompt);
    const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim());
    return {
      hardRequirements: Array.isArray(parsed.hardRequirements) ? parsed.hardRequirements : [],
      searchQueries: Array.isArray(parsed.searchQueries) && parsed.searchQueries.length > 0
        ? parsed.searchQueries.slice(0, 3)
        : [filters.query || filters.language || 'tool'],
      triageKeywords: Array.isArray(parsed.triageKeywords) ? parsed.triageKeywords : [],
    };
  } catch (err) {
    console.error('[RepoRadar] extractSearchPlan failed:', err);
    return {
      hardRequirements: [],
      searchQueries: [filters.query || filters.projectContext || filters.language || 'tool'],
      triageKeywords: [],
    };
  }
}

// ── step 4+5: scoring ───────────────────────────────────────────────────────

export async function analyzeRepos(
  repos: RepoResult[],
  hardRequirements: string[],
  filters: SearchFilters,
  onStep: (msg: string) => void
): Promise<{ results: ScoredRepo[] }> {
  const { query, projectContext, experience, language } = filters;

  const candidates = repos.slice(0, 12);
  onStep(`Reading READMEs for ${candidates.length} repositories...`);

  const reposWithReadmes = await Promise.all(
    candidates.map(async (repo) => {
      onStep(`  Fetching ${repo.name}...`);
      return { ...repo, readme: await fetchReadme(repo.name) };
    })
  );

  onStep('All READMEs fetched. Sending to Claude for deep analysis...');

  const { platform, scale, purpose } = filters;
  const userIntent = [
    query && `Goal: ${query}`,
    projectContext && `Project context: ${projectContext}`,
    language && `Language: ${language}`,
    platform && `Platform: ${platform}`,
    scale && `Expected repo size: ${scale}`,
    purpose && `Repo purpose/type: ${purpose}`,
    `Experience level: ${experience}`,
  ].filter(Boolean).join('\n');

  const repoSummaries = reposWithReadmes
    .map(
      (r, i) => `[${i}] ${r.name}
Stars: ${r.stars} | Language: ${r.language ?? 'unknown'} | Topics: ${r.topics.join(', ') || 'none'}
Owner bio: ${r.ownerBio ?? 'n/a'}
Description: ${r.description ?? 'none'}
Last updated: ${r.lastUpdated}
README (first 2000 chars):
${r.readme?.slice(0, 2000) ?? '(no README)'}
---`
    )
    .join('\n\n');

  const requirementsList = hardRequirements.length > 0
    ? hardRequirements.map((r, i) => `${i + 1}. ${r}`).join('\n')
    : '(infer from user context)';

  const prompt = `You are evaluating GitHub repositories against specific hard requirements.

Hard requirements the user needs:
${requirementsList}

User context:
${userIntent}

Score each repository using this requirement-fit-first rubric:

requirementFit (0-10) — HIGHEST PRIORITY, weight 0.40
  10 = all requirements already implemented
  7-9 = most requirements met, trivial gaps
  4-6 = some requirements met, significant gaps
  1-3 = wrong domain or fundamentally mismatched

effortToAdapt (0-10) — HIGH PRIORITY, weight 0.30
  10 = clear extension points, trivial to add missing features
  7-9 = clean code, moderate effort to extend
  4-6 = significant refactoring needed
  1-3 = essentially a full rewrite

codeReadability (0-10) — MEDIUM, weight 0.20
  Clean structure, small surface area, sensible file layout, minimal dependencies

trustSignals (0-10) — LOW-MEDIUM, weight 0.10
  README quality, usage instructions, recent activity, runnable as-is

Composite = (requirementFit × 0.40) + (effortToAdapt × 0.30) + (codeReadability × 0.20) + (trustSignals × 0.10)

EXCLUDE repos where requirementFit < 3.
Also write "whyLearnFrom" — is this the best direct match or best base to extend?

Return ONLY a valid JSON array (no markdown, no fences):
[{"index":number,"scores":{"requirementFit":number,"effortToAdapt":number,"codeReadability":number,"trustSignals":number,"composite":number},"explanation":"2-3 sentences on requirement fit and gaps","whyLearnFrom":"1 sentence"}]

Repositories:
${repoSummaries}`;

  const responseText = await callClaude(prompt);
  onStep('Claude analysis complete. Ranking by composite score...');

  const cleaned = responseText.replace(/```json\n?|\n?```/g, '').trim();
  const scored: Array<{
    index: number;
    scores: ScoredRepo['scores'];
    explanation: string;
    whyLearnFrom: string;
  }> = JSON.parse(cleaned);

  const allScored = scored
    .map(({ index, scores, explanation, whyLearnFrom }) => ({
      ...reposWithReadmes[index],
      scores,
      explanation,
      whyLearnFrom: whyLearnFrom ?? '',
    }))
    .filter(Boolean)
    .sort((a, b) => b.scores.composite - a.scores.composite);

  const relevant = allScored.filter((r) => r.scores.requirementFit >= 3);
  const results: ScoredRepo[] = (relevant.length > 0 ? relevant : allScored).slice(0, 8);

  onStep(`Done. Returning top ${results.length} repositories.`);
  return { results };
}
