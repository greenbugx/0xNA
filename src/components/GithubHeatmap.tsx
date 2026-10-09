import React from "react";
import { ArrowUpRight, Lock } from "lucide-react";

const PALETTE = [
  "#202124",
  "#0a5332",
  "#15803d",
  "#22c55e",
  "#a3e635",
  "#facc15",
  "#fffbeb",
];

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
];

/*
THIS ARE JUST TEMPORARY DATA FOR THE HEATMAP, I WILL REPLACE IT WITH REAL DATA LATER, OKAYYYYYYYYY!!!!!!!!!
*/

const WEEKS_DATA: string[][] = [
  ["#202124", "#202124", "#202124", "#202124", "#202124", "#202124", "#fffbeb"],
  ["#22c55e", "#202124", "#202124", "#202124", "#202124", "#202124", "#202124"],
  ["#0a5332", "#202124", "#202124", "#202124", "#15803d", "#202124", "#202124"],
  ["#202124", "#202124", "#202124", "#202124", "#202124", "#202124", "#202124"],
  ["#202124", "#202124", "#202124", "#202124", "#202124", "#16a34a", "#202124"],
  ["#202124", "#202124", "#202124", "#202124", "#202124", "#202124", "#202124"],
  ["#202124", "#202124", "#202124", "#202124", "#202124", "#202124", "#202124"],
  ["#202124", "#202124", "#202124", "#202124", "#202124", "#202124", "#202124"],
  ["#202124", "#202124", "#202124", "#202124", "#202124", "#22c55e", "#202124"],
  ["#202124", "#202124", "#202124", "#202124", "#15803d", "#202124", "#202124"],
  ["#0a5332", "#202124", "#202124", "#a3e635", "#202124", "#202124", "#22c55e"],
  ["#202124", "#202124", "#16a34a", "#202124", "#202124", "#202124", "#15803d"],
  ["#a3e635", "#202124", "#22c55e", "#202124", "#202124", "#202124", "#202124"],
  ["#202124", "#202124", "#0a5332", "#a3e635", "#202124", "#fffbeb", "#202124"],
  ["#202124", "#202124", "#202124", "#202124", "#facc15", "#fef08a", "#22c55e"],
  ["#202124", "#202124", "#22c55e", "#202124", "#fffbeb", "#202124", "#202124"],
  ["#202124", "#202124", "#202124", "#15803d", "#22c55e", "#202124", "#a3e635"],
  ["#202124", "#202124", "#202124", "#202124", "#202124", "#202124", "#202124"],
  ["#202124", "#202124", "#202124", "#0a5332", "#202124", "#202124", "#202124"],
  ["#202124", "#202124", "#202124", "#202124", "#202124", "#fffbeb", "#202124"],
  ["#202124", "#202124", "#202124", "#22c55e", "#202124", "#202124", "#202124"],
  ["#16a34a", "#202124", "#202124", "#202124", "#facc15", "#fef08a", "#22c55e"],
  ["#202124", "#202124", "#202124", "#202124", "#22c55e", "#a3e635", "#202124"],
  ["#22c55e", "#22c55e", "#202124", "#202124", "#202124", "#22c55e", "#15803d"],
  ["#15803d", "#16a34a", "#202124", "#202124", "#202124", "#a3e635", "#22c55e"],
  ["#0a5332", "#22c55e", "#202124", "#202124", "#202124", "#202124", "#16a34a"],
  ["#202124", "#0a5332", "#202124", "#22c55e", "#202124", "#202124", "#202124"],
  ["#a3e635", "#22c55e", "#202124", "#15803d", "#22c55e", "#202124", "#202124"],
  ["#202124", "#202124", "#202124", "#22c55e", "#a3e635", "#202124", "#202124"],
  ["#202124", "#202124", "#22c55e", "#22c55e", "#22c55e", "#facc15", "#fef08a"],
  ["#202124", "#202124", "#202124", "#facc15", "#22c55e", "#202124", "#fffbeb"],
  ["#facc15", "#202124", "#202124", "#22c55e", "#facc15", "#fffbeb", "#22c55e"],
  ["#202124", "#22c55e", "#202124", "#202124", "#22c55e", "#a3e635", "#202124"],
  ["#22c55e", "#202124", "#202124", "#202124", "#facc15", "#22c55e", "#facc15"],
  ["#202124", "#202124", "#202124", "#202124", "#22c55e", "#202124", "#202124"],
  ["#facc15", "#202124", "#202124", "#fffbeb", "#202124", "#22c55e", "#facc15"],
  ["#22c55e", "#202124", "#202124", "#202124", "#22c55e", "#202124", "#202124"],
  ["#202124", "#a3e635", "#202124", "#202124", "#202124", "#fffbeb", "#22c55e"],
  ["#a3e635", "#22c55e", "#202124", "#202124", "#fef08a", "#a3e635", "#fef08a"],
  ["#22c55e", "#fffbeb", "#facc15", "#202124", "#22c55e", "#202124", "#202124"],
  ["#202124", "#22c55e", "#202124", "#22c55e", "#202124", "#fef08a", "#202124"],
];

export default function GithubHeatmap() {
  return (
    <section className="w-full px-2 pt-10 sm:pt-14 select-none">
      <div className="flex items-center justify-between gap-4 mb-5 sm:mb-6">
        <h2 className="font-[family-name:var(--font-playfairdisplay)] text-2xl sm:text-3xl text-zinc-100 font-normal tracking-tight">
          Green Squares of Shame
        </h2>
        <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mx-4 hidden sm:block" />
        <a
          href="https://github.com/greenbugx"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs sm:text-sm text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer shrink-0"
        >
          <span>See All</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="relative rounded-2xl border border-white/[0.08] bg-[#121214] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
        <div className="p-4 sm:p-5 flex flex-col gap-2 blur-[6px] opacity-40 select-none pointer-events-none">
          <div className="w-full overflow-x-auto scrollbar-none">
            <div className="min-w-[620px] flex flex-col gap-2">
              <div className="flex justify-between text-[11px] sm:text-xs text-zinc-400 font-medium px-1">
                {MONTHS.map((m) => (
                  <span key={m}>{m}</span>
                ))}
              </div>

              <div className="grid grid-flow-col grid-rows-7 gap-1 sm:gap-1.5">
                {WEEKS_DATA.flatMap((week, wIdx) =>
                  week.map((color, dIdx) => (
                    <span
                      key={`${wIdx}-${dIdx}`}
                      style={{ backgroundColor: color }}
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-[3px]"
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="flex items-end justify-between gap-4 text-xs sm:text-[13px] text-zinc-400 flex-wrap">
            <span>This year, I achieved 1791 contributions</span>

            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-zinc-500">
              <span>Less</span>
              {PALETTE.map((c) => (
                <span
                  key={c}
                  style={{ backgroundColor: c }}
                  className="w-2.5 h-2.5 rounded-[2.5px]"
                />
              ))}
              <span>More</span>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 p-4 select-none">
          <div className="w-10 h-10 rounded-full bg-[#1c1d21]/90 border border-white/15 flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.6)] backdrop-blur-md">
            <Lock className="w-4 h-4 text-zinc-200" />
          </div>
          <p className="text-xs sm:text-sm font-medium text-zinc-200 tracking-tight text-center">
            Heatmap is still heating...
          </p>
        </div>
      </div>
    </section>
  );
}
