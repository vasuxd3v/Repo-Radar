'use client';

import { useState, useRef, useEffect } from 'react';
import { LANGUAGE_GROUPS } from '@/lib/languages';

interface Props {
  value: string;
  onChange: (lang: string) => void;
  disabled?: boolean;
}

function CheckIcon() {
  return (
    <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none"
         stroke="#22D3EE" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function LanguageSelector({ value, onChange, disabled }: Props) {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState('');
  const containerRef        = useRef<HTMLDivElement>(null);
  const inputRef            = useRef<HTMLInputElement>(null);

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
    if (open) setTimeout(() => inputRef.current?.focus(), 10);
  }, [open]);

  const filtered = search.trim()
    ? LANGUAGE_GROUPS
        .map(g => ({
          ...g,
          languages: g.languages.filter(l =>
            l.toLowerCase().includes(search.toLowerCase())
          ),
        }))
        .filter(g => g.languages.length > 0)
    : LANGUAGE_GROUPS;

  function select(lang: string) {
    onChange(lang === value ? '' : lang);
    setOpen(false);
    setSearch('');
  }

  const isOpen = open && !disabled;

  /* ─── Border/ring helper ─── */
  const triggerBorder = isOpen
    ? 'rgba(34,211,238,0.50)'
    : value
      ? 'rgba(34,211,238,0.30)'
      : 'rgba(255,255,255,0.10)';

  const triggerRing = isOpen
    ? '0 0 0 3px rgba(34,211,238,0.12), 0 4px 16px rgba(0,0,0,0.4)'
    : '0 2px 8px rgba(0,0,0,0.3)';

  return (
    <div ref={containerRef} className="relative w-full">

      {/* ── Trigger ── */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 disabled:opacity-40"
        style={{
          background: '#0d1017',
          border:     `1px solid ${triggerBorder}`,
          boxShadow:  triggerRing,
          color:      '#e4e4e7',
        }}
      >
        <span className="flex items-center gap-2 min-w-0">
          {value ? (
            <>
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: '#22D3EE', boxShadow: '0 0 6px rgba(34,211,238,0.8)' }}
              />
              <span className="truncate" style={{ color: '#A5F3FC' }}>{value}</span>
            </>
          ) : (
            <span style={{ color: 'rgba(161,161,170,0.65)' }}>Any</span>
          )}
        </span>

        <svg
          className={`w-3 h-3 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          style={{ color: isOpen || value ? '#22D3EE' : 'rgba(161,161,170,0.5)' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* ── Dropdown ── */}
      {isOpen && (
        <div
          className="absolute left-0 z-50 mt-2 rounded-xl overflow-hidden"
          style={{
            minWidth:   '220px',
            width:      '100%',
            background: '#0d1017',
            border:     '1px solid rgba(34,211,238,0.20)',
            boxShadow:  '0 24px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(34,211,238,0.05)',
          }}
        >
          {/* Search bar */}
          <div className="p-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24"
                   stroke="rgba(34,211,238,0.6)" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1116.65 16.65z" />
              </svg>
              <input
                ref={inputRef}
                className="flex-1 bg-transparent text-xs outline-none"
                style={{ color: '#e4e4e7' }}
                placeholder="Search languages..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="text-xs transition-colors hover:text-zinc-300"
                  style={{ color: 'rgba(161,161,170,0.5)' }}
                >✕</button>
              )}
            </div>
          </div>

          {/* Any language */}
          {!search && (
            <div className="px-2 pt-2">
              <button
                type="button"
                onClick={() => select('')}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-all duration-100 ${
                  value === ''
                    ? ''
                    : 'hover:bg-white/[0.05] hover:text-zinc-200'
                }`}
                style={
                  value === ''
                    ? {
                        background: 'rgba(34,211,238,0.12)',
                        border:     '1px solid rgba(34,211,238,0.28)',
                        color:      '#A5F3FC',
                      }
                    : {
                        border: '1px solid transparent',
                        color:  'rgba(161,161,170,0.7)',
                      }
                }
              >
                {value === '' ? <CheckIcon /> : <span className="w-3 shrink-0" />}
                Any language
              </button>
            </div>
          )}

          {/* Language list */}
          <div
            className="overflow-y-auto p-2 space-y-px"
            style={{ maxHeight: 256 }}
          >
            {filtered.map(group => (
              <div key={group.label}>
                {!search && (
                  <p
                    className="px-3 pt-2.5 pb-1 text-[9px] font-bold uppercase"
                    style={{ color: 'rgba(34,211,238,0.45)', letterSpacing: '0.10em' }}
                  >
                    {group.label}
                  </p>
                )}
                {group.languages.map(lang => {
                  const sel = value === lang;
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => select(lang)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 transition-all duration-100 ${
                        sel
                          ? ''
                          : 'text-zinc-300 hover:text-white hover:bg-white/[0.05]'
                      }`}
                      style={
                        sel
                          ? {
                              background: 'rgba(34,211,238,0.10)',
                              border:     '1px solid rgba(34,211,238,0.22)',
                              color:      '#A5F3FC',
                              fontWeight: 600,
                            }
                          : { border: '1px solid transparent' }
                      }
                    >
                      {sel ? <CheckIcon /> : <span className="w-3 shrink-0" />}
                      {lang}
                    </button>
                  );
                })}
              </div>
            ))}

            {filtered.length === 0 && (
              <p className="text-center py-5 text-xs" style={{ color: 'rgba(161,161,170,0.5)' }}>
                No languages found
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
