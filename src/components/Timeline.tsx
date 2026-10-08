"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TechItem {
  name: string;
  icon: string;
  invert?: boolean;
}

interface TimelineItem {
  id: string;
  organization: string;
  logo: string;
  isLogoInvert?: boolean;
  isActive?: boolean;
  date: string;
  role: string;
  subtitle: string;
  points: string[];
  tech: TechItem[];
  defaultExpanded?: boolean;
}

const TIMELINE_DATA: TimelineItem[] = [
  {
    id: "self-break & side-work",
    organization: "Self Break & Side Work",
    logo: "/gifs/sup.gif",
    isActive: true,
    date: "Nov 2024 - Present",
    role: "Independent Developer & Builder",
    subtitle: "Personal Projects · Side Work",
    points: [
      "Stepped back from client deadlines to focus on independent building, personal exploration, and open source tools.",
      "Took on selective side contracts and freelance development gigs, delivering custom solutions with React, Next.js, and TypeScript.",
      "Built native Android and cross-platform mobile side projects using Kotlin, Java, Flutter, and Dart.",
      "Dove into low-level systems programming, memory safety, and performance utilities with Rust and C++.",
      "Handled full-stack infrastructure with Docker, PostgreSQL, and Cloudflare while exploring music production in FL Studio.",
    ],
    tech: [
      { name: "Rust", icon: "/images/Rust.svg", invert: true },
      { name: "C++", icon: "/images/Cpp.svg" },
      { name: "Next.js", icon: "/images/Next.js.svg", invert: true },
      { name: "React", icon: "/images/React.svg" },
      { name: "Astro", icon: "/images/Astro.svg" },
      { name: "Vite.js", icon: "/images/Vite.js.svg" },
      { name: "TypeScript", icon: "/images/ts-logo-round-128.svg" },
      { name: "Tailwind CSS", icon: "/images/Tailwind CSS.svg" },
      { name: "Docker", icon: "/images/docker.svg" },
      { name: "PostgresSQL", icon: "/images/postgresSQL.svg" },
      { name: "Cloudflare", icon: "/images/Cloudflare.svg" },
      { name: "Kotlin", icon: "/images/kotlin.svg" },
      { name: "Java", icon: "/images/java.svg" },
      { name: "Dart", icon: "/images/dart.svg" },
      { name: "Flutter", icon: "/images/flutter.svg" },
      { name: "FL Studio", icon: "/images/FLStudio.webp" },
    ],
    defaultExpanded: true,
  },
  {
    id: "freelance",
    organization: "Freelance",
    logo: "/images/fiverr.svg",
    isActive: false,
    date: "Apr 2023 - Nov 2024",
    role: "Full-Stack Web Developer",
    subtitle: "Fiverr · Remote (Guwahati, Assam, India)",
    points: [
      "Shipped custom websites and full-stack web solutions end-to-end for global clients on Fiverr.",
      "Built responsive marketing sites, dashboards, and custom client interfaces with React, Next.js, and modern CSS.",
      "Handled direct client communication, requirement scoping, and pixel-accurate implementation.",
      "Integrated third-party APIs, optimized performance budgets, and maintained clean, reusable codebases.",
    ],
    tech: [
      { name: "Next.js", icon: "/images/Next.js.svg", invert: true },
      { name: "React", icon: "/images/React.svg" },
      { name: "Astro", icon: "/images/Astro.svg", invert: true },
      { name: "Vite.js", icon: "/images/Vite.js.svg" },
      { name: "TypeScript", icon: "/images/ts-logo-round-128.svg" },
      { name: "Nuxt.js", icon: "/images/Nuxt.js.svg" },
      { name: "Tailwind CSS", icon: "/images/Tailwind CSS.svg" },
      { name: "Docker", icon: "/images/docker.svg" },
      { name: "FastAPI", icon: "/images/fastAPI.svg" },
      { name: "MongoDB", icon: "/images/mongoDB.svg" },
      { name: "PostgresSQL", icon: "/images/postgresSQL.svg" },
      { name: "AWS", icon: "/images/aws.svg" },
      { name: "Cloudflare", icon: "/images/Cloudflare.svg" },
    ],
    defaultExpanded: false,
  },
];

