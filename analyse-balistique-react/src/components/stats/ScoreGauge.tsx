import { getScoreColor } from '../../lib/ballistics';

interface ScoreGaugeProps {
  score: number;
  label: string;
}

export function ScoreGauge({ score, label }: ScoreGaugeProps) {
  const color = getScoreColor(score);
  const r = 34;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  const size = 88;
  const cx = size / 2;
  const cy = size / 2;

  const gradId = `score-grad-${score}`;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: 12,
      background: 'var(--surface2)',
      border: '1px solid var(--border)',
      position: 'relative',
    }}>
      {/* Corner decorations */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 8, height: 1, background: color, opacity: 0.5 }} />
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1, height: 8, background: color, opacity: 0.5 }} />
      <div style={{ position: 'absolute', top: 0, right: 0, width: 8, height: 1, background: color, opacity: 0.5 }} />
      <div style={{ position: 'absolute', top: 0, right: 0, width: 1, height: 8, background: color, opacity: 0.5 }} />

      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={color} stopOpacity={0.5} />
          </linearGradient>
          <filter id="score-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Track */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="rgba(0,255,65,0.06)"
          strokeWidth={4}
        />

        {/* Score arc */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={4}
          strokeLinecap="butt"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${cx} ${cy})`}
          filter="url(#score-glow)"
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />

        {/* Score number */}
        <text
          x={cx} y={cy - 2}
          textAnchor="middle" dominantBaseline="central"
          fill={color}
          fontSize={22} fontWeight={900}
          fontFamily="'JetBrains Mono', 'Courier New', monospace"
          style={{ textShadow: `0 0 10px ${color}` } as React.CSSProperties}
        >
          {score}
        </text>
        <text
          x={cx} y={cy + 16}
          textAnchor="middle"
          fill="rgba(0,255,65,0.25)"
          fontSize={8} fontWeight={600}
          fontFamily="'JetBrains Mono', monospace"
        >
          / 100
        </text>
      </svg>

      <div>
        <div style={{
          fontSize: 12,
          fontWeight: 800,
          color,
          letterSpacing: '1px',
          textTransform: 'uppercase',
          textShadow: `0 0 8px ${color}66`,
          fontFamily: 'var(--font-mono)',
        }}>
          {label}
        </div>
        <div style={{
          fontSize: 9,
          color: 'rgba(0,255,65,0.3)',
          marginTop: 3,
          fontFamily: 'var(--font-mono)',
          letterSpacing: '1px',
          textTransform: 'uppercase',
        }}>
          Score global
        </div>
      </div>
    </div>
  );
}
