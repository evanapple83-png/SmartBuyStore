'use client';
import { useEffect, useState } from 'react';

function getSecondsUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.floor((midnight.getTime() - now.getTime()) / 1000);
}

function formatUnit(n: number): string {
  return String(n).padStart(2, '0');
}

export function CountdownTimer() {
  const [seconds, setSeconds] = useState(getSecondsUntilMidnight());

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(getSecondsUntilMidnight());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  return (
    <div className="flex items-center gap-1">
      {[
        { value: h, label: 'uur' },
        { value: m, label: 'min' },
        { value: s, label: 'sec' },
      ].map(({ value, label }, i) => (
        <span key={label} className="flex items-center gap-1">
          <span className="bg-primary text-white font-display font-bold text-lg px-2 py-1 rounded-lg min-w-[2.5rem] text-center tabular-nums">
            {formatUnit(value)}
          </span>
          <span className="text-muted text-xs">{label}</span>
          {i < 2 && <span className="text-accent font-bold">:</span>}
        </span>
      ))}
    </div>
  );
}
