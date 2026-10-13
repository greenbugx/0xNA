"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getCalApi } from "@calcom/embed-react";
import { Calendar, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CalBookingButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export default function CalBookingButton({
  className,
  children,
}: CalBookingButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    (async function initCal() {
      try {
        const cal = await getCalApi();
        cal("ui", {
          theme: "dark",
          styles: { branding: { brandColor: "#09090b" } },
          hideEventTypeDetails: false,
          layout: "month_view",
        });
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const defaultClassName =
    "group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-b from-[#2a2b2f] via-[#222326] to-[#1c1c1f] hover:from-[#323338] hover:via-[#28292d] hover:to-[#212124] border border-white/[0.09] hover:border-white/[0.16] text-xs font-medium text-zinc-300 hover:text-white transition-colors shadow-[0_1.5px_4px_rgba(0,0,0,0.5),inset_0_1px_0.5px_rgba(255,255,255,0.18)] cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-white/20";

  const buttonElement = (
    <button
      type="button"
      onClick={() => {
        setIframeLoaded(false);
        setIsOpen(true);
      }}
      aria-label="Book a call on Cal.com"
      className={className || defaultClassName}
    >
      {children || (
        <>
          <Calendar className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-200 transition-colors shrink-0" />
          <span>Book a call</span>
        </>
      )}
    </button>
  );

  const modalElement = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md select-none"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            data-lenis-prevent
            className="relative w-full max-w-4xl h-[90vh] max-h-[720px] rounded-2xl sm:rounded-3xl border border-white/10 bg-[#0f1012] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col"
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close booking modal"
              className="absolute top-3.5 right-3.5 z-30 w-8 h-8 rounded-lg bg-gradient-to-b from-[#2a2b2f] via-[#222326] to-[#1c1c1f] hover:from-[#323338] hover:via-[#28292d] hover:to-[#212124] border border-white/[0.09] hover:border-white/[0.16] text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-[0_1.5px_4px_rgba(0,0,0,0.5),inset_0_1px_0.5px_rgba(255,255,255,0.18)] select-none focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              <X className="w-4 h-4 text-zinc-300 hover:text-white transition-colors" />
            </button>

            <div className="relative w-full h-full overflow-hidden bg-[#0f1012] rounded-2xl sm:rounded-3xl flex items-center justify-center">
              {!iframeLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#0f1012] z-10">
                  <Loader2 className="w-6 h-6 sm:w-7 sm:h-7 text-zinc-300 animate-spin" />
                </div>
              )}

              <iframe
                src="https://cal.com/jesuschetia/30min?embed=true&theme=dark&layout=month_view"
                title="Book a call with Jesus Chetia"
                onLoad={() => setIframeLoaded(true)}
                className={`w-full h-full border-0 transition-opacity duration-300 ${
                  iframeLoaded ? "opacity-100" : "opacity-0"
                }`}
                allow="camera; microphone; autoplay; fullscreen"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {buttonElement}
      {mounted ? createPortal(modalElement, document.body) : null}
    </>
  );
}
