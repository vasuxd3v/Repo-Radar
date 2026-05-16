'use client';

import { useEffect, useRef } from 'react';

interface Props {
  steps: string[];
  done: boolean;
  error?: string | null;
}

function Spinner() {
  return (
    <svg className="animate-spin w-3.5 h-3.5 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default function LiveFeed({ steps, done, error }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [steps.length]);

  if (steps.length === 0 && !error) return null;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-zinc-800 bg-zinc-900">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
        </div>
        <span className="text-xs text-zinc-500 font-mono">reporadar — algorithm trace</span>
        <div className="ml-auto">
          {!done && !error && <Spinner />}
          {done && !error && <span className="text-xs text-emerald-400 font-medium">done</span>}
          {error && <span className="text-xs text-red-400 font-medium">error</span>}
        </div>
      </div>

      {/* Steps */}
      <div className="px-5 py-4 space-y-2 max-h-72 overflow-y-auto font-mono">
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1;
          const isIndented = step.startsWith('  ');
          return (
            <div
              key={i}
              className={`flex items-start gap-2.5 text-xs animate-fadeIn ${
                isIndented ? 'pl-4' : ''
              }`}
              style={{ animationDelay: `${Math.min(i * 20, 200)}ms` }}
            >
              {!done && isLast && !error ? (
                <Spinner />
              ) : error && isLast ? (
                <ErrorIcon />
              ) : (
                <CheckIcon />
              )}
              <span className={`leading-relaxed ${
                isLast && !done ? 'text-indigo-200' : 'text-zinc-400'
              }`}>
                <span className="text-zinc-600 mr-1.5 select-none">{String(i + 1).padStart(2, '0')}.</span>
                {step.trim()}
              </span>
            </div>
          );
        })}

        {error && (
          <div className="flex items-start gap-2.5 text-xs animate-fadeIn">
            <ErrorIcon />
            <span className="text-red-300">{error}</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
