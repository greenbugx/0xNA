import { useState, useEffect, useRef } from 'react';
import meDarkPortrait from '../assets/images/me.webp';
import meLightPortrait from '../assets/images/me-bg.webp';
import loaderForDarkMode from '../assets/images/loader.webp';
import loaderForLightMode from '../assets/images/loader-dark.webp';

export interface LoaderProps {
  isDark?: boolean;
  onLoaded?: () => void;
}

const LOGO_CANVAS_SIZE = 512;
const LOGO_BLOCK_SIZE = 14;
const LOGO_ON_DURATION = 1000;
const LOGO_HOLD_ON_DURATION = 380;
const LOGO_OFF_DURATION = 1000;
const LOGO_HOLD_OFF_DURATION = 260;
const LOGO_TOTAL_CYCLE =
  LOGO_ON_DURATION + LOGO_HOLD_ON_DURATION + LOGO_OFF_DURATION + LOGO_HOLD_OFF_DURATION;

const REVEAL_BLOCK_SIZE = 30;
const REVEAL_DURATION = 1300;

export function Loader({ isDark = true, onLoaded }: LoaderProps) {
  const logoCanvasRef = useRef<HTMLCanvasElement>(null);
  const revealCanvasRef = useRef<HTMLCanvasElement>(null);
  const [stage, setStage] = useState<'loading' | 'revealing'>('loading');
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  useEffect(() => {
    let isMounted = true;
    let animId: number;
    let isReadyToExit = false;

    const startTime = performance.now();
    const minDuration = 3000;

    const minTimePromise = new Promise<void>((resolve) => {
      setTimeout(resolve, minDuration);
    });

    const pageLoadPromise = new Promise<void>((resolve) => {
      if (typeof document !== 'undefined' && document.readyState === 'complete') {
        resolve();
      } else if (typeof window !== 'undefined') {
        const handleLoad = () => {
          window.removeEventListener('load', handleLoad);
          resolve();
        };
        window.addEventListener('load', handleLoad);
      } else {
        resolve();
      }
    });

    const fontsPromise =
      typeof document !== 'undefined' && document.fonts
        ? document.fonts.ready.catch(() => {})
        : Promise.resolve();

    const preloadImage = (src: string): Promise<void> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        if (img.complete) {
          if ('decode' in img && typeof img.decode === 'function') {
            img.decode().then(() => resolve()).catch(() => resolve());
          } else {
            resolve();
          }
        } else {
          img.onload = () => {
            if ('decode' in img && typeof img.decode === 'function') {
              img.decode().then(() => resolve()).catch(() => resolve());
            } else {
              resolve();
            }
          };
          img.onerror = () => resolve();
        }
      });
    };

    const imagesPromise = Promise.all([
      preloadImage(meDarkPortrait),
      preloadImage(meLightPortrait),
      preloadImage(loaderForDarkMode),
      preloadImage(loaderForLightMode),
    ]);

    Promise.all([
      minTimePromise,
      pageLoadPromise,
      fontsPromise,
      imagesPromise,
    ]).then(() => {
      if (!isMounted) return;
      isReadyToExit = true;
    });

    const logoImg = new Image();
    logoImg.src = isDark ? loaderForDarkMode : loaderForLightMode;

    const cols = Math.ceil(LOGO_CANVAS_SIZE / LOGO_BLOCK_SIZE);
    const rows = Math.ceil(LOGO_CANVAS_SIZE / LOGO_BLOCK_SIZE);
    const maxDiag = cols + rows;

    const gridVal = new Float32Array(cols * rows);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const diag = (c + r) / maxDiag;
        const jitter = (((c * 31 + r * 17) % 100) / 100 - 0.5) * 0.16;
        gridVal[r * cols + c] = Math.max(0, Math.min(1, diag + jitter));
      }
    }

    const offscreen = document.createElement('canvas');
    offscreen.width = LOGO_CANVAS_SIZE;
    offscreen.height = LOGO_CANVAS_SIZE;
    const offCtx = offscreen.getContext('2d');

    const smoothEase = (p: number) => {
      return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
    };

    const renderLogo = () => {
      if (!isMounted) return;

      const canvas = logoCanvasRef.current;
      if (!canvas || !offCtx) {
        animId = requestAnimationFrame(renderLogo);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animId = requestAnimationFrame(renderLogo);
        return;
      }

      const elapsed = performance.now() - startTime;
      const cycleTime = elapsed % LOGO_TOTAL_CYCLE;

      if (isReadyToExit && elapsed >= minDuration) {
        if (cycleTime >= LOGO_ON_DURATION + LOGO_HOLD_ON_DURATION + LOGO_OFF_DURATION) {
          ctx.clearRect(0, 0, LOGO_CANVAS_SIZE, LOGO_CANVAS_SIZE);
          setStage('revealing');
          return;
        }
      }

      let phase: 'turning-on' | 'on' | 'turning-off' | 'off';
      let progress = 0;

      if (cycleTime < LOGO_ON_DURATION) {
        phase = 'turning-on';
        progress = smoothEase(cycleTime / LOGO_ON_DURATION);
      } else if (cycleTime < LOGO_ON_DURATION + LOGO_HOLD_ON_DURATION) {
        phase = 'on';
        progress = 1;
      } else if (cycleTime < LOGO_ON_DURATION + LOGO_HOLD_ON_DURATION + LOGO_OFF_DURATION) {
        phase = 'turning-off';
        const offP =
          (cycleTime - (LOGO_ON_DURATION + LOGO_HOLD_ON_DURATION)) / LOGO_OFF_DURATION;
        progress = smoothEase(offP);
      } else {
        phase = 'off';
      }

      offCtx.clearRect(0, 0, LOGO_CANVAS_SIZE, LOGO_CANVAS_SIZE);
      offCtx.globalCompositeOperation = 'source-over';
      offCtx.fillStyle = isDark ? '#ffffff' : '#0a0a0a';

      if (phase === 'on') {
        offCtx.fillRect(0, 0, LOGO_CANVAS_SIZE, LOGO_CANVAS_SIZE);
      } else if (phase !== 'off') {
        for (let r = 0; r < rows; r++) {
          const rowOffset = r * cols;
          const y = r * LOGO_BLOCK_SIZE;
          for (let c = 0; c < cols; c++) {
            const val = gridVal[rowOffset + c];
            const visible = phase === 'turning-on' ? val <= progress : val > progress;
            if (visible) {
              offCtx.fillRect(c * LOGO_BLOCK_SIZE, y, LOGO_BLOCK_SIZE, LOGO_BLOCK_SIZE);
            }
          }
        }
      }

      if (phase !== 'off') {
        offCtx.globalCompositeOperation = 'source-in';
        offCtx.drawImage(logoImg, 0, 0, LOGO_CANVAS_SIZE, LOGO_CANVAS_SIZE);
      }

      ctx.clearRect(0, 0, LOGO_CANVAS_SIZE, LOGO_CANVAS_SIZE);
      ctx.drawImage(offscreen, 0, 0);

      animId = requestAnimationFrame(renderLogo);
    };

    if (logoImg.complete) {
      animId = requestAnimationFrame(renderLogo);
    } else {
      logoImg.onload = () => {
        if (isMounted) {
          animId = requestAnimationFrame(renderLogo);
        }
      };
    }

    return () => {
      isMounted = false;
      cancelAnimationFrame(animId);
    };
  }, [isDark]);

  useEffect(() => {
    if (stage !== 'revealing') return;

    let isMounted = true;
    let animId: number;
    const canvas = revealCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const cols = Math.ceil(width / REVEAL_BLOCK_SIZE);
    const rows = Math.ceil(height / REVEAL_BLOCK_SIZE);
    const centerX = cols / 2;
    const centerY = rows / 2;
    const maxDist = Math.hypot(centerX, centerY);

    const gridDist = new Float32Array(cols * rows);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const dx = c - centerX;
        const dy = r - centerY;
        const dist = Math.hypot(dx, dy) / maxDist;
        const jitter = (((c * 37 + r * 23) % 100) / 100 - 0.5) * 0.16;
        gridDist[r * cols + c] = Math.max(0, Math.min(1.15, dist + jitter));
      }
    }

    const revealStartTime = performance.now();
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const renderReveal = () => {
      if (!isMounted) return;

      const elapsed = performance.now() - revealStartTime;
      const rawProgress = Math.min(1, elapsed / REVEAL_DURATION);
      const progress = easeOutCubic(rawProgress) * 1.15;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = isDark ? '#0a0a0a' : '#fafafa';

      if (rawProgress < 1) {
        for (let r = 0; r < rows; r++) {
          const rowOffset = r * cols;
          const y = r * REVEAL_BLOCK_SIZE;
          for (let c = 0; c < cols; c++) {
            if (gridDist[rowOffset + c] > progress) {
              ctx.fillRect(c * REVEAL_BLOCK_SIZE, y, REVEAL_BLOCK_SIZE, REVEAL_BLOCK_SIZE);
            }
          }
        }
        animId = requestAnimationFrame(renderReveal);
      } else {
        ctx.clearRect(0, 0, width, height);
        onLoaded?.();
        setIsVisible(false);
      }
    };

    animId = requestAnimationFrame(renderReveal);

    return () => {
      isMounted = false;
      cancelAnimationFrame(animId);
    };
  }, [stage, isDark, onLoaded]);

  if (!isVisible) {
    return null;
  }

  const containerBg =
    stage === 'loading'
      ? isDark
        ? 'bg-[#0a0a0a]'
        : 'bg-[#fafafa]'
      : 'bg-transparent pointer-events-none';

  return (
    <div
      role="status"
      aria-label="Loading"
      className={`fixed inset-0 z-[100] flex items-center justify-center select-none ${containerBg}`}
    >
      {stage === 'loading' && (
        <canvas
          ref={logoCanvasRef}
          width={LOGO_CANVAS_SIZE}
          height={LOGO_CANVAS_SIZE}
          className="w-[150px] h-[150px] sm:w-[175px] sm:h-[175px] md:w-[200px] md:h-[200px] max-w-[70vw] max-h-[70vw] object-contain select-none pointer-events-none"
        />
      )}
      {stage === 'revealing' && (
        <canvas
          ref={revealCanvasRef}
          className="fixed inset-0 w-full h-full pointer-events-none"
        />
      )}
    </div>
  );
}
