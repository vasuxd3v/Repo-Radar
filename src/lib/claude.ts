import { spawn } from 'child_process';
import { fetchReadme, RepoResult } from './github';
import type { ScoredRepo, SearchFilters } from './types';
import type { SearchPlan } from './bob';
export type { ScoredRepo, SearchFilters } from './types';

const CLAUDE_BIN = process.env.CLAUDE_BIN || `${process.env.HOME}/.local/bin/claude`;
const CLAUDE_TIMEOUT_MS = 210_000;

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

// ── step 1+2: search planning ────────────────────────────────────────────────

export async function extractSearchPlan(filters: SearchFilters): Promise<SearchPlan> {
  const isBeginner = filters.experience === 'beginner';

  const context = [
    filters.query          && `What I need: ${filters.query}`,
    filters.projectContext && `Project: ${filters.projectContext}`,
    filters.language       && `Language: ${filters.language}`,
    filters.platform       && `Platform: ${filters.platform}`,
    filters.scale          && `Scale: ${filters.scale}`,
    filters.purpose        && `Purpose: ${filters.purpose}`,
    `Experience: ${filters.experience}`,
  ].filter(Boolean).join('\n');

  const experienceGuidance = isBeginner
    ? `IMPORTANT — experience is BEGINNER:
- At least one query must target tutorials, examples, or educational repos (e.g. append "tutorial", "example", "beginner", "demo", or "learning" to a query)
- Prefer repos that teach concepts over production tools
- Avoid queries that would return advanced/kernel/production-grade tooling`
    : filters.experience === 'advanced'
    ? `IMPORTANT — experience is ADVANCED:
- Target production-quality, well-architected implementations
- Prefer repos showing real engineering decisions over toy examples`
    : '';

  const prompt = `You are a GitHub search expert. Analyze this developer request and produce a structured search plan.

${context}

${experienceGuidance}

Return ONLY valid JSON (no markdown, no fences):
{
  "hardRequirements": string[],
  "searchQueries": string[],
  "triageKeywords": string[]
}

Rules for searchQueries:
- Exactly 3 queries, each covering a DIFFERENT angle (topic angle / beginner angle / alternative naming angle)
- Map implied concepts: "25 min focus + 5 min break" → "pomodoro", "track expenses" → "budget tracker"
- Use technical terms that appear in GitHub repo names/descriptions
- No language names in queries (language is filtered separately)
- No generic words: "simple", "project", "program", "tool", "app", "code"

Example for a Python pomodoro timer with GUI and CSV logging (beginner):
{"hardRequirements":["Pomodoro 25/5 cycles","tkinter GUI","CSV session logging"],"searchQueries":["pomodoro timer tkinter","pomodoro gui session csv","pomodoro tutorial beginner"],"triageKeywords":["pomodoro","timer","focus"]}`;

  try {
    const text = await callClaude(prompt);
    const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim());
    return {
      hardRequirements: Array.isArray(parsed.hardRequirements) ? parsed.hardRequirements : [],
      searchQueries: Array.isArray(parsed.searchQueries) && parsed.searchQueries.length > 0
        ? parsed.searchQueries.slice(0, 3)
        : [filters.query || filters.language || 'tutorial'],
      triageKeywords: Array.isArray(parsed.triageKeywords) ? parsed.triageKeywords : [],
    };
  } catch (err) {
    console.error('[RepoRadar] extractSearchPlan failed:', err);
    return {
      hardRequirements: [],
      searchQueries: [filters.query || filters.projectContext || filters.language || 'tutorial'],
      triageKeywords: [],
    };
  }
}

// ── step 4+5: scoring ────────────────────────────────────────────────────────

export async function analyzeRepos(
  repos: RepoResult[],
  hardRequirements: string[],
  filters: SearchFilters,
  onStep: (msg: string) => void
): Promise<{ results: ScoredRepo[] }> {
  const { query, projectContext, experience, language } = filters;

  // Analyze up to 15 candidates — enough for a good ranking without blowing the prompt budget
  const candidates = repos.slice(0, 15);
  onStep(`Reading READMEs for ${candidates.length} repositories...`);

  const reposWithReadmes = await Promise.all(
    candidates.map(async (repo) => ({ ...repo, readme: await fetchReadme(repo.name) }))
  );

  onStep('All READMEs fetched. Running deep analysis...');

  const { platform, scale, purpose } = filters;
  const userIntent = [
    query          && `Goal: ${query}`,
    projectContext && `Project context: ${projectContext}`,
    language       && `Language: ${language}`,
    platform       && `Platform: ${platform}`,
    scale          && `Expected repo size: ${scale}`,
    purpose        && `Repo purpose/type: ${purpose}`,
    `Experience level: ${experience}`,
  ].filter(Boolean).join('\n');

  const repoSummaries = reposWithReadmes
    .map(
      (r, i) => `[${i}] ${r.name}
Stars: ${r.stars} | Language: ${r.language ?? 'unknown'} | Topics: ${r.topics.join(', ') || 'none'}
Owner bio: ${r.ownerBio ?? 'n/a'}
Description: ${r.description ?? 'none'}
Last updated: ${r.lastUpdated}
README (first 1000 chars):
${r.readme?.slice(0, 1000) ?? '(no README)'}
---`
    )
    .join('\n\n');

  const requirementsList = hardRequirements.length > 0
    ? hardRequirements.map((r, i) => `${i + 1}. ${r}`).join('\n')
    : '(infer from user context)';

  const prompt = `You are evaluating GitHub repositories for a developer with experience level: ${experience}.

Hard requirements:
${requirementsList}

User context:
${userIntent}

Score EVERY repository in the list. Do not skip any. Use this rubric:

requirementFit (0-10) — weight 0.40
  How well does this repo match what the user is asking for?
  10 = perfect match, 5 = partially useful, 1 = completely wrong domain

effortToAdapt (0-10) — weight 0.30
  How easy is it for someone at the stated experience level to read and learn from this code?
  10 = easy to follow for this experience level, 5 = doable with effort, 1 = inaccessible

codeReadability (0-10) — weight 0.20
  Clean structure, small surface area, sensible file layout, minimal dependencies

trustSignals (0-10) — weight 0.10
  README quality, usage instructions, recent activity, runnable as-is

Composite = (requirementFit × 0.40) + (effortToAdapt × 0.30) + (codeReadability × 0.20) + (trustSignals × 0.10)

For each repo write:
- "explanation": 2-3 sentences on how well it matches the requirements and experience level
- "whyLearnFrom": 1 sentence on what value it provides to this developer

Return ONLY a valid JSON array containing ALL repositories (no exclusions, no markdown):
[{"index":number,"scores":{"requirementFit":number,"effortToAdapt":number,"codeReadability":number,"trustSignals":number,"composite":number},"explanation":"...","whyLearnFrom":"..."}]

Repositories:
${repoSummaries}`;

  const responseText = await callClaude(prompt);
  onStep('Analysis complete. Ranking by composite score...');

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

  // Always return top 8. If enough repos score well (>= 4), prefer those.
  // Otherwise show the best available so the user always gets results.
  const goodFit  = allScored.filter((r) => r.scores.requirementFit >= 4);
  const results: ScoredRepo[] = (goodFit.length >= 4 ? goodFit : allScored).slice(0, 8);

  onStep(`Done. Returning top ${results.length} repositories.`);
  return { results };
}
