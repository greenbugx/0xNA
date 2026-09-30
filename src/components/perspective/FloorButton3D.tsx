import { useState, useMemo } from 'react';
import {
  computeFloorButtonGeometry,
  pointsToSvgPolygon,
  type PerspectiveRoomConfig,
  type RoomTheme,
} from './geometry';

export interface FloorButton3DProps {
  config: PerspectiveRoomConfig;
  currentTheme: RoomTheme;
  onThemeToggle: () => void;
  strokeWidth?: number;
}

export function FloorButton3D({
  config,
  currentTheme,
  onThemeToggle,
  strokeWidth = 1,
}: FloorButton3DProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const buttonHeight = isPressed ? 3.5 : isHovered ? 16 : 13.5;

  const geom = useMemo(() => {
    return computeFloorButtonGeometry(config, buttonHeight);
  }, [config, buttonHeight]);

  const socketPoly = useMemo(
    () => pointsToSvgPolygon(geom.socketPoints),
    [geom.socketPoints]
  );
  const basePoly = useMemo(
    () => pointsToSvgPolygon(geom.basePoints),
    [geom.basePoints]
  );
  const topPoly = useMemo(
    () => pointsToSvgPolygon(geom.topPoints),
    [geom.topPoints]
  );
  const frontPoly = useMemo(
    () => pointsToSvgPolygon(geom.frontFace),
    [geom.frontFace]
  );
  const leftPoly = useMemo(
    () => pointsToSvgPolygon(geom.leftFace),
    [geom.leftFace]
  );

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`Color Theme: ${currentTheme.name}. Click to change color theme`}
      className="cursor-pointer pointer-events-auto select-none outline-none group"
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        setIsPressed(true);
      }}
      onPointerUp={(e) => {
        e.stopPropagation();
        setIsPressed(false);
        onThemeToggle();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsPressed(true);
          setTimeout(() => {
            setIsPressed(false);
            onThemeToggle();
          }, 100);
        }
      }}
      style={{
        transition: 'transform 0.12s cubic-bezier(0.2, 0.8, 0.2, 1)',
      }}
    >
      <polygon
        points={socketPoly}
        fill="none"
        stroke={currentTheme.strokeColor}
        strokeWidth={strokeWidth}
        opacity={0.35}
        strokeDasharray="2.5 2"
      />

      <polygon
        points={basePoly}
        fill={currentTheme.strokeColor}
        opacity={0.16}
      />

      <polygon
        points={leftPoly}
        fill={currentTheme.buttonSideFill}
        stroke={currentTheme.strokeColor}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />

      <polygon
        points={frontPoly}
        fill={currentTheme.buttonFrontFill}
        stroke={currentTheme.strokeColor}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />

      <polygon
        points={topPoly}
        fill={currentTheme.buttonCapFill}
        stroke={currentTheme.strokeColor}
        strokeWidth={Math.max(1.3, strokeWidth * 1.35)}
        strokeLinejoin="round"
      />

      <g
        transform={`translate(${geom.center.x.toFixed(2)}, ${geom.center.y.toFixed(2)}) scale(1, 0.72)`}
        className="pointer-events-none"
      >
        <circle
          cx="0"
          cy="0"
          r="9.5"
          fill="none"
          stroke={currentTheme.strokeColor}
          strokeWidth="0.8"
          opacity={0.45}
        />

        <path
          d="M 0 -8.5 A 8.5 8.5 0 0 1 8.5 0 L 0 0 Z"
          fill="#ff2a85"
          opacity={0.92}
        />
        <path
          d="M 8.5 0 A 8.5 8.5 0 0 1 0 8.5 L 0 0 Z"
          fill="#00f0ff"
          opacity={0.92}
        />
        <path
          d="M 0 8.5 A 8.5 8.5 0 0 1 -8.5 0 L 0 0 Z"
          fill="#00ff66"
          opacity={0.92}
        />
        <path
          d="M -8.5 0 A 8.5 8.5 0 0 1 0 -8.5 L 0 0 Z"
          fill="#ffb800"
          opacity={0.92}
        />

        <circle
          cx="0"
          cy="0"
          r="3.6"
          fill={currentTheme.accentColor}
          stroke={currentTheme.backgroundColor}
          strokeWidth="1.2"
        />
      </g>
    </g>
  );
}
