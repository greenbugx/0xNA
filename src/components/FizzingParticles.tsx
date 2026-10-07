"use client";

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

    const LUT_STEPS = 48;
    const WHITE_BUCKETS = 8;
    const colorLut: string[] = [];
    for (let s = 0; s < LUT_STEPS; s++) {
      const t = s / (LUT_STEPS - 1);
      const [r, g, b] = interpolateRgb(rgbPalette, t);
      colorLut.push(`rgb(${r},${g},${b})`);
    }

    const getCurveX = (y: number, w: number, h: number): number => {
      const progress = Math.max(0, Math.min(1, y / h));
      const depth = Math.min(260, w * 0.18);
      const baseX = w - Math.min(420, w * 0.30);
      return baseX + Math.sin(progress * Math.PI) * depth;
    };

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

    const bucketCount = new Int32Array(LUT_STEPS);
    const bucketX = Array.from(
      { length: LUT_STEPS },
      () => new Int32Array(bodyCount)
    );
    const bucketY = Array.from(
      { length: LUT_STEPS },
      () => new Int32Array(bodyCount)
    );
    const bucketS = Array.from(
      { length: LUT_STEPS },
      () => new Float32Array(bodyCount)
    );

    const whiteBucketCount = new Int32Array(WHITE_BUCKETS);
    const whiteBucketX = Array.from(
      { length: WHITE_BUCKETS },
      () => new Int32Array(whiteCount)
    );
    const whiteBucketY = Array.from(
      { length: WHITE_BUCKETS },
      () => new Int32Array(whiteCount)
    );
    const whiteBucketS = Array.from(
      { length: WHITE_BUCKETS },
      () => new Float32Array(whiteCount)
    );

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize, { passive: true });

    let time = 0;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      time += 0.016 * speed;

      bucketCount.fill(0);
      whiteBucketCount.fill(0);

      for (let i = 0; i < bodyCount; i++) {
        if (!reducedMotion) {
          pY[i] += pSpeedY[i] * speed;
          if (pY[i] < -20) pY[i] = height + 20;
          else if (pY[i] > height + 20) pY[i] = -20;

          if (pIsStreamer[i] === 1) {
            pU[i] -= pSpeedU[i] * speed;
            if (pU[i] <= 0) {
              pU[i] = 1.0 + Math.random() * 0.04;
              pSpeedU[i] = 0.0005 + Math.random() * 0.0007;
            }
          }
        }

        const cx = getCurveX(pY[i], width, height);
        const spread = Math.max(40, width - cx);

        const uVal = pU[i];
        const timePhase = time * pFreq[i] + pPhase[i];
        const wobbleX =
          Math.sin(timePhase) * (2 + uVal * 5.5) * turbulence;
        const wobbleY =
          Math.cos(timePhase * 0.8) * (1.5 + uVal * 3.5) * turbulence;

        const posX = Math.floor(cx + uVal * spread + wobbleX);
        const posY = Math.floor(pY[i] + wobbleY);

        const colorT = Math.max(
          0,
          Math.min(1, Math.pow(Math.max(0, uVal), 0.90))
        );
        const lutIdx = Math.min(
          LUT_STEPS - 1,
          Math.floor(colorT * LUT_STEPS)
        );

        const bIdx = bucketCount[lutIdx]++;
        bucketX[lutIdx][bIdx] = posX;
        bucketY[lutIdx][bIdx] = posY;
        bucketS[lutIdx][bIdx] = pSize[i];
      }

      for (let i = 0; i < whiteCount; i++) {
        if (!reducedMotion) {
          pWhiteDist[i] += pWhiteVx[i] * speed;
          pWhiteY[i] += pWhiteVy[i] * speed;

          const distOutside = Math.abs(pWhiteDist[i]);
          const curCx = getCurveX(pWhiteY[i], width, height);
          const curX = curCx + pWhiteDist[i];

          if (
            distOutside > pWhiteMax[i] ||
            pWhiteY[i] < -20 ||
            pWhiteY[i] > height + 20 ||
            curX < 0
          ) {
            pWhiteDist[i] = -Math.random() * 3;
            pWhiteY[i] = -15 + Math.random() * (height + 30);
            pWhiteMax[i] = 100 + Math.random() * 150;
            pWhiteVx[i] = -(0.18 + Math.random() * 0.35);
            pWhiteVy[i] = (Math.random() - 0.48) * 0.28;
          }
        }

        const cx = getCurveX(pWhiteY[i], width, height);
        const wobbleX =
          Math.sin(time * 0.5 + pWhitePhase[i]) * 1.5 * turbulence;
        const wobbleY =
          Math.cos(time * 0.4 + pWhitePhase[i]) * 1.2 * turbulence;

        const posX = Math.floor(cx + pWhiteDist[i] + wobbleX);
        const posY = Math.floor(pWhiteY[i] + wobbleY);

        const distOut = Math.abs(pWhiteDist[i]);
        const alphaFrac = Math.max(0, 1 - distOut / pWhiteMax[i]);
        const alphaBucket = Math.min(
          WHITE_BUCKETS - 1,
          Math.max(0, Math.floor(alphaFrac * WHITE_BUCKETS))
        );

        const wbIdx = whiteBucketCount[alphaBucket]++;
        whiteBucketX[alphaBucket][wbIdx] = posX;
        whiteBucketY[alphaBucket][wbIdx] = posY;
        whiteBucketS[alphaBucket][wbIdx] = pWhiteSize[i];
      }

      for (let b = 0; b < LUT_STEPS; b++) {
        const count = bucketCount[b];
        if (count === 0) continue;
        const alpha = Math.max(0.72, 0.95 - (b / LUT_STEPS) * 0.18);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = colorLut[b];
        const xs = bucketX[b];
        const ys = bucketY[b];
        const ss = bucketS[b];
        for (let j = 0; j < count; j++) {
          ctx.fillRect(xs[j], ys[j], ss[j], ss[j]);
        }
      }

      ctx.fillStyle = "#ffffff";
      for (let wb = 0; wb < WHITE_BUCKETS; wb++) {
        const count = whiteBucketCount[wb];
        if (count === 0) continue;
        const alpha = ((wb + 1) / WHITE_BUCKETS) * 0.92;
        ctx.globalAlpha = alpha;
        const xs = whiteBucketX[wb];
        const ys = whiteBucketY[wb];
        const ss = whiteBucketS[wb];
        for (let j = 0; j < count; j++) {
          ctx.fillRect(xs[j], ys[j], ss[j], ss[j]);
        }
      }

      ctx.globalAlpha = 1;

      if (!reducedMotion) {
        animId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
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
