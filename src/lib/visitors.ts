"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "portfolio_visitor_id";
const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const ENDPOINT = "/api/visitors";

function isValidId(value: unknown): value is string {
  return typeof value === "string" && UUID_V4.test(value);
}

function createVisitorId(): string {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join("-");
}

function getOrCreateVisitorId(): string | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isValidId(stored)) return stored;

    const created = createVisitorId();
    localStorage.setItem(STORAGE_KEY, created);
    return created;
  } catch {
    return null;
  }
}

let pending: Promise<number | null> | null = null;

function loadVisitorNumber(): Promise<number | null> {
  if (!pending) {
    const request = (async () => {
      const visitorId = getOrCreateVisitorId();
      if (!visitorId) return null;

      try {
        const response = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visitorId }),
          cache: "no-store",
        });

        if (!response.ok) return null;

        const data = (await response.json()) as { visitorNumber?: unknown };
        return typeof data.visitorNumber === "number"
          ? data.visitorNumber
          : null;
      } catch {
        return null;
      }
    })();

    pending = request;
    void request.then((value) => {
      if (value === null && pending === request) pending = null;
    });
  }

  return pending;
}

export function useVisitorNumber(): number | null {
  const [visitorNumber, setVisitorNumber] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    void loadVisitorNumber().then((value) => {
      if (active && value !== null) setVisitorNumber(value);
    });

    return () => {
      active = false;
    };
  }, []);

  return visitorNumber;
}