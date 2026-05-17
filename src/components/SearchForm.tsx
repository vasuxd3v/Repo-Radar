'use client';

import { motion } from 'framer-motion';
import type { SearchFilters } from '@/lib/types';
import LanguageSelector from './LanguageSelector';

interface Props {
  filters: SearchFilters;
  loading: boolean;
  onChange: (f: SearchFilters) => void;
  onSubmit: () => void;
}

const EXPERIENCE = ['beginner', 'intermediate', 'advanced'] as const;

const PLATFORM_OPTIONS = [
  { value: '', label: 'Any Platform' },
  { value: 'macos', label: 'macOS' },
  { value: 'linux', label: 'Linux' },
  { value: 'windows', label: 'Windows' },
  { value: 'cross-platform', label: 'Cross-platform' },
  { value: 'web', label: 'Web / Browser' },
  { value: 'embedded', label: 'Embedded / IoT' },
];

const SCALE_OPTIONS = [
  { value: '', label: 'Any Size' },
  { value: 'single-file', label: 'Single file' },
  { value: 'small', label: 'Small (<500 lines)' },
  { value: 'medium', label: 'Medium' },
  { value: 'production', label: 'Production scale' },
];

const PURPOSE_OPTIONS = [
  { value: '', label: 'Any Purpose' },
  { value: 'educational', label: 'Educational' },
  { value: 'cli-tool', label: 'CLI Tool' },
  { value: 'library', label: 'Library / Package' },
  { value: 'systems', label: 'Systems / Low-level' },
  { value: 'application', label: 'Application' },
  { value: 'game', label: 'Game / Graphics' },
];

function MinimalSelect({
  value,
  options,
  onChange,
  disabled,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full rounded-lg px-3 py-2.5 text-xs font-medium disabled:opacity-40 appearance-none cursor-pointer pr-8 bg-white/[0.04] backdrop-blur-xl border border-white/[0.12] text-white transition-all duration-200 hover:bg-white/[0.06] hover:border-white/[0.16] focus:outline-none focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/20"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23a1a1aa' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 10px center',
        backgroundSize: '12px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)'
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-zinc-950 text-zinc-200">
          {o.label}
        </option>
      ))}
    </select>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest mb-2 block">
      {children}
    </span>
  );
}

export default function SearchForm({ filters, loading, onChange, onSubmit }: Props) {
  const set = <K extends keyof SearchFilters>(k: K, v: SearchFilters[K]) =>
    onChange({ ...filters, [k]: v });

  const canSubmit = (filters.query.trim() || filters.language || filters.projectContext.trim()) && !loading;

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (canSubmit) onSubmit(); }}
      className="flex flex-col gap-6"
    >
      {/* Main query input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <textarea
          className="w-full rounded-2xl px-6 py-5 text-base resize-none disabled:opacity-40 leading-relaxed font-light placeholder:text-zinc-600 bg-white/[0.04] backdrop-blur-xl border border-white/[0.12] text-white transition-all duration-300 focus:bg-white/[0.06] focus:border-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          rows={2}
          placeholder="Search for elegant low-level networking repos written in Rust…"
          value={filters.query}
          onChange={(e) => set('query', e.target.value)}
          disabled={loading}
          style={{
            boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)'
          }}
        />
      </motion.div>

      {/* Filter grid */}
      <motion.div 
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="col-span-2 sm:col-span-1">
          <FieldLabel>Language</FieldLabel>
          <LanguageSelector
            value={filters.language}
            onChange={(v) => set('language', v)}
            disabled={loading}
          />
        </div>

        <div>
          <FieldLabel>Platform</FieldLabel>
          <MinimalSelect 
            value={filters.platform} 
            options={PLATFORM_OPTIONS} 
            onChange={(v) => set('platform', v)} 
            disabled={loading} 
          />
        </div>

        <div>
          <FieldLabel>Size</FieldLabel>
          <MinimalSelect 
            value={filters.scale} 
            options={SCALE_OPTIONS} 
            onChange={(v) => set('scale', v)} 
            disabled={loading} 
          />
        </div>

        <div>
          <FieldLabel>Purpose</FieldLabel>
          <MinimalSelect 
            value={filters.purpose} 
            options={PURPOSE_OPTIONS} 
            onChange={(v) => set('purpose', v)} 
            disabled={loading} 
          />
        </div>
      </motion.div>

      {/* Experience level */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <FieldLabel>Experience Level</FieldLabel>
        <div className="flex rounded-xl overflow-hidden border border-white/[0.12] bg-white/[0.02]"
             style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
          {EXPERIENCE.map((lvl, idx) => (
            <button
              key={lvl}
              type="button"
              disabled={loading}
              onClick={() => set('experience', lvl)}
              className={`flex-1 px-4 py-2.5 text-xs font-semibold capitalize transition-all duration-200 disabled:opacity-40 ${
                idx !== 0 ? 'border-l border-white/[0.08]' : ''
              } ${
                filters.experience === lvl
                  ? 'text-white bg-gradient-to-b from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25'
                  : 'text-zinc-300 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Context + Submit */}
      <motion.div 
        className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <div className="flex-1">
          <FieldLabel>Project Context (Optional)</FieldLabel>
          <input
            type="text"
            className="w-full rounded-xl px-4 py-2.5 text-sm disabled:opacity-40 font-light placeholder:text-zinc-600 bg-white/[0.04] backdrop-blur-xl border border-white/[0.12] text-white transition-all duration-200 hover:bg-white/[0.06] hover:border-white/[0.16] focus:outline-none focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/20"
            placeholder="e.g. building a macOS memory scanner"
            value={filters.projectContext}
            onChange={(e) => set('projectContext', e.target.value)}
            disabled={loading}
            style={{
              boxShadow: '0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)'
            }}
          />
        </div>

        <motion.button
          type="submit"
          disabled={!canSubmit}
          whileHover={canSubmit ? { scale: 1.02, y: -1 } : {}}
          whileTap={canSubmit ? { scale: 0.98 } : {}}
          className="flex items-center justify-center gap-2.5 rounded-xl px-8 py-3 text-sm font-bold shrink-0 text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: canSubmit 
              ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
              : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            boxShadow: canSubmit
              ? '0 8px 32px rgba(59,130,246,0.4), 0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
              : '0 4px 16px rgba(59,130,246,0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
          }}
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Searching…
            </>
          ) : (
            <>
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <circle cx="11" cy="11" r="8" />
                <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
              </svg>
              Search
            </>
          )}
        </motion.button>
      </motion.div>
    </form>
  );
}

// Made with Bob
