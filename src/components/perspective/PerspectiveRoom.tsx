import { useMemo, useState, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import meDarkPortrait from '../../assets/images/me.webp';
import meLightPortrait from '../../assets/images/me-bg.webp';
import {
  ROOM_LEFT,
  ROOM_RIGHT,
  ROOM_TOP,
  ROOM_BOTTOM,
  VANISHING_POINT,
  DEFAULT_ROOM_BOUNDS,
  DEFAULT_EXTRA_TEXT_SLIDES,
  ARCADE_WORD_SPACING,
  computeRoomGeometry,
  computeLeftWallMatrix3d,
  computeRightWallMatrix3d,
  computeArcadeTextViewBox,
  pointsToSvgPolygon,
  type PerspectiveRoomConfig,
  type Point,
  type WallSlideItem,
  type SideBreathingMode,
  ROOM_THEMES,
  type RoomTheme,
} from './geometry';
import { RoomPlane } from './RoomPlane';
import { PerspectiveGrid } from './PerspectiveGrid';
import { FloorButton3D } from './FloorButton3D';

const WALL_PITCH_PERCENT = 107;
const PIXEL_STEP_DIVISIONS = 14;
const SCROLL_VH_PER_STEP = 220;

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
  extraTextSlides?: string[];
  initialThemeIndex?: number;
  onThemeChange?: (theme: RoomTheme) => void;
  initialMode?: 'light' | 'dark';
  mode?: 'light' | 'dark';
  onModeChange?: (mode: 'light' | 'dark') => void;
  className?: string;
}

