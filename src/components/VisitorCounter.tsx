"use client";

import React from "react";
import { useVisitorNumber } from "@/lib/visitors";
import { formatOrdinal } from "@/lib/format";

export default function VisitorCounter() {
  const visitorNumber = useVisitorNumber();

  return (
    <div className="mt-4 min-h-[1.25rem] flex items-center justify-center">
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
    </div>
  );
}