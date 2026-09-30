import { useMemo, useState, useEffect } from 'react';
import mePortrait from '../../assets/images/me.webp';
import {
  ROOM_LEFT,
  ROOM_RIGHT,
  ROOM_TOP,
  ROOM_BOTTOM,
  VANISHING_POINT,
  DEFAULT_ROOM_BOUNDS,
  computeRoomGeometry,
  computeLeftWallMatrix3d,
  computeRightWallMatrix3d,
  pointsToSvgPolygon,
  type PerspectiveRoomConfig,
  type Point,
} from './geometry';
import { RoomPlane } from './RoomPlane';
import { PerspectiveGrid } from './PerspectiveGrid';

export interface PerspectiveRoomProps {
  vanishingPoint?: Point;
  backWallScale?: number;
  strokeColor?: string;
  backgroundColor?: string;
  strokeWidth?: number;
  boundaryStrokeWidth?: number;
  horizontalSubdivisions?: number;
  verticalSubdivisions?: number;
  depthSteps?: number;
  brandLabel?: string;
  leftWallText?: string;
  centerWallText?: string;
  rightWallImage?: string;
  className?: string;
}

export function PerspectiveRoom({
  vanishingPoint,
  backWallScale,
  strokeColor = '#0a0a0a',
  backgroundColor = '#fafafa',
  strokeWidth = 1,
  boundaryStrokeWidth = 1.6,
  horizontalSubdivisions,
  verticalSubdivisions,
  depthSteps,
  brandLabel = '0xNA',
  leftWallText = '0X',
  centerWallText = 'NA',
  rightWallImage = mePortrait,
  className = '',
}: PerspectiveRoomProps) {
  const [viewport, setViewport] = useState<{ width: number; height: number }>(() => {
    if (typeof window !== 'undefined') {
      return { width: window.innerWidth, height: window.innerHeight };
    }
    return { width: 1440, height: 900 };
  });

  useEffect(() => {
    const handleResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = viewport.width < 768;

  const activeConfig: PerspectiveRoomConfig = useMemo(() => {
    const defaultVp = isMobile
      ? { x: 500, y: 450 }
      : VANISHING_POINT;

    const defaultScale = isMobile ? 0.38 : 0.36;

    return {
      vanishingPoint: vanishingPoint ?? defaultVp,
      roomBounds: DEFAULT_ROOM_BOUNDS,
      backWallScale: backWallScale ?? defaultScale,
      horizontalSubdivisions: horizontalSubdivisions ?? (isMobile ? 10 : 14),
      verticalSubdivisions: verticalSubdivisions ?? (isMobile ? 6 : 8),
      depthSteps: depthSteps ?? (isMobile ? 8 : 10),
    };
  }, [
    vanishingPoint,
    backWallScale,
    horizontalSubdivisions,
    verticalSubdivisions,
    depthSteps,
    isMobile,
  ]);

  const geometry = useMemo(() => {
    return computeRoomGeometry(activeConfig);
  }, [activeConfig]);

  const outermostCeilingLine =
    geometry.grids.ceilingTransverse[geometry.grids.ceilingTransverse.length - 1];
  const badgeTopPercent = outermostCeilingLine
    ? outermostCeilingLine.y1 / 10
    : 6.5;

  const leftWallClipPoints = useMemo(
    () => pointsToSvgPolygon(geometry.planes.leftWall),
    [geometry.planes.leftWall]
  );

  const backWallClipPoints = useMemo(
    () => pointsToSvgPolygon(geometry.planes.backWall),
    [geometry.planes.backWall]
  );

  const leftWallCssClip = useMemo(() => {
    const pts = geometry.planes.leftWall
      .map((p) => `${(p.x / 10).toFixed(2)}% ${(p.y / 10).toFixed(2)}%`)
      .join(', ');
    return `polygon(${pts})`;
  }, [geometry.planes.leftWall]);

  const rightWallCssClip = useMemo(() => {
    const pts = geometry.planes.rightWall
      .map((p) => `${(p.x / 10).toFixed(2)}% ${(p.y / 10).toFixed(2)}%`)
      .join(', ');
    return `polygon(${pts})`;
  }, [geometry.planes.rightWall]);

  const leftWallMatrix = useMemo(() => {
    return computeLeftWallMatrix3d(
      viewport.width,
      viewport.height,
      activeConfig.vanishingPoint,
      activeConfig.roomBounds,
      activeConfig.backWallScale
    );
  }, [viewport.width, viewport.height, activeConfig]);

  const rightWallMatrix = useMemo(() => {
    return computeRightWallMatrix3d(
      viewport.width,
      viewport.height,
      activeConfig.vanishingPoint,
      activeConfig.roomBounds,
      activeConfig.backWallScale
    );
  }, [viewport.width, viewport.height, activeConfig]);

  const leftWallWidthPercent = geometry.backWall.left / 10;
  const rightWallLeftPercent = geometry.backWall.right / 10;
  const rightWallWidthPercent = 100 - rightWallLeftPercent;

  return (
    <div
      className={`relative w-screen h-screen overflow-hidden ${className}`}
      style={{ backgroundColor }}
      data-testid="perspective-room-container"
    >
      {rightWallImage && (
        <div
          className="absolute inset-0 pointer-events-none select-none overflow-hidden"
          style={{ clipPath: rightWallCssClip }}
          data-layer="right-wall-image-layer"
        >
          <div
            className="absolute top-0 h-full origin-top-left"
            style={{
              left: `${rightWallLeftPercent}%`,
              width: `${rightWallWidthPercent}%`,
              transform: rightWallMatrix,
            }}
          >
            <img
              src={rightWallImage}
              alt=""
              className="w-full h-full object-cover object-center mix-blend-multiply"
              draggable={false}
            />
          </div>
        </div>
      )}

      <svg
        viewBox={`${ROOM_LEFT} ${ROOM_TOP} ${ROOM_RIGHT} ${ROOM_BOTTOM}`}
        preserveAspectRatio="none"
        className="relative z-10 w-full h-full block pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Interactive 2D perspective room"
        role="img"
      >
        <defs>
          <clipPath id="left-wall-clip">
            <polygon points={leftWallClipPoints} />
          </clipPath>
          <clipPath id="back-wall-clip">
            <polygon points={backWallClipPoints} />
          </clipPath>
        </defs>

        <g id="layer-2-ceiling-geometry">
          <RoomPlane
            id="ceiling"
            points={geometry.planes.ceiling}
            stroke={strokeColor}
            strokeWidth={boundaryStrokeWidth}
            fill="none"
          />
        </g>

        <g id="layer-3-left-wall-geometry">
          <RoomPlane
            id="left-wall"
            points={geometry.planes.leftWall}
            stroke={strokeColor}
            strokeWidth={boundaryStrokeWidth}
            fill="none"
          >
            <g clipPath="url(#left-wall-clip)" data-layer="left-wall-pattern">
              {geometry.leftWallPattern.map((node) =>
                node.kind === 'square' ? (
                  <rect
                    key={node.id}
                    x={node.x - node.r}
                    y={node.y - node.r}
                    width={node.r * 2}
                    height={node.r * 2}
                    fill={strokeColor}
                  />
                ) : (
                  <circle
                    key={node.id}
                    cx={node.x}
                    cy={node.y}
                    r={node.r}
                    fill={strokeColor}
                  />
                )
              )}
            </g>
          </RoomPlane>
        </g>

        <g id="layer-4-right-wall-geometry">
          <RoomPlane
            id="right-wall"
            points={geometry.planes.rightWall}
            stroke={strokeColor}
            strokeWidth={boundaryStrokeWidth}
            fill="none"
          />
        </g>

        <g id="layer-5-back-wall-boundary">
          <RoomPlane
            id="back-wall"
            points={geometry.planes.backWall}
            stroke={strokeColor}
            strokeWidth={boundaryStrokeWidth}
            fill={strokeColor}
          >
            <g clipPath="url(#back-wall-clip)" data-layer="back-wall-waves">
              {geometry.backWallWaves.map((wave) => (
                <path
                  key={wave.id}
                  d={wave.d}
                  fill="none"
                  stroke={backgroundColor}
                  strokeWidth={strokeWidth}
                  vectorEffect="non-scaling-stroke"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
            </g>
          </RoomPlane>
        </g>

        <g id="layer-6-floor-geometry">
          <RoomPlane
            id="floor"
            points={geometry.planes.floor}
            stroke={strokeColor}
            strokeWidth={boundaryStrokeWidth}
            fill="none"
          />
        </g>

        <g id="layer-7-perspective-guide-lines">
          <PerspectiveGrid
            lines={geometry.grids.ceilingRadial}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            data-layer="ceiling-radial"
          />

          <PerspectiveGrid
            lines={geometry.grids.ceilingTransverse}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            data-layer="ceiling-transverse"
          />

          <PerspectiveGrid
            lines={geometry.grids.floorRadial}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            data-layer="floor-radial"
          />

          <PerspectiveGrid
            lines={geometry.grids.floorTransverse}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            data-layer="floor-transverse"
          />

          <PerspectiveGrid
            lines={geometry.cornerRays}
            stroke={strokeColor}
            strokeWidth={boundaryStrokeWidth}
            data-layer="primary-corner-rays"
          />
        </g>
      </svg>

      {leftWallText && (
        <div
          className="absolute inset-0 z-15 pointer-events-none select-none overflow-hidden"
          style={{ clipPath: leftWallCssClip }}
          data-layer="left-wall-text-layer"
        >
          <div
            className="absolute left-0 top-0 h-full origin-top-left"
            style={{
              width: `${leftWallWidthPercent}%`,
              transform: leftWallMatrix,
            }}
          >
            <svg
              viewBox="1 0 1095 498"
              preserveAspectRatio="none"
              className="w-full h-full block"
              xmlns="http://www.w3.org/2000/svg"
            >
              <text
                x="0"
                y="563"
                fontSize="1000"
                fill={strokeColor}
                className="font-arcadeclassic"
              >
                {leftWallText}
              </text>
            </svg>
          </div>
        </div>
      )}

      {centerWallText && (
        <div
          className="absolute z-15 pointer-events-none select-none overflow-hidden"
          style={{
            left: `${geometry.backWall.left / 10}%`,
            top: `${geometry.backWall.top / 10}%`,
            width: `${(geometry.backWall.right - geometry.backWall.left) / 10}%`,
            height: `${(geometry.backWall.bottom - geometry.backWall.top) / 10}%`,
          }}
          data-layer="center-wall-text-layer"
        >
          <svg
            viewBox="1 0 1048 498"
            preserveAspectRatio="none"
            className="w-full h-full block"
            xmlns="http://www.w3.org/2000/svg"
          >
            <text
              x="0"
              y="563"
              fontSize="1000"
              fill="#ffffff"
              className="font-arcadeclassic"
            >
              {centerWallText}
            </text>
          </svg>
        </div>
      )}

      {brandLabel && (
        <div
          className="absolute z-20 left-[13%] -translate-y-1/2 flex items-center justify-center px-6 py-1.5 md:px-8 md:py-2 border-[1.5px] select-none font-minecraft text-base md:text-xl lg:text-2xl tracking-wider leading-none"
          style={{
            top: `${badgeTopPercent}%`,
            backgroundColor,
            borderColor: strokeColor,
            color: strokeColor,
          }}
        >
          <span className="translate-y-[1px]">{brandLabel}</span>
        </div>
      )}
    </div>
  );
}

