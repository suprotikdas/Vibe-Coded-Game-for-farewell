import React, { useMemo } from "react";
import { SkyTheme } from "../types";

interface SkyBackgroundProps {
  theme: SkyTheme;
}

export default function SkyBackground({ theme }: SkyBackgroundProps) {
  // Memoize random star generation to prevent flickering stars on state updates
  const stars = useMemo(() => {
    const starList = [];
    const seed = theme.id === "midnight" ? 95 : theme.id === "aurora" ? 75 : theme.id === "twilight" ? 50 : 25;
    for (let i = 0; i < seed; i++) {
      const top = Math.random() * 70; // Keep in upper 70% of screen
      const left = Math.random() * 100;
      const size = 1 + Math.random() * 2.5;
      const opacity = 0.3 + Math.random() * 0.7;
      const animationIndex = 1 + Math.floor(Math.random() * 3); // 1, 2, or 3
      starList.push({ id: i, top, left, size, opacity, animationIndex });
    }
    return starList;
  }, [theme.id]);

  return (
    <div className={`absolute inset-0 transition-all duration-1000 overflow-hidden ${theme.backgroundClass}`}>
      {/* Aurora Layer for Aurora Borealis theme */}
      {theme.id === "aurora" && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
          {/* Neon green aurora ribbons */}
          <div className="absolute -top-[20%] -left-[10%] w-[120%] h-[60%] bg-gradient-to-tr from-emerald-500/20 via-teal-400/15 to-transparent blur-3xl transform rotate-2 animate-pulse duration-[8000ms]" />
          <div className="absolute -top-[10%] -right-[15%] w-[100%] h-[70%] bg-gradient-to-bl from-teal-500/25 via-indigo-600/10 to-transparent blur-3xl transform -rotate-3 animate-pulse duration-[12000ms]" />
        </div>
      )}

      {/* Starfield */}
      {theme.starCount > 0 && (
        <div className="absolute inset-0 pointer-events-none opacity-80 mix-blend-screen">
          {stars.map((star) => (
            <div
              key={star.id}
              className={`absolute rounded-full bg-white animate-star-twinkle-${star.animationIndex}`}
              style={{
                top: `${star.top}%`,
                left: `${star.left}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                opacity: star.opacity,
              }}
            />
          ))}
        </div>
      )}

      {/* Shooting Stars */}
      {theme.starCount > 30 && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[10%] right-[15%] w-[2px] h-[80px] bg-gradient-to-b from-white to-transparent transform rotate-[35deg] animate-shooting-star-1 opacity-0" />
          <div className="absolute top-[25%] right-[40%] w-[1.5px] h-[60px] bg-gradient-to-b from-white/80 to-transparent transform rotate-[35deg] animate-shooting-star-2 opacity-0" />
          <div className="absolute top-[5%] right-[60%] w-[2px] h-[100px] bg-gradient-to-b from-teal-200 to-transparent transform rotate-[35deg] animate-shooting-star-3 opacity-0" />
        </div>
      )}

      {/* Sun or Moon depending on context */}
      <div className="absolute top-[12%] left-[10%] md:left-[15%] pointer-events-none animate-ambient-drift select-none">
        {theme.id === "midnight" && (
          <div className="relative">
            {/* Glowing Golden Crescent Moon */}
            <div className="w-16 h-16 rounded-full bg-yellow-100 shadow-[0_0_40px_rgba(253,224,71,0.4)] transition-all duration-1000" />
            <div className="absolute top-0 -left-3 w-16 h-16 rounded-full bg-slate-900 duration-1000" style={{ backgroundColor: "transparent", mixBlendMode: "destination-out" }} />
            {/* Real overlay subtraction fallback for modern CSS */}
            <div className="absolute -top-[4px] -left-4 w-[68px] h-[68px] rounded-full bg-[#0b0f19] transition-all duration-1000" />
          </div>
        )}

        {theme.id === "aurora" && (
          <div className="relative">
            {/* Bright polar North Star */}
            <div className="relative flex items-center justify-center">
              <div className="absolute w-8 h-8 bg-teal-200 rounded-full blur-md opacity-70" />
              <div className="w-4 h-4 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,1)]" />
              <div className="absolute w-[1px] h-12 bg-white/70" />
              <div className="absolute w-12 h-[1px] bg-white/70" />
            </div>
          </div>
        )}

        {theme.id === "twilight" && (
          <div className="relative">
            {/* A soft glowing Venus morning star */}
            <div className="w-5 h-5 bg-pink-100 rounded-full shadow-[0_0_30px_rgba(219,39,119,0.8)]" />
            <div className="absolute -top-1 -left-1 w-7 h-7 bg-pink-300 rounded-full blur-sm opacity-50 animate-ping duration-[3000ms]" />
          </div>
        )}

        {theme.id === "dusk" && (
          <div className="relative flex items-center justify-center">
            {/* Heavy orange evening sun sinking into the skyline */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-t from-orange-600 via-amber-400 to-yellow-200 shadow-[0_0_60px_rgba(249,115,22,0.5)]" />
          </div>
        )}
      </div>

      {/* Floating Stylized Clouds */}
      <div className="absolute inset-x-0 top-[8%] pointer-events-none overflow-hidden h-[40%]">
        {/* Cloud Layer 1: Fast (Foreground) */}
        <div className="absolute top-[5%] left-0 w-[180px] h-[55px] opacity-[0.25] text-white animate-cloud-fast">
          <svg viewBox="0 0 100 40" fill="currentColor" className="w-full h-full text-slate-100">
            <path d="M15 30a10 10 0 0110-10 12 12 0 0122-4 10 10 0 0118 2 12 12 0 0115 12c0 5-4 9-9 9H15z" />
          </svg>
        </div>
        <div className="absolute top-[40%] left-[30vw] w-[210px] h-[65px] opacity-[0.25] text-white animate-cloud-fast" style={{ animationDelay: "-12s" }}>
          <svg viewBox="0 0 100 40" fill="currentColor" className="w-full h-full text-slate-100">
            <path d="M15 30a10 10 0 0110-10 12 12 0 0122-4 10 10 0 0118 2 12 12 0 0115 12c0 5-4 9-9 9H15z" />
          </svg>
        </div>

        {/* Cloud Layer 2: Medium */}
        <div className="absolute top-[20%] left-0 w-[280px] h-[80px] opacity-[0.18] text-white animate-cloud-medium" style={{ animationDelay: "-5s" }}>
          <svg viewBox="0 0 100 40" fill="currentColor" className="w-full h-full text-slate-200">
            <path d="M15 30a10 10 0 0110-10 12 12 0 0122-4 10 10 0 0118 2 12 12 0 0115 12c0 5-4 9-9 9H15z" />
          </svg>
        </div>
        <div className="absolute top-[60%] left-0 w-[240px] h-[70px] opacity-[0.15] text-white animate-cloud-medium" style={{ animationDelay: "-28s" }}>
          <svg viewBox="0 0 100 40" fill="currentColor" className="w-full h-full text-slate-200">
            <path d="M15 30a10 10 0 0110-10 12 12 0 0122-4 10 10 0 0118 2 12 12 0 0115 12c0 5-4 9-9 9H15z" />
          </svg>
        </div>

        {/* Cloud Layer 3: Slow (Deep Background) */}
        <div className="absolute top-[10%] left-0 w-[350px] h-[100px] opacity-[0.1] text-white animate-cloud-slow" style={{ animationDelay: "-15s" }}>
          <svg viewBox="0 0 100 40" fill="currentColor" className="w-full h-full text-slate-350">
            <path d="M15 30a10 10 0 0110-10 12 12 0 0122-4 10 10 0 0118 2 12 12 0 0115 12c0 5-4 9-9 9H15z" />
          </svg>
        </div>
        <div className="absolute top-[35%] left-0 w-[420px] h-[120px] opacity-[0.08] text-white animate-cloud-slow" style={{ animationDelay: "-42s" }}>
          <svg viewBox="0 0 100 40" fill="currentColor" className="w-full h-full text-slate-350">
            <path d="M15 30a10 10 0 0110-10 12 12 0 0122-4 10 10 0 0118 2 12 12 0 0115 12c0 5-4 9-9 9H15z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