export function PerspectiveRoom({
  vanishingPoint,
  backWallScale,
  strokeColor,
  backgroundColor,
  strokeWidth = 1,
  boundaryStrokeWidth = 1.6,
  horizontalSubdivisions,
  verticalSubdivisions,
  depthSteps,
  brandLabel = '0xNA',
  leftWallText = '0X',
  centerWallText = 'NA',
  rightWallImage,
  extraTextSlides = DEFAULT_EXTRA_TEXT_SLIDES,
  initialThemeIndex = 0,
  onThemeChange,
  initialMode = 'light',
  mode: controlledMode,
  onModeChange,
  className = '',
}: PerspectiveRoomProps) {
  const [internalMode, setInternalMode] = useState<'light' | 'dark'>(initialMode);
  const activeMode = controlledMode ?? internalMode;
  const isDark = activeMode === 'dark';

  const [themeIndex, setThemeIndex] = useState(initialThemeIndex);
  const currentTheme = ROOM_THEMES[themeIndex % ROOM_THEMES.length];
  const isMonochrome = currentTheme.id === 'monochrome';
  const activeStrokeColor =
    strokeColor ??
    (isDark && isMonochrome
      ? '#ffffff'
      : currentTheme.strokeColor);
  const activeBackgroundColor =
    backgroundColor ?? (isDark ? '#0a0a0a' : '#fafafa');

  const wallTextColor = isDark ? '#ffffff' : '#0a0a0a';
  const centerWallFill = isMonochrome
    ? (isDark ? '#ffffff' : '#0a0a0a')
    : activeStrokeColor;
  const centerWallTextColor = isDark ? '#0a0a0a' : '#ffffff';
  const centerWallWaveStroke = isDark ? '#0a0a0a' : '#ffffff';
  const badgeBg = isDark ? '#0a0a0a' : '#fafafa';
  const badgeBorder = isDark ? '#ffffff' : '#0a0a0a';
  const badgeText = isDark ? '#ffffff' : '#0a0a0a';

  const handleModeToggle = (nextMode: 'light' | 'dark') => {
    setInternalMode(nextMode);
    onModeChange?.(nextMode);
  };

  const handleThemeToggle = () => {
    setThemeIndex((prev) => {
      const next = (prev + 1) % ROOM_THEMES.length;
      onThemeChange?.(ROOM_THEMES[next]);
      return next;
    });
  };

  useEffect(() => {
    document.body.style.backgroundColor = activeBackgroundColor;
  }, [activeBackgroundColor]);

  const [viewport, setViewport] = useState<{ width: number; height: number }>(() => {
    if (typeof window !== 'undefined') {
      return { width: window.innerWidth, height: window.innerHeight };
    }
    return { width: 1440, height: 900 };
  });

  const leftTrackRef = useRef<HTMLDivElement>(null);
  const centerTrackRef = useRef<HTMLDivElement>(null);
  const rightTrackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeRightWallImage =
    rightWallImage ?? (isDark ? meDarkPortrait : meLightPortrait);

  const slides: WallSlideItem[] = useMemo(() => {
    const list: WallSlideItem[] = [];

    if (activeRightWallImage) {
      list.push({
        id: 'slide-right-image',
        kind: 'image',
        imageSrc: activeRightWallImage,
        initialWallPos: 2,
      });
    }

    if (centerWallText) {
      list.push({
        id: 'slide-center-text',
        kind: 'text',
        text: centerWallText.toUpperCase(),
        initialWallPos: 1,
      });
    }

    if (leftWallText) {
      list.push({
        id: 'slide-left-text',
        kind: 'text',
        text: leftWallText.toUpperCase(),
        initialWallPos: 0,
      });
    }

    extraTextSlides.forEach((txt, idx) => {
      list.push({
        id: `slide-extra-${idx}`,
        kind: 'text',
        text: txt.toUpperCase(),
        initialWallPos: -(idx + 1),
      });
    });

    return list;
  }, [activeRightWallImage, centerWallText, leftWallText, extraTextSlides]);

  const maxScrollSteps = useMemo(() => {
    return Math.max(1, extraTextSlides.length);
  }, [extraTextSlides.length]);

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.045,
      wheelMultiplier: 0.45,
      touchMultiplier: 0.6,
      smoothWheel: true,
      syncTouch: true,
    });

    const applyScrollProgress = (progress: number) => {
      const clamped = Math.max(0, Math.min(1, progress));
      const rawStep = clamped * maxScrollSteps;
      const quantizedStep =
        Math.round(rawStep * PIXEL_STEP_DIVISIONS) / PIXEL_STEP_DIVISIONS;

      const baseStep = Math.floor(quantizedStep);
      const frac = quantizedStep - baseStep;
      const s = 0.36;
      const rightWarpedFrac =
        frac > 0 ? frac / (s + (1 - s) * frac) : 0;
      const rightQuantizedStep =
        baseStep +
        Math.round(rightWarpedFrac * PIXEL_STEP_DIVISIONS) /
          PIXEL_STEP_DIVISIONS;

      const translatePercent = quantizedStep * WALL_PITCH_PERCENT;
      const rightTranslatePercent = rightQuantizedStep * WALL_PITCH_PERCENT;
      const transformStr = `translate3d(${translatePercent.toFixed(2)}%, 0, 0)`;
      const rightTransformStr = `translate3d(${rightTranslatePercent.toFixed(2)}%, 0, 0)`;

      if (leftTrackRef.current) {
        leftTrackRef.current.style.transform = transformStr;
      }
      if (centerTrackRef.current) {
        centerTrackRef.current.style.transform = transformStr;
      }
      if (rightTrackRef.current) {
        rightTrackRef.current.style.transform = rightTransformStr;
      }
    };

    lenis.on('scroll', ({ progress }: { progress: number }) => {
      applyScrollProgress(progress);
    });

    applyScrollProgress(lenis.progress);

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [maxScrollSteps]);

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

  const renderWallSlides = (
    wallIndex: 0 | 1 | 2,
    textColor: string,
    sideBreathing: SideBreathingMode
  ) => {
    return slides.map((slide) => {
      const leftOffsetPercent =
        (slide.initialWallPos - wallIndex) * WALL_PITCH_PERCENT;

      return (
        <div
          key={`${wallIndex}-${slide.id}`}
          className="absolute top-0 h-full w-full overflow-hidden"
          style={{ left: `${leftOffsetPercent}%` }}
        >
          {slide.kind === 'image' && slide.imageSrc ? (
            <img
              src={slide.imageSrc}
              alt=""
              className={`w-full h-full object-cover object-center ${isDark ? '' : 'mix-blend-multiply'}`}
              draggable={false}
            />
          ) : slide.kind === 'text' && slide.text ? (
            <svg
              viewBox={computeArcadeTextViewBox(slide.text, sideBreathing)}
              preserveAspectRatio="none"
              className="w-full h-full block"
              shapeRendering="crispEdges"
              xmlns="http://www.w3.org/2000/svg"
            >
              <text
                x="0"
                y="563"
                fontSize="1000"
                wordSpacing={ARCADE_WORD_SPACING}
                fill={textColor}
                className="font-arcadeclassic"
                style={{ transition: 'fill 0.25s ease' }}
              >
                {slide.text}
              </text>
            </svg>
          ) : null}
        </div>
      );
    });
  };

  return (
    <div
      className={`relative w-full ${className}`}
      style={{
        height: `${100 + maxScrollSteps * SCROLL_VH_PER_STEP}vh`,
        backgroundColor: activeBackgroundColor,
        transition: 'background-color 0.25s ease',
      }}
    >
      <div
        className="fixed inset-0 w-screen h-screen overflow-hidden"
        style={{
          backgroundColor: activeBackgroundColor,
          transition: 'background-color 0.25s ease',
        }}
        data-testid="perspective-room-container"
      >
        <div
          className="absolute inset-0 pointer-events-none select-none overflow-hidden"
          style={{ clipPath: rightWallCssClip }}
          data-layer="right-wall-conveyor-layer"
        >
          <div
            className="absolute top-0 h-full origin-top-left overflow-hidden"
            style={{
              left: `${rightWallLeftPercent}%`,
              width: `${rightWallWidthPercent}%`,
              transform: rightWallMatrix,
            }}
          >
            <div
              ref={rightTrackRef}
              className="relative w-full h-full will-change-transform"
            >
              {renderWallSlides(2, wallTextColor, 'left')}
            </div>
          </div>
        </div>

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
              stroke={activeStrokeColor}
              strokeWidth={boundaryStrokeWidth}
              fill="none"
            />
          </g>

          <g id="layer-3-left-wall-geometry">
            <RoomPlane
              id="left-wall"
              points={geometry.planes.leftWall}
              stroke={activeStrokeColor}
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
                      fill={activeStrokeColor}
                      style={{ transition: 'fill 0.25s ease' }}
                    />
                  ) : (
                    <circle
                      key={node.id}
                      cx={node.x}
                      cy={node.y}
                      r={node.r}
                      fill={activeStrokeColor}
                      style={{ transition: 'fill 0.25s ease' }}
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
              stroke={activeStrokeColor}
              strokeWidth={boundaryStrokeWidth}
              fill="none"
            />
          </g>

          <g id="layer-5-back-wall-boundary">
            <RoomPlane
              id="back-wall"
              points={geometry.planes.backWall}
              stroke={activeStrokeColor}
              strokeWidth={boundaryStrokeWidth}
              fill={centerWallFill}
            >
              <g clipPath="url(#back-wall-clip)" data-layer="back-wall-waves">
                {geometry.backWallWaves.map((wave) => (
                  <path
                    key={wave.id}
                    d={wave.d}
                    fill="none"
                    stroke={centerWallWaveStroke}
                    strokeWidth={strokeWidth}
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ transition: 'stroke 0.25s ease' }}
                  />
                ))}
              </g>
            </RoomPlane>
          </g>

          <g id="layer-6-floor-geometry">
            <RoomPlane
              id="floor"
              points={geometry.planes.floor}
              stroke={activeStrokeColor}
              strokeWidth={boundaryStrokeWidth}
              fill="none"
            />
          </g>

          <g id="layer-7-perspective-guide-lines">
            <PerspectiveGrid
              lines={geometry.grids.ceilingRadial}
              stroke={activeStrokeColor}
              strokeWidth={strokeWidth}
              data-layer="ceiling-radial"
            />

            <PerspectiveGrid
              lines={geometry.grids.ceilingTransverse}
              stroke={activeStrokeColor}
              strokeWidth={strokeWidth}
              data-layer="ceiling-transverse"
            />

            <PerspectiveGrid
              lines={geometry.grids.floorRadial}
              stroke={activeStrokeColor}
              strokeWidth={strokeWidth}
              data-layer="floor-radial"
            />

            <PerspectiveGrid
              lines={geometry.grids.floorTransverse}
              stroke={activeStrokeColor}
              strokeWidth={strokeWidth}
              data-layer="floor-transverse"
            />

            <PerspectiveGrid
              lines={geometry.cornerRays}
              stroke={activeStrokeColor}
              strokeWidth={boundaryStrokeWidth}
              data-layer="primary-corner-rays"
            />
          </g>

          <g id="layer-8-floor-3d-button" data-layer="floor-3d-button">
            <FloorButton3D
              config={activeConfig}
              currentTheme={currentTheme}
              cellCol={2}
              depthOffset={3}
              icon="sun-moon"
              mode={activeMode}
              onModeToggle={handleModeToggle}
              strokeWidth={strokeWidth}
            />
            <FloorButton3D
              config={activeConfig}
              currentTheme={currentTheme}
              colOffset={3}
              depthOffset={3}
              icon="color-spectrum"
              mode={activeMode}
              onThemeToggle={handleThemeToggle}
              strokeWidth={strokeWidth}
            />
          </g>
        </svg>

        <div
          className="absolute inset-0 z-15 pointer-events-none select-none overflow-hidden"
          style={{ clipPath: leftWallCssClip }}
          data-layer="left-wall-conveyor-layer"
        >
          <div
            className="absolute left-0 top-0 h-full origin-top-left overflow-hidden"
            style={{
              width: `${leftWallWidthPercent}%`,
              transform: leftWallMatrix,
            }}
          >
            <div
              ref={leftTrackRef}
              className="relative w-full h-full will-change-transform"
            >
              {renderWallSlides(0, wallTextColor, 'right')}
            </div>
          </div>
        </div>

        <div
          className="absolute z-15 pointer-events-none select-none overflow-hidden"
          style={{
            left: `${geometry.backWall.left / 10}%`,
            top: `${geometry.backWall.top / 10}%`,
            width: `${(geometry.backWall.right - geometry.backWall.left) / 10}%`,
            height: `${(geometry.backWall.bottom - geometry.backWall.top) / 10}%`,
          }}
          data-layer="center-wall-conveyor-layer"
        >
          <div
            ref={centerTrackRef}
            className="relative w-full h-full will-change-transform"
          >
            {renderWallSlides(1, centerWallTextColor, 'none')}
          </div>
        </div>

        {brandLabel && (
          <div
            className="absolute z-20 left-[13%] -translate-y-1/2 flex items-center justify-center px-6 py-1.5 md:px-8 md:py-2 border-[1.5px] select-none font-minecraft text-base md:text-xl lg:text-2xl tracking-wider leading-none"
            style={{
              top: `${badgeTopPercent}%`,
              backgroundColor: badgeBg,
              borderColor: badgeBorder,
              color: badgeText,
              transition:
                'background-color 0.25s ease, border-color 0.25s ease, color 0.25s ease',
            }}
          >
            <span className="translate-y-[1px]">{brandLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}
