'use client';

const RINGS = [
  { size: 100, borderOpacity: 0.14, glowOpacity: 0.02 },
  { size:  75, borderOpacity: 0.22, glowOpacity: 0.04 },
  { size:  50, borderOpacity: 0.35, glowOpacity: 0.07 },
  { size:  25, borderOpacity: 0.58, glowOpacity: 0.14 },
];

const BLIPS: Array<{
  x: number; y: number; size: number;
  color: 'cyan' | 'blue';
  label: string | null;
  delay: number;
}> = [
  { x: 68, y: 32, size: 14, color: 'cyan', label: 'tokio-rs/mini-redis', delay: 0   },
  { x: 36, y: 60, size: 12, color: 'cyan', label: 'async-std/examples',  delay: 0.5 },
  { x: 78, y: 70, size:  8, color: 'cyan', label: 'actix/actix-web',     delay: 1.0 },
  { x: 28, y: 30, size: 12, color: 'blue', label: 'rust-lang/book',      delay: 1.5 },
  { x: 55, y: 78, size:  8, color: 'cyan', label: null,                  delay: 2.0 },
];

export default function RadarDisplay() {
  return (
    <div
      className="relative select-none"
      style={{ width: '100%', maxWidth: 460, aspectRatio: '1 / 1' }}
    >
      {/* Outer glow */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{ boxShadow: '0 0 80px rgba(34,211,238,0.07), inset 0 0 60px rgba(34,211,238,0.04)' }}
      />

      {/* Rings */}
      {RINGS.map((ring, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width:     `${ring.size}%`,
            height:    `${ring.size}%`,
            left:      '50%',
            top:       '50%',
            transform: 'translate(-50%, -50%)',
            border:    `1px solid rgba(34,211,238,${ring.borderOpacity})`,
            background:`radial-gradient(circle, rgba(34,211,238,${ring.glowOpacity}) 0%, transparent 70%)`,
          }}
        />
      ))}

      {/* Crosshairs */}
      <div
        className="absolute inset-x-0 top-1/2"
        style={{ height: 1, background: 'rgba(34,211,238,0.18)', transform: 'translateY(-0.5px)' }}
      />
      <div
        className="absolute inset-y-0 left-1/2"
        style={{ width: 1, background: 'rgba(34,211,238,0.18)', transform: 'translateX(-0.5px)' }}
      />

      {/* Sweep — clipped to circle */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: 'conic-gradient(from 0deg, rgba(34,211,238,0.45) 0deg, rgba(34,211,238,0.18) 30deg, rgba(34,211,238,0.05) 60deg, transparent 90deg, transparent 360deg)',
            animation:  'radar-sweep 5s linear infinite',
            filter:     'blur(0.5px)',
          }}
        />
      </div>

      {/* Center dot */}
      <div
        className="absolute"
        style={{
          left: '50%', top: '50%',
          width: 6, height: 6,
          borderRadius: '50%',
          background: '#A5F3FC',
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 0 12px 3px rgba(165,243,252,0.9)',
          zIndex: 3,
        }}
      />

      {/* Blips */}
      {BLIPS.map((b, i) => (
        <div key={i}>
          {/* Dot */}
          <div
            style={{
              position:        'absolute',
              left:            `${b.x}%`,
              top:             `${b.y}%`,
              width:           b.size,
              height:          b.size,
              borderRadius:    '50%',
              background:      b.color === 'cyan' ? '#A5F3FC' : '#DBEAFE',
              transform:       'translate(-50%, -50%)',
              animation:       `${b.color === 'cyan' ? 'blip-cyan' : 'blip-blue'} 2.6s ease-out infinite`,
              animationDelay:  `${b.delay}s`,
              zIndex:          4,
            }}
          />
          {/* Label */}
          {b.label && (
            <div
              style={{
                position:        'absolute',
                left:            `calc(${b.x}% + ${b.size / 2 + 4}px)`,
                top:             `${b.y}%`,
                transform:       'translateY(-50%)',
                display:         'flex',
                alignItems:      'center',
                zIndex:          5,
                pointerEvents:   'none',
              }}
            >
              {/* Connector */}
              <div style={{
                width:      14,
                height:     1,
                background: b.color === 'cyan'
                  ? 'rgba(34,211,238,0.55)'
                  : 'rgba(59,130,246,0.55)',
                flexShrink: 0,
              }} />
              {/* Box */}
              <div style={{
                fontFamily:    "'JetBrains Mono', 'Fira Code', monospace",
                fontSize:      10,
                color:         b.color === 'cyan' ? '#A5F3FC' : '#BFDBFE',
                letterSpacing: '0.02em',
                padding:       '3px 8px',
                borderRadius:  4,
                background:    'rgba(5,7,10,0.82)',
                border:        `1px solid ${b.color === 'cyan' ? 'rgba(34,211,238,0.35)' : 'rgba(59,130,246,0.45)'}`,
                whiteSpace:    'nowrap',
                backdropFilter:'blur(4px)',
              }}>
                {b.label}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
