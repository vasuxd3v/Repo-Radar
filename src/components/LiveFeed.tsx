'use client';

import { useEffect, useRef } from 'react';

interface Props {
  steps: string[];
  done: boolean;
  error?: string | null;
}

function Spinner() {
  return (
    <svg className="animate-spin w-3 h-3 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-3 h-3 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg className="w-3 h-3 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Terminal header */}
      <div
        className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.05]"
        style={{ background: 'rgba(255,255,255,0.015)' }}
      >
        {/* Traffic lights */}
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        </div>
        <span className="text-[10px] text-zinc-600 font-mono tracking-wider flex-1 text-center uppercase">
          Algorithm Trace
        </span>
        <div className="ml-auto">
          {!done && !error && (
            <span className="flex items-center gap-1.5 text-[10px] text-blue-400 font-medium">
              <svg className="animate-spin w-2.5 h-2.5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Running
            </span>
          )}
          {done && !error && (
            <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold">
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Complete
            </span>
          )}
          {error && <span className="text-[10px] text-red-400 font-semibold">Error</span>}
        </div>
      </div>

      {/* Steps */}
      <div className="px-5 py-4 space-y-2.5 max-h-64 overflow-y-auto font-mono">
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1;
          const isIndented = step.startsWith('  ');
          return (
            <div
              key={i}
              className={`flex items-start gap-3 animate-fade-in ${isIndented ? 'pl-5' : ''}`}
              style={{ animationDelay: `${Math.min(i * 15, 180)}ms` }}
            >
              {!done && isLast && !error ? (
                <Spinner />
              ) : error && isLast ? (
                <ErrorIcon />
              ) : (
                <CheckIcon />
              )}
              <span className={`text-[11px] leading-relaxed font-light ${
                isLast && !done ? 'text-blue-300' : 'text-zinc-600'
              }`}>
                <span className="text-zinc-700 mr-2 select-none font-medium">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {step.trim()}
              </span>
            </div>
          );
        })}

        {error && (
          <div className="flex items-start gap-3 animate-fade-in">
            <ErrorIcon />
            <span className="text-[11px] text-red-400 font-light">{error}</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}

// Made with Bob
