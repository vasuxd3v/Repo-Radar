'use client';

import type { ScoredRepo } from '@/lib/types';

interface Props {
  repo: ScoredRepo;
  rank: number;
}

function ScoreBar({ label, value, color = 'bg-indigo-500' }: { label: string; value: number; color?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-36 text-xs text-zinc-500 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-700`}
          style={{ width: `${(value / 10) * 100}%` }}
        />
      </div>
      <span className="w-7 text-right text-xs font-mono text-zinc-300">{value.toFixed(1)}</span>
    </div>
  );
}

function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'lang' | 'topic' }) {
  const styles = {
    default: 'bg-zinc-800 text-zinc-400',
    lang: 'bg-indigo-950 text-indigo-300 border border-indigo-900',
    topic: 'bg-zinc-800/60 text-zinc-500',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs ${styles[variant]}`}>{children}</span>
  );
}

export default function RepoCard({ repo, rank }: Props) {
  const updatedDate = new Date(repo.lastUpdated).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  const composite = repo.scores.composite;
  const compositeColor =
    composite >= 7.5 ? 'text-emerald-400' :
    composite >= 5 ? 'text-indigo-400' : 'text-zinc-400';

  return (
    <div className="group rounded-2xl border border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900 transition-all duration-200 overflow-hidden">
      {/* Top bar */}
      <div className="flex items-start justify-between gap-3 p-5 pb-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-zinc-700 font-mono text-sm shrink-0 w-6 text-right">#{rank}</span>
          <div className="min-w-0">
            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 font-semibold text-sm truncate block transition-colors"
            >
              {repo.name}
            </a>
            {repo.ownerBio && (
              <p className="text-zinc-600 text-xs mt-0.5 truncate">{repo.ownerBio}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1 text-yellow-400 text-sm">
            <span>★</span>
            <span className="font-mono">{repo.stars.toLocaleString()}</span>
          </div>
          <div className={`text-xl font-bold font-mono ${compositeColor}`}>
            {composite.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Description */}
      {repo.description && (
        <p className="px-5 pb-3 text-zinc-300 text-sm leading-relaxed">{repo.description}</p>
      )}

      {/* Badges */}
      <div className="px-5 pb-4 flex flex-wrap gap-1.5">
        {repo.language && <Badge variant="lang">{repo.language}</Badge>}
        {repo.topics.slice(0, 5).map((t) => <Badge key={t} variant="topic">{t}</Badge>)}
        <span className="ml-auto text-xs text-zinc-600">Updated {updatedDate}</span>
      </div>

      {/* Score bars */}
      <div className="px-5 py-4 border-t border-zinc-800 space-y-2">
        <ScoreBar label="Requirement Fit" value={repo.scores.requirementFit} color="bg-indigo-500" />
        <ScoreBar label="Effort to Adapt" value={repo.scores.effortToAdapt} color="bg-violet-500" />
        <ScoreBar label="Code Readability" value={repo.scores.codeReadability} color="bg-sky-500" />
        <ScoreBar label="Trust Signals" value={repo.scores.trustSignals} color="bg-emerald-500" />
        <div className="flex items-center gap-3 pt-1">
          <span className="w-36 text-xs font-semibold text-zinc-300 shrink-0">Composite Score</span>
          <span className={`text-sm font-bold font-mono ${compositeColor}`}>{composite.toFixed(2)} / 10</span>
        </div>
      </div>

      {/* AI analysis */}
      {(repo.explanation || repo.whyLearnFrom) && (
        <div className="px-5 py-4 border-t border-zinc-800 space-y-2.5">
          {repo.explanation && (
            <p className="text-zinc-400 text-xs leading-relaxed">{repo.explanation}</p>
          )}
          {repo.whyLearnFrom && (
            <div className="flex gap-2 items-start rounded-lg bg-indigo-950/40 border border-indigo-900/40 px-3 py-2.5">
              <span className="text-indigo-400 text-xs font-semibold shrink-0 mt-0.5">Learn:</span>
              <p className="text-indigo-200 text-xs leading-relaxed">{repo.whyLearnFrom}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
