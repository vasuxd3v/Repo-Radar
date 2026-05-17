'use client';

import { motion } from 'framer-motion';
import type { ScoredRepo } from '@/lib/types';

interface Props {
  repo: ScoredRepo;
  rank: number;
  onExplain?: () => void;
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="w-32 text-[11px] text-zinc-600 shrink-0 font-medium tracking-wide">
        {label}
      </span>
      <div className="flex-1 h-[2px] rounded-full score-track overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${(value / 10) * 100}%` }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        />
      </div>
      <span className="w-8 text-right text-[11px] font-mono text-zinc-500 tabular-nums">
        {value.toFixed(1)}
      </span>
    </div>
  );
}

function Tag({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span className={`px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
      accent
        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
        : 'bg-white/[0.03] text-zinc-600 border border-white/[0.05]'
    }`}>
      {children}
    </span>
  );
}

export default function RepoCard({ repo, rank, onExplain }: Props) {
  const updatedDate = new Date(repo.lastUpdated).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  const composite = repo.scores.composite;
  const compositeColor =
    composite >= 7.5 ? 'text-emerald-400' :
    composite >= 5   ? 'text-blue-400'    : 'text-zinc-500';

  return (
    <motion.div
      className="glass-card rounded-2xl overflow-hidden group"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-6 px-6 pt-6 pb-4">
        
        <div className="flex items-start gap-4 min-w-0 flex-1">
          {/* Rank badge */}
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] shrink-0">
            <span className="text-xs font-bold text-zinc-600 font-mono">
              {rank}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white font-semibold text-base hover:text-blue-400 transition-colors leading-tight block mb-1 group-hover:underline decoration-blue-400/30 underline-offset-2"
            >
              {repo.name}
            </a>
            {repo.ownerBio && (
              <p className="text-zinc-600 text-xs mt-1 line-clamp-1">
                {repo.ownerBio}
              </p>
            )}
          </div>
        </div>

        {/* Score display */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-1.5 text-sm">
            <svg className="w-4 h-4 text-yellow-500/60" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="font-mono text-zinc-500 text-xs tabular-nums">
              {repo.stars.toLocaleString()}
            </span>
          </div>
          <div className={`text-3xl font-black font-mono leading-none ${compositeColor}`}>
            {composite.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Description */}
      {repo.description && (
        <p className="px-6 pb-4 text-zinc-400 text-sm leading-relaxed font-light">
          {repo.description}
        </p>
      )}

      {/* Tags */}
      <div className="px-6 pb-5 flex flex-wrap items-center gap-2">
        {repo.language && <Tag accent>{repo.language}</Tag>}
        {repo.topics.slice(0, 4).map(t => <Tag key={t}>{t}</Tag>)}
        <span className="ml-auto text-[10px] text-zinc-700 font-medium">
          {updatedDate}
        </span>
      </div>

      {/* Divider */}
      <div className="divider-subtle mx-6" />

      {/* Score breakdown */}
      <div className="px-6 py-5 space-y-3.5">
        <ScoreBar label="Requirement Fit"  value={repo.scores.requirementFit}  color="bg-blue-400" />
        <ScoreBar label="Effort to Adapt"  value={repo.scores.effortToAdapt}   color="bg-violet-400" />
        <ScoreBar label="Code Quality"     value={repo.scores.codeReadability} color="bg-cyan-400" />
        <ScoreBar label="Trust Signals"    value={repo.scores.trustSignals}    color="bg-emerald-400" />

        <div className="flex items-center gap-4 pt-3 border-t border-white/[0.04]">
          <span className="w-32 text-[11px] font-bold text-zinc-500 shrink-0 uppercase tracking-wider">
            Composite
          </span>
          <span className={`text-base font-bold font-mono ${compositeColor}`}>
            {composite.toFixed(2)}
          </span>
          <span className="text-xs text-zinc-700 font-medium">/ 10</span>
        </div>
      </div>

      {/* AI insights */}
      {(repo.explanation || repo.whyLearnFrom) && (
        <>
          <div className="divider-subtle mx-6" />
          <div className="px-6 py-5 space-y-4">
            {repo.explanation && (
              <p className="text-zinc-500 text-xs leading-relaxed font-light">
                {repo.explanation}
              </p>
            )}
            {repo.whyLearnFrom && (
              <div className="flex gap-3 items-start rounded-xl bg-blue-500/[0.06] border border-blue-500/15 px-4 py-3.5">
                <svg className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <div className="flex-1">
                  <span className="text-blue-400 text-[10px] font-bold uppercase tracking-wider block mb-1">
                    Learning Value
                  </span>
                  <p className="text-blue-200/80 text-xs leading-relaxed font-light">
                    {repo.whyLearnFrom}
                  </p>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Footer */}
      <div className="divider-subtle mx-6" />
      <div className="px-6 py-4 flex items-center justify-between">
        <motion.button
          onClick={onExplain}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2.5 text-xs font-semibold text-white px-4 py-2 rounded-lg transition-all"
          style={{ 
            background: 'linear-gradient(135deg, #0f62fe 0%, #0043ce 100%)',
            boxShadow: '0 4px 20px rgba(15,98,254,0.25)'
          }}
        >
          <span className="text-[9px] font-black tracking-wider opacity-90">IBM</span>
          <span>Bob Analysis →</span>
        </motion.button>
        <span className="text-zinc-700 text-[10px] font-medium uppercase tracking-wider">
          Deep Code Analysis
        </span>
      </div>
    </motion.div>
  );
}

// Made with Bob
