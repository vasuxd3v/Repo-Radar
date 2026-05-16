'use client';

import { useState, useRef, useEffect } from 'react';
import { LANGUAGE_GROUPS } from '@/lib/languages';

interface Props {
  value: string;
  onChange: (lang: string) => void;
  disabled?: boolean;
}

export default function LanguageSelector({ value, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const filtered = search.trim()
    ? LANGUAGE_GROUPS
        .map((g) => ({
          ...g,
          languages: g.languages.filter((l) => l.toLowerCase().includes(search.toLowerCase())),
        }))
        .filter((g) => g.languages.length > 0)
    : LANGUAGE_GROUPS;

  function select(lang: string) {
    onChange(lang === value ? '' : lang);
    setOpen(false);
    setSearch('');
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-sm transition-all ${
          open
            ? 'border-indigo-500 bg-zinc-800 text-white'
            : value
            ? 'border-indigo-700 bg-zinc-800/70 text-white'
            : 'border-zinc-700 bg-zinc-800/40 text-zinc-400 hover:border-zinc-600'
        } disabled:opacity-40`}
      >
        <span className="flex items-center gap-2">
          <span className="text-zinc-500 text-xs">lang:</span>
          <span className={value ? 'text-indigo-300 font-medium' : ''}>
            {value || 'Any language'}
          </span>
        </span>
        <svg
          className={`w-4 h-4 text-zinc-500 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-zinc-800">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700">
              <svg className="w-3.5 h-3.5 text-zinc-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1116.65 16.65z" />
              </svg>
              <input
                ref={inputRef}
                className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 outline-none"
                placeholder="Search languages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button type="button" onClick={() => setSearch('')} className="text-zinc-500 hover:text-zinc-300 text-xs">✕</button>
              )}
            </div>
          </div>

          {/* Any language option */}
          {!search && (
            <div className="px-2 pt-2">
              <button
                type="button"
                onClick={() => select('')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  value === '' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                }`}
              >
                Any language
              </button>
            </div>
          )}

          {/* Grouped list */}
          <div className="overflow-y-auto max-h-64 p-2 space-y-1">
            {filtered.map((group) => (
              <div key={group.label}>
                {!search && (
                  <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                    {group.label}
                  </p>
                )}
                {group.languages.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => select(lang)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      value === lang
                        ? 'bg-indigo-600 text-white font-medium'
                        : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-zinc-500 text-sm py-4">No languages found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
