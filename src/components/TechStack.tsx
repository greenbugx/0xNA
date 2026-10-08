"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TechBadgeProps {
  name: string;
  icon: string;
  invert?: boolean;
}

function TechBadge({ name, icon, invert }: TechBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-[2px] rounded-[5px] align-middle -translate-y-[1px] bg-gradient-to-b from-[#2a2b2f] via-[#222326] to-[#1c1c1f] hover:from-[#323338] hover:via-[#28292d] hover:to-[#212124] border border-white/[0.09] hover:border-white/[0.16] shadow-[0_1.5px_4px_rgba(0,0,0,0.5),inset_0_1px_0.5px_rgba(255,255,255,0.18)] select-none cursor-default transition-colors duration-150 text-[11px] sm:text-xs font-medium text-zinc-200 tracking-tight leading-none">
      <Image
        src={icon}
        alt={name}
        width={12}
        height={12}
        unoptimized
        className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 object-contain ${invert ? "invert" : ""}`}
      />
      <span>{name}</span>
    </span>
  );
}

const CATEGORIES = [
  {
    title: "LANGUAGES",
    items: [
      { name: "TypeScript", icon: "/images/ts-logo-round-128.svg" },
      { name: "JavaScript", icon: "/images/js.svg" },
      { name: "Rust", icon: "/images/Rust.svg", invert: true },
      { name: "Go", icon: "/images/go.svg" },
      { name: "Python", icon: "/images/python.svg" },
      { name: "C++", icon: "/images/Cpp.svg" },
      { name: "HTML", icon: "/images/html.svg" },
      { name: "CSS", icon: "/images/css.svg" },
    ],
  },
  {
    title: "FRONTEND & UI",
    items: [
      { name: "React", icon: "/images/React.svg" },
      { name: "Next.js", icon: "/images/Next.js.svg", invert: true },
      { name: "Vite", icon: "/images/Vite.js.svg" },
      { name: "Tailwind", icon: "/images/Tailwind CSS.svg" },
      { name: "WebGL", icon: "/images/WebGL.svg" },
      { name: "GSAP", icon: "/images/gsap.svg" },
      { name: "Motion", icon: "/images/motion.svg" },
    ],
  },
  {
    title: "BACKEND & DATABASES",
    items: [
      { name: "Go", icon: "/images/go.svg" },
      { name: "Node.js", icon: "/images/node.js.svg" },
      { name: "PostgreSQL", icon: "/images/postgresSQL.svg" },
      { name: "SQLite", icon: "/images/SQLite.svg" },
      { name: "Redis", icon: "/images/redis.svg" },
      { name: "Drizzle", icon: "/images/drizzle.svg" },
    ],
  },
  {
    title: "CROSS-PLATFORM WIZARDRY",
    items: [
      { name: "Tauri", icon: "/images/tauri.svg" },
      { name: "Flutter", icon: "/images/flutter.svg" },
      { name: "Dart", icon: "/images/dart.svg" },
      { name: "Kotlin", icon: "/images/kotlin.svg" },
      { name: "Java", icon: "/images/java.svg" },
    ],
  },
  {
    title: "TOOLS I OPEN EVERY DAY",
    items: [
      { name: "VS Code", icon: "/images/vscode.svg" },
      { name: "GitHub", icon: "/images/github.svg", invert: true },
      { name: "pnpm", icon: "/images/pnpm.svg" },
      { name: "Thunder Client", icon: "/images/thunderclient.svg" },
      { name: "Docker", icon: "/images/docker.svg" },
      { name: "Git", icon: "/images/git.svg" },
    ],
  },
];

export default function TechStack() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="w-full px-2 pt-10 sm:pt-14 select-none">
      <h2 className="font-[family-name:var(--font-playfairdisplay)] text-2xl sm:text-3xl text-zinc-100 font-normal tracking-tight mb-5 sm:mb-6">
        Things I blame when it breaks
      </h2>

      <div className="w-full text-[13px] sm:text-sm text-zinc-400 leading-[1.7] sm:leading-[1.75] space-y-3.5 sm:space-y-4">
        <p>
          My usual setup is basically{" "}
          <span className="inline-block whitespace-nowrap">
            <TechBadge name="JavaScript" icon="/images/js.svg" />
          </span>{" "}
          arguing with{" "}
          <span className="inline-block whitespace-nowrap">
            <TechBadge name="TypeScript" icon="/images/ts-logo-round-128.svg" />
          </span>{" "}
          while{" "}
          <span className="inline-block whitespace-nowrap">
            <TechBadge name="Tailwind CSS" icon="/images/Tailwind CSS.svg" />
          </span>{" "}
          makes everything look pretty enough that nobody notices the bugs.
        </p>

        <p>
          For databases, I trust{" "}
          <span className="inline-block whitespace-nowrap">
            <TechBadge name="PostgreSQL" icon="/images/postgresSQL.svg" />
          </span>{" "}
          with my life and{" "}
          <span className="inline-block whitespace-nowrap">
            <TechBadge name="SQLite" icon="/images/SQLite.svg" />
          </span>{" "}
          with my side projects. I use{" "}
          <span className="inline-block whitespace-nowrap">
            <TechBadge name="Git" icon="/images/git.svg" />
          </span>{" "}
          when I remember to commit,{" "}
          <span className="inline-block whitespace-nowrap">
            <TechBadge name="VS Code" icon="/images/vscode.svg" />
          </span>{" "}
          when I pretend I know what I&apos;m doing, and I use{" "}
          <span className="inline-block whitespace-nowrap">
            <TechBadge name="Arch Linux" icon="/images/arch.svg" />
          </span>{" "}
          just to be able to say{" "}
          <span className="inline-block whitespace-nowrap font-semibold text-[14px] sm:text-[15px] text-zinc-200">
            &quot;<span className="italic">I use Arch btw</span>{" "}
            <span className="not-italic">: )</span>&quot;
          </span>
        </p>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
              opacity: { duration: 0.25, ease: "easeOut" },
            }}
            className="overflow-hidden"
          >
            <div className="pt-6 sm:pt-7">
              <p className="text-[13px] sm:text-sm text-zinc-400 mb-6">
                Alright G, here&apos;s few more:
              </p>

              <div className="space-y-6 sm:space-y-7">
                {CATEGORIES.map((cat) => (
                  <div key={cat.title}>
                    <h3 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2.5">
                      {cat.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 pt-0.5">
                      {cat.items.map((item) => (
                        <TechBadge
                          key={item.name}
                          name={item.name}
                          icon={item.icon}
                          invert={item.invert}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-5 sm:mt-6">
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="group inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gradient-to-b from-[#2a2b2f] via-[#222326] to-[#1c1c1f] hover:from-[#323338] hover:via-[#28292d] hover:to-[#212124] border border-white/[0.09] hover:border-white/[0.16] shadow-[0_1.5px_4px_rgba(0,0,0,0.5),inset_0_1px_0.5px_rgba(255,255,255,0.18)] select-none cursor-pointer transition-colors duration-150 text-[11px] sm:text-xs font-medium text-zinc-200"
        >
          {isExpanded ? (
            <>
              <ChevronLeft className="w-3 h-3 text-zinc-400 group-hover:text-zinc-200 group-hover:-translate-x-0.5 transition-transform duration-150" />
              <span>Show Less</span>
            </>
          ) : (
            <>
              <span>Show More</span>
              <ChevronRight className="w-3 h-3 text-zinc-400 group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-transform duration-150" />
            </>
          )}
        </button>
      </div>
    </section>
  );
}
