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
        I’m an 18-year-old full-stack developer building with{" "}
        <span className="inline-block whitespace-nowrap">
          <TechBadge name="TypeScript" icon="/images/ts-logo-round-128.svg" />,
        </span>{" "}
        <span className="inline-block whitespace-nowrap">
          <TechBadge name="React" icon="/images/React.svg" />,
        </span>{" "}
        and{" "}
        <span className="inline-block whitespace-nowrap">
          <TechBadge name="Next.js" icon="/images/Next.js.svg" invert />.
        </span>{" "}
        When I’m not shipping web apps, I’m probably experimenting with{" "}
        <span className="inline-block whitespace-nowrap">
          <TechBadge name="Rust" icon="/images/Rust.svg" invert />,
        </span>{" "}
        <span className="inline-block whitespace-nowrap">
          <TechBadge name="C++" icon="/images/Cpp.svg" />,
        </span>{" "}
        or making music in{" "}
        <span className="inline-block whitespace-nowrap">
          <TechBadge name="FL Studio" icon="/images/FLStudio.webp" />.
        </span>
      </p>
    </div>
  );
}
