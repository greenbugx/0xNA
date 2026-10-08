import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ProjectsPage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-8 pb-36 select-none">
      <div className="relative z-20 w-full max-w-2xl flex flex-col items-center text-center px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-b from-[#2a2b2f] via-[#222326] to-[#1c1c1f] hover:from-[#323338] hover:via-[#28292d] hover:to-[#212124] border border-white/[0.09] hover:border-white/[0.16] text-xs font-medium text-zinc-300 hover:text-white transition-colors shadow-[0_1.5px_4px_rgba(0,0,0,0.5),inset_0_1px_0.5px_rgba(255,255,255,0.18)] cursor-pointer mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-zinc-400" />
          <span>Back to Home</span>
        </Link>

        <h1 className="font-[family-name:var(--font-playfairdisplay)] text-2xl sm:text-3xl md:text-4xl text-zinc-100 font-normal tracking-tight leading-snug">
          THE OWNER HAS YET TO GIVE THIS PAGE ANY ATTENTION
        </h1>

        <p className="mt-3 text-sm sm:text-base text-zinc-400 font-normal">
          So, Stay Tuned.
        </p>
      </div>
    </div>
  );
}
