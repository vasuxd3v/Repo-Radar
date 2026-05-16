'use client';

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
  { value: 'single-file', label: 'Single file / snippet' },
  { value: 'small', label: 'Small project (<500 lines)' },
  { value: 'medium', label: 'Medium (hobby project)' },
  { value: 'production', label: 'Production scale' },
];

const PURPOSE_OPTIONS = [
  { value: '', label: 'Any Purpose' },
  { value: 'educational', label: 'Educational / Tutorial' },
  { value: 'cli-tool', label: 'CLI Tool / Utility' },
  { value: 'library', label: 'Library / Package' },
  { value: 'systems', label: 'Systems / OS / Low-level' },
  { value: 'application', label: 'Application' },
  { value: 'game', label: 'Game / Graphics' },
];

function InlineSelect({
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
  const selected = options.find((o) => o.value === value);
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full bg-zinc-800/60 border border-zinc-700 text-zinc-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all disabled:opacity-40 appearance-none cursor-pointer"
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2371717a' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', backgroundSize: '14px', paddingRight: '30px' }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-zinc-900">
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Label({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="flex items-baseline gap-2 mb-1.5">
      <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">{children}</span>
      {sub && <span className="text-[11px] text-zinc-600">{sub}</span>}
    </div>
  );
}

export default function SearchForm({ filters, loading, onChange, onSubmit }: Props) {
  const set = <K extends keyof SearchFilters>(k: K, v: SearchFilters[K]) =>
    onChange({ ...filters, [k]: v });

  const canSubmit = (filters.query.trim() || filters.language || filters.projectContext.trim()) && !loading;

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (canSubmit) onSubmit(); }} className="flex flex-col gap-4">

      {/* Row 1: Language + Experience */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Language</Label>
          <LanguageSelector value={filters.language} onChange={(v) => set('language', v)} disabled={loading} />
        </div>
        <div>
          <Label>Experience</Label>
          <div className="flex rounded-xl overflow-hidden border border-zinc-700">
            {EXPERIENCE.map((lvl) => (
              <button
                key={lvl}
                type="button"
                disabled={loading}
                onClick={() => set('experience', lvl)}
                className={`flex-1 py-2 text-xs font-medium capitalize transition-colors disabled:opacity-40 ${
                  filters.experience === lvl
                    ? 'bg-indigo-600 text-white'
                    : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/60'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Platform + Scale + Purpose */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label>Platform</Label>
          <InlineSelect value={filters.platform} options={PLATFORM_OPTIONS} onChange={(v) => set('platform', v)} disabled={loading} />
        </div>
        <div>
          <Label>Size</Label>
          <InlineSelect value={filters.scale} options={SCALE_OPTIONS} onChange={(v) => set('scale', v)} disabled={loading} />
        </div>
        <div>
          <Label>Purpose</Label>
          <InlineSelect value={filters.purpose} options={PURPOSE_OPTIONS} onChange={(v) => set('purpose', v)} disabled={loading} />
        </div>
      </div>

      {/* Row 3: Project context (single line) */}
      <div>
        <Label sub="— what are you building?">Project Context</Label>
        <input
          type="text"
          className="w-full rounded-xl border border-zinc-700 bg-zinc-800/40 text-zinc-100 placeholder-zinc-600 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all disabled:opacity-40"
          placeholder="e.g. building a macOS memory scanner to understand OS internals"
          value={filters.projectContext}
          onChange={(e) => set('projectContext', e.target.value)}
          disabled={loading}
        />
      </div>

      {/* Row 4: Main query */}
      <div>
        <Label sub="— be specific, Claude reads this carefully">What are you looking for?</Label>
        <textarea
          className="w-full rounded-xl border border-zinc-700 bg-zinc-800/40 text-zinc-100 placeholder-zinc-600 px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all disabled:opacity-40"
          rows={3}
          placeholder="e.g. a small single-file C++ program that reads process memory on macOS using vm_read or task_vm_info — something I can read through in one sitting to understand how memory scanning works"
          value={filters.query}
          onChange={(e) => set('query', e.target.value)}
          disabled={loading}
        />
      </div>

      {/* Submit row */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-zinc-600">GitHub API + Claude Pro plan · {[filters.language, filters.platform, filters.scale, filters.purpose].filter(Boolean).length} filters active</span>
        <button
          type="submit"
          disabled={!canSubmit}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 text-sm transition-all"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Searching...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M16.65 16.65A7.5 7.5 0 1116.65 16.65z"/>
              </svg>
              Search Repos
            </>
          )}
        </button>
      </div>
    </form>
  );
}
