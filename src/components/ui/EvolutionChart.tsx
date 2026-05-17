'use client';

import { useMemo } from 'react';

interface DataPoint {
  label: string;
  value: number;
}

interface EvolutionChartProps {
  title: string;
  data: DataPoint[];
  color?: string;
  height?: number;
  showLabels?: boolean;
  type?: 'line' | 'bar';
}

export function EvolutionChart({
  title,
  data,
  color = '#3B82F6',
  height = 200,
  showLabels = true,
  type = 'line',
}: EvolutionChartProps) {
  const { maxValue, points, areaPath, linePath } = useMemo(() => {
    if (data.length === 0) {
      return { maxValue: 100, points: [], areaPath: '', linePath: '' };
    }

    const values = data.map((d) => d.value);
    const max = Math.max(...values, 1);

    const padding = 20;
    const chartWidth = 100; // percent
    const stepX = chartWidth / Math.max(data.length - 1, 1);

    const calculatedPoints = data.map((d, i) => ({
      x: i * stepX,
      y: padding + ((max - d.value) / max) * (height - padding * 2),
      value: d.value,
      label: d.label,
    }));

    const linePathPoints = calculatedPoints
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');

    const areaPathD = [
      ...calculatedPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`),
      `L ${calculatedPoints[calculatedPoints.length - 1].x} ${height - padding}`,
      `L ${calculatedPoints[0].x} ${height - padding}`,
      'Z',
    ].join(' ');

    return {
      maxValue: max,
      points: calculatedPoints,
      linePath: linePathPoints,
      areaPath: areaPathD,
    };
  }, [data, height]);

  if (data.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-card border border-border">
        <h3 className="text-sm font-semibold text-text-primary mb-4">{title}</h3>
        <div
          className="flex items-center justify-center text-muted"
          style={{ height }}
        >
          Sem dados disponíveis
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-card border border-border">
      <h3 className="text-sm font-semibold text-text-primary mb-4">{title}</h3>
      <svg
        viewBox={`0 0 100 ${height}`}
        className="w-full"
        preserveAspectRatio="none"
      >
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <line
            key={i}
            x1="0"
            y1={20 + ratio * (height - 40)}
            x2="100"
            y2={20 + ratio * (height - 40)}
            stroke="var(--border-color)"
            strokeWidth="0.5"
            strokeDasharray="2"
          />
        ))}

        {type === 'line' ? (
          <>
            {/* Area fill */}
            <path
              d={areaPath}
              fill={color}
              fillOpacity="0.1"
            />
            {/* Line */}
            <path
              d={linePath}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Points */}
            {points.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r="2"
                fill={color}
              />
            ))}
          </>
        ) : (
          /* Bar chart */
          points.map((p, i) => {
            const barHeight = ((p.value / maxValue) * (height - 40));
            return (
              <rect
                key={i}
                x={p.x - 8}
                y={height - 20 - barHeight}
                width="16"
                height={barHeight}
                rx="2"
                fill={color}
                fillOpacity="0.8"
              />
            );
          })
        )}
      </svg>

      {showLabels && (
        <div className="flex justify-between mt-2 text-xs text-muted">
          {points.map((p, i) => (
            <span key={i} className="truncate max-w-[60px]">
              {p.label}
            </span>
          ))}
        </div>
      )}

      <div className="flex justify-between mt-1 text-xs text-muted">
        <span>0</span>
        <span>{maxValue}</span>
      </div>
    </div>
  );
}

// Componente de gráfico de pizza simples
interface PieChartProps {
  title: string;
  data: { label: string; value: number; color: string }[];
  size?: number;
}

export function PieChart({ title, data, size = 150 }: PieChartProps) {
  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);

  const slices = useMemo(() => {
    if (total === 0) return [];

    let currentAngle = 0;
    return data.map((d) => {
      const percentage = d.value / total;
      const angle = percentage * 360;
      const startAngle = currentAngle;
      currentAngle += angle;

      return {
        ...d,
        percentage: Math.round(percentage * 100),
        startAngle,
        endAngle: currentAngle,
      };
    });
  }, [data, total]);

  const describeArc = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(size / 2, size / 2, size / 2 - 2, endAngle);
    const end = polarToCartesian(size / 2, size / 2, size / 2 - 2, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return [
      'M', start.x, start.y,
      'A', size / 2 - 2, size / 2 - 2, 0, largeArcFlag, 0, end.x, end.y,
    ].join(' ');
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  return (
    <div className="p-4 rounded-xl bg-card border border-border">
      <h3 className="text-sm font-semibold text-text-primary mb-4">{title}</h3>

      {total === 0 ? (
        <div className="flex items-center justify-center text-muted" style={{ height: size }}>
          Sem dados
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <svg width={size} height={size} className="flex-shrink-0">
            {slices.map((slice, i) => (
              <path
                key={i}
                d={describeArc(slice.startAngle, slice.endAngle)}
                fill={slice.color}
              />
            ))}
            <circle cx={size / 2} cy={size / 2} r={size / 4} fill="var(--card-color)" />
          </svg>

          <div className="flex-1 space-y-2">
            {slices.map((slice, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="text-sm text-text-primary">{slice.label}</span>
                </div>
                <span className="text-sm font-medium text-text-primary">
                  {slice.value} ({slice.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}