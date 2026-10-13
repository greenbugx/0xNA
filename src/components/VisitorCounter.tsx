"use client";

import React from "react";
import { useVisitorStats } from "@/lib/visitors";
import { formatOrdinal } from "@/lib/format";

export default function VisitorCounter() {
  const { visitorNumber, totalVisitors } = useVisitorStats();

  return (
    <div className="mt-4 min-h-[2.75rem] flex flex-col items-center justify-center gap-1">
      {visitorNumber !== null && (
        <p
          aria-live="polite"
          className="text-[11px] sm:text-xs text-zinc-500 tracking-tight"
        >
          You&apos;re the{" "}
          <span className="font-semibold text-zinc-100">
            {formatOrdinal(visitorNumber)}
          </span>{" "}
          visitor
        </p>
      )}

      {totalVisitors !== null && (
        <p className="text-[10px] sm:text-[11px] text-zinc-600 tracking-tight">
          <span className="text-zinc-500">
            {totalVisitors.toLocaleString("en-US")}
          </span>{" "}
          {totalVisitors === 1 ? "visitor so far" : "visitors so far"}
        </p>
      )}
    </div>
  );
}