import React from "react";
import Image from "next/image";

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

export default function AboutMe() {
  return (
    <div className="w-full px-2 text-[13px] sm:text-sm text-zinc-400 leading-[1.65] sm:leading-[1.7] space-y-3.5 sm:space-y-4">
      <p>
        I’m 18, a full-stack developer who likes figuring out how things work and then probably rebuilding them for no good reason. I spend most of my time with{" "}
        <span className="inline-block whitespace-nowrap">
          <TechBadge name="TypeScript" icon="/images/ts-logo-round-128.svg" />,
        </span>{" "}
        <span className="inline-block whitespace-nowrap">
          <TechBadge name="React" icon="/images/React.svg" />,
        </span>{" "}
        and{" "}
        <span className="inline-block whitespace-nowrap">
          <TechBadge name="Next.js" icon="/images/Next.js.svg" invert />,
        </span>{" "}
        jumping between frontend, backend, and{" "}
        <span className="inline-block whitespace-nowrap">everything in between.</span>
      </p>

      <p>
        When web development starts feeling a little too comfortable, I disappear into{" "}
        <TechBadge name="Rust" icon="/images/Rust.svg" invert /> and{" "}
        <TechBadge name="C++" icon="/images/Cpp.svg" /> for a while. Low-level programming has a weird way of turning a simple idea into a personal challenge.
      </p>

      <p>
        I like making things from scratch, especially the kind of projects that start with a random thought and end with a working product. Somewhere between shipping, breaking, and fixing things, I’m usually learning something new.
      </p>

      <p>
        When I’m not coding, there’s probably{" "}
        <TechBadge name="Spotify" icon="/images/Spotify.svg" /> running in the background, music playing a little too loud, or another project that I absolutely did not need to start. And when I finally get bored of it too, I open{" "}
        <TechBadge name="FL Studio" icon="/images/FLStudio.webp" /> and try to make something of{" "}
        <span className="inline-block whitespace-nowrap">my own.</span>
      </p>

      <div className="pt-10 sm:pt-20">
        <p className="text-xl sm:text-4xl font-bold text-zinc-100 tracking-tight">
          More things are getting added{" "}<br className="hidden sm:inline" />
          <span className="pl-24 sm:pl-48 text-zinc-500 font-normal">Soon</span>
        </p>
      </div>
    </div>
  );
}
