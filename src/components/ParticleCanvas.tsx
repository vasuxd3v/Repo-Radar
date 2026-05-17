'use client';

import { useEffect, useRef } from 'react';

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let W = 0, H = 0;
    let animId = 0;

    interface Particle {
      x: number; y: number;
      vx: number; vy: number;
      r: number;
      hue: 'c' | 'w';
    }

    let parts: Particle[] = [];

    function resize() {
      W = canvas!.width  = window.innerWidth  * dpr;
      H = canvas!.height = window.innerHeight * dpr;
      canvas!.style.width  = window.innerWidth  + 'px';
      canvas!.style.height = window.innerHeight + 'px';
    }

    function seed() {
      const N = Math.max(35, Math.min(60, Math.round((W * H) / 55000)));
      parts = Array.from({ length: N }, () => ({
        x:   Math.random() * W,
        y:   Math.random() * H,
        vx:  (Math.random() - 0.5) * 0.22 * dpr,
        vy:  (Math.random() - 0.5) * 0.22 * dpr,
        r:   (Math.random() * 1.4 + 0.5) * dpr,
        hue: (Math.random() < 0.6 ? 'c' : 'w') as 'c' | 'w',
      }));
    }

    resize();
    seed();

    const MAX_D  = 155 * dpr;
    const MAX_D2 = MAX_D * MAX_D;

    function draw() {
      ctx!.clearRect(0, 0, W, H);

      for (const p of parts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      }

      for (let i = 0; i < parts.length; i++) {
        for (let j = i + 1; j < parts.length; j++) {
          const a = parts[i], b = parts[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < MAX_D2) {
            ctx!.strokeStyle = `rgba(34,211,238,${(1 - d2 / MAX_D2) * 0.13})`;
            ctx!.lineWidth   = 0.6 * dpr;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }
      }

      for (const p of parts) {
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = p.hue === 'c'
          ? 'rgba(165,243,252,0.75)'
          : 'rgba(230,241,255,0.55)';
        ctx!.fill();
      }

      animId = requestAnimationFrame(draw);
    }

    draw();

    function onResize() { resize(); seed(); }
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
