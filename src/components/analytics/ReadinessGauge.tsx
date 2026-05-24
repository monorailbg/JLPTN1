'use client';

interface Props {
  score: number;       // 0-100
  components: {
    coverage_pct:      number;
    mature_pct:        number;
    exercise_accuracy: number;
  };
}

function band(score: number) {
  if (score >= 80) return { label: '合格圏内', color: 'text-moss',       fill: 'stroke-moss' };
  if (score >= 60) return { label: '準備中',   color: 'text-amber-600',  fill: 'stroke-gold' };
  if (score >= 30) return { label: '要強化',   color: 'text-vermillion', fill: 'stroke-vermillion' };
  return              { label: '初学段階', color: 'text-ink/60',     fill: 'stroke-ink/40' };
}

export default function ReadinessGauge({ score, components }: Props) {
  const radius      = 70;
  const stroke      = 10;
  const circumference = 2 * Math.PI * radius;
  const dash        = (score / 100) * circumference;
  const b           = band(score);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: 180, height: 180 }}>
        <svg width={180} height={180} viewBox="0 0 180 180" className="-rotate-90">
          <circle cx={90} cy={90} r={radius} className="fill-none stroke-ink/10" strokeWidth={stroke} />
          <circle
            cx={90}
            cy={90}
            r={radius}
            className={`fill-none ${b.fill} transition-all duration-700`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-serif text-5xl font-bold text-ink leading-none">{score}</span>
          <span className="text-xs text-ink/40 mt-1">/ 100</span>
          <span className={`text-xs font-medium mt-1 ${b.color}`}>{b.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-5 text-center w-full max-w-xs">
        <Component label="カバー" value={components.coverage_pct}      weight="40%" />
        <Component label="習得"   value={components.mature_pct}        weight="30%" />
        <Component label="正答"   value={components.exercise_accuracy} weight="30%" />
      </div>
    </div>
  );
}

function Component({ label, value, weight }: { label: string; value: number; weight: string }) {
  return (
    <div>
      <p className="font-serif text-xl font-bold text-ink">{value}%</p>
      <p className="text-xs text-ink/50">{label}</p>
      <p className="text-[10px] text-ink/30 font-mono mt-0.5">重み {weight}</p>
    </div>
  );
}
