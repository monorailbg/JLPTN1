'use client';

import { useState } from 'react';

interface Day {
  date: string;
  count: number;
}

interface Props {
  data: Day[]; // 365 days, oldest first
}

// 7 rows (Sun-Sat), 53 columns (weeks). Cell color intensity by count.
function intensity(count: number): string {
  if (count === 0)  return 'fill-ink/5';
  if (count < 3)    return 'fill-moss/30';
  if (count < 8)    return 'fill-moss/55';
  if (count < 15)   return 'fill-moss/75';
  return 'fill-moss';
}

export default function Heatmap({ data }: Props) {
  const [hovered, setHovered] = useState<Day | null>(null);

  // Group into weeks. Position 0 = oldest. Pad start so the first column starts on Sunday.
  if (data.length === 0) return null;

  const cellSize = 11;
  const cellGap  = 2;
  const stride   = cellSize + cellGap;

  // Align: pad with empty days at the start so column 0's Sunday lines up
  const firstDate     = new Date(data[0].date);
  const padding       = firstDate.getDay(); // 0 = Sunday
  const padded: (Day | null)[] = Array(padding).fill(null).concat(data);
  const numWeeks      = Math.ceil(padded.length / 7);

  const width  = numWeeks * stride;
  const height = 7 * stride;

  // Month labels (above)
  const monthLabels: { x: number; label: string }[] = [];
  let lastMonth = -1;
  for (let w = 0; w < numWeeks; w++) {
    const idx = w * 7;
    const day = padded[idx];
    if (day) {
      const m = new Date(day.date).getMonth();
      if (m !== lastMonth) {
        monthLabels.push({ x: w * stride, label: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'][m] });
        lastMonth = m;
      }
    }
  }

  return (
    <div className="w-full overflow-x-auto">
      <svg width={width + 20} height={height + 22} className="select-none">
        {/* Month labels */}
        {monthLabels.map((m, i) => (
          <text key={i} x={m.x + 20} y={10} className="fill-ink/40 text-[9px] font-mono">{m.label}</text>
        ))}
        {/* Day-of-week labels (left) */}
        {['', '月', '', '水', '', '金', ''].map((d, i) => (
          <text key={i} x={0} y={20 + i * stride + 8} className="fill-ink/30 text-[8px] font-mono">{d}</text>
        ))}
        {/* Cells */}
        {padded.map((day, i) => {
          if (!day) return null;
          const week = Math.floor(i / 7);
          const dow  = i % 7;
          return (
            <rect
              key={i}
              x={week * stride + 20}
              y={dow * stride + 14}
              width={cellSize}
              height={cellSize}
              rx={2}
              className={`${intensity(day.count)} stroke-ink/5 transition-opacity hover:opacity-70`}
              onMouseEnter={() => setHovered(day)}
              onMouseLeave={() => setHovered(null)}
            />
          );
        })}
      </svg>

      <div className="flex items-center justify-between text-xs text-ink/50 mt-2 px-5">
        <span className="font-mono">
          {hovered
            ? `${hovered.date} · ${hovered.count}件`
            : `合計アクティブ日数: ${data.filter(d => d.count > 0).length}日`}
        </span>
        <span className="flex items-center gap-1">
          少
          <svg width={64} height={11}>
            {['fill-ink/5', 'fill-moss/30', 'fill-moss/55', 'fill-moss/75', 'fill-moss'].map((cls, i) => (
              <rect key={i} x={i * 13} y={0} width={11} height={11} rx={2} className={cls} />
            ))}
          </svg>
          多
        </span>
      </div>
    </div>
  );
}
