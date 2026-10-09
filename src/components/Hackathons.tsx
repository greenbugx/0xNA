"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface HackItem {
  id: string;
  title: string;
  location: string;
  date: string;
  isOngoing?: boolean;
  description: string;
  logo: string;
}

const HACKATHONS: HackItem[] = [
  {
    id: "hacktoberfest-2026",
    title: "Hacktoberfest 2026",
    location: "Online",
    date: "October 2026 (Ongoing)",
    isOngoing: true,
    description:
      "Participating in Hacktoberfest 2026. Making open-source projects, exploring new ideas, and building something related to the theme's of this year's DEV Challenges. Also taking part in the MLH Global Hack Week (9-15 Oct).",
    logo: "/images/hacks/hacktoberfest.svg",
  },
  {
    id: "nasa-space-apps-2026",
    title: "NASA Space Apps Challenge",
    location: "Online",
    date: "November 14-15, 2026",
    isOngoing: false,
    description:
      "Coming up next. Taking on NASA World's Largest Annual Global Hackathon to tackle real-world challenges using science, space technology, and creativity. Two days to build something meaningful, collaborate, and probably sacrifice some sleep.",
    logo: "/images/hacks/NASA_Space_Apps_Challenge.svg",
  },
];

function Keycap({ label, keyCode }: { label: string; keyCode?: string }) {
  const [isPressed, setIsPressed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const keyId = label.toLowerCase();
  const w = label.length === 1 ? 42 : 58;
  const h = 42;
  const dishTop = isPressed ? 22 : 21;
  const dishMid = isPressed ? 24 : 23.5;
  const textY = isPressed ? 14.5 : 13;

  useEffect(() => {
    audioRef.current = new Audio("/music/click.mp3");
    audioRef.current.volume = 0.5;
  }, []);

  const playClick = () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      const sound = audio.cloneNode() as HTMLAudioElement;
      sound.volume = 0.5;
      sound.play().catch(() => {});
    } catch {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  };

  useEffect(() => {
    if (!keyCode) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (keyCode === "Control" && (e.key === "Control" || e.ctrlKey)) ||
        (keyCode === "c" && e.key.toLowerCase() === "c") ||
        (keyCode === "v" && e.key.toLowerCase() === "v")
      ) {
        if (!e.repeat) {
          playClick();
        }
        setIsPressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (
        (keyCode === "Control" && !e.ctrlKey) ||
        (keyCode === "c" && e.key.toLowerCase() === "c") ||
        (keyCode === "v" && e.key.toLowerCase() === "v")
      ) {
        setIsPressed(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [keyCode]);

  return (
    <button
      type="button"
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onClick={() => {
        setIsPressed(true);
        setTimeout(() => setIsPressed(false), 150);
      }}
      className={`inline-flex items-center justify-center select-none cursor-pointer align-middle transition-transform duration-75 ${
        isPressed ? "translate-y-[2.5px]" : ""
      }`}
    >
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        className="h-10 sm:h-11 md:h-12 w-auto overflow-visible"
      >
        <defs>
          <linearGradient id={`topG_${keyId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isPressed ? "#25262a" : "#38393f"} />
            <stop offset="50%" stopColor={isPressed ? "#1d1e21" : "#28292e"} />
            <stop offset="100%" stopColor={isPressed ? "#161719" : "#1e1f23"} />
          </linearGradient>
          <linearGradient id={`frontG_${keyId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#222327" />
            <stop offset="100%" stopColor="#121316" />
          </linearGradient>
        </defs>

        <ellipse
          cx={w / 2}
          cy={39}
          rx={w / 2 - 3}
          ry={2.5}
          fill="#000"
          opacity={isPressed ? 0.35 : 0.65}
        />

        <path
          d={`M 4.5 ${dishTop} C ${w / 2 - 8} ${dishMid}, ${w / 2 + 8} ${dishMid}, ${w - 4.5} ${dishTop} L ${w - 2.5} 33 C ${w - 2.5} 35.5, ${w - 5} 36.5, ${w - 6} 36.5 L 6 36.5 C 5 36.5, 2.5 35.5, 2.5 33 Z`}
          fill={`url(#frontG_${keyId})`}
          stroke="#090a0c"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />

        <path
          d={`M 6.5 5.5 C ${w / 2 - 6} 4.2, ${w / 2 + 6} 4.2, ${w - 6.5} 5.5 L ${w - 4.5} ${dishTop} C ${w / 2 + 8} ${dishMid}, ${w / 2 - 8} ${dishMid}, 4.5 ${dishTop} Z`}
          fill={`url(#topG_${keyId})`}
          stroke="#090a0c"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />

        <path
          d={`M 5.5 ${dishTop} C ${w / 2 - 8} ${dishMid}, ${w / 2 + 8} ${dishMid}, ${w - 5.5} ${dishTop}`}
          fill="none"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="1"
        />

        <text
          x={w / 2}
          y={textY}
          textAnchor="middle"
          dominantBaseline="central"
          fill={isPressed ? "#c4c4c8" : "#f4f4f6"}
          fontFamily="var(--font-mono), monospace"
          fontSize={label.length === 1 ? 13 : 11}
          fontWeight="600"
          letterSpacing="-0.02em"
        >
          {label}
        </text>
      </svg>
    </button>
  );
}

export default function Hackathons() {
  const [hoveredHack, setHoveredHack] = useState<string | null>(null);

  return (
    <section className="w-full px-2 pt-10 sm:pt-14 select-none">
      <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8">
        <h2 className="font-[family-name:var(--font-playfairdisplay)] text-2xl sm:text-3xl text-zinc-100 font-normal tracking-tight flex items-center gap-2 sm:gap-3 flex-wrap">
          <span>Competitive</span>
          <span className="inline-flex items-center gap-1.5 sm:gap-2 font-sans text-xs sm:text-sm font-normal text-zinc-500 not-italic align-middle">
            <Keycap label="Ctrl" keyCode="Control" />
            <span className="text-zinc-500 font-sans text-sm sm:text-base font-normal">+</span>
            <Keycap label="C" keyCode="c" />
            <span className="w-1.5 sm:w-2" />
            <Keycap label="Ctrl" keyCode="Control" />
            <span className="text-zinc-500 font-sans text-sm sm:text-base font-normal">+</span>
            <Keycap label="V" keyCode="v" />
          </span>
        </h2>
        <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mx-4 hidden sm:block" />
      </div>

      <div className="relative flex flex-col">
        {HACKATHONS.map((item, index) => {
          const isLast = index === HACKATHONS.length - 1;
          const isHovered = hoveredHack === item.id;
          const isOtherHovered = hoveredHack !== null && !isHovered;

          return (
            <div
              key={item.id}
              onMouseEnter={() => setHoveredHack(item.id)}
              onMouseLeave={() => setHoveredHack(null)}
              className={`relative flex gap-3.5 sm:gap-4 transition-opacity duration-300 cursor-pointer ${
                isOtherHovered ? "opacity-60" : "opacity-100"
              }`}
            >
              <div className="relative flex flex-col items-center shrink-0 w-9 sm:w-10">
                <div className="relative z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-white/15 bg-[#161618] flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                  <Image
                    src={item.logo}
                    alt={item.title}
                    width={40}
                    height={40}
                    unoptimized
                    className="w-full h-full object-cover"
                  />
                </div>

                {!isLast && (
                  <div className="w-[1.5px] bg-zinc-800/80 flex-1 my-1" />
                )}
              </div>

              <div className={`flex-1 min-w-0 ${isLast ? "pb-2" : "pb-8 sm:pb-10"}`}>
                <div className="flex items-center justify-between gap-2 min-h-9 sm:min-h-10 pt-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-zinc-100 font-semibold text-sm sm:text-base tracking-tight">
                      {item.title}
                    </span>
                    {item.isOngoing && (
                      <span className="relative flex h-2 w-2 shrink-0 items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse" />
                      </span>
                    )}
                  </div>
                  <span className="text-zinc-500 text-xs sm:text-sm font-normal shrink-0">
                    {item.date}
                  </span>
                </div>

                <div className="text-xs sm:text-[13px] text-zinc-500 font-normal mt-0.5">
                  {item.location}
                </div>

                <p className="text-xs sm:text-[13px] text-zinc-400 leading-relaxed mt-2.5 sm:mt-3">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
