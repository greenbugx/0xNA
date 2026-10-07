"use client";

import React, { useMemo, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface FlipTextProps {
  className?: string;
  children?: string;
  texts?: string[];
  duration?: number;
  delay?: number;
  interval?: number;
  loop?: boolean;
  separator?: string;
  together?: boolean;
}

const DEFAULT_TEXTS = [
  "Certified bug creator",
  "Works on my machine",
  "Tabs > spaces (fight me)",
  "Stack Overflow graduate",
  "Will code for pizza",
  "Deleting code is a vibe",
  "git push --force & pray",
  "Procrastinating cleanly",
  "404: Sleep not found",
];

export function FlipText({
  className,
  children,
  texts = DEFAULT_TEXTS,
  duration = 0.4,
  delay = 0,
  interval = 3200,
  separator = " ",
  together = false,
}: FlipTextProps) {
  const list = useMemo(() => {
    if (texts && texts.length > 0) return texts;
    if (children) return [children];
    return DEFAULT_TEXTS;
  }, [texts, children]);

  const [textIndex, setTextIndex] = useState(0);
  const [isFlippingOut, setIsFlippingOut] = useState(false);

  useEffect(() => {
    if (list.length <= 1) return;

    let timeoutId: ReturnType<typeof setTimeout>;
    const intervalId = setInterval(() => {
      setIsFlippingOut(true);

      timeoutId = setTimeout(() => {
        setTextIndex((prev) => (prev + 1) % list.length);
        setIsFlippingOut(false);
      }, 450);
    }, interval);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [list.length, interval]);

  const currentText = list[textIndex] || "";
  const words = useMemo(() => currentText.split(separator), [currentText, separator]);
  const totalChars = currentText.length || 1;

  const getCharIndex = (wordIndex: number, charIndex: number) => {
    let index = 0;
    for (let i = 0; i < wordIndex; i++) {
      index += words[i].length + (separator === " " ? 1 : separator.length);
    }
    return index + charIndex;
  };

  return (
    <div
      className={cn(
        "flip-text-wrapper inline-block leading-none",
        className
      )}
      style={{ perspective: "1000px" }}
    >
      {words.map((word, wordIndex) => {
        const chars = word.split("");

        return (
          <span
            key={`${textIndex}-${wordIndex}-${word}`}
            className="word inline-block whitespace-nowrap"
            style={{ transformStyle: "preserve-3d" }}
          >
            {chars.map((char, charIndex) => {
              const currentGlobalIndex = getCharIndex(wordIndex, charIndex);

              let calculatedDelay = delay;
              if (!together) {
                const normalizedIndex = currentGlobalIndex / totalChars;
                const sineValue = Math.sin(normalizedIndex * (Math.PI / 2));
                calculatedDelay = sineValue * (duration * 0.25) + delay;
              }

              return (
                <span
                  key={`${textIndex}-${wordIndex}-${charIndex}`}
                  className={cn(
                    "flip-char inline-block relative",
                    isFlippingOut ? "animate-flip-out" : "animate-flip-in"
                  )}
                  data-char={char}
                  style={
                    {
                      animationDuration: isFlippingOut ? "0.5s" : "0.55s",
                      animationDelay: `${calculatedDelay}s`,
                      animationFillMode: "forwards",
                      transformStyle: "preserve-3d",
                    } as React.CSSProperties
                  }
                >
                  {char}
                </span>
              );
            })}
            {separator === " " && wordIndex < words.length - 1 && (
              <span className="whitespace inline-block">&nbsp;</span>
            )}
            {separator !== " " && wordIndex < words.length - 1 && (
              <span className="separator inline-block">{separator}</span>
            )}
          </span>
        );
      })}
    </div>
  );
}

export default FlipText;

