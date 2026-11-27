import React, { useEffect, useRef, useState } from "react";

/**
 * Global Liquid Glass Cursor System
 * - Spring-physics SVG-refracted glass bubble with velocity stretch & prismatic rim
 * - Three trailing micro-glass droplets + ambient aurora spotlight + precision jewel dot
 * - Expanding liquid caustic ripples on click
 * - Live `--mx` / `--my` surface specular lighting on hovered `.glass-reactive` elements
 * - Yields native text cursor in inputs/editors and hides cleanly over cross-origin iframes
 */
export default function LiquidGlassCursor() {
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem("advocai-liquid-cursor");
    return saved === null ? true : saved === "true";
  });
  const [isFinePointer, setIsFinePointer] = useState(false);

  const lensRef = useRef(null);
  const dotRef = useRef(null);
  const trail1Ref = useRef(null);
  const trail2Ref = useRef(null);
  const trail3Ref = useRef(null);
  const auraRef = useRef(null);

  useEffect(() => {
    const handleToggle = (e) => {
      const next = typeof e.detail === "boolean" ? e.detail : !enabled;
      setEnabled(next);
      localStorage.setItem("advocai-liquid-cursor", String(next));
    };
    window.addEventListener("advocai:toggle-cursor", handleToggle);
    return () => window.removeEventListener("advocai:toggle-cursor", handleToggle);
  }, [enabled]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const pointerQuery = window.matchMedia("(pointer: fine)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateCapability = () => {
      setIsFinePointer(pointerQuery.matches && !motionQuery.matches);
    };
    updateCapability();

    pointerQuery.addEventListener("change", updateCapability);
    motionQuery.addEventListener("change", updateCapability);
    return () => {
      pointerQuery.removeEventListener("change", updateCapability);
      motionQuery.removeEventListener("change", updateCapability);
    };
  }, []);

  useEffect(() => {
    const active = enabled && isFinePointer;
    document.documentElement.classList.toggle("liquid-cursor-enabled", active);
    return () => {
      document.documentElement.classList.remove("liquid-cursor-enabled");
    };
  }, [enabled, isFinePointer]);

  useEffect(() => {
    if (!enabled || !isFinePointer) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let visible = false;
    let mode = "default"; // 'default' | 'interactive' | 'text' | 'iframe'
    let pressed = false;
    let lastAngle = 0;

    const lensPos = { x: mouseX, y: mouseY };
    const trail1Pos = { x: mouseX, y: mouseY };
    const trail2Pos = { x: mouseX, y: mouseY };
    const trail3Pos = { x: mouseX, y: mouseY };
    const auraPos = { x: mouseX, y: mouseY };

    let rafId = null;

    const getModeFromTarget = (target) => {
      if (!target || !(target instanceof Element)) return "default";
      if (target.tagName === "IFRAME") return "iframe";
      if (
        target.closest(
          "input, textarea, select, [contenteditable='true'], .ProseMirror"
        )
      ) {
        return "text";
      }
      if (
        target.closest(
          "button, a, [role='button'], label[for], .glass-panel-interactive, .cursor-glass-target"
        )
      ) {
        return "interactive";
      }
      return "default";
    };

    const spawnRipple = (x, y) => {
      const ripple = document.createElement("div");
      ripple.className = "liquid-click-ripple";
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      document.body.appendChild(ripple);
      window.setTimeout(() => {
        ripple.remove();
      }, 680);
    };

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      visible = true;
      mode = getModeFromTarget(e.target);

      document.documentElement.style.setProperty("--cursor-x", `${mouseX}px`);
      document.documentElement.style.setProperty("--cursor-y", `${mouseY}px`);

      if (e.target instanceof Element) {
        const reactiveCard = e.target.closest(".glass-reactive");
        if (reactiveCard) {
          const rect = reactiveCard.getBoundingClientRect();
          reactiveCard.style.setProperty("--mx", `${mouseX - rect.left}px`);
          reactiveCard.style.setProperty("--my", `${mouseY - rect.top}px`);
        }
      }
    };

    const handleMouseDown = (e) => {
      pressed = true;
      if (mode !== "text" && mode !== "iframe") {
        spawnRipple(e.clientX, e.clientY);
      }
    };

    const handleMouseUp = () => {
      pressed = false;
    };

    const handleMouseLeave = () => {
      visible = false;
    };

    const handleMouseEnter = () => {
      visible = true;
    };

    const animate = () => {
      const dx = mouseX - lensPos.x;
      const dy = mouseY - lensPos.y;
      const speed = Math.hypot(dx, dy);

      lensPos.x += dx * 0.22;
      lensPos.y += dy * 0.22;

      trail1Pos.x += (lensPos.x - trail1Pos.x) * 0.17;
      trail1Pos.y += (lensPos.y - trail1Pos.y) * 0.17;

      trail2Pos.x += (trail1Pos.x - trail2Pos.x) * 0.14;
      trail2Pos.y += (trail1Pos.y - trail2Pos.y) * 0.14;

      trail3Pos.x += (trail2Pos.x - trail3Pos.x) * 0.12;
      trail3Pos.y += (trail2Pos.y - trail3Pos.y) * 0.12;

      auraPos.x += (mouseX - auraPos.x) * 0.08;
      auraPos.y += (mouseY - auraPos.y) * 0.08;

      if (speed > 1.5) {
        lastAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
      }

      // Organic velocity stretch (liquid droplet deformation)
      const stretch = Math.min(speed / 95, 0.34);
      const scaleX = 1 + stretch;
      const scaleY = 1 - stretch * 0.42;

      const hiddenForTarget = !visible || mode === "iframe";

      // Precision core jewel dot (0-lag)
      if (dotRef.current) {
        const dotScale = mode === "text" ? 0 : pressed ? 1.5 : mode === "interactive" ? 0.72 : 1;
        dotRef.current.style.opacity = hiddenForTarget || mode === "text" ? "0" : "1";
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%) scale(${dotScale})`;
      }

      // Main Liquid Glass Lens Bubble with organic velocity stretch
      if (lensRef.current) {
        const baseScale =
          mode === "text"
            ? 0.42
            : pressed
            ? 0.8
            : mode === "interactive"
            ? 1.5
            : 1;
        const lensOpacity = hiddenForTarget ? 0 : mode === "text" ? 0.26 : 1;

        lensRef.current.style.opacity = String(lensOpacity);
        lensRef.current.style.transform = `translate3d(${lensPos.x}px, ${lensPos.y}px, 0) translate(-50%, -50%) rotate(${lastAngle.toFixed(1)}deg) scale(${(baseScale * scaleX).toFixed(3)}, ${(baseScale * scaleY).toFixed(3)})`;
      }

      // Trailing Glass Micro-Droplets
      const showTrail = !hiddenForTarget && mode !== "text";
      if (trail1Ref.current) {
        trail1Ref.current.style.opacity = showTrail ? "0.82" : "0";
        trail1Ref.current.style.transform = `translate3d(${trail1Pos.x}px, ${trail1Pos.y}px, 0) translate(-50%, -50%)`;
      }
      if (trail2Ref.current) {
        trail2Ref.current.style.opacity = showTrail ? "0.62" : "0";
        trail2Ref.current.style.transform = `translate3d(${trail2Pos.x}px, ${trail2Pos.y}px, 0) translate(-50%, -50%)`;
      }
      if (trail3Ref.current) {
        trail3Ref.current.style.opacity = showTrail ? "0.42" : "0";
        trail3Ref.current.style.transform = `translate3d(${trail3Pos.x}px, ${trail3Pos.y}px, 0) translate(-50%, -50%)`;
      }

      // Wide Ambient Aurora Spotlight
      if (auraRef.current) {
        auraRef.current.style.opacity = hiddenForTarget ? "0" : "1";
        auraRef.current.style.transform = `translate3d(${auraPos.x}px, ${auraPos.y}px, 0) translate(-50%, -50%)`;
      }

      rafId = window.requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown, { passive: true });
    window.addEventListener("mouseup", handleMouseUp, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    rafId = window.requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [enabled, isFinePointer]);

  if (!enabled || !isFinePointer) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9998] overflow-hidden" aria-hidden="true">
      {/* Smooth SVG Optical Refraction Filter */}
      <svg className="absolute h-0 w-0 opacity-0 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter
            id="liquid-glass-lens"
            x="-25%"
            y="-25%"
            width="150%"
            height="150%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.014"
              numOctaves="1"
              seed="7"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="10"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Wide Ambient Soft Aurora Spotlight following pointer */}
      <div
        ref={auraRef}
        className="fixed left-0 top-0 h-[360px] w-[360px] rounded-full opacity-0 transition-opacity duration-500 will-change-transform"
        style={{
          background:
            "radial-gradient(circle, rgba(0, 224, 255, 0.16) 0%, rgba(168, 85, 247, 0.1) 36%, rgba(0, 245, 180, 0.04) 62%, transparent 74%)",
          filter: "blur(14px)",
        }}
      />

      {/* Trailing Micro-Droplet 3 */}
      <div
        ref={trail3Ref}
        className="fixed left-0 top-0 h-2.5 w-2.5 rounded-full opacity-0 will-change-transform"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(168,85,247,0.35) 65%, transparent 100%)",
          border: "1px solid rgba(255, 255, 255, 0.5)",
          backdropFilter: "blur(5px)",
          WebkitBackdropFilter: "blur(5px)",
          boxShadow: "0 0 10px rgba(168, 85, 247, 0.35)",
        }}
      />

      {/* Trailing Micro-Droplet 2 */}
      <div
        ref={trail2Ref}
        className="fixed left-0 top-0 h-3.5 w-3.5 rounded-full opacity-0 will-change-transform"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.85), rgba(0,212,255,0.32) 65%, transparent 100%)",
          border: "1px solid rgba(255, 255, 255, 0.5)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          boxShadow: "0 0 12px rgba(0, 212, 255, 0.38), inset 0 1px 1px rgba(255,255,255,0.9)",
        }}
      />

      {/* Trailing Micro-Droplet 1 */}
      <div
        ref={trail1Ref}
        className="fixed left-0 top-0 h-5 w-5 rounded-full opacity-0 will-change-transform"
        style={{
          background:
            "radial-gradient(circle at 30% 28%, rgba(255,255,255,0.68), rgba(56,189,248,0.22) 65%, rgba(255,255,255,0.06) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.52)",
          backdropFilter: "blur(8px) saturate(200%)",
          WebkitBackdropFilter: "blur(8px) saturate(200%)",
          boxShadow: "0 4px 16px rgba(0, 212, 255, 0.3), inset 0 1.5px 2px rgba(255,255,255,0.9)",
        }}
      />

      {/* Main Fluffy Liquid Glass Lens Orb with Prismatic Rim & Refraction */}
      <div
        ref={lensRef}
        className="fixed left-0 top-0 h-12 w-12 rounded-full opacity-0 transition-[opacity] duration-200 will-change-transform"
        style={{
          background:
            "radial-gradient(circle at 30% 28%, rgba(255, 255, 255, 0.44) 0%, rgba(255, 255, 255, 0.11) 46%, rgba(0, 212, 255, 0.18) 82%, rgba(168, 85, 247, 0.16) 100%)",
          border: "1.5px solid rgba(255, 255, 255, 0.62)",
          backdropFilter: "blur(6px) saturate(225%) url(#liquid-glass-lens)",
          WebkitBackdropFilter: "blur(6px) saturate(225%) url(#liquid-glass-lens)",
          boxShadow:
            "inset 0 2.5px 5px rgba(255, 255, 255, 0.92), inset 0 -4px 8px rgba(0, 212, 255, 0.3), 0 12px 30px rgba(0, 0, 0, 0.34), 0 0 26px rgba(0, 212, 255, 0.32)",
        }}
      >
        {/* Top-left Specular Dome Catchlight */}
        <span
          className="absolute left-[18%] top-[12%] h-[28%] w-[48%] -rotate-12 rounded-full"
          style={{
            background: "radial-gradient(ellipse at center, rgba(255,255,255,0.92) 0%, transparent 78%)",
          }}
        />
        {/* Bottom-right Caustic Bounce Rim */}
        <span
          className="absolute right-[16%] bottom-[12%] h-[16%] w-[32%] -rotate-12 rounded-full"
          style={{
            background: "radial-gradient(ellipse at center, rgba(103,232,249,0.75) 0%, transparent 78%)",
          }}
        />
      </div>

      {/* Zero-Lag Crisp Center Jewel Dot */}
      <div
        ref={dotRef}
        className="fixed left-0 top-0 h-2.5 w-2.5 rounded-full opacity-0 transition-opacity duration-150 will-change-transform"
        style={{
          background: "radial-gradient(circle at 35% 35%, #ffffff 0%, #67e8f9 65%, #00d4ff 100%)",
          boxShadow: "0 0 14px rgba(0, 212, 255, 0.95), 0 0 5px rgba(255, 255, 255, 0.98)",
        }}
      />
    </div>
  );
}
