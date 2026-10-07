"use client";

import { useState, useEffect } from "react";
import { WEATHER_CONFIG } from "@/config/weather";

const STORAGE_KEY = "portfolio_weather_cache";

interface WeatherCache {
  temperature: number;
  isDay: boolean;
  timestamp: number;
}

export function useWeather() {
  const [temperature, setTemperature] = useState<string | null>(null);
  const [isDay, setIsDay] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadWeather() {
      try {
        const cachedRaw = localStorage.getItem(STORAGE_KEY);
        if (cachedRaw) {
          try {
            const cached: WeatherCache = JSON.parse(cachedRaw);
            const isFresh =
              Date.now() - cached.timestamp <
              WEATHER_CONFIG.revalidateMinutes * 60 * 1000;

            if (isFresh && typeof cached.temperature === "number") {
              if (isMounted) {
                setTemperature(`${cached.temperature}°C`);
                setIsDay(cached.isDay);
                setLoading(false);
              }
              return;
            }
          } catch {
            localStorage.removeItem(STORAGE_KEY);
          }
        }

        const url = `https://api.open-meteo.com/v1/forecast?latitude=${WEATHER_CONFIG.latitude}&longitude=${WEATHER_CONFIG.longitude}&current=temperature_2m,is_day&temperature_unit=celsius`;
        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(`Weather fetch failed with status ${res.status}`);
        }

        const data = await res.json();
        const rawTemp = data.current?.temperature_2m;

        if (typeof rawTemp !== "number") {
          throw new Error("Invalid temperature payload");
        }

        const roundedTemp = Math.round(rawTemp);
        const dayFlag = data.current?.is_day === 1;

        const newCache: WeatherCache = {
          temperature: roundedTemp,
          isDay: dayFlag,
          timestamp: Date.now(),
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(newCache));

        if (isMounted) {
          setTemperature(`${roundedTemp}°C`);
          setIsDay(dayFlag);
          setLoading(false);
        }
      } catch {
        const fallbackRaw = localStorage.getItem(STORAGE_KEY);
        if (fallbackRaw) {
          try {
            const fallback: WeatherCache = JSON.parse(fallbackRaw);
            if (typeof fallback.temperature === "number") {
              if (isMounted) {
                setTemperature(`${fallback.temperature}°C`);
                setIsDay(fallback.isDay);
                setLoading(false);
              }
              return;
            }
          } catch {}
        }

        if (isMounted) {
          setTemperature(null);
          setLoading(false);
        }
      }
    }

    loadWeather();

    return () => {
      isMounted = false;
    };
  }, []);

  return { temperature, isDay, loading };
}

