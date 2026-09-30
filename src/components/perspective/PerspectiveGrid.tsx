import type { LineSegment } from './geometry';

export interface PerspectiveGridProps {
  lines: LineSegment[];
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  className?: string;
  'data-layer'?: string;
}

export function PerspectiveGrid({
  lines,
  stroke = '#000000',
  strokeWidth = 1,
  strokeDasharray,
  className,
  'data-layer': dataLayer,
}: PerspectiveGridProps) {
  return (
    <g className={className} data-layer={dataLayer}>
      {lines.map((line) => (
        <line
          key={line.id}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
        />
      ))}
    </g>
  );
}
