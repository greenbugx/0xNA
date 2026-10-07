"use client";
"use no memo";

import React, { useEffect, useRef } from "react";

export interface FizzingParticlesProps {
  colors?: string[];
  particleCount?: number;
  speed?: number;
  turbulence?: number;
  className?: string;
}

const DEFAULT_PALETTE = [
  "#fffbeb",
  "#fef08a",
  "#facc15",
  "#a3e635",
  "#22c55e",
  "#16a34a",
  "#15803d",
  "#0f6e43",
  "#0a5332",
];

const LUT_STEPS = 48;
const WHITE_BUCKETS = 8;

function hexToRgb(color: string): [number, number, number] {
  let hex = color.trim().replace("#", "");
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const val = parseInt(hex, 16);
  if (Number.isNaN(val)) return [255, 255, 255];
  return [(val >> 16) & 255, (val >> 8) & 255, val & 255];
}

function interpolateRgb(
  palette: [number, number, number][],
  t: number
): [number, number, number] {
  const clamped = Math.max(0, Math.min(1, t));
  const segments = palette.length - 1;
  const scaled = clamped * segments;
  const idx = Math.min(Math.floor(scaled), segments - 1);
  const frac = scaled - idx;
  const c1 = palette[idx];
  const c2 = palette[idx + 1];
  return [
    Math.round(c1[0] + (c2[0] - c1[0]) * frac),
    Math.round(c1[1] + (c2[1] - c1[1]) * frac),
    Math.round(c1[2] + (c2[2] - c1[2]) * frac),
  ];
}