export default function Timeline() {
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({
    "self-break & side-work": true,
    "freelance": false,
  });

  const toggleExpand = (id: string) => {
    setExpandedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <section className="w-full px-2 pt-10 sm:pt-14 select-none">
      <h2 className="font-[family-name:var(--font-playfairdisplay)] text-2xl sm:text-3xl text-zinc-100 font-normal tracking-tight mb-8">
        Life&apos;s been Tough
      </h2>

      <div className="relative flex flex-col">
        {TIMELINE_DATA.map((item, index) => {
          const isExpanded = !!expandedMap[item.id];
          const isLast = index === TIMELINE_DATA.length - 1;

          return (
            <div key={item.id} className="relative flex gap-3.5 sm:gap-4">
              <div className="relative flex flex-col items-center shrink-0 w-9 sm:w-10">
                <div className="relative z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-white/15 bg-[#161618] flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                  <Image
                    src={item.logo}
                    alt={item.organization}
                    width={40}
                    height={40}
                    unoptimized
                    className={`w-full h-full object-cover ${item.isLogoInvert ? "invert" : ""}`}
                  />
                </div>

                {!isLast && (
                  <div className="w-[1.5px] bg-zinc-800/80 flex-1 my-1" />
                )}

                <div className="absolute top-9 left-1/2 -translate-x-[0.5px] w-4 h-6 pointer-events-none">
                  <svg
                    viewBox="0 0 16 24"
                    fill="none"
                    className="w-4 h-6 text-zinc-800/90 stroke-current"
                  >
                    <path
                      d="M 1 0 V 12 C 1 18 5 22 15 22"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              <div className="flex-1 min-w-0 pb-8 sm:pb-10">
                <div className="flex items-center justify-between gap-2 min-h-9 sm:min-h-10 pt-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-zinc-100 font-semibold text-sm sm:text-base tracking-tight">
                      {item.organization}
                    </span>
                    {item.isActive && (
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

                <div className="mt-2.5 sm:mt-3 pl-1 sm:pl-2">
                  <div
                    onClick={() => toggleExpand(item.id)}
                    className="flex items-start justify-between gap-3 cursor-pointer group/item"
                  >
                    <div className="flex flex-col min-w-0">
                      <h3 className="text-zinc-200 group-hover/item:text-white font-medium text-sm sm:text-[15px] transition-colors">
                        {item.role}
                      </h3>
                      <p className="text-zinc-500 text-xs sm:text-[13px] mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>

                    <button
                      type="button"
                      aria-label="Toggle details"
                      className="text-zinc-500 group-hover/item:text-zinc-300 p-1 transition-colors shrink-0"
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ease-out ${
                          isExpanded ? "rotate-180" : "rotate-0"
                        }`}
                      />
                    </button>
                  </div>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          height: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
                          opacity: { duration: 0.24, ease: "easeOut" },
                        }}
                        className="overflow-hidden"
                      >
                        <ul className="mt-3.5 space-y-2.5">
                          {item.points.map((point, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2.5 text-zinc-400 text-xs sm:text-[13px] leading-relaxed"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 shrink-0 mt-1.5" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="mt-4 flex flex-wrap gap-2 pt-1">
                          {item.tech.map((t) => (
                            <span
                              key={t.name}
                              className="inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-[5px] align-middle bg-gradient-to-b from-[#2a2b2f] via-[#222326] to-[#1c1c1f] hover:from-[#323338] hover:via-[#28292d] hover:to-[#212124] border border-white/[0.09] hover:border-white/[0.16] shadow-[0_1.5px_4px_rgba(0,0,0,0.5),inset_0_1px_0.5px_rgba(255,255,255,0.18)] select-none cursor-default transition-colors duration-150 text-[11px] sm:text-xs font-medium text-zinc-200 tracking-tight leading-none"
                            >
                              <Image
                                src={t.icon}
                                alt={t.name}
                                width={12}
                                height={12}
                                unoptimized
                                className={`w-3 h-3 sm:w-3.5 sm:h-3.5 object-contain shrink-0 ${t.invert ? "invert" : ""}`}
                              />
                              <span>{t.name}</span>
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
