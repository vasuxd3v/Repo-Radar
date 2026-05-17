'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { BobExplanation } from '@/lib/types';

/* ─── Loading steps ─────────────────────────────────────────────── */
const LOAD_STEPS = [
  { label: 'Fetching repository file tree',    detail: 'Reading directory structure & manifest'  },
  { label: 'Reading README and source files',  detail: 'Parsing code patterns & architecture'    },
  { label: 'IBM Bob generating deep analysis', detail: 'Applying AI intelligence to your query'  },
];

/* ─── Helpers ───────────────────────────────────────────────────── */
function parseLearnItems(text: string): string[] {
  const byBullet = text.split(/[•\-–]\s+/).map(s => s.trim()).filter(s => s.length > 15);
  if (byBullet.length > 2) return byBullet.slice(0, 6);
  const bySentence = text.split(/\.\s+/).map(s => s.trim()).filter(s => s.length > 15);
  return bySentence.slice(0, 5);
}

const BAR_WIDTHS  = [72, 62, 80, 84, 68, 55, 90];
const DIFF_LEVELS = [
  { cls: 'beg', label: 'Beginner'     },
  { cls: 'beg', label: 'Beginner'     },
  { cls: 'int', label: 'Intermediate' },
  { cls: 'int', label: 'Intermediate' },
  { cls: 'adv', label: 'Advanced'     },
  { cls: 'int', label: 'Intermediate' },
  { cls: 'adv', label: 'Advanced'     },
];

/* ─── Starfield ──────────────────────────────────────────────────── */
function Starfield() {
  const starsRef = useRef<SVGGElement>(null);
  const constelRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const g = starsRef.current;
    const cg = constelRef.current;
    if (!g || !cg) return;
    const NS = 'http://www.w3.org/2000/svg';
    const stars: { x: number; y: number }[] = [];

    for (let i = 0; i < 90; i++) {
      const c = document.createElementNS(NS, 'circle');
      const x = Math.random() * 1400;
      const y = Math.random() * 1000;
      c.setAttribute('cx', String(x));
      c.setAttribute('cy', String(y));
      c.setAttribute('r',  String(Math.random() * 1.4 + 0.4));
      c.setAttribute('class', 'ex-star');
      c.style.animationDelay = (Math.random() * 4) + 's';
      g.appendChild(c);
      stars.push({ x, y });
    }

    function nearest(p: { x: number; y: number }, n: number) {
      return stars
        .map(s => ({ s, d: Math.hypot(s.x - p.x, s.y - p.y) }))
        .sort((a, b) => a.d - b.d)
        .slice(1, n + 1).map(o => o.s);
    }

    stars.slice(0, 40).forEach(s => {
      nearest(s, 2).forEach(n => {
        if (Math.hypot(n.x - s.x, n.y - s.y) > 180) return;
        const l = document.createElementNS(NS, 'line');
        l.setAttribute('x1', String(s.x)); l.setAttribute('y1', String(s.y));
        l.setAttribute('x2', String(n.x)); l.setAttribute('y2', String(n.y));
        cg.appendChild(l);
      });
    });
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }} aria-hidden="true">
      <svg viewBox="0 0 1400 1000" preserveAspectRatio="xMidYMid slice"
           style={{ width: '100%', height: '100%', display: 'block', opacity: 0.55 }}>
        <g ref={starsRef} />
        <g ref={constelRef} stroke="rgba(125,211,252,.18)" strokeWidth="0.6" fill="none" />
      </svg>
    </div>
  );
}