export default function FizzingParticles({
  colors = DEFAULT_PALETTE,
  particleCount,
  speed = 1.0,
  turbulence = 1.0,
  className = "",
}: FizzingParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    let animId = 0;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const activeColors =
      colors && colors.length >= 2 ? colors : DEFAULT_PALETTE;
    const rgbPalette = activeColors.map(hexToRgb);

    const colorLut: string[] = [];
    for (let s = 0; s < LUT_STEPS; s++) {
      const t = s / (LUT_STEPS - 1);
      const [r, g, b] = interpolateRgb(rgbPalette, t);
      colorLut.push(`rgb(${r},${g},${b})`);
    }

    const targetTotal =
      particleCount ||
      Math.max(
        50000,
        Math.min(96000, Math.round((width * height) / 22))
      );

    const whiteCount = Math.round(targetTotal * 0.22);
    const bodyCount = targetTotal - whiteCount;
    const anchorCount = Math.round(bodyCount * 0.65);

    const pY = new Float32Array(bodyCount);
    const pU = new Float32Array(bodyCount);
    const pSpeedY = new Float32Array(bodyCount);
    const pSpeedU = new Float32Array(bodyCount);
    const pPhase = new Float32Array(bodyCount);
    const pFreq = new Float32Array(bodyCount);
    const pSize = new Float32Array(bodyCount);
    const pIsStreamer = new Uint8Array(bodyCount);

    for (let i = 0; i < anchorCount; i++) {
      pIsStreamer[i] = 0;
      pY[i] = -20 + Math.random() * (height + 40);

      const r = Math.random();
      if (r < 0.28) {
        pU[i] = Math.pow(Math.random(), 1.6) * 0.28;
      } else if (r < 0.60) {
        pU[i] = 1.04 - Math.pow(Math.random(), 1.5) * 0.36;
      } else {
        pU[i] = Math.random() * 1.04;
      }

      pSpeedY[i] = -(0.03 + Math.random() * 0.10);
      pSpeedU[i] = 0;
      pPhase[i] = Math.random() * Math.PI * 2;
      pFreq[i] = 0.5 + Math.random() * 1.5;

      const sizeRand = Math.random();
      pSize[i] = sizeRand < 0.55 ? 1 : sizeRand < 0.88 ? 1.5 : 2;
    }

    for (let i = anchorCount; i < bodyCount; i++) {
      pIsStreamer[i] = 1;
      pY[i] = -20 + Math.random() * (height + 40);
      pU[i] = Math.random() * 1.04;
      pSpeedY[i] = -(0.04 + Math.random() * 0.12);
      pSpeedU[i] = 0.0005 + Math.random() * 0.0007;
      pPhase[i] = Math.random() * Math.PI * 2;
      pFreq[i] = 0.6 + Math.random() * 1.6;

      const sizeRand = Math.random();
      pSize[i] = sizeRand < 0.60 ? 1 : sizeRand < 0.90 ? 1.5 : 2;
    }

    const pWhiteY = new Float32Array(whiteCount);
    const pWhiteDist = new Float32Array(whiteCount);
    const pWhiteVx = new Float32Array(whiteCount);
    const pWhiteVy = new Float32Array(whiteCount);
    const pWhiteMax = new Float32Array(whiteCount);
    const pWhiteSize = new Float32Array(whiteCount);
    const pWhitePhase = new Float32Array(whiteCount);

    for (let i = 0; i < whiteCount; i++) {
      pWhiteY[i] = -20 + Math.random() * (height + 40);
      pWhiteMax[i] = 100 + Math.random() * 150;
      pWhiteDist[i] = -Math.random() * pWhiteMax[i] * 0.95;
      pWhiteVx[i] = -(0.18 + Math.random() * 0.35);
      pWhiteVy[i] = (Math.random() - 0.48) * 0.28;
      pWhiteSize[i] = Math.random() < 0.78 ? 1 : 1.5;
      pWhitePhase[i] = Math.random() * Math.PI * 2;
    }

    const anchorBucket = new Uint8Array(anchorCount);
    const anchorAmpX = new Float64Array(anchorCount);
    const anchorAmpY = new Float64Array(anchorCount);
    for (let i = 0; i < anchorCount; i++) {
      const u = pU[i];
      const anchorColorT = Math.max(
        0,
        Math.min(1, Math.pow(Math.max(0, u), 0.9))
      );
      anchorBucket[i] = Math.min(
        LUT_STEPS - 1,
        Math.floor(anchorColorT * LUT_STEPS)
      );
      anchorAmpX[i] = (2 + u * 5.5) * turbulence;
      anchorAmpY[i] = (1.5 + u * 3.5) * turbulence;
    }

    const pSpeedYScaled = new Float64Array(bodyCount);
    for (let i = 0; i < bodyCount; i++) pSpeedYScaled[i] = pSpeedY[i] * speed;
    const whiteVxScaled = new Float64Array(whiteCount);
    const whiteVyScaled = new Float64Array(whiteCount);
    for (let i = 0; i < whiteCount; i++) {
      whiteVxScaled[i] = pWhiteVx[i] * speed;
      whiteVyScaled[i] = pWhiteVy[i] * speed;
    }

    const particleBucket = new Int32Array(bodyCount);
    const particleX = new Int32Array(bodyCount);
    const particleY = new Int32Array(bodyCount);
    const bucketCount = new Int32Array(LUT_STEPS);
    const bucketOffset = new Int32Array(LUT_STEPS + 1);
    const bucketCursor = new Int32Array(LUT_STEPS);
    const bodyX = new Int32Array(bodyCount);
    const bodyY = new Int32Array(bodyCount);
    const bodySize = new Float32Array(bodyCount);

    const whiteParticleBucket = new Int32Array(whiteCount);
    const whiteParticleX = new Int32Array(whiteCount);
    const whiteParticleY = new Int32Array(whiteCount);
    const whiteBucketCount = new Int32Array(WHITE_BUCKETS);
    const whiteBucketOffset = new Int32Array(WHITE_BUCKETS + 1);
    const whiteBucketCursor = new Int32Array(WHITE_BUCKETS);
    const fizzX = new Int32Array(whiteCount);
    const fizzY = new Int32Array(whiteCount);
    const fizzSize = new Float32Array(whiteCount);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize, { passive: true });

    let time = 0;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let onScreen = true;
    let pageVisible = !document.hidden;

    const render = () => {
      animId = 0;

      ctx.clearRect(0, 0, width, height);

      time += 0.016 * speed;

      bucketCount.fill(0);
      whiteBucketCount.fill(0);

      const depth = Math.min(260, width * 0.18);
      const baseX = width - Math.min(420, width * 0.30);
      const top = height + 20;

      for (let i = 0; i < bodyCount; i++) {
        if (!reducedMotion) {
          pY[i] += pSpeedYScaled[i];
          if (pY[i] < -20) pY[i] = top;
          else if (pY[i] > top) pY[i] = -20;

          if (pIsStreamer[i] === 1) {
            pU[i] -= pSpeedU[i] * speed;
            if (pU[i] <= 0) {
              pU[i] = 1.0 + Math.random() * 0.04;
              pSpeedU[i] = 0.0005 + Math.random() * 0.0007;
            }
          }
        }

        const y = pY[i];
        const progress = y < 0 ? 0 : y > height ? 1 : y / height;
        const cx = baseX + Math.sin(progress * Math.PI) * depth;

        let spread = width - cx;
        if (spread < 40) spread = 40;

        const uVal = pU[i];
        const timePhase = time * pFreq[i] + pPhase[i];

        let wobbleX;
        let wobbleY;
        let lutIdx;
        if (i < anchorCount) {
          wobbleX = Math.sin(timePhase) * anchorAmpX[i];
          wobbleY = Math.cos(timePhase * 0.8) * anchorAmpY[i];
          lutIdx = anchorBucket[i];
        } else {
          wobbleX = Math.sin(timePhase) * (2 + uVal * 5.5) * turbulence;
          wobbleY =
            Math.cos(timePhase * 0.8) * (1.5 + uVal * 3.5) * turbulence;
          const colorT = Math.max(
            0,
            Math.min(1, Math.pow(Math.max(0, uVal), 0.9))
          );
          lutIdx = Math.min(LUT_STEPS - 1, Math.floor(colorT * LUT_STEPS));
        }

        particleBucket[i] = lutIdx;
        particleX[i] = Math.floor(cx + uVal * spread + wobbleX);
        particleY[i] = Math.floor(y + wobbleY);
        bucketCount[lutIdx]++;
      }

      let run = 0;
      for (let b = 0; b < LUT_STEPS; b++) {
        bucketOffset[b] = run;
        bucketCursor[b] = run;
        run += bucketCount[b];
      }
      bucketOffset[LUT_STEPS] = run;

      for (let i = 0; i < bodyCount; i++) {
        const k = bucketCursor[particleBucket[i]]++;
        bodyX[k] = particleX[i];
        bodyY[k] = particleY[i];
        bodySize[k] = pSize[i];
      }

      for (let i = 0; i < whiteCount; i++) {
        if (!reducedMotion) {
          pWhiteDist[i] += whiteVxScaled[i];
          pWhiteY[i] += whiteVyScaled[i];

          const dist = pWhiteDist[i];
          const distOutside = dist < 0 ? -dist : dist;
          const yCheck = pWhiteY[i];
          const checkProgress =
            yCheck < 0 ? 0 : yCheck > height ? 1 : yCheck / height;
          const checkCx =
            baseX + Math.sin(checkProgress * Math.PI) * depth;

          if (
            distOutside > pWhiteMax[i] ||
            yCheck < -20 ||
            yCheck > top ||
            checkCx + dist < 0
          ) {
            pWhiteDist[i] = -Math.random() * 3;
            pWhiteY[i] = -15 + Math.random() * (height + 30);
            pWhiteMax[i] = 100 + Math.random() * 150;
            pWhiteVx[i] = -(0.18 + Math.random() * 0.35);
            pWhiteVy[i] = (Math.random() - 0.48) * 0.28;
            whiteVxScaled[i] = pWhiteVx[i] * speed;
            whiteVyScaled[i] = pWhiteVy[i] * speed;
          }
        }

        const y = pWhiteY[i];
        const progress = y < 0 ? 0 : y > height ? 1 : y / height;
        const cx = baseX + Math.sin(progress * Math.PI) * depth;
        const wobbleX =
          Math.sin(time * 0.5 + pWhitePhase[i]) * 1.5 * turbulence;
        const wobbleY =
          Math.cos(time * 0.4 + pWhitePhase[i]) * 1.2 * turbulence;

        const dist = pWhiteDist[i];
        const posX = Math.floor(cx + dist + wobbleX);
        const posY = Math.floor(y + wobbleY);

        const distOut = dist < 0 ? -dist : dist;
        const alphaFrac = Math.max(0, 1 - distOut / pWhiteMax[i]);
        const alphaBucket = Math.min(
          WHITE_BUCKETS - 1,
          Math.max(0, Math.floor(alphaFrac * WHITE_BUCKETS))
        );

        whiteParticleBucket[i] = alphaBucket;
        whiteParticleX[i] = posX;
        whiteParticleY[i] = posY;
        whiteBucketCount[alphaBucket]++;
      }

      let fizzRun = 0;
      for (let b = 0; b < WHITE_BUCKETS; b++) {
        whiteBucketOffset[b] = fizzRun;
        whiteBucketCursor[b] = fizzRun;
        fizzRun += whiteBucketCount[b];
      }
      whiteBucketOffset[WHITE_BUCKETS] = fizzRun;

      for (let i = 0; i < whiteCount; i++) {
        const k = whiteBucketCursor[whiteParticleBucket[i]]++;
        fizzX[k] = whiteParticleX[i];
        fizzY[k] = whiteParticleY[i];
        fizzSize[k] = pWhiteSize[i];
      }

      for (let b = 0; b < LUT_STEPS; b++) {
        const start = bucketOffset[b];
        const end = bucketOffset[b + 1];
        if (start === end) continue;
        ctx.globalAlpha = Math.max(0.72, 0.95 - (b / LUT_STEPS) * 0.18);
        ctx.fillStyle = colorLut[b];
        for (let j = start; j < end; j++) {
          ctx.fillRect(bodyX[j], bodyY[j], bodySize[j], bodySize[j]);
        }
      }

      ctx.fillStyle = "#ffffff";
      for (let wb = 0; wb < WHITE_BUCKETS; wb++) {
        const start = whiteBucketOffset[wb];
        const end = whiteBucketOffset[wb + 1];
        if (start === end) continue;
        ctx.globalAlpha = ((wb + 1) / WHITE_BUCKETS) * 0.92;
        for (let j = start; j < end; j++) {
          ctx.fillRect(fizzX[j], fizzY[j], fizzSize[j], fizzSize[j]);
        }
      }

      ctx.globalAlpha = 1;

      if (!reducedMotion && onScreen && pageVisible) {
        animId = requestAnimationFrame(render);
      }
    };

    const sync = () => {
      const run = !reducedMotion && onScreen && pageVisible;
      if (run && animId === 0) {
        animId = requestAnimationFrame(render);
      } else if (!run && animId !== 0) {
        cancelAnimationFrame(animId);
        animId = 0;
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        onScreen = entries[entries.length - 1].isIntersecting;
        sync();
      },
      { threshold: 0 }
    );
    observer.observe(canvas);

    const handleVisibility = () => {
      pageVisible = !document.hidden;
      sync();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    render();

    return () => {
      if (animId !== 0) cancelAnimationFrame(animId);
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("resize", handleResize);
    };
  }, [colors, particleCount, speed, turbulence]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ imageRendering: "pixelated" }}
    />
  );
}
