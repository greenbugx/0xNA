"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { MapPin, Moon, Sun } from "lucide-react";
import FlipText from "./block/flip-text";
import { useWeather } from "@/lib/weather";

export default function ProfileHeader() {
  const { temperature, isDay: weatherIsDay } = useWeather();
  const [isDay, setIsDay] = useState<boolean>(() => {
    const now = new Date();
    const utcMillis = now.getTime() + now.getTimezoneOffset() * 60000;
    const istDate = new Date(utcMillis + 5.5 * 3600000);
    const hours = istDate.getHours();
    return hours >= 6 && hours < 18;
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const utcMillis = now.getTime() + now.getTimezoneOffset() * 60000;
      const istDate = new Date(utcMillis + 5.5 * 3600000);
      const hours = istDate.getHours();
      setIsDay(hours >= 6 && hours < 18);
    };

    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  const activeIsDay = weatherIsDay !== null ? weatherIsDay : isDay;

  return (
    <header className="w-full max-w-2xl mx-auto flex items-center justify-between gap-4 py-4 px-2 select-none">
      <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden shrink-0 ring-2 ring-white/10 ring-offset-2 ring-offset-[#09090b]">
          <Image
            src="/images/me.webp"
            alt="Jesus Chetia"
            width={56}
            height={56}
            priority
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col min-w-0 justify-center">
          <h1
            className="text-2xl sm:text-3xl text-zinc-100 font-normal tracking-wide leading-none"
            style={{ fontFamily: "var(--font-playfairdisplay), serif" }}
          >
            Jesus Chetia
          </h1>

          <div className="mt-1.5 h-4 flex items-center">
            <FlipText className="text-xs sm:text-sm text-zinc-400" />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end shrink-0 gap-1 text-right">
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-zinc-300 font-medium">
          <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span>Assam, IN</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-zinc-400">
          {activeIsDay ? (
            <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
          )}
          <span>{temperature ?? "24°C"}</span>
        </div>
      </div>
    </header>
  );
}
