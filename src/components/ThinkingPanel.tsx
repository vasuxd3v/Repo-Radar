'use client';

import { useState } from 'react';

interface Props {
  steps: string[];
}

export default function ThinkingPanel({ steps }: Props) {
  const [open, setOpen] = useState(true);

  if (steps.length === 0) return null;

  return (
    <div className="rounded-xl border border-indigo-800 bg-indigo-950/40 p-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-indigo-300 text-sm font-semibold"
      >
        <span>Claude&apos;s Thinking</span>
        <span>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <ol className="mt-3 space-y-1 text-xs text-indigo-200 list-decimal list-inside">
          {steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      )}
    </div>
  );
}