/* ─── Typing terminal ────────────────────────────────────────────── */
function TypingTerminal({ text, repoName }: { text: string; repoName: string }) {
  const [shown, setShown] = useState('');
  const [done,  setDone]  = useState(false);

  useEffect(() => {
    let i = 0;
    function step() {
      if (i <= text.length) {
        setShown(text.slice(0, i));
        i += Math.random() > 0.92 ? 3 : 1;
        setTimeout(step, 14 + Math.random() * 22);
      } else {
        setShown(text);
        setDone(true);
      }
    }
    const t = setTimeout(step, 300);
    return () => clearTimeout(t);
  }, [text]);

  return (
    <div className="ex-term">
      <div className="ex-term-bar">
        <span className="ex-dots"><i className="r"/><i className="y"/><i className="g"/></span>
        <span className="ex-term-tab">bob@radar:~/{repoName} $ analyze --section overview</span>
      </div>
      <div className="ex-term-body">
        <div className="ex-term-cmd"><span className="ex-teal">$</span> what_this_project_does</div>
        <div className="ex-term-text">
          {shown}
          <span className={`ex-caret${done ? ' done' : ''}`}>&nbsp;</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Pattern card ───────────────────────────────────────────────── */
function PatternCard({ name, explanation, index }: { name: string; explanation: string; index: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <article
      className="ex-win"
      style={{ borderColor: hovered ? 'rgba(6,182,212,.4)' : undefined, transform: hovered ? 'translateY(-2px)' : undefined }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="ex-win-bar">
        <span className="ex-dots"><i className="r"/><i className="y"/><i className="g"/></span>
        <span className="ex-win-tab">pattern_{String(index + 1).padStart(2, '0')}.concept</span>
      </div>
      <div className="ex-win-body">
        <div className="ex-win-title">
          <span className="ex-dollar">$ </span>{name}
        </div>
        <div className="ex-win-code">
          <span className="ex-com">// {name.toLowerCase().replace(/\s+/g, '_')}</span>{'\n'}
          <span className="ex-kw">implement</span>
          <span className="ex-fn"> {name.split(/\s+/).slice(0, 2).join('_').toLowerCase()}(</span>
          <span className="ex-var">context</span>
          <span className="ex-fn">)</span>
          <span className="ex-op"> {'{...'}</span>
          <span className="ex-op">{'}'}</span>
        </div>
        <p className="ex-win-desc">{explanation}</p>
      </div>
    </article>
  );
}

/* ─── Skill bars ─────────────────────────────────────────────────── */
function SkillBars({ learningValue }: { learningValue: string }) {
  const skillsRef = useRef<HTMLDivElement>(null);
  const [filled, setFilled] = useState(false);
  const items = parseLearnItems(learningValue);

  useEffect(() => {
    const el = skillsRef.current;
    if (!el) return;
    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { setFilled(true); io.disconnect(); }
    }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={skillsRef} className="ex-skills">
      {items.map((item, i) => {
        const diff = DIFF_LEVELS[i % DIFF_LEVELS.length];
        const w    = BAR_WIDTHS[i % BAR_WIDTHS.length];
        return (
          <div key={i} className="ex-skill">
            <div className="ex-skill-lbl">
              <span className="ex-skill-ix">0{i + 1}</span>
              {item.length > 60 ? item.slice(0, 57) + '…' : item}
            </div>
            <div className="ex-track">
              <div
                className="ex-fill"
                style={{ width: filled ? `${w}%` : '0%', transition: `width 1.4s cubic-bezier(.22,.94,.34,1) ${i * 120}ms` }}
              />
            </div>
            <div className={`ex-diff ${diff.cls}`}>{diff.label}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Bob bubble ─────────────────────────────────────────────────── */
function BobBubble({ note }: { note: string }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setTimeout(() => setRevealed(true), 1100);
        io.disconnect();
      }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={rowRef} className="ex-bob-row">
      <div className="ex-bob-av">B</div>
      <div className="ex-bob-bub">
        <div className="ex-bob-meta">
          <span className="ex-bob-nm">Bob</span>
          <span>· just now</span>
        </div>
        {!revealed ? (
          <div className="ex-bob-typing">
            <i/><i/><i/>
          </div>
        ) : (
          <div className="ex-bob-msg">
            <span className="ex-q">&gt; </span>
            {note}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────────────── */
function ExplainContent() {
  const params     = useSearchParams();
  const owner      = params.get('owner')      ?? '';
  const repo       = params.get('repo')       ?? '';
  const query      = params.get('query')      ?? '';
  const experience = params.get('experience') ?? 'intermediate';
  const stars      = Number(params.get('stars') ?? 0);
  const lang       = params.get('lang')       ?? '';
  const desc       = params.get('desc')       ?? '';

  const [explanation,    setExplanation]    = useState<BobExplanation | null>(null);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState(0);

  const fullName = `${owner}/${repo}`;
  const ghUrl    = `https://github.com/${owner}/${repo}`;

  useEffect(() => {
    if (!owner || !repo) { setLoading(false); return; }
    const t1 = setTimeout(() => setCompletedSteps(1), 600);
    const t2 = setTimeout(() => setCompletedSteps(2), 1600);
    fetch('/api/explain', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoOwner: owner, repoName: repo, userQuery: query, experienceLevel: experience }),
    })
      .then(r => r.json())
      .then(data => {
        clearTimeout(t1); clearTimeout(t2); setCompletedSteps(3);
        setTimeout(() => {
          if (data.error) setError(data.error); else setExplanation(data as BobExplanation);
          setLoading(false);
        }, 400);
      })
      .catch(err => { setError(err.message); setLoading(false); });
    return () => { clearTimeout(t1); clearTimeout(t2); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owner, repo]);

  return (
    <>
      {/* styles are in globals.css — no inline style tag needed */}
      {false && <style>{`
        :root {
          --ex-bg:      #0a0f1e;
          --ex-panel:   #0f1830;
          --ex-line:    rgba(255,255,255,.08);
          --ex-line2:   rgba(255,255,255,.14);
          --ex-fg:      #e6ecf7;
          --ex-muted:   rgba(230,236,247,.55);
          --ex-dim:     rgba(230,236,247,.35);
          --ex-teal:    #06b6d4;
          --ex-ts:      rgba(6,182,212,.18);
          --ex-tl:      rgba(6,182,212,.35);
          --ex-blue:    #3b82f6;
          --ex-bob:     #2563eb;
          --ex-purple:  #a78bfa;
          --ex-mono:    'JetBrains Mono','SFMono-Regular',Menlo,Consolas,monospace;
        }

        .ex-star { fill:#7dd3fc; opacity:.55; animation: ex-twinkle 4s ease-in-out infinite; }
        @keyframes ex-twinkle { 0%,100%{opacity:.2} 50%{opacity:.8} }
        @keyframes ex-caret   { 50%{border-color:transparent} }
        @keyframes ex-fadeIn  { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:none} }
        @keyframes ex-breathe {
          0%,100%{border-color:rgba(6,182,212,.28)}
          50%    {border-color:rgba(6,182,212,.65)}
        }
        @keyframes ex-breathe-glow {
          0%,100%{box-shadow:0 0 0 1.5px rgba(6,182,212,.25) inset, 0 0 24px rgba(6,182,212,.08) inset}
          50%    {box-shadow:0 0 0 1.5px rgba(6,182,212,.7)  inset, 0 0 50px rgba(6,182,212,.18) inset, 0 0 70px rgba(6,182,212,.18)}
        }
        @keyframes ex-dot-pulse {
          0%,80%,100%{opacity:.3;transform:translateY(0)}
          40%        {opacity:1;transform:translateY(-3px)}
        }
        @keyframes ex-bob-reveal { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:none} }

        /* Page grid background */
        .ex-grid-bg {
          position:fixed; inset:0; z-index:0; pointer-events:none;
          background:
            radial-gradient(1200px 600px at 50% -200px, rgba(6,182,212,.08), transparent 60%),
            radial-gradient(900px  500px at 100% 100%, rgba(59,130,246,.06), transparent 60%);
        }

        /* Page chrome */
        .ex-page { position:relative; z-index:2; max-width:1180px; margin:0 auto; padding:0 24px 96px; }
        .ex-nav   { display:flex; align-items:center; justify-content:space-between; padding:22px 0 36px; }
        .ex-brand { display:flex; align-items:center; gap:10px; font-size:18px; font-weight:600; color:#fff; }
        .ex-brand-name em { color:var(--ex-teal); font-style:normal; }
        .ex-by    { display:flex; align-items:center; gap:10px; font-family:var(--ex-mono); font-size:11px; color:var(--ex-muted); letter-spacing:.06em; text-transform:uppercase; }
        .ex-bob-pill { display:inline-flex; align-items:center; gap:6px; padding:6px 10px; border-radius:999px; background:var(--ex-bob); color:#fff; font-weight:600; font-size:12px; letter-spacing:.02em; text-transform:none; font-family:Inter,sans-serif; }
        .ex-bob-av-sm { width:18px; height:18px; border-radius:5px; background:#fff; color:var(--ex-bob); display:inline-flex; align-items:center; justify-content:center; font-weight:800; font-size:11px; font-family:var(--ex-mono); }

        /* Repo card */
        .ex-repo-card { position:relative; border:1px solid var(--ex-line); border-radius:16px; padding:28px 32px; background:linear-gradient(180deg,rgba(255,255,255,.02),rgba(255,255,255,0)); overflow:hidden; }
        .ex-repo-card::before { content:""; position:absolute; inset:0; border-radius:16px; pointer-events:none; background:radial-gradient(600px 200px at 100% 0%,rgba(6,182,212,.06),transparent 60%); }
        .ex-repo-top { display:flex; align-items:flex-start; justify-content:space-between; gap:24px; flex-wrap:wrap; }
        .ex-repo-meta { display:flex; align-items:center; gap:10px; }
        .ex-lang-chip { width:34px; height:34px; border-radius:50%; border:1px solid var(--ex-tl); background:var(--ex-ts); color:var(--ex-teal); display:inline-flex; align-items:center; justify-content:center; font-family:var(--ex-mono); font-weight:700; font-size:14px; }
        .ex-stars { display:inline-flex; align-items:center; gap:4px; color:#fbbf24; font-family:var(--ex-mono); font-size:14px; }
        .ex-level { padding:5px 12px; border:1px solid var(--ex-line2); border-radius:999px; color:var(--ex-muted); font-size:12px; }
        .ex-gh-btn { display:inline-flex; align-items:center; gap:10px; padding:10px 16px; border-radius:12px; border:1px solid var(--ex-line2); color:#fff; font-size:14px; transition:background .2s,border-color .2s; text-decoration:none; }
        .ex-gh-btn:hover { background:rgba(255,255,255,.04); border-color:var(--ex-tl); }
        .ex-repo-name { margin:18px 0 8px; font-family:var(--ex-mono); font-weight:700; font-size:clamp(28px,4vw,42px); letter-spacing:-.01em; color:#fff; word-break:break-all; }
        .ex-repo-desc { color:var(--ex-muted); font-size:15px; line-height:1.6; max-width:64ch; }
        .ex-repo-q    { margin-top:14px; color:var(--ex-dim); font-size:13px; }
        .ex-repo-q em { color:var(--ex-fg); font-style:italic; opacity:.8; }

        /* Divider */
        .ex-divider { display:flex; align-items:center; justify-content:center; gap:16px; padding:28px 0 8px; }
        .ex-divider-line { flex:1; height:1px; background:linear-gradient(90deg,transparent,var(--ex-line) 30%,var(--ex-line) 70%,transparent); max-width:280px; }
        .ex-pill { display:inline-flex; align-items:center; gap:8px; padding:7px 14px; border-radius:999px; border:1px solid var(--ex-line2); background:rgba(255,255,255,.02); font-family:var(--ex-mono); font-size:11px; letter-spacing:.14em; color:var(--ex-muted); text-transform:uppercase; }
        .ex-pill-dot { width:6px; height:6px; border-radius:50%; background:var(--ex-teal); box-shadow:0 0 10px var(--ex-teal); }

        /* Section */
        .ex-sec { position:relative; margin-top:20px; border:1px solid var(--ex-line); border-radius:16px; padding:26px 28px; background:linear-gradient(180deg,rgba(255,255,255,.015),rgba(255,255,255,0)); }
        .ex-sec-hd { display:flex; align-items:center; gap:10px; margin-bottom:16px; color:var(--ex-muted); font-family:var(--ex-mono); font-size:11px; letter-spacing:.18em; text-transform:uppercase; }
        .ex-sd      { width:6px; height:6px; border-radius:50%; background:var(--ex-teal); box-shadow:0 0 8px var(--ex-teal); }
        .ex-sd.blue   { background:var(--ex-blue);   box-shadow:0 0 8px var(--ex-blue);   }
        .ex-sd.purple { background:var(--ex-purple); box-shadow:0 0 8px var(--ex-purple); }
        .ex-count { padding:3px 8px; border-radius:6px; background:var(--ex-ts); color:var(--ex-teal); font-size:10px; letter-spacing:.1em; }

        /* Terminal */
        .ex-term { position:relative; border:1px solid var(--ex-line); border-radius:12px; background:#070b18; overflow:hidden; font-family:var(--ex-mono); font-size:14px; line-height:1.75; }
        .ex-term::before { content:""; position:absolute; inset:0; pointer-events:none; background:repeating-linear-gradient(0deg,rgba(125,211,252,.04) 0,rgba(125,211,252,.04) 1px,transparent 1px,transparent 3px); opacity:.6; mix-blend-mode:screen; }
        .ex-term::after  { content:""; position:absolute; inset:0; pointer-events:none; background:radial-gradient(800px 200px at 50% 0%,rgba(6,182,212,.08),transparent 60%); }
        .ex-term-bar  { display:flex; align-items:center; gap:10px; padding:10px 14px; border-bottom:1px solid var(--ex-line); position:relative; z-index:1; }
        .ex-term-tab  { color:var(--ex-dim); font-size:12px; }
        .ex-term-body { padding:18px 18px 22px; position:relative; z-index:1; }
        .ex-term-cmd  { color:var(--ex-muted); font-size:11px; letter-spacing:.16em; text-transform:uppercase; margin-bottom:8px; }
        .ex-teal      { color:var(--ex-teal); font-weight:700; margin-right:6px; }
        .ex-term-text { color:#dbe6f5; white-space:pre-wrap; }
        .ex-caret     { border-right:2px solid var(--ex-teal); animation:ex-caret 1s steps(2) infinite; padding-right:2px; }
        .ex-caret.done { animation:ex-caret 1.1s steps(2) infinite; }

        /* Arch text block */
        .ex-arch-body { color:#dbe6f5; font-size:14.5px; line-height:1.75; white-space:pre-wrap; }

        /* Start here */
        .ex-start { position:relative; margin-top:20px; border-radius:18px; padding:30px 32px; background:linear-gradient(180deg,rgba(6,182,212,.05),rgba(6,182,212,.01)); border:1.5px solid var(--ex-tl); overflow:hidden; animation:ex-breathe 4s ease-in-out infinite; }
        .ex-start::before { content:""; position:absolute; inset:-1.5px; border-radius:18px; pointer-events:none; animation:ex-breathe-glow 4s ease-in-out infinite; }
        .ex-start-hd   { display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; }
        .ex-start-lbl  { display:inline-flex; align-items:center; gap:8px; color:var(--ex-teal); font-family:var(--ex-mono); font-size:11px; letter-spacing:.2em; text-transform:uppercase; }
        .ex-start-lbl::before { content:""; width:6px; height:6px; border-radius:50%; background:var(--ex-teal); box-shadow:0 0 10px var(--ex-teal); }
        .ex-start-hint { color:var(--ex-muted); font-family:var(--ex-mono); font-size:12px; }
        .ex-start-prose { color:#dbe6f5; font-size:15.5px; line-height:1.7; max-width:66ch; margin-top:16px; }
        .ex-start-prose strong { color:#fff; font-weight:600; }

        /* Pattern grid */
        .ex-pat-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
        @media(max-width:780px) { .ex-pat-grid { grid-template-columns:1fr; } }
        .ex-win { position:relative; border:1px solid var(--ex-line); border-radius:12px; background:#060914; overflow:hidden; transition:border-color .25s,box-shadow .25s,transform .25s; }
        .ex-win-bar { display:flex; align-items:center; gap:10px; padding:9px 12px; border-bottom:1px solid var(--ex-line); background:linear-gradient(180deg,#0b1224,#070b18); }
        .ex-win-tab { margin-left:6px; font-family:var(--ex-mono); font-size:11.5px; color:var(--ex-dim); padding:3px 10px; border-radius:6px; background:rgba(255,255,255,.03); border:1px solid var(--ex-line); }
        .ex-win-body  { padding:14px 16px 16px; font-family:var(--ex-mono); font-size:13px; line-height:1.7; }
        .ex-win-title { color:var(--ex-teal); font-weight:700; font-size:15px; letter-spacing:-.01em; }
        .ex-dollar    { color:var(--ex-teal); margin-right:4px; opacity:.7; }
        .ex-win-code  { margin-top:10px; color:#cbd5e1; font-size:12.5px; line-height:1.75; white-space:pre-wrap; }
        .ex-win-desc  { margin-top:12px; color:var(--ex-muted); font-size:13px; line-height:1.65; font-family:Inter,sans-serif; }
        .ex-com  { color:#64748b; font-style:italic; }
        .ex-kw   { color:#a78bfa; }
        .ex-fn   { color:#06b6d4; }
        .ex-var  { color:#e6ecf7; }
        .ex-op   { color:#94a3b8; }

        /* Skill bars */
        .ex-skills { display:flex; flex-direction:column; gap:16px; }
        .ex-skill   { display:grid; grid-template-columns:minmax(180px,1fr) 1.4fr 120px; gap:18px; align-items:center; }
        @media(max-width:680px) { .ex-skill { grid-template-columns:1fr; gap:6px; } }
        .ex-skill-lbl { font-family:var(--ex-mono); font-size:13px; color:#dbe6f5; }
        .ex-skill-ix  { color:var(--ex-dim); margin-right:8px; }
        .ex-track  { position:relative; height:10px; border-radius:999px; background:rgba(255,255,255,.05); border:1px solid var(--ex-line); overflow:hidden; }
        .ex-fill   { position:absolute; left:0; top:0; bottom:0; border-radius:999px; background:linear-gradient(90deg,var(--ex-teal),var(--ex-blue)); box-shadow:0 0 14px rgba(6,182,212,.4); }
        .ex-diff   { justify-self:end; padding:4px 10px; border-radius:999px; font-family:var(--ex-mono); font-size:10.5px; letter-spacing:.1em; text-transform:uppercase; border:1px solid currentColor; }
        .ex-diff.beg { color:#34d399; }
        .ex-diff.int { color:#fbbf24; }
        .ex-diff.adv { color:#f472b6; }

        /* Bob bubble */
        .ex-bob-row { display:flex; align-items:flex-start; gap:16px; margin-top:8px; }
        .ex-bob-av  { flex:0 0 auto; width:44px; height:44px; border-radius:12px; background:linear-gradient(135deg,#2563eb,#1d4ed8); color:#fff; display:inline-flex; align-items:center; justify-content:center; font-family:var(--ex-mono); font-weight:800; font-size:20px; box-shadow:0 8px 22px -8px rgba(37,99,235,.6); }
        .ex-bob-bub { position:relative; flex:1; border:1px solid var(--ex-line2); background:linear-gradient(180deg,#101a33,#0d162c); border-radius:14px; padding:18px 22px; color:#dbe6f5; }
        .ex-bob-bub::before { content:""; position:absolute; left:-7px; top:14px; width:14px; height:14px; background:#101a33; border-left:1px solid var(--ex-line2); border-bottom:1px solid var(--ex-line2); transform:rotate(45deg); }
        .ex-bob-meta { display:flex; align-items:center; gap:10px; margin-bottom:8px; font-family:var(--ex-mono); font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:var(--ex-muted); }
        .ex-bob-nm   { color:var(--ex-teal); font-weight:600; }
        .ex-bob-typing { display:flex; align-items:center; gap:6px; color:var(--ex-dim); font-family:var(--ex-mono); font-size:13px; height:24px; }
        .ex-bob-typing i { width:6px; height:6px; border-radius:50%; background:var(--ex-dim); animation:ex-dot-pulse 1.2s ease-in-out infinite; display:inline-block; }
        .ex-bob-typing i:nth-child(2) { animation-delay:.15s; }
        .ex-bob-typing i:nth-child(3) { animation-delay:.3s; }
        .ex-bob-msg { font-style:italic; font-size:15.5px; line-height:1.7; color:#e6ecf7; animation:ex-bob-reveal .4s ease-out forwards; }
        .ex-q { color:var(--ex-teal); font-style:normal; font-family:var(--ex-mono); font-size:14px; opacity:.7; margin-right:4px; }

        /* Traffic light dots */
        .ex-dots { display:inline-flex; gap:6px; }
        .ex-dots i { width:11px; height:11px; border-radius:50%; display:inline-block; }
        .ex-dots .r { background:#ef4444; }
        .ex-dots .y { background:#eab308; }
        .ex-dots .g { background:#22c55e; }

        /* Footer */
        .ex-foot { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-top:36px; padding-top:22px; border-top:1px solid var(--ex-line); flex-wrap:wrap; }
        .ex-foot-by  { font-size:12px; color:var(--ex-muted); }
        .ex-foot-by b { color:var(--ex-teal); font-weight:600; }
        .ex-foot-actions { display:flex; gap:10px; }
        .ex-btn { padding:10px 18px; border-radius:10px; border:1px solid var(--ex-line2); font-size:14px; color:#fff; text-decoration:none; display:inline-block; transition:border-color .2s,background .2s; }
        .ex-btn:hover { border-color:var(--ex-tl); background:rgba(6,182,212,.05); }
        .ex-btn.primary { background:var(--ex-teal); color:#001018; border-color:var(--ex-teal); font-weight:600; }
        .ex-btn.primary:hover { background:#22c4dd; }

        /* Loading card */
        .ex-load-card { } .ex-load-av { }
      `}</style>}

      <div style={{ background: 'var(--ex-bg)', minHeight: '100vh', color: 'var(--ex-fg)', fontFamily: 'Inter, sans-serif', WebkitFontSmoothing: 'antialiased', position: 'relative' }}>

        {/* Starfield + radial gradient */}
        <Starfield />
        <div className="ex-grid-bg" aria-hidden="true" />

        <div className="ex-page">

          {/* ── Nav ── */}
          <nav className="ex-nav">
            <div className="ex-brand">
              <Link href="/tool" style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:28, height:28, borderRadius:8, color:'var(--ex-muted)', transition:'background .2s,color .2s', textDecoration:'none' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,.06)'; (e.currentTarget as HTMLElement).style.color='#fff'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background='transparent'; (e.currentTarget as HTMLElement).style.color='var(--ex-muted)'; }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
              </Link>
              <span className="ex-brand-name">Repo<em>Radar</em></span>
            </div>
            <div className="ex-by">
              <span>Deep analysis by</span>
              <span className="ex-bob-pill">
                <span className="ex-bob-av-sm">B</span> Bob
              </span>
            </div>
          </nav>

          {/* ── Repo header ── */}
          <div className="ex-repo-card">
            <div className="ex-repo-top">
              <div className="ex-repo-meta">
                {lang && <span className="ex-lang-chip">{lang.slice(0, 2)}</span>}
                {stars > 0 && <span className="ex-stars">★ <span style={{ color:'#fbbf24' }}>{stars.toLocaleString()}</span></span>}
                <span className="ex-level" style={{ textTransform:'capitalize' }}>{experience}</span>
              </div>
              <a className="ex-gh-btn" href={ghUrl} target="_blank" rel="noopener noreferrer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2.18c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.27-1.68-1.27-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.69 1.25 3.35.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.47.11-3.06 0 0 .97-.31 3.18 1.18.92-.26 1.91-.39 2.9-.39.99 0 1.98.13 2.9.39 2.21-1.49 3.18-1.18 3.18-1.18.62 1.59.23 2.77.11 3.06.73.81 1.18 1.84 1.18 3.1 0 4.44-2.7 5.41-5.26 5.69.41.36.78 1.05.78 2.12v3.14c0 .31.21.67.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z"/></svg>
                View on GitHub
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M9 7h8v8"/></svg>
              </a>
            </div>
            <h1 className="ex-repo-name">{fullName}</h1>
            {desc  && <p className="ex-repo-desc">{desc}</p>}
            {query && <p className="ex-repo-q">Searched for: <em>&ldquo;{query}&rdquo;</em></p>}
          </div>

          {/* ── Loading ── */}
          {loading && (
            <div className="ex-load-card" style={{ marginTop: 28 }}>
              <div className="ex-load-av">B</div>
              <div style={{ textAlign:'center' }}>
                <p style={{ color:'#fff', fontWeight:600, fontSize:17 }}>IBM Bob is reading the codebase</p>
                <p style={{ color:'var(--ex-muted)', fontSize:14, marginTop:6 }}>This takes 15–30 seconds for a thorough analysis</p>
              </div>
              <div style={{ width:'100%', maxWidth:380, display:'flex', flexDirection:'column', gap:20 }}>
                {LOAD_STEPS.map((s, i) => {
                  const done    = completedSteps > i;
                  const current = completedSteps === i;
                  return (
                    <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:16 }}>
                      <div style={{
                        width:36, height:36, borderRadius:'50%', flexShrink:0,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        background: done ? '#10b981' : current ? 'rgba(6,182,212,.12)' : 'rgba(255,255,255,.04)',
                        border: done ? 'none' : current ? '1px solid rgba(6,182,212,.5)' : '1px solid rgba(255,255,255,.08)',
                        boxShadow: current ? '0 0 14px rgba(6,182,212,.25)' : 'none',
                        transition: 'all .5s',
                      }}>
                        {done ? (
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        ) : current ? (
                          <span style={{ width:8, height:8, borderRadius:'50%', background:'var(--ex-teal)', animation:'ex-caret 1s steps(2) infinite', display:'inline-block' }} />
                        ) : (
                          <span style={{ color:'var(--ex-dim)', fontFamily:'var(--ex-mono)', fontSize:12 }}>{i + 1}</span>
                        )}
                      </div>
                      <div style={{ flex:1, paddingTop:6 }}>
                        <p style={{ fontSize:14, fontWeight:500, color: done ? '#a0aec0' : current ? '#fff' : 'rgba(230,236,247,.35)', transition:'color .3s' }}>{s.label}</p>
                        <p style={{ fontSize:12, marginTop:2, color: current ? 'var(--ex-muted)' : 'rgba(230,236,247,.2)' }}>{s.detail}</p>
                        {current && (
                          <div style={{ marginTop:8, height:2, borderRadius:999, background:'rgba(255,255,255,.06)', overflow:'hidden' }}>
                            <div style={{ height:'100%', background:'linear-gradient(90deg,var(--ex-teal),var(--ex-blue))', borderRadius:999, animation:'shimmer 2s linear infinite', backgroundSize:'200% auto', width:'100%' }} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Error ── */}
          {error && (
            <div style={{ marginTop:20, border:'1px solid rgba(239,68,68,.3)', borderRadius:16, padding:24, background:'rgba(127,29,29,.15)', color:'#fca5a5', fontSize:14, lineHeight:1.6 }}>
              <strong style={{ display:'block', marginBottom:6 }}>Analysis failed</strong>
              {error}
            </div>
          )}

          {/* ══ Analysis sections ══ */}
          {explanation && (<>

            {/* Divider */}
            <div className="ex-divider">
              <div className="ex-divider-line" />
              <span className="ex-pill"><span className="ex-pill-dot" /> Bob analysis complete</span>
              <div className="ex-divider-line" />
            </div>

            {/* S1 — What this project does (typing terminal) */}
            <section className="ex-sec">
              <div className="ex-sec-hd"><span className="ex-sd" /> What this project does</div>
              <TypingTerminal text={explanation.overview} repoName={repo} />
            </section>

            {/* S2 — How it's structured (arch terminal) */}
            <section className="ex-sec">
              <div className="ex-sec-hd"><span className="ex-sd" /> How it&apos;s structured</div>
              <div className="ex-term">
                <div className="ex-term-bar">
                  <span className="ex-dots"><i className="r"/><i className="y"/><i className="g"/></span>
                  <span className="ex-term-tab">bob@radar:~/{repo} $ analyze --section architecture</span>
                </div>
                <div className="ex-term-body">
                  <div className="ex-term-cmd"><span className="ex-teal">$</span> describe_structure</div>
                  <div className="ex-arch-body">{explanation.architecture}</div>
                </div>
              </div>
            </section>

            {/* S3 — Start here (breathing card) */}
            <div className="ex-start">
              <div className="ex-start-hd">
                <span className="ex-start-lbl">Start here</span>
                <span className="ex-start-hint">— open this first</span>
              </div>
              <p className="ex-start-prose">{explanation.whereToStart}</p>
            </div>

            {/* S4 — Code tricks (pattern grid) */}
            {explanation.keyPatterns.length > 0 && (
              <section className="ex-sec">
                <div className="ex-sec-hd">
                  <span className="ex-sd blue" />
                  Code tricks to master
                  <span className="ex-count">{explanation.keyPatterns.length} patterns</span>
                </div>
                <div className="ex-pat-grid">
                  {explanation.keyPatterns.map((p, i) => (
                    <PatternCard key={i} name={p.name} explanation={p.explanation} index={i} />
                  ))}
                </div>
              </section>
            )}

            {/* S5 — What you'll learn (animated skill bars) */}
            <section className="ex-sec">
              <div className="ex-sec-hd"><span className="ex-sd purple" /> What you&apos;ll learn</div>
              <SkillBars learningValue={explanation.learningValue} />
            </section>

            {/* S6 — Bob's honest take (chat bubble) */}
            {explanation.bobNote && (
              <section className="ex-sec">
                <div className="ex-sec-hd"><span className="ex-sd" /> Bob&apos;s honest take</div>
                <BobBubble note={explanation.bobNote} />
              </section>
            )}

            {/* Footer */}
            <footer className="ex-foot">
              <div className="ex-foot-by">Analysis powered by <b>Bob</b> · RepoRadar</div>
              <div className="ex-foot-actions">
                <a className="ex-btn" href={ghUrl} target="_blank" rel="noopener noreferrer">Open in GitHub ↗</a>
                <Link className="ex-btn primary" href="/tool">New search</Link>
              </div>
            </footer>

          </>)}
        </div>
      </div>
    </>
  );
}

/* ─── Suspense wrapper ──────────────────────────────────────────── */
export default function ExplainPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:'100vh', background:'#0a0f1e', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ width:56, height:56, borderRadius:14, background:'linear-gradient(135deg,#2563eb,#1d4ed8)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:24, boxShadow:'0 0 40px rgba(37,99,235,.5)' }}>B</div>
      </div>
    }>
      <ExplainContent />
    </Suspense>
  );
}
