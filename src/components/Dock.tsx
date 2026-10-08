"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
  AnimatePresence,
} from "motion/react";
import {
  Home,
  Notebook,
  Mail,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";

const TRACKS = [
  "/music/music1.mp3",
  "/music/music2.mp3",
  "/music/music3.mp3",
];

function generateShuffledPlaylist(lastTrack: string | null): string[] {
  const copy = [...TRACKS];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  if (lastTrack && copy[0] === lastTrack && copy.length > 1) {
    const swapIdx = Math.floor(Math.random() * (copy.length - 1)) + 1;
    [copy[0], copy[swapIdx]] = [copy[swapIdx], copy[0]];
  }
  return copy;
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.25a1.62 1.62 0 0 0-1.63 1.63 1.63 1.63 0 0 0 1.63 1.62 1.63 1.63 0 0 0 1.63-1.62A1.62 1.62 0 0 0 7.83 6.25z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function DevIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 448 512" fill="currentColor">
      <path d="M120.12 208.29c-3.88-2.9-7.77-4.35-11.65-4.35H91.03v104.47h17.45c3.88 0 7.77-1.45 11.65-4.35 3.88-2.9 5.82-7.25 5.82-13.06v-69.65c-.01-5.8-1.96-10.16-5.83-13.06zM404.1 32H43.9C19.7 32 .06 51.59 0 75.8v360.4C.06 460.41 19.7 480 43.9 480h360.2c24.21 0 43.84-19.59 43.9-43.8V75.8c-.06-24.21-19.7-43.8-43.9-43.8zM154.2 291.19c0 18.81-11.61 47.31-48.36 47.25h-46.4V172.98h47.38c35.44 0 47.38 28.49 47.38 47.25v70.96zm100.68-88.66H201.6v38.42h32.57v29.57H201.6v38.41h53.29v29.57h-85.86V173.11h85.86v29.42zm131.11 29.54c0 38.65-27.42 105.79-88.88 105.79h-4.66l-26.65-164.75h33.68l17.72 109.84 17.73-109.84h33.72l-26.66 164.75h4.66c43.64 0 39.34-67.14 39.34-105.79h.02z" />
    </svg>
  );
}

interface DockItemProps {
  mouseX: MotionValue<number>;
  label: string;
  href?: string;
  onClick?: () => void;
  onHover?: () => void;
  isMusicButton?: boolean;
  children: React.ReactNode;
}

