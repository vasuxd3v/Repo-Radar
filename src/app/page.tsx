'use client';

import { useState, useRef } from 'react';
import SearchForm from '@/components/SearchForm';
import LiveFeed from '@/components/LiveFeed';
import RepoCard from '@/components/RepoCard';
import type { ScoredRepo, SearchFilters } from '@/lib/types';

const DEFAULT_FILTERS: SearchFilters = {
  language: '',
  experience: 'intermediate',
  platform: '',
  scale: '',
  purpose: '',
  projectContext: '',
  query: '',
};

// Simulated steps shown while the request is in-flight
const LOADING_STEPS: { delay: number; msg: string }[] = [
  { delay: 0,     msg: 'Parsing your search intent...' },
  { delay: 600,   msg: 'Building GitHub search strategy...' },
  { delay: 1400,  msg: 'Querying GitHub API...' },
  { delay: 4000,  msg: 'Fetching READMEs and owner profiles for top candidates...' },
  { delay: 8000,  msg: 'Sending repository data to Claude for deep analysis...' },
  { delay: 14000, msg: 'Claude is scoring relevance, code quality, and human authorship...' },
  { delay: 22000, msg: 'Almost done — ranking final results by composite score...' },
];

export default function Home() {
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState<string[]>([]);
  const [results, setResults] = useState<ScoredRepo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  function clearTimers() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }

  async function handleSearch() {
    clearTimers();
    setLoading(true);
    setError(null);
    setResults([]);
    setDone(false);
    setSteps([]);

    // Animate fake steps while waiting for the API response
    const timers = LOADING_STEPS.map(({ delay, msg }) =>
      setTimeout(() => setSteps((prev) => [...prev, msg]), delay)
    );
    timersRef.current = timers;

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters }),
      });

      const data = await res.json();

      // Replace simulated steps with the real ones from the server
      clearTimers();

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.');
        setDone(true);
      } else {
        setSteps(data.steps ?? []);
        setResults(data.results ?? []);
        setDone(true);
      }
    } catch (err) {
      clearTimers();
      setError(err instanceof Error ? err.message : 'Network error. Please try again.');
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="relative max-w-4xl mx-auto px-4 py-12 flex flex-col gap-10">

        {/* Header */}
        <header className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-400 text-xs font-medium mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Powered by GitHub API + Claude (your Pro plan)
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-white">
            Repo<span className="text-indigo-400">Radar</span>
          </h1>
          <p className="text-zinc-400 text-base max-w-xl mx-auto leading-relaxed">
            Find real, human-written GitHub repositories that will actually teach you something.
            <br />
            <span className="text-zinc-600 text-sm">Claude reads the README, owner bio, and code quality — not just star counts.</span>
          </p>
        </header>

        {/* Search form */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 md:p-8">
          <SearchForm
            filters={filters}
            loading={loading}
            onChange={setFilters}
            onSubmit={handleSearch}
          />
        </div>

        {/* Live algorithm feed */}
        {(steps.length > 0 || (loading && steps.length === 0)) && (
          <LiveFeed steps={steps} done={done} error={error} />
        )}

        {/* Results */}
        {results.length > 0 && (
          <section className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">
                Top {results.length} Repositories
              </h2>
              <span className="text-xs text-zinc-600">ranked by Claude composite score</span>
            </div>
            {results.map((repo, i) => (
              <RepoCard key={repo.url} repo={repo} rank={i + 1} />
            ))}
          </section>
        )}

        {done && results.length === 0 && !error && (
          <div className="text-center py-12 text-zinc-500 text-sm">
            No repositories found. Try broader keywords or a different language.
          </div>
        )}
      </div>
    </div>
  );
}
