export interface Point {
  x: number;
  y: number;
}

export interface RoomBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface LineSegment {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface PatternNode {
  id: string;
  x: number;
  y: number;
  r: number;
  kind: 'circle' | 'square';
}

export interface BackWallWavePath {
  id: string;
  d: string;
}

export interface WallSlideItem {
  id: string;
  kind: 'text' | 'image';
  text?: string;
  imageSrc?: string;
  initialWallPos: number;
}

export interface PerspectiveRoomConfig {
  vanishingPoint: Point;
  roomBounds: RoomBounds;
  backWallScale: number;
  horizontalSubdivisions: number;
  verticalSubdivisions: number;
  depthSteps: number;
}

export interface ComputedRoomGeometry {
  vanishingPoint: Point;
  roomBounds: RoomBounds;
  backWall: RoomBounds;
  planes: {
    ceiling: Point[];
    leftWall: Point[];
    rightWall: Point[];
    floor: Point[];
    backWall: Point[];
  };
  cornerRays: LineSegment[];
  leftWallPattern: PatternNode[];
  backWallWaves: BackWallWavePath[];
  grids: {
    ceilingRadial: LineSegment[];
    ceilingTransverse: LineSegment[];
    floorRadial: LineSegment[];
    floorTransverse: LineSegment[];
  };
}

export const ROOM_LEFT = 0;
export const ROOM_RIGHT = 1000;
export const ROOM_TOP = 0;
export const ROOM_BOTTOM = 1000;

export const DEFAULT_ROOM_BOUNDS: RoomBounds = {
  left: ROOM_LEFT,
  right: ROOM_RIGHT,
  top: ROOM_TOP,
  bottom: ROOM_BOTTOM,
};

export const VANISHING_POINT: Point = {
  x: 500,
  y: 430,
};

export const DEFAULT_PERSPECTIVE_CONFIG: PerspectiveRoomConfig = {
  vanishingPoint: VANISHING_POINT,
  roomBounds: DEFAULT_ROOM_BOUNDS,
  backWallScale: 0.36,
  horizontalSubdivisions: 12,
  verticalSubdivisions: 8,
  depthSteps: 10,
};

export const DEFAULT_EXTRA_TEXT_SLIDES: string[] = [
  'HI',
  'MY',
  'NAME',
  'IS',
  'JESUS',
  'CHETIA',
];

export const ARCADE_WORD_SPACING = 200;

export type SideBreathingMode = 'none' | 'left' | 'right';

export function computeArcadeTextViewBox(
  text: string,
  sideBreathing: SideBreathingMode = 'none'
): string {
  const upper = text.toUpperCase();
  if (!upper) {
    return '0 0 1000 498';
  }

  const firstChar = upper[0];
  let minX = 1;
  if (firstChar === '1') minX = 65;
  else if (firstChar === 'E') minX = 4;
  else if (firstChar === 'I') minX = 51;
  else if (firstChar === 'Y') minX = 36;
  else if (firstChar === 'L' || firstChar === 'T') minX = -35;

  let cursorX = 0;
  let maxX = 499;

  for (let idx = 0; idx < upper.length; idx++) {
    const ch = upper[idx];
    if (ch === ' ') {
      cursorX += 128 + ARCADE_WORD_SPACING;
      continue;
    }

    let charRight = 499;
    if (ch === '1') charRight = 492;
    else if (ch === 'I') charRight = 478;
    else if (ch === 'Y') charRight = 463;
    else if (ch === 'E') charRight = 508;
    else if (ch === 'L' || ch === 'T') charRight = 392;

    maxX = cursorX + charRight;
    cursorX += 550;
  }

  const tightWidth = Math.max(100, maxX - minX);
  const pad = Math.round(tightWidth * 0.065);

  if (sideBreathing === 'left') {
    return `${minX - pad} 0 ${tightWidth + pad} 498`;
  }
  if (sideBreathing === 'right') {
    return `${minX} 0 ${tightWidth + pad} 498`;
  }

  return `${minX} 0 ${tightWidth} 498`;
}

export function projectFromVanishingPoint(
  vanishingPoint: Point,
  target: Point,
  t: number
): Point {
  return {
    x: vanishingPoint.x + t * (target.x - vanishingPoint.x),
    y: vanishingPoint.y + t * (target.y - vanishingPoint.y),
  };
}

export function computePerspectiveDepthScales(
  backWallScale: number,
  steps: number
): number[] {
  const scales: number[] = [];
  const invStart = 1 / backWallScale;
  const invEnd = 1;

  for (let i = 1; i < steps; i++) {
    const progress = i / steps;
    const invZ = invStart - Math.pow(progress, 0.92) * (invStart - invEnd);
    scales.push(1 / invZ);
  }

  return scales;
}

export function pointsToSvgPolygon(points: Point[]): string {
  return points.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
}

export function computeLeftWallPattern(
  vanishingPoint: Point,
  bounds: RoomBounds,
  backWallScale: number
): PatternNode[] {
  const nodes: PatternNode[] = [];
  const cols = 28;
  const rows = 34;

  for (let c = 1; c < cols; c++) {
    const u = c / cols;
    const depthProgress = Math.pow(u, 1.22);
    const t = backWallScale + (1 - backWallScale) * depthProgress;

    for (let r = 1; r < rows; r++) {
      const v = r / rows;
      const outerY = bounds.top + v * (bounds.bottom - bounds.top);
      const frontPoint: Point = { x: bounds.left, y: outerY };
      const projected = projectFromVanishingPoint(vanishingPoint, frontPoint, t);

      const waveRidge =
        0.5 + 0.24 * Math.sin(u * Math.PI * 1.9 - 0.5) - 0.08 * (1 - u);
      const distFromRidge = Math.abs(v - waveRidge);
      const ridgeIntensity = Math.max(0, 1 - distFromRidge / 0.46);

      const lowerClusterDx = (u - 0.54) / 0.44;
      const lowerClusterDy = (v - 0.66) / 0.38;
      const lowerCluster = Math.max(
        0,
        1 - Math.sqrt(lowerClusterDx * lowerClusterDx + lowerClusterDy * lowerClusterDy)
      );

      const upperClusterDx = (u - 0.74) / 0.38;
      const upperClusterDy = (v - 0.24) / 0.32;
      const upperCluster = Math.max(
        0,
        1 - Math.sqrt(upperClusterDx * upperClusterDx + upperClusterDy * upperClusterDy)
      );

      const innerClusterDx = (u - 0.24) / 0.32;
      const innerClusterDy = (v - 0.44) / 0.38;
      const innerCluster = Math.max(
        0,
        1 - Math.sqrt(innerClusterDx * innerClusterDx + innerClusterDy * innerClusterDy)
      );

      const frontLowerDx = (u - 0.84) / 0.3;
      const frontLowerDy = (v - 0.78) / 0.28;
      const frontLowerCluster = Math.max(
        0,
        1 - Math.sqrt(frontLowerDx * frontLowerDx + frontLowerDy * frontLowerDy)
      );

      const edgeFade =
        Math.pow(Math.sin(u * Math.PI), 0.45) *
        Math.pow(Math.sin(v * Math.PI), 0.45);

      const combined =
        Math.max(
          ridgeIntensity * 0.92,
          lowerCluster * 1.08,
          upperCluster * 0.96,
          innerCluster * 0.88,
          frontLowerCluster * 0.9
        ) * Math.min(1, edgeFade * 1.45);

      if (combined < 0.1) {
        continue;
      }

      const maxBaseRadius = 8.4;
      const radius = maxBaseRadius * Math.pow(combined, 1.25) * (0.38 + 0.62 * t);

      if (radius < 0.5) {
        continue;
      }

      const isOuterDither = combined < 0.32 && (c + r) % 2 === 0;

      nodes.push({
        id: `lw-pat-${c}-${r}`,
        x: projected.x,
        y: projected.y,
        r: radius,
        kind: isOuterDither ? 'square' : 'circle',
      });
    }
  }

  return nodes;
}

function warpBackWallPoint(u: number, v: number, backWall: RoomBounds): Point {
  const du1 = u - 0.19;
  const dv1 = v - 0.56;
  const r1Sq = du1 * du1 + dv1 * dv1;
  const pinch = -0.52 * Math.exp(-r1Sq / 0.085);

  const du2 = u - 0.58;
  const dv2 = v - 0.44;
  const r2Sq = du2 * du2 + dv2 * dv2;
  const bulge = 0.36 * Math.exp(-r2Sq / 0.16);
  const swirl = 0.58 * Math.exp(-r2Sq / 0.14);

  const du3 = u - 0.82;
  const dv3 = v - 0.72;
  const r3Sq = du3 * du3 + dv3 * dv3;
  const lowerRightPull = -0.24 * Math.exp(-r3Sq / 0.11);

  const waveU = 0.045 * Math.sin(v * Math.PI * 2.3 + 0.35);
  const waveV = 0.065 * Math.sin(u * Math.PI * 2.1 - 0.55);

  const warpedU =
    u +
    du1 * pinch +
    du2 * bulge -
    dv2 * swirl +
    du3 * lowerRightPull +
    waveU;

  const warpedV =
    v +
    dv1 * pinch +
    dv2 * bulge +
    du2 * swirl +
    dv3 * lowerRightPull +
    waveV;

  const width = backWall.right - backWall.left;
  const height = backWall.bottom - backWall.top;

  return {
    x: backWall.left + warpedU * width,
    y: backWall.top + warpedV * height,
  };
}

export function computeBackWallWaves(backWall: RoomBounds): BackWallWavePath[] {
  const paths: BackWallWavePath[] = [];
  const horizontalLines = 15;
  const verticalLines = 17;
  const sampleCount = 56;
  const minParam = -0.18;
  const maxParam = 1.18;

  for (let r = 0; r < horizontalLines; r++) {
    const v =
      minParam + (r / (horizontalLines - 1)) * (maxParam - minParam);
    const cmds: string[] = [];

    for (let s = 0; s <= sampleCount; s++) {
      const u = minParam + (s / sampleCount) * (maxParam - minParam);
      const pt = warpBackWallPoint(u, v, backWall);
      cmds.push(`${s === 0 ? 'M' : 'L'} ${pt.x.toFixed(2)} ${pt.y.toFixed(2)}`);
    }

    paths.push({
      id: `bw-wave-h-${r}`,
      d: cmds.join(' '),
    });
  }

  for (let c = 0; c < verticalLines; c++) {
    const u = minParam + (c / (verticalLines - 1)) * (maxParam - minParam);
    const cmds: string[] = [];

    for (let s = 0; s <= sampleCount; s++) {
      const v = minParam + (s / sampleCount) * (maxParam - minParam);
      const pt = warpBackWallPoint(u, v, backWall);
      cmds.push(`${s === 0 ? 'M' : 'L'} ${pt.x.toFixed(2)} ${pt.y.toFixed(2)}`);
    }

    paths.push({
      id: `bw-wave-v-${c}`,
      d: cmds.join(' '),
    });
  }

  return paths;
}

export function computeLeftWallMatrix3d(
  viewportWidth: number,
  viewportHeight: number,
  vanishingPoint: Point,
  bounds: RoomBounds,
  backWallScale: number
): string {
  const totalWidth = bounds.right - bounds.left;
  const totalHeight = bounds.bottom - bounds.top;
  const backLeft =
    vanishingPoint.x + backWallScale * (bounds.left - vanishingPoint.x);
  const wallWidthRatio = (backLeft - bounds.left) / totalWidth;

  const wPx = Math.max(1, viewportWidth * wallWidthRatio);
  const hPx = Math.max(1, viewportHeight);
  const vpYRatio = (vanishingPoint.y - bounds.top) / totalHeight;
  const s = backWallScale;

  const m11 = 1 / s;
  const m21 = (((1 - s) / s) * vpYRatio * hPx) / wPx;
  const m41 = (1 - s) / (s * wPx);

  return `matrix3d(${m11}, ${m21}, 0, ${m41}, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)`;
}

export function computeRightWallMatrix3d(
  viewportWidth: number,
  viewportHeight: number,
  vanishingPoint: Point,
  bounds: RoomBounds,
  backWallScale: number
): string {
  const totalWidth = bounds.right - bounds.left;
  const totalHeight = bounds.bottom - bounds.top;
  const backRight =
    vanishingPoint.x + backWallScale * (bounds.right - vanishingPoint.x);
  const wallWidthRatio = (bounds.right - backRight) / totalWidth;

  const wPx = Math.max(1, viewportWidth * wallWidthRatio);
  const hPx = Math.max(1, viewportHeight);
  const vpYRatio = (vanishingPoint.y - bounds.top) / totalHeight;
  const s = backWallScale;

  const m11 = s;
  const m21 = (-(1 - s) * vpYRatio * hPx) / wPx;
  const m41 = -(1 - s) / wPx;
  const m22 = s;
  const m24 = (1 - s) * vpYRatio * hPx;

  return `matrix3d(${m11}, ${m21}, 0, ${m41}, 0, ${m22}, 0, 0, 0, 0, 1, 0, 0, ${m24}, 0, 1)`;
}

export function computeRoomGeometry(
  config: PerspectiveRoomConfig = DEFAULT_PERSPECTIVE_CONFIG
): ComputedRoomGeometry {
  const {
    vanishingPoint: vp,
    roomBounds: bounds,
    backWallScale: s,
    horizontalSubdivisions,
    depthSteps,
  } = config;

  const outerTopLeft: Point = { x: bounds.left, y: bounds.top };
  const outerTopRight: Point = { x: bounds.right, y: bounds.top };
  const outerBottomRight: Point = { x: bounds.right, y: bounds.bottom };
  const outerBottomLeft: Point = { x: bounds.left, y: bounds.bottom };

  const backTopLeft = projectFromVanishingPoint(vp, outerTopLeft, s);
  const backTopRight = projectFromVanishingPoint(vp, outerTopRight, s);
  const backBottomRight = projectFromVanishingPoint(vp, outerBottomRight, s);
  const backBottomLeft = projectFromVanishingPoint(vp, outerBottomLeft, s);

  const backWall: RoomBounds = {
    left: backTopLeft.x,
    right: backTopRight.x,
    top: backTopLeft.y,
    bottom: backBottomLeft.y,
  };

  const planes = {
    ceiling: [outerTopLeft, outerTopRight, backTopRight, backTopLeft],
    leftWall: [outerTopLeft, backTopLeft, backBottomLeft, outerBottomLeft],
    rightWall: [backTopRight, outerTopRight, outerBottomRight, backBottomRight],
    floor: [backBottomLeft, backBottomRight, outerBottomRight, outerBottomLeft],
    backWall: [backTopLeft, backTopRight, backBottomRight, backBottomLeft],
  };

  const cornerRays: LineSegment[] = [
    {
      id: 'corner-top-left',
      x1: outerTopLeft.x,
      y1: outerTopLeft.y,
      x2: backTopLeft.x,
      y2: backTopLeft.y,
    },
    {
      id: 'corner-top-right',
      x1: outerTopRight.x,
      y1: outerTopRight.y,
      x2: backTopRight.x,
      y2: backTopRight.y,
    },
    {
      id: 'corner-bottom-left',
      x1: outerBottomLeft.x,
      y1: outerBottomLeft.y,
      x2: backBottomLeft.x,
      y2: backBottomLeft.y,
    },
    {
      id: 'corner-bottom-right',
      x1: outerBottomRight.x,
      y1: outerBottomRight.y,
      x2: backBottomRight.x,
      y2: backBottomRight.y,
    },
  ];

  const depthScales = computePerspectiveDepthScales(s, depthSteps);

  const ceilingCutLeftCol = Math.max(2, Math.round(horizontalSubdivisions * 0.33));
  const ceilingCutRightCol = horizontalSubdivisions - ceilingCutLeftCol;
  const ceilingCutDepthIdx = Math.max(0, depthScales.length - 2);
  const ceilingCutScale = depthScales[ceilingCutDepthIdx] ?? 1;

  const floorCutLeftCol = Math.max(2, Math.round(horizontalSubdivisions * 0.25));
  const floorCutRightCol = horizontalSubdivisions - floorCutLeftCol;
  const floorCutDepthIdx = Math.min(
    depthScales.length - 1,
    Math.max(2, Math.floor(depthScales.length * 0.42))
  );
  const floorCutScale = depthScales[floorCutDepthIdx] ?? 1;

  const ceilingRadial: LineSegment[] = [];
  const floorRadial: LineSegment[] = [];

  for (let i = 1; i < horizontalSubdivisions; i++) {
    const ratio = i / horizontalSubdivisions;
    const outerX = bounds.left + ratio * (bounds.right - bounds.left);

    const ceilingTarget: Point = { x: outerX, y: bounds.top };
    const ceilingBack = projectFromVanishingPoint(vp, ceilingTarget, s);
    const isCeilingCenterCut = i > ceilingCutLeftCol && i < ceilingCutRightCol;
    const ceilingEndScale = isCeilingCenterCut ? ceilingCutScale : 1;
    const ceilingFront = projectFromVanishingPoint(
      vp,
      ceilingTarget,
      ceilingEndScale
    );

    ceilingRadial.push({
      id: `ceiling-radial-${i}`,
      x1: ceilingFront.x,
      y1: ceilingFront.y,
      x2: ceilingBack.x,
      y2: ceilingBack.y,
    });

    const floorTarget: Point = { x: outerX, y: bounds.bottom };
    const floorBack = projectFromVanishingPoint(vp, floorTarget, s);
    const isFloorCenterCut = i > floorCutLeftCol && i < floorCutRightCol;
    const floorEndScale = isFloorCenterCut ? floorCutScale : 1;
    const floorFront = projectFromVanishingPoint(
      vp,
      floorTarget,
      floorEndScale
    );

    floorRadial.push({
      id: `floor-radial-${i}`,
      x1: floorBack.x,
      y1: floorBack.y,
      x2: floorFront.x,
      y2: floorFront.y,
    });
  }

  const ceilingTransverse: LineSegment[] = [];
  const floorTransverse: LineSegment[] = [];

  const ceilingLeftCutRatio = ceilingCutLeftCol / horizontalSubdivisions;
  const ceilingRightCutRatio = ceilingCutRightCol / horizontalSubdivisions;
  const floorLeftCutRatio = floorCutLeftCol / horizontalSubdivisions;
  const floorRightCutRatio = floorCutRightCol / horizontalSubdivisions;

  depthScales.forEach((t, idx) => {
    const topLeft = projectFromVanishingPoint(vp, outerTopLeft, t);
    const topRight = projectFromVanishingPoint(vp, outerTopRight, t);
    const bottomLeft = projectFromVanishingPoint(vp, outerBottomLeft, t);
    const bottomRight = projectFromVanishingPoint(vp, outerBottomRight, t);

    if (idx > ceilingCutDepthIdx) {
      const cutLeftX = topLeft.x + ceilingLeftCutRatio * (topRight.x - topLeft.x);
      const cutRightX = topLeft.x + ceilingRightCutRatio * (topRight.x - topLeft.x);

      ceilingTransverse.push({
        id: `ceiling-transverse-${idx}-left`,
        x1: topLeft.x,
        y1: topLeft.y,
        x2: cutLeftX,
        y2: topLeft.y,
      });

      ceilingTransverse.push({
        id: `ceiling-transverse-${idx}-right`,
        x1: cutRightX,
        y1: topRight.y,
        x2: topRight.x,
        y2: topRight.y,
      });
    } else {
      ceilingTransverse.push({
        id: `ceiling-transverse-${idx}`,
        x1: topLeft.x,
        y1: topLeft.y,
        x2: topRight.x,
        y2: topRight.y,
      });
    }

    if (idx > floorCutDepthIdx) {
      const cutLeftX =
        bottomLeft.x + floorLeftCutRatio * (bottomRight.x - bottomLeft.x);
      const cutRightX =
        bottomLeft.x + floorRightCutRatio * (bottomRight.x - bottomLeft.x);

      floorTransverse.push({
        id: `floor-transverse-${idx}-left`,
        x1: bottomLeft.x,
        y1: bottomLeft.y,
        x2: cutLeftX,
        y2: bottomLeft.y,
      });

      floorTransverse.push({
        id: `floor-transverse-${idx}-right`,
        x1: cutRightX,
        y1: bottomRight.y,
        x2: bottomRight.x,
        y2: bottomRight.y,
      });
    } else {
      floorTransverse.push({
        id: `floor-transverse-${idx}`,
        x1: bottomLeft.x,
        y1: bottomLeft.y,
        x2: bottomRight.x,
        y2: bottomRight.y,
      });
    }
  });

  const leftWallPattern = computeLeftWallPattern(vp, bounds, s);
  const backWallWaves = computeBackWallWaves(backWall);

  return {
    vanishingPoint: vp,
    roomBounds: bounds,
    backWall,
    planes,
    cornerRays,
    leftWallPattern,
    backWallWaves,
    grids: {
      ceilingRadial,
      ceilingTransverse,
      floorRadial,
      floorTransverse,
    },
  };
}

export interface RoomTheme {
  id: string;
  name: string;
  strokeColor: string;
  backgroundColor: string;
  centerWallFill: string;
  centerWallWaves: string;
  centerWallText: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  accentColor: string;
  buttonCapFill: string;
  buttonSideFill: string;
  buttonFrontFill: string;
}

export const ROOM_THEMES: RoomTheme[] = [
  {
    id: 'monochrome',
    name: 'Classic Black',
    strokeColor: '#0a0a0a',
    backgroundColor: '#fafafa',
    centerWallFill: '#0a0a0a',
    centerWallWaves: '#ffffff',
    centerWallText: '#ffffff',
    badgeBg: '#fafafa',
    badgeBorder: '#0a0a0a',
    badgeText: '#0a0a0a',
    accentColor: '#0a0a0a',
    buttonCapFill: '#ffffff',
    buttonSideFill: '#d4d4d4',
    buttonFrontFill: '#a3a3a3',
  },
  {
    id: 'cobalt',
    name: 'Electric Cobalt',
    strokeColor: '#0055ff',
    backgroundColor: '#fafafa',
    centerWallFill: '#0055ff',
    centerWallWaves: '#ffffff',
    centerWallText: '#ffffff',
    badgeBg: '#fafafa',
    badgeBorder: '#0a0a0a',
    badgeText: '#0a0a0a',
    accentColor: '#0055ff',
    buttonCapFill: '#ffffff',
    buttonSideFill: '#d4d4d4',
    buttonFrontFill: '#a3a3a3',
  },
  {
    id: 'magenta',
    name: 'Neon Magenta',
    strokeColor: '#e60067',
    backgroundColor: '#fafafa',
    centerWallFill: '#e60067',
    centerWallWaves: '#ffffff',
    centerWallText: '#ffffff',
    badgeBg: '#fafafa',
    badgeBorder: '#0a0a0a',
    badgeText: '#0a0a0a',
    accentColor: '#e60067',
    buttonCapFill: '#ffffff',
    buttonSideFill: '#d4d4d4',
    buttonFrontFill: '#a3a3a3',
  },
  {
    id: 'emerald',
    name: 'Emerald Matrix',
    strokeColor: '#008c3a',
    backgroundColor: '#fafafa',
    centerWallFill: '#008c3a',
    centerWallWaves: '#ffffff',
    centerWallText: '#ffffff',
    badgeBg: '#fafafa',
    badgeBorder: '#0a0a0a',
    badgeText: '#0a0a0a',
    accentColor: '#008c3a',
    buttonCapFill: '#ffffff',
    buttonSideFill: '#d4d4d4',
    buttonFrontFill: '#a3a3a3',
  },
  {
    id: 'crimson',
    name: 'Arcade Crimson',
    strokeColor: '#d61818',
    backgroundColor: '#fafafa',
    centerWallFill: '#d61818',
    centerWallWaves: '#ffffff',
    centerWallText: '#ffffff',
    badgeBg: '#fafafa',
    badgeBorder: '#0a0a0a',
    badgeText: '#0a0a0a',
    accentColor: '#d61818',
    buttonCapFill: '#ffffff',
    buttonSideFill: '#d4d4d4',
    buttonFrontFill: '#a3a3a3',
  },
  {
    id: 'purple',
    name: 'Ultraviolet Purple',
    strokeColor: '#7b1fa2',
    backgroundColor: '#fafafa',
    centerWallFill: '#7b1fa2',
    centerWallWaves: '#ffffff',
    centerWallText: '#ffffff',
    badgeBg: '#fafafa',
    badgeBorder: '#0a0a0a',
    badgeText: '#0a0a0a',
    accentColor: '#7b1fa2',
    buttonCapFill: '#ffffff',
    buttonSideFill: '#d4d4d4',
    buttonFrontFill: '#a3a3a3',
  },
  {
    id: 'amber',
    name: 'Solar Amber',
    strokeColor: '#c76a00',
    backgroundColor: '#fafafa',
    centerWallFill: '#c76a00',
    centerWallWaves: '#ffffff',
    centerWallText: '#ffffff',
    badgeBg: '#fafafa',
    badgeBorder: '#0a0a0a',
    badgeText: '#0a0a0a',
    accentColor: '#c76a00',
    buttonCapFill: '#ffffff',
    buttonSideFill: '#d4d4d4',
    buttonFrontFill: '#a3a3a3',
  },
];

export interface FloorButtonGeometry {
  socketPoints: Point[];
  basePoints: Point[];
  topPoints: Point[];
  frontFace: Point[];
  leftFace: Point[];
  center: Point;
}

export function computeFloorButtonGeometry(
  config: PerspectiveRoomConfig,
  height: number,
  colOffset = 3,
  depthOffset = 3
): FloorButtonGeometry {
  const {
    vanishingPoint: vp,
    roomBounds: bounds,
    backWallScale: s,
    horizontalSubdivisions,
    depthSteps,
  } = config;

  const col = Math.max(1, horizontalSubdivisions - colOffset);
  const depthIdx = Math.min(
    depthSteps - 2,
    Math.max(2, depthSteps - depthOffset)
  );

  const scales = computePerspectiveDepthScales(s, depthSteps);
  const tBack = scales[depthIdx];
  const tFront = scales[depthIdx + 1];

  const xLeft =
    bounds.left +
    (col / horizontalSubdivisions) * (bounds.right - bounds.left);
  const xRight =
    bounds.left +
    ((col + 1) / horizontalSubdivisions) * (bounds.right - bounds.left);

  const cellTL = projectFromVanishingPoint(
    vp,
    { x: xLeft, y: bounds.bottom },
    tBack
  );
  const cellTR = projectFromVanishingPoint(
    vp,
    { x: xRight, y: bounds.bottom },
    tBack
  );
  const cellBR = projectFromVanishingPoint(
    vp,
    { x: xRight, y: bounds.bottom },
    tFront
  );
  const cellBL = projectFromVanishingPoint(
    vp,
    { x: xLeft, y: bounds.bottom },
    tFront
  );

  const cellCenter: Point = {
    x: (cellTL.x + cellTR.x + cellBR.x + cellBL.x) / 4,
    y: (cellTL.y + cellTR.y + cellBR.y + cellBL.y) / 4,
  };

  const lerpPoint = (p: Point, c: Point, factor: number): Point => ({
    x: p.x + factor * (c.x - p.x),
    y: p.y + factor * (c.y - p.y),
  });

  const socketTL = lerpPoint(cellTL, cellCenter, 0.08);
  const socketTR = lerpPoint(cellTR, cellCenter, 0.08);
  const socketBR = lerpPoint(cellBR, cellCenter, 0.08);
  const socketBL = lerpPoint(cellBL, cellCenter, 0.08);

  const baseTL = lerpPoint(cellTL, cellCenter, 0.18);
  const baseTR = lerpPoint(cellTR, cellCenter, 0.18);
  const baseBR = lerpPoint(cellBR, cellCenter, 0.18);
  const baseBL = lerpPoint(cellBL, cellCenter, 0.18);

  const topTL: Point = { x: baseTL.x, y: baseTL.y - height };
  const topTR: Point = { x: baseTR.x, y: baseTR.y - height };
  const topBR: Point = { x: baseBR.x, y: baseBR.y - height };
  const topBL: Point = { x: baseBL.x, y: baseBL.y - height };

  const capCenter: Point = {
    x: (topTL.x + topTR.x + topBR.x + topBL.x) / 4,
    y: (topTL.y + topTR.y + topBR.y + topBL.y) / 4,
  };

  return {
    socketPoints: [socketTL, socketTR, socketBR, socketBL],
    basePoints: [baseTL, baseTR, baseBR, baseBL],
    topPoints: [topTL, topTR, topBR, topBL],
    frontFace: [baseBL, baseBR, topBR, topBL],
    leftFace: [baseTL, baseBL, topBL, topTL],
    center: capCenter,
  };
}
