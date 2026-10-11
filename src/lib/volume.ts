export type VolumeLevel = 0 | 1 | 2;

let currentLevel: VolumeLevel = 0;
const listeners = new Set<(level: VolumeLevel) => void>();

export function getVolumeLevel(): VolumeLevel {
  return currentLevel;
}

export function publishVolumeLevel(level: VolumeLevel) {
  if (level === currentLevel) return;
  currentLevel = level;
  listeners.forEach((listener) => listener(level));
}

export function subscribeVolumeLevel(
  listener: (level: VolumeLevel) => void,
) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}