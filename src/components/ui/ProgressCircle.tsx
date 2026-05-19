'use client';

import { cn } from '@/utils/cn';

interface ProgressCircleProps {
  value: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  showLabel?: boolean;
  label?: string;
  className?: string;
}

const sizes = {
  sm: 'w-10 h-10 text-xs',
  md: 'w-14 h-14 text-sm',
  lg: 'w-20 h-20 text-lg',
};

export function ProgressCircle({
  value,
  size = 'md',
  color = 'rgb(59, 130, 246)',
  showLabel = true,
  label,
  className,
}: ProgressCircleProps) {
  const radius = size === 'sm' ? 16 : size === 'lg' ? 36 : 24;
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = size === 'sm' ? 3 : size === 'lg' ? 5 : 4;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', sizes[size], className)}>
      <svg className="transform -rotate-90" width="100%" height="100%" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="var(--surface-color)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {showLabel && (
        <span
          className={cn(
            'absolute font-bold',
            size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : 'text-sm'
          )}
          style={{ color: value === 100 ? '#22C55E' : color }}
        >
          {value}%
        </span>
      )}
    </div>
  );
}