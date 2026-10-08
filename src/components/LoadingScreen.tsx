"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import PacmanLoader from "./PacmanLoader";

const CRITICAL_IMAGES = [
  "/images/me.webp",
  "/matte-grain.webp",
  "/images/ts-logo-round-128.svg",
  "/images/React.svg",
  "/images/Next.js.svg",
  "/images/Rust.svg",
  "/images/Cpp.svg",
  "/images/Spotify.svg",
  "/images/FLStudio.webp",
];

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.src = src;
    if (img.complete) {
      resolve();
    } else {
      img.onload = () => resolve();
      img.onerror = () => resolve();
    }
  });
}

function waitForDocumentComplete(): Promise<void> {
  return new Promise((resolve) => {
    if (document.readyState === "complete") {
      resolve();
    } else {
      window.addEventListener("load", () => resolve(), { once: true });
    }
  });
}

export default function LoadingScreen({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function checkResources() {
      const minDurationPromise = new Promise((resolve) => setTimeout(resolve, 3000));

      const fontsPromise = document.fonts ? document.fonts.ready : Promise.resolve();
      const imagesPromise = Promise.all(CRITICAL_IMAGES.map(preloadImage));
      const documentPromise = waitForDocumentComplete();

      const allResourcesPromise = Promise.all([
        documentPromise,
        fontsPromise,
        imagesPromise,
      ]);

      const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 8000));

      await Promise.all([
        minDurationPromise,
        Promise.race([allResourcesPromise, timeoutPromise]),
      ]);

      if (isMounted) {
        setIsLoading(false);
      }
    }

    checkResources();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="loading-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#09090b] pointer-events-auto select-none"
          >
            <div
              style={{
                backgroundImage: "url('/matte-grain.webp')",
                backgroundRepeat: "repeat",
                imageRendering: "pixelated",
              }}
              className="absolute inset-0 opacity-90 pointer-events-none"
            />
            <span
              style={{
                background:
                  "repeating-linear-gradient(to bottom, rgba(0, 0, 0, 0.4) 0 1px, transparent 1px 3px)",
              }}
              className="absolute inset-0 opacity-35 pointer-events-none"
            />

            <div className="relative z-10 flex flex-col items-center justify-center">
              <PacmanLoader />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col flex-1 w-full"
      >
        {children}
      </motion.div>
    </>
  );
}

