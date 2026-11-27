import React from "react";

/**
 * Lush Living Aurora & Pillowy Floating Glass Orbs Backdrop
 * Gives frosted glass panels rich ambient light and vibrant colors to refract.
 */
export default function AmbientGlassBackdrop() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Deep Celestial Studio Gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 65% at 50% -12%, rgba(0, 212, 255, 0.22), transparent 68%), radial-gradient(ellipse 70% 55% at 94% 28%, rgba(168, 85, 247, 0.18), transparent 62%), radial-gradient(ellipse 75% 58% at 8% 85%, rgba(14, 165, 233, 0.18), transparent 66%), #060914",
        }}
      />

      {/* Fluffy Breathing Aurora Clouds */}
      <div
        className="absolute -top-36 left-[6%] h-[560px] w-[560px] rounded-full opacity-65 blur-[125px] animate-orb-1"
        style={{
          background: "radial-gradient(circle, rgba(0, 224, 255, 0.48) 0%, rgba(56, 189, 248, 0.16) 55%, transparent 75%)",
        }}
      />
      <div
        className="absolute top-[18%] -right-28 h-[600px] w-[600px] rounded-full opacity-60 blur-[130px] animate-orb-2"
        style={{
          background: "radial-gradient(circle, rgba(168, 85, 247, 0.42) 0%, rgba(99, 102, 241, 0.18) 55%, transparent 75%)",
        }}
      />
      <div
        className="absolute -bottom-32 left-[26%] h-[520px] w-[560px] rounded-full opacity-55 blur-[125px] animate-orb-3"
        style={{
          background: "radial-gradient(circle, rgba(0, 245, 180, 0.34) 0%, rgba(14, 165, 233, 0.16) 55%, transparent 75%)",
        }}
      />
      <div
        className="absolute top-[52%] left-[4%] h-[380px] w-[380px] rounded-full opacity-35 blur-[115px] animate-orb-2"
        style={{
          background: "radial-gradient(circle, rgba(245, 158, 11, 0.32) 0%, transparent 72%)",
        }}
      />

      {/* Soft Floating 3D Translucent Glass Bubbles (tactile depth behind UI) */}
      <div
        className="hidden lg:block absolute top-28 right-[8%] h-28 w-28 rounded-full animate-bubble-breathe opacity-65"
        style={{
          background:
            "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.44), rgba(0,212,255,0.14) 55%, rgba(255,255,255,0.03) 100%)",
          border: "1.25px solid rgba(255,255,255,0.36)",
          boxShadow:
            "inset 0 3px 5px rgba(255,255,255,0.82), inset 0 -5px 12px rgba(0,0,0,0.32), 0 20px 44px rgba(0,0,0,0.35)",
          backdropFilter: "blur(10px)",
        }}
      />
      <div
        className="hidden lg:block absolute bottom-24 left-[6%] h-20 w-20 rounded-full animate-bubble-breathe opacity-55"
        style={{
          animationDelay: "-2.2s",
          background:
            "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.4), rgba(168,85,247,0.18) 55%, rgba(255,255,255,0.03) 100%)",
          border: "1.25px solid rgba(255,255,255,0.3)",
          boxShadow:
            "inset 0 2.5px 4px rgba(255,255,255,0.75), inset 0 -4px 10px rgba(0,0,0,0.28), 0 16px 36px rgba(0,0,0,0.35)",
          backdropFilter: "blur(10px)",
        }}
      />
      <div
        className="hidden xl:block absolute top-[58%] right-[14%] h-14 w-14 rounded-full animate-bubble-breathe opacity-50"
        style={{
          animationDelay: "-3.6s",
          background:
            "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.38), rgba(0,245,180,0.16) 55%, rgba(255,255,255,0.02) 100%)",
          border: "1px solid rgba(255,255,255,0.28)",
          boxShadow:
            "inset 0 2px 3px rgba(255,255,255,0.72), inset 0 -3px 8px rgba(0,0,0,0.25), 0 14px 30px rgba(0,0,0,0.3)",
          backdropFilter: "blur(8px)",
        }}
      />

      {/* Subtle Crisp Optical Dot Grid */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255, 255, 255, 0.6) 1px, transparent 1px)",
          backgroundSize: "34px 34px",
        }}
      />

      {/* Soft Vignette Framing */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, transparent 56%, rgba(4, 7, 16, 0.62) 100%)",
        }}
      />
    </div>
  );
}
