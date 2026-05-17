'use client';

import { useState, useRef, useId } from 'react';
import Link from 'next/link';

/* ── Exact video from app.jsx ─────────────────────────────────── */
const BG_VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_155101_f2540600-6fe9-433e-8e48-b3f4b72f0727.mp4';

/* ── Exact Octocat path from app.jsx ─────────────────────────── */
const OCTO_PATH =
  'M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55v-1.93c-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.27-1.69-1.27-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.68 1.25 3.34.96.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18.91-.25 1.89-.38 2.87-.39.97 0 1.95.13 2.86.39 2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.4-5.26 5.69.41.36.77 1.06.77 2.14v3.17c0 .31.21.66.79.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z';

/* ── 3D GitHub mark — exact gradient layers from app.jsx ─────── */
function GithubMark3D() {
  const raw = useId();
  const uid = raw.replace(/:/g, '');
  const gId = `gh-g-${uid}`;
  const rId = `gh-r-${uid}`;
  const bId = `gh-b-${uid}`;

  return (
    <div
      aria-hidden="true"
      style={{
        position:     'absolute',
        left:         '50%',
        top:          '50%',
        zIndex:       10,
        width:        'clamp(240px, 32vw, 420px)',
        height:       'clamp(240px, 32vw, 420px)',
        pointerEvents:'none',
        animation:    'gh-float 6s ease-in-out infinite',
        filter:       'drop-shadow(0 30px 60px rgba(0,0,0,.7)) drop-shadow(0 8px 20px rgba(0,0,0,.5))',
      }}
    >
      <svg viewBox="-2 -2 28 28" style={{ width: '100%', height: '100%', display: 'block' }}>
        <defs>
          {/* body gradient */}
          <radialGradient id={gId} cx="35%" cy="28%" r="80%">
            <stop offset="0%"   stopColor="#5a5a64" />
            <stop offset="45%"  stopColor="#27272d" />
            <stop offset="100%" stopColor="#0a0a0c" />
          </radialGradient>
          {/* top rim highlight */}
          <linearGradient id={rId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="55%" stopColor="#ffffff" stopOpacity="0.0"  />
          </linearGradient>
          {/* bottom shadow lip */}
          <linearGradient id={bId} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%"  stopColor="#000000" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#000000" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        <path d={OCTO_PATH} fill={`url(#${gId})`} />
        <path d={OCTO_PATH} fill={`url(#${rId})`} />
        <path d={OCTO_PATH} fill={`url(#${bId})`} />

        {/* specular highlights */}
        <ellipse cx="8.2" cy="6.4" rx="3.6" ry="1.6"  fill="#ffffff" opacity="0.18" />
        <ellipse cx="7.4" cy="5.7" rx="1.6" ry="0.55" fill="#ffffff" opacity="0.35" />
      </svg>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────────── */
export default function LandingPage() {
  const videoRef          = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);

  function toggleVideo() {
    if (!videoRef.current) return;
    if (paused) {
      videoRef.current.play().catch(() => {});
      setPaused(false);
    } else {
      videoRef.current.pause();
      setPaused(true);
    }
  }

  return (
    <>
      <style>{`html,body{margin:0;padding:0;overflow:hidden}`}</style>

      {/* .app */}
      <div style={{
        position:   'relative',
        width:      '100%',
        height:     '100svh',
        overflow:   'hidden',
        background: '#000',
        color:      '#fff',
        fontFamily: 'Inter, sans-serif',
        WebkitFontSmoothing: 'antialiased',
        textRendering: 'optimizeLegibility',
      }}>

        {/* .bg-video */}
        <video
          ref={videoRef}
          src={BG_VIDEO}
          autoPlay loop muted playsInline
          style={{
            position:   'absolute',
            inset:      0,
            zIndex:     0,
            width:      '100%',
            height:     '100%',
            objectFit:  'cover',
          }}
        />

        {/* .bg-veil — exact radial gradients from HTML */}
        <div style={{
          position:      'absolute',
          inset:         0,
          zIndex:        1,
          pointerEvents: 'none',
          background: `
            radial-gradient(closest-side at 50% 50%,
              rgba(0,0,0,.92) 0%,
              rgba(0,0,0,.78) 22%,
              rgba(0,0,0,.55) 42%,
              rgba(0,0,0,.35) 62%,
              rgba(0,0,0,.45) 100%
            ),
            radial-gradient(120% 80% at 50% 10%,
              rgba(0,0,0,0)   0%,
              rgba(0,0,0,.35) 65%,
              rgba(0,0,0,.75) 100%
            )
          `,
        }} />

        {/* 3D GitHub mark */}
        <GithubMark3D />

        {/* nav.topnav — only brand, matching app.jsx Navbar() */}
        <nav style={{
          position:       'absolute',
          top:            0,
          left:           0,
          right:          0,
          zIndex:         50,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          padding:        '16px 20px',
        }}>
          <span style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-.02em', color: '#fff' }}>
            RepoRadar
          </span>
        </nav>

        {/* .hero (centered) — z-index 20 so it sits above the mark */}
        <div style={{
          position:       'relative',
          zIndex:         20,
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          textAlign:      'center',
          padding:        '90px 20px 0',
        }}>

          {/* .h1 (Inter, weight 400) — displayFont default is "inter" */}
          <h1 style={{
            color:         '#fff',
            fontWeight:    400,
            lineHeight:    1.12,
            letterSpacing: '-.02em',
            maxWidth:      '48rem',
            margin:        0,
            fontSize:      'clamp(1.75rem, 5vw, 2.6rem)',
          }}>
            AI wrote most of GitHub. Find the humans who didn&rsquo;t.
          </h1>

          {/* .sub — JetBrains Mono (Geist Mono here) */}
          <p style={{
            marginTop:   24,
            color:       'rgba(255,255,255,.6)',
            fontSize:    15,
            lineHeight:  1.6,
            maxWidth:    '26rem',
            fontFamily:  'var(--font-geist-mono), "JetBrains Mono", "Courier New", monospace',
            letterSpacing: '.01em',
          }}>
            Real thinking. Real decisions. Real code you can actually learn something from.
          </p>

          {/* .btn-row */}
          <div style={{ marginTop: 32, display: 'inline-flex', alignItems: 'center', gap: 10 }}>

            {/* .btn — white pill, black text */}
            <Link href="/tool" style={{
              display:         'inline-flex',
              alignItems:      'center',
              gap:             10,
              padding:         '10px 20px',
              borderRadius:    9999,
              color:           '#000',
              background:      '#fff',
              fontSize:        14,
              fontWeight:      500,
              textDecoration:  'none',
              transition:      'opacity .3s, background .3s, color .3s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
            >
              Start Tool
              {/* .arr — arrow right icon */}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth={1.5}
                   strokeLinecap="round" strokeLinejoin="round"
                   style={{ transition: 'transform .2s ease' }}>
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>

          </div>
        </div>

        {/* .status bar */}
        <div style={{
          position:       'absolute',
          left:           20,
          right:          20,
          bottom:         20,
          zIndex:         20,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          color:          'rgba(255,255,255,.45)',
          fontFamily:     'var(--font-geist-mono), "JetBrains Mono", monospace',
          fontSize:       11,
          letterSpacing:  '.04em',
          textTransform:  'uppercase',
          pointerEvents:  'none',
        }}>

          {/* .status .dot — green dot + text */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, pointerEvents: 'auto' }}>
            <span style={{
              display:      'inline-block',
              width:        6,
              height:       6,
              borderRadius: '50%',
              background:   '#7be58a',
              boxShadow:    '0 0 8px #7be58a',
              flexShrink:   0,
            }} />
            System online · v0.4
          </div>

          {/* .video-ctrl — pause/play button */}
          <button
            onClick={toggleVideo}
            style={{
              display:       'inline-flex',
              alignItems:    'center',
              gap:           8,
              padding:       '6px 12px',
              borderRadius:  9999,
              background:    'rgba(255,255,255,.06)',
              color:         'rgba(255,255,255,.7)',
              border:        '1px solid rgba(255,255,255,.08)',
              fontFamily:    'inherit',
              fontSize:      11,
              letterSpacing: '.04em',
              textTransform: 'uppercase',
              cursor:        'pointer',
              transition:    'all .2s',
              pointerEvents: 'auto',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.12)';
              (e.currentTarget as HTMLElement).style.color = '#fff';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.06)';
              (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.7)';
            }}
          >
            {paused ? (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="6 4 20 12 6 20 6 4" />
              </svg>
            ) : (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6"  y="5" width="4" height="14" />
                <rect x="14" y="5" width="4" height="14" />
              </svg>
            )}
            {paused ? 'Play' : 'Pause'}
          </button>

        </div>

      </div>
    </>
  );
}
