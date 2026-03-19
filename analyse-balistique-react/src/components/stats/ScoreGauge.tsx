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

  // Generate gradient ID unique to this instance
  const gradId = `score-grad-${score}`;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: 14,
      background: 'var(--surface2)',
      borderRadius: 'var(--radius)',
      border: '1px solid var(--border)',
    }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={color} stopOpacity={0.6} />
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
          stroke="var(--border)"
          strokeWidth={5}
        />

        {/* Score arc */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={5}
          strokeLinecap="round"
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
          fontSize={24} fontWeight={900}
          fontFamily="Inter"
        >
          {score}
        </text>
        <text
          x={cx} y={cy + 16}
          textAnchor="middle"
          fill="var(--muted)"
          fontSize={8} fontWeight={600}
          fontFamily="Inter"
        >
          / 100
        </text>
      </svg>

      <div>
        <div style={{
          fontSize: 14,
          fontWeight: 800,
          color,
          letterSpacing: '-0.2px',
        }}>
          {label}
        </div>
        <div style={{
          fontSize: 11,
          color: 'var(--muted)',
          marginTop: 3,
        }}>
          Score global
        </div>
      </div>
    </div>
  );
}
