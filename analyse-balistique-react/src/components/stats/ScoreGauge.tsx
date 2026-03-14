import { getScoreColor } from '../../lib/ballistics';

interface ScoreGaugeProps {
  score: number;
  label: string;
}

export function ScoreGauge({ score, label }: ScoreGaugeProps) {
  const color = getScoreColor(score);
  const circumference = 2 * Math.PI * 30;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <svg width={76} height={76} viewBox="0 0 76 76">
        {/* Background ring */}
        <circle
          cx={38} cy={38} r={30}
          fill="none"
          stroke="var(--border)"
          strokeWidth={6}
        />
        {/* Score ring */}
        <circle
          cx={38} cy={38} r={30}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 38 38)"
          style={{
            transition: 'stroke-dashoffset 0.8s ease',
            filter: `drop-shadow(0 0 6px ${color})`,
          }}
        />
        {/* Score text */}
        <text x={38} y={35} textAnchor="middle" fill={color} fontSize={20} fontWeight={800} fontFamily="Inter">
          {score}
        </text>
        <text x={38} y={48} textAnchor="middle" fill="var(--muted)" fontSize={8} fontWeight={600} fontFamily="Inter">
          / 100
        </text>
      </svg>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color }}>{label}</div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Score global</div>
      </div>
    </div>
  );
}
