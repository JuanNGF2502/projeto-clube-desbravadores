'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

interface UnitHeaderProps {
  name: string;
  cores: string[];
  gender: 'M' | 'F' | 'MISTA';
  gritoDeGuerra?: string;
  icon?: LucideIcon;
  className?: string;
}

export function UnitHeader({
  name,
  cores,
  gender,
  gritoDeGuerra,
  icon: ShieldIcon,
  className,
}: UnitHeaderProps) {
  const genderLabels = {
    M: 'Masculina',
    F: 'Feminina',
    MISTA: 'Mista',
  };

  const gradientStyle = cores.length === 1
    ? cores[0]
    : `linear-gradient(135deg, ${cores[0]}, ${cores[cores.length - 1]})`;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Gradient bar */}
      <div
        className="h-1 rounded-full"
        style={{
          background: cores.length === 1
            ? cores[0]
            : `linear-gradient(to right, ${cores.join(', ')})`,
        }}
      />

      {/* Header content */}
      <div className="flex items-center gap-4">
        {/* Shield/Icon */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: gradientStyle }}
        >
          {ShieldIcon ? (
            <ShieldIcon className="w-8 h-8 text-white" />
          ) : (
            <svg
              className="w-8 h-8 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
            </svg>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-text-primary truncate">{name}</h1>
          <p className="text-sm text-muted">Unidade {genderLabels[gender]}</p>
        </div>
      </div>

      {/* Grito de Guerra */}
      {gritoDeGuerra && (
        <div
          className="px-4 py-2 rounded-xl text-center"
          style={{
            background: `${cores[0]}15`,
            border: `1px solid ${cores[0]}30`,
          }}
        >
          <p className="text-sm font-semibold" style={{ color: cores[0] }}>
            "{gritoDeGuerra}"
          </p>
        </div>
      )}
    </div>
  );
}