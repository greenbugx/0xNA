"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const STAGES = [
  { delay: 1200, text: "Eating more..." },
  { delay: 2400, text: "Eating a lot..." },
  { delay: 3800, text: "Eating a huge amount..." },
  { delay: 5400, text: "Daymn!!! Eating very much..." },
];

export default function PacmanLoader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState("Eating...");

  useEffect(() => {
    const timers = STAGES.map((stage) =>
      setTimeout(() => {
        setStatus(stage.text);
      }, stage.delay)
    );

    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const displaySize = 104;
    canvas.width = displaySize * dpr;
    canvas.height = displaySize * dpr;
    ctx.scale(dpr, dpr);

    let animationId: number;
    const startTime = performance.now();

    const drawFrame = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      ctx.clearRect(0, 0, displaySize, displaySize);

      const cx = displaySize / 2;
      const cy = displaySize / 2;
      const trackRadius = 34;
      const pacRadius = 9;
      const numDots = 14;

      const speed = 2.0;
      const orbit = (elapsed * speed) % (Math.PI * 2);

      for (let i = 0; i < numDots; i++) {
        const theta = (i / numDots) * (Math.PI * 2);
        let diff = (theta - orbit) % (Math.PI * 2);
        if (diff < 0) diff += Math.PI * 2;

        let scale = 1.0;
        if (diff < 0.08) {
          scale = 0.0;
        } else if (diff <= 0.25) {
          scale = (diff - 0.08) / 0.17;
        } else if (diff > Math.PI * 2 - 2.1) {
          scale = 0.0;
        } else if (diff > Math.PI * 2 - 2.6) {
          scale = (Math.PI * 2 - 2.1 - diff) / 0.5;
        }

        if (scale > 0.02) {
          const dx = cx + Math.cos(theta) * trackRadius;
          const dy = cy + Math.sin(theta) * trackRadius;
          ctx.beginPath();
          ctx.arc(dx, dy, 2.0 * scale, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff";
          ctx.shadowColor = "rgba(255, 255, 255, 0.4)";
          ctx.shadowBlur = 3;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      const pacX = cx + Math.cos(orbit) * trackRadius;
      const pacY = cy + Math.sin(orbit) * trackRadius;
      const heading = orbit + Math.PI / 2;
      const mouthAngle = Math.abs(Math.sin(elapsed * 14)) * 0.44 + 0.05;

      const startAngle = heading + mouthAngle;
      const endAngle = heading - mouthAngle + Math.PI * 2;

      ctx.beginPath();
      ctx.moveTo(pacX, pacY);
      ctx.arc(pacX, pacY, pacRadius, startAngle, endAngle, false);
      ctx.closePath();
      ctx.fillStyle = "#facc15";
      ctx.shadowColor = "rgba(250, 204, 21, 0.35)";
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;

      animationId = requestAnimationFrame(drawFrame);
    };

    drawFrame(performance.now());

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center select-none pointer-events-none gap-2.5">
      <div className="w-28 h-28 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          style={{ width: 104, height: 104 }}
          className="block"
        />
      </div>
      <div className="h-5 flex items-center justify-center min-w-[200px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={status}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            style={{ color: "#a1a1aa" }}
            className="font-[family-name:var(--font-google-sans-italic)] italic text-xs tracking-wider text-center"
          >
            {status}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
