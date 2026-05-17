'use client';

import { motion } from 'framer-motion';

export default function Nav() {
  return (
    <motion.nav
      className="glass-nav fixed top-0 left-0 right-0 z-50"
      initial={{ y: -72, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 h-[60px] flex items-center justify-between gap-8">

        {/* Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="relative w-7 h-7">
            <div className="absolute inset-0 rounded-lg border"
                 style={{ background: 'rgba(34,211,238,0.12)', borderColor: 'rgba(34,211,238,0.30)' }} />
            <div className="relative flex items-center justify-center w-full h-full">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                   style={{ color: '#22D3EE' }}>
                <circle cx="11" cy="11" r="7.5" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 20l-3.5-3.5" />
              </svg>
            </div>
          </div>
          <span className="font-bold text-[15px] tracking-tight">
            <span className="text-white">Repo</span>
            <span style={{ color: '#22D3EE' }}>Radar</span>
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2.5 shrink-0">

          {/* Live badge */}
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium text-zinc-300 border border-white/[0.10] bg-white/[0.03]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
            IBM Hackathon &apos;25
          </span>

          {/* GitHub */}
          <motion.a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-zinc-200 hover:text-white border border-white/[0.09] bg-white/[0.04] hover:bg-white/[0.09] hover:border-white/[0.18] transition-all duration-200"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
            <span className="hidden sm:inline">GitHub</span>
          </motion.a>

        </div>
      </div>
    </motion.nav>
  );
}
