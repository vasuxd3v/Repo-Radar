import { NextRequest, NextResponse } from 'next/server';
import { searchRepos } from '@/lib/github';
import { extractSearchPlan as extractPlanBob } from '@/lib/bob';
import { extractSearchPlan as extractPlanClaude, analyzeRepos } from '@/lib/claude';
import type { SearchFilters } from '@/lib/types';
import type { SearchPlan } from '@/lib/bob';

const MIN_STARS: Record<string, number> = {
  beginner:     5,
  intermediate: 30,
  advanced:     100,
};

const STAR_CEILING_BY_SCALE: Record<string, number> = {
  'single-file': 1000,
  'small':       5000,
  'medium':      30000,
  'production':  Infinity,
  '':            Infinity,
};
const STAR_CEILING_BY_EXP: Record<string, number> = {
  beginner:     3000,
  intermediate: 20000,
  advanced:     Infinity,
};

function starCeiling(filters: SearchFilters): number {
  return Math.min(
    STAR_CEILING_BY_SCALE[filters.scale] ?? Infinity,
    STAR_CEILING_BY_EXP[filters.experience] ?? Infinity,
  );
}

function dedupe(repos: Awaited<ReturnType<typeof searchRepos>>) {
  const seen = new Set<string>();
  return repos.filter((r) => { if (seen.has(r.url)) return false; seen.add(r.url); return true; });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const filters = body.filters as SearchFilters;

    if (!filters || typeof filters !== 'object') {
      return NextResponse.json({ error: 'filters object is required' }, { status: 400 });
    }
    if (!filters.experience) filters.experience = 'intermediate';

    const steps: string[] = [];
    const step = (msg: string) => steps.push(msg);

    // ── Step 1+2: Extract requirements and search queries via AI ──
    step('Translating your request into requirements and search queries...');
    let plan: SearchPlan;
    try {
      plan = await extractPlanBob(filters);
      step(`Using IBM BOB for search planning.`);
    } catch {
      step('Falling back to Claude for search planning...');
      plan = await extractPlanClaude(filters);
    }
    step(`Requirements: ${plan.hardRequirements.join(' · ') || 'inferred from context'}`);
    step(`Search angles: ${plan.searchQueries.map((q) => `"${q}"`).join(', ')}`);

    // ── Step 2: Run all search queries in parallel ──
    const baseParams = {
      language: filters.language || undefined,
      minStars: MIN_STARS[filters.experience] ?? 30,
      sort:     'best-match' as const,
      perPage:  20,
    };

    const allResults = await Promise.all(
      plan.searchQueries.map((q) => searchRepos({ ...baseParams, query: q }))
    );
    let repos = dedupe(allResults.flat());
    step(`GitHub returned ${repos.length} candidates across ${plan.searchQueries.length} queries.`);

    // ── Step 3a: Star ceiling — reject repos too large for the requested scale/experience ──
    const ceiling = starCeiling(filters);
    if (ceiling < Infinity && repos.length > 0) {
      const before = repos.length;
      repos = repos.filter((r) => r.stars <= ceiling);
      if (repos.length < before) {
        step(`Dropped ${before - repos.length} oversized repos (>${ceiling.toLocaleString()}★).`);
      }
    }

    // ── Step 3b: Triage — reject repos that don't mention core domain keywords ──
    if (plan.triageKeywords.length > 0 && repos.length > 4) {
      const kws = plan.triageKeywords.map((k) => k.toLowerCase());
      const triaged = repos.filter((repo) => {
        const haystack = [repo.name, repo.description ?? '', ...repo.topics].join(' ').toLowerCase();
        return kws.some((k) => haystack.includes(k));
      });
      if (triaged.length >= 3) {
        const removed = repos.length - triaged.length;
        if (removed > 0) step(`Triage: removed ${removed} off-topic repos.`);
        repos = triaged;
      }
    }

    // ── Retry without star filter if needed ──
    if (repos.length === 0) {
      step('No results after filtering — retrying with relaxed star filter...');
      const retryAll = await Promise.all(
        plan.searchQueries.map((q) => searchRepos({ ...baseParams, query: q, minStars: 0 }))
      );
      repos = dedupe(retryAll.flat());
    }

    if (repos.length === 0) {
      return NextResponse.json({
        results: [],
        steps: [...steps, 'No repositories found. Try different keywords or language.'],
      });
    }

    // ── Steps 4+5: Score with requirement-fit-first rubric ──
    step(`Analyzing ${Math.min(repos.length, 12)} candidates...`);
    const { results } = await analyzeRepos(repos, plan.hardRequirements, filters, step);

    return NextResponse.json({ results, steps });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[RepoRadar] search error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
