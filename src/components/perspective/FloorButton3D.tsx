import { useState, useMemo } from 'react';
import {
  computeFloorButtonGeometry,
  pointsToSvgPolygon,
  type PerspectiveRoomConfig,
  type RoomTheme,
} from './geometry';

export type FloorButtonIcon =
  | 'color-spectrum'
  | 'sun-moon'
  | 'mode-toggle'
  | 'crescent-moon'
  | 'sun';

export interface FloorButton3DProps {
  config: PerspectiveRoomConfig;
  currentTheme: RoomTheme;
  onClick?: () => void;
  onThemeToggle?: () => void;
  onModeToggle?: (nextMode: 'light' | 'dark') => void;
  mode?: 'light' | 'dark';
  initialMode?: 'light' | 'dark';
  strokeWidth?: number;
  colOffset?: number;
  depthOffset?: number;
  cellCol?: number;
  cellDepth?: number;
  icon?: FloorButtonIcon;
  ariaLabel?: string;
}

export function FloorButton3D({
  config,
  currentTheme,
  onClick,
  onThemeToggle,
  onModeToggle,
  mode,
  initialMode = 'light',
  strokeWidth = 1,
  colOffset = 3,
  depthOffset = 3,
  cellCol,
  cellDepth,
  icon = 'color-spectrum',
  ariaLabel,
}: FloorButton3DProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [internalMode, setInternalMode] = useState<'light' | 'dark'>(initialMode);

  const activeMode = mode ?? internalMode;
  const isModeButton =
    icon === 'sun-moon' ||
    icon === 'mode-toggle' ||
    icon === 'crescent-moon' ||
    icon === 'sun';

  const isDarkMode =
    icon === 'sun' ? true : icon === 'crescent-moon' ? false : activeMode === 'dark';

  const buttonHeight = isPressed ? 3.5 : isHovered ? 16 : 13.5;

  const geom = useMemo(() => {
    return computeFloorButtonGeometry(
      config,
      buttonHeight,
      colOffset,
      depthOffset,
      cellCol,
      cellDepth
    );
  }, [config, buttonHeight, colOffset, depthOffset, cellCol, cellDepth]);

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
  const sidePoly = useMemo(
    () => pointsToSvgPolygon(geom.sideFace ?? geom.leftFace),
    [geom.sideFace, geom.leftFace]
  );

  const handleAction = () => {
    if (isModeButton) {
      const nextMode = activeMode === 'light' ? 'dark' : 'light';
      setInternalMode(nextMode);
      onModeToggle?.(nextMode);
    }
    if (onClick) {
      onClick();
    } else if (onThemeToggle) {
      onThemeToggle();
    }
  };

  const defaultLabel = isModeButton
    ? isDarkMode
      ? 'Switch to light mode'
      : 'Switch to dark mode'
    : `Color Theme: ${currentTheme.name}. Click to change color theme`;
  const computedAriaLabel = ariaLabel ?? defaultLabel;

  const isDarkCanvas = isDarkMode || activeMode === 'dark';
  const buttonCapFill = isDarkCanvas ? '#222222' : currentTheme.buttonCapFill;
  const buttonSideFill = isDarkCanvas ? '#171717' : currentTheme.buttonSideFill;
  const buttonFrontFill = isDarkCanvas ? '#0d0d0d' : currentTheme.buttonFrontFill;
  const buttonStrokeColor =
    isDarkCanvas && currentTheme.id === 'monochrome'
      ? '#ffffff'
      : currentTheme.strokeColor;

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={computedAriaLabel}
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
        handleAction();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsPressed(true);
          setTimeout(() => {
            setIsPressed(false);
            handleAction();
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
        stroke={buttonStrokeColor}
        strokeWidth={strokeWidth}
        opacity={0.35}
        strokeDasharray="2.5 2"
      />

      <polygon
        points={basePoly}
        fill={buttonStrokeColor}
        opacity={0.16}
      />

      <polygon
        points={sidePoly}
        fill={buttonSideFill}
        stroke={buttonStrokeColor}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />

      <polygon
        points={frontPoly}
        fill={buttonFrontFill}
        stroke={buttonStrokeColor}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />

      <polygon
        points={topPoly}
        fill={buttonCapFill}
        stroke={buttonStrokeColor}
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
          stroke={buttonStrokeColor}
          strokeWidth="0.8"
          opacity={0.45}
        />

        {isModeButton ? (
          isDarkMode ? (
            <g>
              <circle
                cx="0"
                cy="0"
                r="3.8"
                fill="#ffb800"
                stroke={buttonStrokeColor}
                strokeWidth="0.6"
              />
              <line
                x1="0"
                y1="-5.2"
                x2="0"
                y2="-7.5"
                stroke="#ffb800"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
              <line
                x1="3.7"
                y1="-3.7"
                x2="5.3"
                y2="-5.3"
                stroke="#ffb800"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
              <line
                x1="5.2"
                y1="0"
                x2="7.5"
                y2="0"
                stroke="#ffb800"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
              <line
                x1="3.7"
                y1="3.7"
                x2="5.3"
                y2="5.3"
                stroke="#ffb800"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
              <line
                x1="0"
                y1="5.2"
                x2="0"
                y2="7.5"
                stroke="#ffb800"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
              <line
                x1="-3.7"
                y1="3.7"
                x2="-5.3"
                y2="5.3"
                stroke="#ffb800"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
              <line
                x1="-5.2"
                y1="0"
                x2="-7.5"
                y2="0"
                stroke="#ffb800"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
              <line
                x1="-3.7"
                y1="-3.7"
                x2="-5.3"
                y2="-5.3"
                stroke="#ffb800"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
              <circle
                cx="0"
                cy="0"
                r="1.4"
                fill={currentTheme.accentColor}
                stroke="#ffffff"
                strokeWidth="0.5"
              />
            </g>
          ) : (
            <g>
              <path
                d="M 2.2 -5.5 A 6 6 0 1 0 2.2 5.5 A 5.8 5.8 0 0 1 2.2 -5.5 Z"
                fill="#18181b"
                stroke={buttonStrokeColor}
                strokeWidth="0.5"
              />
              <path
                d="M 4.5 -2.2 Q 4.5 -1.2 5.5 -1.2 Q 4.5 -1.2 4.5 -0.2 Q 4.5 -1.2 3.5 -1.2 Q 4.5 -1.2 4.5 -2.2 Z"
                fill="#ffb800"
              />
              <circle
                cx="4.2"
                cy="2.4"
                r="0.65"
                fill="#ffb800"
              />
              <circle
                cx="0"
                cy="0"
                r="1.3"
                fill={currentTheme.accentColor}
                stroke="#ffffff"
                strokeWidth="0.5"
              />
            </g>
          )
        ) : (
          <g>
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
              stroke={isDarkCanvas ? '#0a0a0a' : currentTheme.backgroundColor}
              strokeWidth="1.2"
            />
          </g>
        )}
      </g>
    </g>
  );
}
