'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import SearchForm from '@/components/SearchForm';
import LiveFeed from '@/components/LiveFeed';
import RepoCard from '@/components/RepoCard';
import ParticleCanvas from '@/components/ParticleCanvas';
import RadarDisplay from '@/components/RadarDisplay';
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

const LOADING_STEPS: { delay: number; msg: string }[] = [
  { delay: 0,     msg: 'Parsing your search intent...' },
  { delay: 600,   msg: 'Building GitHub search strategy...' },
  { delay: 1400,  msg: 'Querying GitHub API...' },
  { delay: 4000,  msg: 'Fetching READMEs and owner profiles for top candidates...' },
  { delay: 8000,  msg: 'Sending repository data to IBM Bob for deep analysis...' },
  { delay: 14000, msg: 'Bob is scoring relevance, code quality, and human authorship...' },
  { delay: 22000, msg: 'Almost done — ranking final results by composite score...' },
];

const EASE = [0.16, 1, 0.3, 1] as const;

const fadeUp = (delay = 0) => ({
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay, ease: EASE } },
});

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12 } },
};

export default function ToolPage() {
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(false);
  const [steps,   setSteps]   = useState<string[]>([]);
  const [results, setResults] = useState<ScoredRepo[]>([]);
  const [error,   setError]   = useState<string | null>(null);
  const [done,    setDone]    = useState(false);
  const timersRef  = useRef<ReturnType<typeof setTimeout>[]>([]);
  const resultsRef = useRef<HTMLDivElement>(null);

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

    const timers = LOADING_STEPS.map(({ delay, msg }) =>
      setTimeout(() => setSteps(prev => [...prev, msg]), delay)
    );
    timersRef.current = timers;

    try {
      const res  = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters }),
      });
      const data = await res.json();
      clearTimers();

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.');
        setDone(true);
      } else {
        setSteps(data.steps ?? []);
        setResults(data.results ?? []);
        setDone(true);
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
      }
    } catch (err) {
      clearTimers();
      setError(err instanceof Error ? err.message : 'Network error. Please try again.');
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  function handleExplain(repo: ScoredRepo) {
    const [owner, repoName] = repo.name.split('/');
    const params = new URLSearchParams({
      owner, repo: repoName,
      query: filters.query,
      experience: filters.experience,
      stars: String(repo.stars),
      lang: repo.language ?? '',
      desc: repo.description ?? '',
    });
    window.open(`/explain?${params.toString()}`, '_blank');
  }

  const showFeed = steps.length > 0 || (loading && steps.length === 0);

  return (
    <div className="relative min-h-screen">

      <div className="bg-cinematic" aria-hidden="true" />
      <ParticleCanvas />
      <div className="grid-texture" aria-hidden="true" />
      <div className="noise-layer" aria-hidden="true" />

      {/* ── Tool Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-10 h-[60px]"
           style={{ background: 'rgba(5,5,7,0.75)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link href="/" className="flex items-center gap-2.5">
          <div className="relative w-7 h-7 flex items-center justify-center rounded-lg"
               style={{ background: 'rgba(34,211,238,0.12)', border: '1px solid rgba(34,211,238,0.30)' }}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="#22D3EE" strokeWidth={2.5}>
              <circle cx="11" cy="11" r="7.5" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 20l-3.5-3.5" />
            </svg>
          </div>
          <span className="font-bold text-[15px] tracking-tight">
            <span className="text-white">Repo</span>
            <span style={{ color: '#22D3EE' }}>Radar</span>
          </span>
        </Link>

        <div className="flex items-center gap-2.5">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium text-zinc-300 border border-white/[0.10] bg-white/[0.03]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
            IBM Hackathon &apos;25
          </span>
          <Link href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-zinc-200 hover:text-white border border-white/[0.09] bg-white/[0.04] hover:bg-white/[0.09] hover:border-white/[0.18] transition-all duration-200">
            ← Home
          </Link>
        </div>
      </nav>

      <div className="relative z-10">

        <section className="relative min-h-screen flex items-center px-6 sm:px-12 lg:px-20 xl:px-32 pt-20 pb-10 overflow-hidden">

          <motion.div
            className="absolute top-8 left-6 sm:left-12 lg:left-20 xl:left-32"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex items-center gap-2.5 px-3 py-1.5 glass-minimal rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse-dot" />
              <span className="text-[10px] font-semibold text-zinc-300 tracking-wider uppercase">
                Live · IBM Bob Powered
              </span>
            </div>
          </motion.div>

          <div className="w-full grid grid-cols-1 xl:grid-cols-[1fr_440px] gap-10 xl:gap-14 items-center">

            <motion.div className="w-full" initial="hidden" animate="visible" variants={stagger}>

              <motion.div variants={fadeUp(0)} className="mb-6">
                <h1 className="text-left font-black leading-[1.05] tracking-[-0.02em]"
                    style={{ fontSize: 'clamp(36px, 5vw, 60px)' }}>
                  <motion.span
                    className="block bg-gradient-to-br from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  >Find repositories</motion.span>
                  <motion.span
                    className="block"
                    style={{ background: 'linear-gradient(90deg, #22D3EE 0%, #3B82F6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >humans miss.</motion.span>
                </h1>
              </motion.div>

              <motion.p
                variants={fadeUp(0.15)}
                className="text-zinc-200 text-base sm:text-lg leading-relaxed mb-8 font-light"
                style={{ maxWidth: '42ch' }}
              >
                AI-curated GitHub discovery for developers who care about code quality, not star counts.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <SearchForm filters={filters} loading={loading} onChange={setFilters} onSubmit={handleSearch} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="flex flex-wrap items-center gap-3 mt-6"
              >
                {['Semantic Search', 'AI Scoring', 'Human-written', 'IBM Bob', '4 Score Dimensions'].map((label, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.9 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="glass-minimal px-3 py-1.5 rounded-full"
                  >
                    <span className="text-[11px] font-medium text-zinc-300">{label}</span>
                  </motion.div>
                ))}
              </motion.div>

            </motion.div>

            <motion.div
              className="hidden xl:flex justify-center items-center"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <RadarDisplay />
            </motion.div>

          </div>
        </section>

        <AnimatePresence>
          {showFeed && (
            <motion.section
              className="px-6 sm:px-12 lg:px-20 xl:px-32 pb-12"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
            >
              <div className="max-w-3xl">
                <LiveFeed steps={steps} done={done} error={error} />
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {results.length > 0 && (
            <motion.section
              ref={resultsRef}
              className="px-6 sm:px-12 lg:px-20 xl:px-32 pb-40"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="max-w-4xl">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
                    <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">
                      Top {results.length} Repositories
                    </h2>
                  </div>
                  <span className="text-xs text-zinc-400">Scored by IBM Bob</span>
                </div>

                <div className="space-y-6">
                  {results.map((repo, i) => (
                    <motion.div
                      key={repo.url}
                      initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: i * 0.08, ease: EASE }}
                    >
                      <RepoCard repo={repo} rank={i + 1} onExplain={() => handleExplain(repo)} />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {done && results.length === 0 && !error && (
          <motion.div className="px-6 pb-40 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-zinc-400 text-sm py-24">
              No repositories found. Try broader keywords or different filters.
            </p>
          </motion.div>
        )}

      </div>
    </div>
  );
}
