export {
  PerspectiveRoom,
  type PerspectiveRoomProps,
} from './PerspectiveRoom';
export { RoomPlane, type RoomPlaneProps, type PlaneId } from './RoomPlane';
export { PerspectiveGrid, type PerspectiveGridProps } from './PerspectiveGrid';
export {
  ROOM_LEFT,
  ROOM_RIGHT,
  ROOM_TOP,
  ROOM_BOTTOM,
  VANISHING_POINT,
  DEFAULT_ROOM_BOUNDS,
  DEFAULT_PERSPECTIVE_CONFIG,
  DEFAULT_EXTRA_TEXT_SLIDES,
  ARCADE_WORD_SPACING,
  computeRoomGeometry,
  computeLeftWallPattern,
  computeBackWallWaves,
  computeLeftWallMatrix3d,
  computeRightWallMatrix3d,
  computeArcadeTextViewBox,
  projectFromVanishingPoint,
  computePerspectiveDepthScales,
  type Point,
  type RoomBounds,
  type LineSegment,
  type PatternNode,
  type BackWallWavePath,
  type WallSlideItem,
  type SideBreathingMode,
  type PerspectiveRoomConfig,
  type ComputedRoomGeometry,
} from './geometry';

