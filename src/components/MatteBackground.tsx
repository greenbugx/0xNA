"use client";

import React, { useEffect, useRef } from "react";
import FizzingParticles from "./FizzingParticles";

const BLACK = [9, 9, 11] as const;

function hash(n: number): number {
  let t = n >>> 0;
  t = Math.imul(t ^ (t >>> 16), 2146121005);
  t = Math.imul(t ^ (t >>> 15), 2221713035);
  return (t ^ (t >>> 16)) >>> 0;
}

export function renderDarkBackground(canvas: HTMLCanvasElement, w: number, h: number) {
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const scale = Math.min(2, Math.max(0.5, Math.sqrt((w * h) / (1920 * 1080))));
  const hw = w / 2;
  const hh = h / 2;
  const vigR = 1600 * scale;

  const img = ctx.createImageData(w, h);
  const data = img.data;

  let seed = 0;
  let p = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++, seed++, p += 4) {
      const grain = (((hash((seed ^ 2654435769) >>> 0) >>> 8) / 16777216) - 0.5) * 12;
      const nv = Math.hypot(x + 0.5 - hw, y + 0.5 - hh) / vigR;
      const vig = Math.max(0.2, 1 - nv * nv * nv);

      const r = BLACK[0] * vig;
      const g = BLACK[1] * vig;
      const b = BLACK[2] * vig;

      data[p] = Math.min(255, Math.max(0, r + grain));
      data[p + 1] = Math.min(255, Math.max(0, g + grain));
      data[p + 2] = Math.min(255, Math.max(0, b + grain));
      data[p + 3] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);
}

export default function MatteBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const BUDGET = 2.2e6;

    const render = () => {
      const cssW = Math.max(320, window.innerWidth);
      const cssH = Math.max(240, window.innerHeight);
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const res = Math.max(0.4, Math.min(dpr, Math.sqrt(BUDGET / (cssW * cssH))));
      const w = Math.round(cssW * res);
      const h = Math.round(cssH * res);
      renderDarkBackground(canvas, w, h);
    };

    render();

    let debounceId = 0;
    const handleResize = () => {
      cancelAnimationFrame(debounceId);
      debounceId = requestAnimationFrame(render);
    };

    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      cancelAnimationFrame(debounceId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#09090b]"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none select-none"
        style={{
          imageRendering: "pixelated",
        }}
      />
      <FizzingParticles speed={0.3} className="hidden lg:block" />
      <span
        style={{
          background:
            "repeating-linear-gradient(to bottom, rgba(0, 0, 0, 0.4) 0 1px, transparent 1px 3px)",
        }}
        className="absolute inset-0 opacity-20 pointer-events-none"
      />
    </div>
  );
}
