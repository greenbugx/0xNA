"use client";
"use no memo";

import React, { useEffect, useRef } from "react";
import { createFizzRenderer, type FizzRenderer } from "./fizzing/renderer";

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

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const renderer: FizzRenderer | null = createFizzRenderer(
      canvas,
      colors && colors.length >= 2 ? colors : DEFAULT_PALETTE,
      particleCount
    );

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      renderer?.resize(canvas.width, canvas.height);
    };

    window.addEventListener("resize", handleResize, { passive: true });

    let animId = 0;
    let time = 0;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let onScreen = true;
    let pageVisible = !document.hidden;

    if (renderer) {
      const render = () => {
        animId = 0;
        time += 0.016 * speed;
        renderer.render(time, speed, turbulence, !reducedMotion);
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
        renderer.dispose();
      };
    }

    return () => {
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
