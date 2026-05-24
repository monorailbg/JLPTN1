import { cn } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';

type Props = {
  score: number;
  examCount: number;
  lastSeen: number | null;
  className?: string;
};

function tier(score: number): { label: string; classes: string } {
  if (score >= 80) return { label: '高頻出', classes: 'bg-vermillion/10 text-vermillion border-vermillion/30' };
  if (score >= 60) return { label: '頻出',   classes: 'bg-gold/15 text-amber-700 border-gold/40' };
  if (score >= 40) return { label: '中頻度', classes: 'bg-moss/10 text-moss border-moss/30' };
  return              { label: '低頻度', classes: 'bg-ink/5 text-ink/40 border-ink/10' };
}

export default function FrequencyBadge({ score, examCount, lastSeen, className }: Props) {
  if (score === 0) return null;
  const { label, classes } = tier(score);

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      <span className={cn('flex items-center gap-1 text-xs border px-2 py-0.5 rounded-full font-medium', classes)}>
        <TrendingUp size={10} />
        {label}
      </span>
      <span className="text-xs text-ink/40">
        {examCount > 0 ? `${examCount}回出題` : ''}
        {lastSeen ? ` · ${lastSeen}年` : ''}
      </span>
      <span className="text-xs font-mono text-ink/30 tabular-nums">
        {score.toFixed(0)}/100
      </span>
    </div>
  );
}
