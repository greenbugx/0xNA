"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Globe, ArrowUpRight } from "lucide-react";

interface ProjectItem {
  title: string;
  date: string;
  status: "discontinued" | "not maintained";
  description: string;
  image: string;
  imageFit?: "cover" | "contain";
  tags: { name: string; icon: string; invert?: boolean }[];
  website?: string;
  github?: string;
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

function ExpandableTechTag({
  name,
  icon,
  invert,
}: {
  name: string;
  icon: string;
  invert?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative z-0 hover:z-20 flex items-center h-6 sm:h-7 rounded-full bg-gradient-to-b from-[#2a2b2f] via-[#222326] to-[#1c1c1f] hover:from-[#323338] hover:via-[#28292d] hover:to-[#212124] border border-white/[0.09] hover:border-white/[0.16] shadow-[0_1.5px_4px_rgba(0,0,0,0.5),inset_0_1px_0.5px_rgba(255,255,255,0.18)] select-none cursor-pointer transition-all duration-200 ease-out px-1.5 shrink-0"
    >
      <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 flex items-center justify-center">
        <Image
          src={icon}
          alt={name}
          width={14}
          height={14}
          unoptimized
          className={`w-full h-full object-contain ${invert ? "invert" : ""}`}
        />
      </div>
      <span
        className={`overflow-hidden whitespace-nowrap transition-all duration-200 ease-out text-[11px] sm:text-xs font-medium text-zinc-200 ${
          isHovered
            ? "max-w-[120px] opacity-100 ml-1.5 pr-1"
            : "max-w-0 opacity-0 ml-0"
        }`}
      >
        {name}
      </span>
    </div>
  );
}

const PROJECTS: ProjectItem[] = [
  {
    title: "Hongeet",
    date: "Feb 3, 2026",
    status: "discontinued",
    description:
      "A distraction-free streaming music client built for seamless playback, offline capabilities, synchronized lyrics, and a clean ad-free interface.",
    image: "/images/projects/hongeet.webp",
    imageFit: "cover",
    tags: [
      { name: "Dart", icon: "/images/dart.svg" },
      { name: "Flutter", icon: "/images/flutter.svg" },
      { name: "Kotlin", icon: "/images/kotlin.svg" },
      { name: "C++", icon: "/images/Cpp.svg" },
      { name: "CMake", icon: "/images/Cmake.svg" },
    ],
    website: "https://greenbugx.github.io/Hongeet/",
    github: "https://github.com/greenbugx/Hongeet",
  },
  {
    title: "ScorpionV3",
    date: "Apr 4, 2025",
    status: "not maintained",
    description:
      "A powerful web scraping and security scanning tool designed for penetration testing and security analysis. This tool combines website scraping capabilities with vulnerability detection to help identify common security issues.",
    image: "/images/projects/scorpion.webp",
    imageFit: "contain",
    tags: [
      { name: "Python", icon: "/images/python.svg" },
      { name: "Selenium", icon: "/images/selenium.svg" },
    ],
    github: "https://github.com/greenbugx/ScorpionV3",
  },
];

export default function Projects() {
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);

  return (
    <section className="w-full px-2 pt-10 sm:pt-14 select-none">
      <div className="flex items-center justify-between gap-4 mb-5 sm:mb-6">
        <h2 className="font-[family-name:var(--font-playfairdisplay)] text-2xl sm:text-3xl text-zinc-100 font-normal tracking-tight">
          Things I Made.{" "}
          <span className="text-base sm:text-lg text-zinc-500 font-normal">
            Please Clap.
          </span>
        </h2>
        <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mx-4 hidden sm:block" />
        <Link
          href="/projects"
          className="flex items-center gap-1 text-xs sm:text-sm text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer shrink-0"
        >
          <span>See All</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
        {PROJECTS.map((project) => {
          const isHovered = hoveredProject === project.title;
          const isOtherHovered = hoveredProject !== null && !isHovered;

          return (
            <div
              key={project.title}
              onMouseEnter={() => setHoveredProject(project.title)}
              onMouseLeave={() => setHoveredProject(null)}
              className={`group rounded-xl border bg-[#121214] overflow-hidden flex flex-col transition-all duration-300 shadow-[0_3px_14px_rgba(0,0,0,0.35)] cursor-pointer ${
                isOtherHovered
                  ? "opacity-60 border-white/[0.06]"
                  : isHovered
                  ? "opacity-100 border-white/[0.18] shadow-[0_8px_30px_rgba(0,0,0,0.6)]"
                  : "opacity-100 border-white/[0.08]"
              }`}
            >
            <div className="relative w-full aspect-[16/10] overflow-hidden bg-[#0c0c0c]">
              <Image
                src={project.image}
                alt={project.title}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover object-center group-hover:scale-[1.02] transition-transform duration-300"
              />
            </div>

            <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-[family-name:var(--font-playfairdisplay)] text-base sm:text-lg font-normal text-zinc-100 tracking-tight">
                    {project.title}
                  </h3>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium bg-gradient-to-b from-[#2a2b2f] via-[#222326] to-[#1c1c1f] border border-white/[0.09] shadow-[0_1.5px_4px_rgba(0,0,0,0.5),inset_0_1px_0.5px_rgba(255,255,255,0.18)] text-zinc-300">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        project.status === "discontinued"
                          ? "bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]"
                          : "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]"
                      }`}
                    />
                    <span>{project.status}</span>
                  </span>
                </div>

                <div className="text-[11px] text-zinc-500 font-normal">
                  {project.date}
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  {project.description}
                </p>
              </div>

              <div className="space-y-3 pt-1">
                <div className="flex items-center -space-x-1.5 flex-wrap">
                  {project.tags.map((tag) => (
                    <ExpandableTechTag
                      key={tag.name}
                      name={tag.name}
                      icon={tag.icon}
                      invert={tag.invert}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-0.5">
                  {project.website && (
                    <a
                      href={project.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gradient-to-b from-[#2a2b2f] via-[#222326] to-[#1c1c1f] hover:from-[#323338] hover:via-[#28292d] hover:to-[#212124] border border-white/[0.09] hover:border-white/[0.16] text-[11px] sm:text-xs font-medium text-zinc-200 transition-colors shadow-[0_1.5px_4px_rgba(0,0,0,0.5),inset_0_1px_0.5px_rgba(255,255,255,0.18)] cursor-pointer"
                    >
                      <Globe className="w-3 h-3 text-zinc-400" />
                      <span>Website</span>
                    </a>
                  )}
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gradient-to-b from-[#2a2b2f] via-[#222326] to-[#1c1c1f] hover:from-[#323338] hover:via-[#28292d] hover:to-[#212124] border border-white/[0.09] hover:border-white/[0.16] text-[11px] sm:text-xs font-medium text-zinc-200 transition-colors shadow-[0_1.5px_4px_rgba(0,0,0,0.5),inset_0_1px_0.5px_rgba(255,255,255,0.18)] cursor-pointer"
                    >
                      <GithubIcon className="w-3 h-3 text-zinc-400" />
                      <span>GitHub</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      </div>
    </section>
  );
}
