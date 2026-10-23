"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { ArrowUpRight, Lock } from "lucide-react";
import type { ContributionCalendar, ContributionDay } from "@/lib/github";

const LEVEL_COLORS: Record<string, string> = {
  NONE: "#202124",
  FIRST_QUARTILE: "#0a5332",
  SECOND_QUARTILE: "#15803d",
  THIRD_QUARTILE: "#22c55e",
  FOURTH_QUARTILE: "#a3e635",
};

const LEVEL_ORDER = [
  "NONE",
  "FIRST_QUARTILE",
  "SECOND_QUARTILE",
  "THIRD_QUARTILE",
  "FOURTH_QUARTILE",
];

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const VISIBLE_WEEKDAYS = [1, 3, 5];
const PAD = 10;
const CELL_SIZE = 10;
const CELL_GAP = 3;
const COLUMN_GAP = 8;

type TooltipState = {
  day: ContributionDay;
  centerX: number;
  centerY: number;
  containerWidth: number;
  containerHeight: number;
} | null;


function dayLabel(day: ContributionDay) {
  const formatted = new Date(`${day.date}T00:00:00Z`).toLocaleDateString(
    "en-US",
    { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" },
  );
  const unit = day.contributionCount === 1 ? "contribution" : "contributions";
  return `${day.contributionCount} ${unit} on ${formatted}`;
}

function monthLabels(calendar: ContributionCalendar) {
  const result: { key: string; name: string; left: number }[] = [];

  calendar.months.forEach((month) => {
    const weekIdx = calendar.weeks.findIndex((w) =>
      w.contributionDays.some((d) =>
        d.date.startsWith(month.firstDay.slice(0, 7)),
      ),
    );
    if (weekIdx === -1) return;
    const left = weekIdx * (CELL_SIZE + CELL_GAP);
    result.push({
      key: `${month.year}-${month.firstDay}`,
      name: month.name,
      left,
    });
  });

  return result.filter((m, i) => {
    if (i < result.length - 1) {
      return result[i + 1].left - m.left >= 28;
    }
    return true;
  });
}

type GridProps = {
  weeks: ContributionCalendar["weeks"];
  show: (day: ContributionDay, cell: HTMLElement) => void;
  hide: () => void;
};

const ContributionGrid = React.memo(function ContributionGrid({
  weeks,
  show,
  hide,
}: GridProps) {
  return (
    <div
      className="grid select-none"
      style={{
        gap: CELL_GAP,
        gridTemplateColumns: `repeat(${weeks.length}, ${CELL_SIZE}px)`,
        gridTemplateRows: `repeat(7, ${CELL_SIZE}px)`,
      }}
    >
      {weeks.map((week, weekIndex) =>
        week.contributionDays.map((day) => (
          <button
            key={day.date}
            type="button"
            data-day
            aria-label={dayLabel(day)}
            style={{
              backgroundColor:
                LEVEL_COLORS[day.contributionLevel] ?? day.color,
              gridColumn: weekIndex + 1,
              gridRow: day.weekday + 1,
            }}
            className="w-[10px] h-[10px] rounded-[2px] cursor-pointer outline-none transition-transform duration-150 hover:scale-[1.35] focus-visible:scale-[1.35] focus-visible:ring-1 focus-visible:ring-white/60"
            onMouseEnter={(event) => show(day, event.currentTarget)}
            onMouseLeave={hide}
            onFocus={(event) => show(day, event.currentTarget)}
            onBlur={hide}
            onTouchStart={(event) => show(day, event.currentTarget)}
          />
        )),
      )}
    </div>
  );
});

export default function GithubHeatmap({
  calendar,
}: {
  calendar: ContributionCalendar | null;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState>(null);

  const show = useCallback(
    (day: ContributionDay, cell: HTMLElement) => {
      const card = cardRef.current;
      if (!card) return;

      const cardRect = card.getBoundingClientRect();
      const cellRect = cell.getBoundingClientRect();

      setTooltip({
        day,
        centerX: cellRect.left - cardRect.left + cellRect.width / 2,
        centerY: cellRect.top - cardRect.top + cellRect.height / 2,
        containerWidth: cardRect.width,
        containerHeight: cardRect.height,
      });
    },
    [],
  );

  const hide = useCallback(() => setTooltip(null), []);

  useLayoutEffect(() => {
    const node = tooltipRef.current;
    if (!node || !tooltip) return;

    const width = node.offsetWidth;
    const height = node.offsetHeight;
    const left = Math.min(
      Math.max(tooltip.centerX - width / 2, PAD),
      Math.max(tooltip.containerWidth - width - PAD, PAD),
    );
    const top =
      tooltip.centerY - height - 8 >= PAD
        ? tooltip.centerY - height - 8
        : tooltip.centerY + 16;

    node.style.left = `${left}px`;
    node.style.top = `${top}px`;
  }, [tooltip]);

  useEffect(() => {
    if (!tooltip) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") hide();
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest("[data-day]")) hide();
    };

    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [tooltip, hide]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [calendar]);

  const levelColors = new Map<string, string>();
  calendar?.weeks.forEach((week) =>
    week.contributionDays.forEach((day) => {
      if (!levelColors.has(day.contributionLevel)) {
        levelColors.set(
          day.contributionLevel,
          LEVEL_COLORS[day.contributionLevel] ?? day.color,
        );
      }
    }),
  );

  const legend = LEVEL_ORDER.filter((level) => levelColors.has(level)).map(
    (level) => ({ level, background: levelColors.get(level) as string }),
  );

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

      <div
        ref={cardRef}
        className="relative rounded-2xl border border-white/[0.08] bg-[#121214] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
      >
        {!calendar ? (
          <div className="flex min-h-[190px] flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="w-10 h-10 rounded-full bg-[#1c1d21]/90 border border-white/15 flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
              <Lock className="w-4 h-4 text-zinc-200" />
            </div>
            <p className="text-xs sm:text-sm font-medium text-zinc-200 tracking-tight">
              Contribution data is unavailable right now
            </p>
            <p className="text-[11px] sm:text-xs text-zinc-500">
              Check the activity on GitHub in the meantime
            </p>
          </div>
        ) : (
          <div className="p-4 sm:p-5 flex flex-col gap-3">
            <div
              ref={scrollRef}
              className="w-full overflow-x-auto scrollbar-none pb-1"
              onScroll={hide}
            >
              <div
                className="w-max grid grid-cols-[auto_1fr] gap-y-2"
                style={{ columnGap: COLUMN_GAP }}
              >
                <div className="w-6 sm:w-7" aria-hidden="true" />
                <div className="relative h-4">
                  {monthLabels(calendar).map((month) => (
                    <span
                      key={month.key}
                      className="absolute top-0 text-[10px] sm:text-[11px] text-zinc-400 font-medium whitespace-nowrap"
                      style={{ left: `${month.left}px` }}
                    >
                      {month.name}
                    </span>
                  ))}
                </div>

                <div
                  className="w-6 sm:w-7 grid"
                  style={{
                    gap: CELL_GAP,
                    gridTemplateRows: `repeat(7, ${CELL_SIZE}px)`,
                  }}
                >
                  {WEEKDAY_LABELS.map((label, weekday) =>
                    VISIBLE_WEEKDAYS.includes(weekday) ? (
                      <span
                        key={label}
                        style={{ gridRow: weekday + 1 }}
                        className="h-[10px] flex items-center text-[9px] sm:text-[10px] leading-none text-zinc-500"
                      >
                        {label}
                      </span>
                    ) : null,
                  )}
                </div>

                <ContributionGrid
                  weeks={calendar.weeks}
                  show={show}
                  hide={hide}
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 text-xs sm:text-[13px] text-zinc-400 flex-wrap pt-1">
              <span>
                This year, I achieved{" "}
                {calendar.totalContributions.toLocaleString("en-US")}{" "}
                contributions
              </span>

              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-zinc-500">
                <span>Less</span>
                {legend.map((item) => (
                  <span
                    key={item.level}
                    style={{ background: item.background }}
                    className="w-2.5 h-2.5 rounded-[2.5px]"
                  />
                ))}
                <span>More</span>
              </div>
            </div>
          </div>
        )}

        {tooltip && (
          <div
            ref={tooltipRef}
            role="tooltip"
            className="absolute left-0 top-0 z-20 pointer-events-none whitespace-nowrap rounded-lg border border-white/10 bg-[#1c1d21] px-2 py-1 text-[11px] sm:text-xs font-medium text-zinc-100 shadow-[0_6px_20px_rgba(0,0,0,0.6)]"
          >
            {dayLabel(tooltip.day)}
          </div>
        )}
      </div>
    </section>
  );
}