function DockItem({
  mouseX,
  label,
  href,
  onClick,
  onHover,
  isMusicButton,
  children,
}: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return Infinity;
    return val - (bounds.left + bounds.width / 2);
  });

  const sizeSync = useTransform(distance, [-140, 0, 140], [40, 58, 40]);
  const size = useSpring(sizeSync, {
    mass: 0.1,
    stiffness: 160,
    damping: 14,
  });

  const iconSizeSync = useTransform(distance, [-140, 0, 140], [18, 26, 18]);
  const iconSize = useSpring(iconSizeSync, {
    mass: 0.1,
    stiffness: 160,
    damping: 14,
  });

  const content = (
    <motion.div
      ref={ref}
      style={{ width: size, height: size }}
      onMouseEnter={() => {
        setIsHovered(true);
        onHover?.();
      }}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex items-center justify-center rounded-full bg-gradient-to-b from-[#2a2b2f] via-[#222326] to-[#1c1c1f] hover:from-[#323338] hover:via-[#28292d] hover:to-[#212124] active:from-[#1d1d20] active:to-[#171719] border border-white/[0.09] hover:border-white/[0.16] text-[#9fa0a5] hover:text-[#f4f4f6] transition-colors duration-150 shrink-0 cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.65),0_1.5px_3px_rgba(0,0,0,0.5),inset_0_1px_0.5px_rgba(255,255,255,0.18)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.75),0_2px_4px_rgba(0,0,0,0.6),inset_0_1px_0.5px_rgba(255,255,255,0.25)] select-none"
    >
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 6, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 4, x: "-50%" }}
            transition={{ duration: 0.15 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-md text-[11px] font-medium tracking-wide bg-[#1c1c1f]/95 text-zinc-100 border border-white/10 shadow-[0_4px_14px_rgba(0,0,0,0.7)] pointer-events-none whitespace-nowrap backdrop-blur-md z-30"
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        style={{ width: iconSize, height: iconSize }}
        className="flex items-center justify-center shrink-0 pointer-events-none"
      >
        {children}
      </motion.div>
    </motion.div>
  );

  if (href) {
    const isExternal = href.startsWith("http") || href.startsWith("mailto");
    return (
      <a
        href={href}
        target={isExternal && !href.startsWith("mailto") ? "_blank" : undefined}
        rel={isExternal && !href.startsWith("mailto") ? "noopener noreferrer" : undefined}
        aria-label={label}
        className="shrink-0 focus:outline-none"
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      data-music-btn={isMusicButton ? "true" : undefined}
      className="shrink-0 focus:outline-none"
    >
      {content}
    </button>
  );
}

export default function Dock() {
  const mouseX = useMotionValue(Infinity);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dockAudioRef = useRef<HTMLAudioElement | null>(null);
  const menuAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const dockBufferRef = useRef<AudioBuffer | null>(null);
  const menuBufferRef = useRef<AudioBuffer | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const [volumeLevel, setVolumeLevel] = useState<0 | 1 | 2>(0);
  const [playlist, setPlaylist] = useState<string[]>(() =>
    generateShuffledPlaylist(null)
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  const volumeLevelRef = useRef<0 | 1 | 2>(0);
  const playlistRef = useRef(playlist);
  const currentIndexRef = useRef(0);

  useEffect(() => {
    playlistRef.current = playlist;
  }, [playlist]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    volumeLevelRef.current = volumeLevel;
  }, [volumeLevel]);

  useEffect(() => {
    let isMounted = true;
    const initAudio = async () => {
      try {
        const AudioCtx = window.AudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;
        const gain = ctx.createGain();
        gain.connect(ctx.destination);
        gainNodeRef.current = gain;

        const [resDock, resMenu] = await Promise.all([
          fetch("/music/click2.mp3"),
          fetch("/music/click.mp3"),
        ]);
        const [dockArr, menuArr] = await Promise.all([
          resDock.arrayBuffer(),
          resMenu.arrayBuffer(),
        ]);
        const [dockBuf, menuBuf] = await Promise.all([
          ctx.decodeAudioData(dockArr),
          ctx.decodeAudioData(menuArr),
        ]);
        if (isMounted) {
          dockBufferRef.current = dockBuf;
          menuBufferRef.current = menuBuf;
        }
      } catch {}
    };
    initAudio();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio && playlistRef.current[0]) {
      audio.volume = 0.5;
      audio.src = playlistRef.current[0];
    }
  }, []);

  const playDockSound = useCallback((overrideLevel?: number) => {
    const level = overrideLevel ?? volumeLevelRef.current;
    if (level === 0) return;

    const ctx = audioCtxRef.current;
    const buffer = dockBufferRef.current;
    const gainNode = gainNodeRef.current;

    if (ctx && buffer && gainNode) {
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
      gainNode.gain.value = level === 2 ? 1 : 0.5;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(gainNode);
      source.start(0);
      return;
    }

    const baseAudio = dockAudioRef.current;
    if (!baseAudio) return;

    try {
      const sound = baseAudio.cloneNode() as HTMLAudioElement;
      sound.volume = level === 2 ? 1 : 0.5;
      sound.play().catch(() => {});
    } catch {
      baseAudio.currentTime = 0;
      baseAudio.volume = level === 2 ? 1 : 0.5;
      baseAudio.play().catch(() => {});
    }
  }, []);

  const playMenuSound = useCallback((overrideLevel?: number) => {
    const level = overrideLevel ?? volumeLevelRef.current;
    if (level === 0) return;

    const ctx = audioCtxRef.current;
    const buffer = menuBufferRef.current;
    const gainNode = gainNodeRef.current;

    if (ctx && buffer && gainNode) {
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
      gainNode.gain.value = level === 2 ? 1 : 0.5;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(gainNode);
      source.start(0);
      return;
    }

    const baseAudio = menuAudioRef.current;
    if (!baseAudio) return;

    try {
      const sound = baseAudio.cloneNode() as HTMLAudioElement;
      sound.volume = level === 2 ? 1 : 0.5;
      sound.play().catch(() => {});
    } catch {
      baseAudio.currentTime = 0;
      baseAudio.volume = level === 2 ? 1 : 0.5;
      baseAudio.play().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (volumeLevelRef.current === 0) return;
      const target = (e.target as HTMLElement | null)?.closest(
        "button, a, [role='button'], .cursor-pointer"
      );
      if (target) {
        if (target.getAttribute("data-music-btn") === "true") return;
        if (target.closest("nav")) {
          playDockSound();
        } else {
          playMenuSound();
        }
      }
    };

    window.addEventListener("click", handleGlobalClick, { capture: true });
    return () => {
      window.removeEventListener("click", handleGlobalClick, { capture: true });
    };
  }, [playDockSound, playMenuSound]);

  const handleEnded = useCallback(() => {
    if (volumeLevelRef.current === 0) return;

    let nextIdx = currentIndexRef.current + 1;
    let tracks = playlistRef.current;

    if (nextIdx >= tracks.length) {
      const lastTrack = tracks[tracks.length - 1];
      tracks = generateShuffledPlaylist(lastTrack);
      playlistRef.current = tracks;
      setPlaylist(tracks);
      nextIdx = 0;
    }

    currentIndexRef.current = nextIdx;
    setCurrentIndex(nextIdx);

    const audio = audioRef.current;
    if (audio && tracks[nextIdx]) {
      audio.src = tracks[nextIdx];
      audio.volume = volumeLevelRef.current === 2 ? 1 : 0.5;
      audio.play().catch(() => {});
    }
  }, []);

  const toggleAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (volumeLevel === 0) {
      if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume().catch(() => {});
      }
      playDockSound(1);
      if (!audio.src && playlistRef.current.length > 0) {
        audio.src = playlistRef.current[currentIndexRef.current];
      }
      audio.volume = 0.5;
      setVolumeLevel(1);
      volumeLevelRef.current = 1;
      audio.play().catch(() => {
        setVolumeLevel(0);
        volumeLevelRef.current = 0;
      });
    } else if (volumeLevel === 1) {
      playDockSound(2);
      audio.volume = 1;
      setVolumeLevel(2);
      volumeLevelRef.current = 2;
    } else {
      playDockSound(1);
      audio.pause();
      setVolumeLevel(0);
      volumeLevelRef.current = 0;
    }
  }, [volumeLevel, playDockSound]);

  return (
    <>
      <audio
        ref={audioRef}
        onEnded={handleEnded}
        preload="auto"
        className="hidden"
      />
      <audio
        ref={dockAudioRef}
        src="/music/click2.mp3"
        preload="auto"
        className="hidden"
      />
      <audio
        ref={menuAudioRef}
        src="/music/click.mp3"
        preload="auto"
        className="hidden"
      />

      <nav
        aria-label="Navigation Dock"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center max-w-[calc(100vw-1.5rem)]"
      >
        <motion.div
          onMouseMove={(e) => mouseX.set(e.clientX)}
          onMouseLeave={() => mouseX.set(Infinity)}
          className="flex items-center h-[56px] gap-1 px-2.5 rounded-full bg-[#111113]/90 border border-white/[0.07] backdrop-blur-2xl shadow-[0_14px_45px_rgba(0,0,0,0.75),inset_0_1px_1px_rgba(255,255,255,0.06)] overflow-visible"
        >
          <DockItem mouseX={mouseX} label="Home" href="/" onHover={playDockSound}>
            <Home className="w-full h-full stroke-[1.8]" />
          </DockItem>
          <DockItem mouseX={mouseX} label="Notebook" href="#notes" onHover={playDockSound}>
            <Notebook className="w-full h-full stroke-[1.8]" />
          </DockItem>

          <div className="h-5 w-[1px] bg-white/[0.08] shadow-[1px_0_0_rgba(0,0,0,0.5)] mx-1 self-center shrink-0" />

          <DockItem mouseX={mouseX} label="GitHub" href="https://github.com/greenbugx" onHover={playDockSound}>
            <GithubIcon className="w-full h-full" />
          </DockItem>
          <DockItem mouseX={mouseX} label="LinkedIn" href="https://linkedin.com/in/jesus-chetia" onHover={playDockSound}>
            <LinkedinIcon className="w-full h-full" />
          </DockItem>
          <DockItem mouseX={mouseX} label="X" href="https://x.com/greenbugx" onHover={playDockSound}>
            <XIcon className="w-full h-full" />
          </DockItem>
          <DockItem mouseX={mouseX} label="DEV" href="https://dev.to/0xna" onHover={playDockSound}>
            <DevIcon className="w-full h-full" />
          </DockItem>
          <DockItem mouseX={mouseX} label="Contact" href="mailto:greenbugx@proton.me" onHover={playDockSound}>
            <Mail className="w-full h-full stroke-[1.8]" />
          </DockItem>

          <div className="h-5 w-[1px] bg-white/[0.08] shadow-[1px_0_0_rgba(0,0,0,0.5)] mx-1 self-center shrink-0" />

          <DockItem
            mouseX={mouseX}
            label={
              volumeLevel === 1
                ? "Volume 50%"
                : volumeLevel === 2
                ? "Volume 100%"
                : "Play Music"
            }
            onClick={toggleAudio}
            onHover={playDockSound}
            isMusicButton
          >
            {volumeLevel === 1 ? (
              <Volume1 className="w-full h-full stroke-[1.8]" />
            ) : volumeLevel === 2 ? (
              <Volume2 className="w-full h-full stroke-[1.8]" />
            ) : (
              <VolumeX className="w-full h-full stroke-[1.8]" />
            )}
          </DockItem>
        </motion.div>
      </nav>
    </>
  );
}
