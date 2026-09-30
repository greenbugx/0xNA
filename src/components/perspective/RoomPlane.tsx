import type { ReactNode, CSSProperties } from 'react';
import { type Point, pointsToSvgPolygon } from './geometry';

export type PlaneId = 'ceiling' | 'left-wall' | 'right-wall' | 'back-wall' | 'floor';

export interface RoomPlaneProps {
  id: PlaneId;
  points: Point[];
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export function RoomPlane({
  id,
  points,
  stroke = '#000000',
  strokeWidth = 1.25,
  fill = 'none',
  style,
  children,
}: RoomPlaneProps) {
  const polygonPoints = pointsToSvgPolygon(points);

  return (
    <g data-plane={id}>
      <polygon
        points={polygonPoints}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="miter"
        vectorEffect="non-scaling-stroke"
        style={{
          transition: 'fill 0.25s ease, stroke 0.25s ease',
          ...style,
        }}
      />
      {children}
    </g>
  );
}
