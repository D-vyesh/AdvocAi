import React, { useEffect, useRef, useState } from "react";

/**
 * Global Liquid Glass Cursor System
 * - Frame-rate-independent (delta-time) GPU-composited glass lens with smooth velocity stretch & hover scaling
 * - Ambient aurora spotlight + zero-lag precision jewel dot
 * - Expanding liquid caustic ripples on click
 * - Throttled `--mx` / `--my` surface specular lighting on hovered `.glass-reactive` elements
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
  const auraRef = useRef(null);

  useEffect(() => {
    const handleToggle = (e) => {
      setEnabled((prev) => {
        const next = typeof e.detail === "boolean" ? e.detail : !prev;
        localStorage.setItem("advocai-liquid-cursor", String(next));
        return next;
      });
    };
    window.addEventListener("advocai:toggle-cursor", handleToggle);
    return () => window.removeEventListener("advocai:toggle-cursor", handleToggle);
  }, []);

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
    let currentAngle = 0;

    const lensPos = { x: mouseX, y: mouseY };
    const auraPos = { x: mouseX, y: mouseY };
    let currentLensScale = 1;
    let currentDotScale = 1;
    let currentStretch = 0;

    let pendingReactiveCard = null;
    let pointerDirty = false;
    let lastLensOpacity = "";
    let lastDotOpacity = "";
    let lastAuraOpacity = "";

    let rafId = null;
    let lastTime = 0;

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

    const scheduleFrame = () => {
      if (rafId === null) {
        lastTime = performance.now();
        rafId = window.requestAnimationFrame(animate);
      }
    };

    const handlePointerMove = (e) => {
      if (e.pointerType && e.pointerType !== "mouse" && e.pointerType !== "pen") {
        return;
      }
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!visible) {
        lensPos.x = mouseX;
        lensPos.y = mouseY;
        auraPos.x = mouseX;
        auraPos.y = mouseY;
      }
      visible = true;
      mode = getModeFromTarget(e.target);
      pendingReactiveCard =
        e.target instanceof Element ? e.target.closest(".glass-reactive") : null;
      pointerDirty = true;

      // Update precision core dot immediately for 0-lag pointer tracking
      if (dotRef.current) {
        const hidden = mode === "iframe" || mode === "text";
        const nextOpacity = hidden ? "0" : "1";
        if (nextOpacity !== lastDotOpacity) {
          dotRef.current.style.opacity = nextOpacity;
          lastDotOpacity = nextOpacity;
        }
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%) scale(${currentDotScale.toFixed(3)})`;
      }

      scheduleFrame();
    };

    const handlePointerDown = (e) => {
      if (e.pointerType && e.pointerType !== "mouse" && e.pointerType !== "pen") {
        return;
      }
      pressed = true;
      if (mode !== "text" && mode !== "iframe") {
        spawnRipple(e.clientX, e.clientY);
      }
      scheduleFrame();
    };

    const handlePointerUp = () => {
      pressed = false;
      scheduleFrame();
    };

    const handleMouseLeave = () => {
      visible = false;
      pendingReactiveCard = null;
      scheduleFrame();
    };

    const handleMouseEnter = () => {
      visible = true;
      scheduleFrame();
    };

    const animate = (now) => {
      rafId = null;
      const dt = Math.min(Math.max((now - lastTime) / 1000, 0.001), 0.05);
      lastTime = now;

      // Update hovered .glass-reactive card once per frame instead of on every raw pointer event
      if (pointerDirty && pendingReactiveCard) {
        const rect = pendingReactiveCard.getBoundingClientRect();
        pendingReactiveCard.style.setProperty("--mx", `${mouseX - rect.left}px`);
        pendingReactiveCard.style.setProperty("--my", `${mouseY - rect.top}px`);
      }
      pointerDirty = false;

      const lensAlpha = 1 - Math.exp(-28 * dt);
      const auraAlpha = 1 - Math.exp(-10 * dt);
      const scaleAlpha = 1 - Math.exp(-22 * dt);
      const stretchAlpha = 1 - Math.exp(-18 * dt);
      const angleAlpha = 1 - Math.exp(-20 * dt);

      const dx = mouseX - lensPos.x;
      const dy = mouseY - lensPos.y;
      const dist = Math.hypot(dx, dy);

      lensPos.x += dx * lensAlpha;
      lensPos.y += dy * lensAlpha;

      const auraDx = mouseX - auraPos.x;
      const auraDy = mouseY - auraPos.y;
      auraPos.x += auraDx * auraAlpha;
      auraPos.y += auraDy * auraAlpha;

      if (dist > 1.5) {
        const targetAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
        const deltaAngle = ((targetAngle - currentAngle + 540) % 360) - 180;
        currentAngle += deltaAngle * angleAlpha;
      }

      // Smooth organic velocity stretch (liquid droplet deformation)
      const targetStretch = Math.min(dist / 120, 0.24);
      currentStretch += (targetStretch - currentStretch) * stretchAlpha;
      const scaleX = 1 + currentStretch;
      const scaleY = 1 - currentStretch * 0.42;

      const targetLensScale =
        mode === "text"
          ? 0.42
          : pressed
          ? 0.82
          : mode === "interactive"
          ? 1.42
          : 1;
      currentLensScale += (targetLensScale - currentLensScale) * scaleAlpha;

      const targetDotScale =
        mode === "text" ? 0 : pressed ? 1.45 : mode === "interactive" ? 0.72 : 1;
      currentDotScale += (targetDotScale - currentDotScale) * scaleAlpha;

      const hiddenForTarget = !visible || mode === "iframe";

      // Precision core jewel dot
      if (dotRef.current) {
        const nextDotOpacity = hiddenForTarget || mode === "text" ? "0" : "1";
        if (nextDotOpacity !== lastDotOpacity) {
          dotRef.current.style.opacity = nextDotOpacity;
          lastDotOpacity = nextDotOpacity;
        }
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%) scale(${currentDotScale.toFixed(3)})`;
      }

      // Main Liquid Glass Lens Bubble with smooth velocity stretch
      if (lensRef.current) {
        const nextLensOpacity = hiddenForTarget
          ? "0"
          : mode === "text"
          ? "0.26"
          : "1";
        if (nextLensOpacity !== lastLensOpacity) {
          lensRef.current.style.opacity = nextLensOpacity;
          lastLensOpacity = nextLensOpacity;
        }
        lensRef.current.style.transform = `translate3d(${lensPos.x.toFixed(2)}px, ${lensPos.y.toFixed(2)}px, 0) translate(-50%, -50%) rotate(${currentAngle.toFixed(1)}deg) scale(${(currentLensScale * scaleX).toFixed(3)}, ${(currentLensScale * scaleY).toFixed(3)})`;
      }

      // Wide Ambient Aurora Spotlight
      if (auraRef.current) {
        const nextAuraOpacity = hiddenForTarget ? "0" : "1";
        if (nextAuraOpacity !== lastAuraOpacity) {
          auraRef.current.style.opacity = nextAuraOpacity;
          lastAuraOpacity = nextAuraOpacity;
        }
        auraRef.current.style.transform = `translate3d(${auraPos.x.toFixed(2)}px, ${auraPos.y.toFixed(2)}px, 0) translate(-50%, -50%)`;
      }

      const settled =
        dist < 0.05 &&
        Math.hypot(mouseX - auraPos.x, mouseY - auraPos.y) < 0.1 &&
        Math.abs(targetLensScale - currentLensScale) < 0.002 &&
        Math.abs(targetDotScale - currentDotScale) < 0.002 &&
        currentStretch < 0.002;

      if (!settled) {
        rafId = window.requestAnimationFrame(animate);
      }
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    scheduleFrame();

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, [enabled, isFinePointer]);

  if (!enabled || !isFinePointer) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9998] overflow-hidden" aria-hidden="true">
      {/* Wide Ambient Soft Aurora Spotlight following pointer (pure radial gradient for GPU compositing) */}
      <div
        ref={auraRef}
        className="fixed left-0 top-0 h-[360px] w-[360px] rounded-full opacity-0 transition-opacity duration-500 will-change-transform"
        style={{
          background:
            "radial-gradient(circle, rgba(0, 224, 255, 0.15) 0%, rgba(168, 85, 247, 0.09) 36%, rgba(0, 245, 180, 0.035) 58%, transparent 74%)",
          backfaceVisibility: "hidden",
          contain: "layout style",
        }}
      />

      {/* Main Liquid Glass Lens Orb with Prismatic Rim & Specular Catchlights */}
      <div
        ref={lensRef}
        className="fixed left-0 top-0 h-12 w-12 rounded-full opacity-0 transition-[opacity] duration-200 will-change-transform"
        style={{
          background:
            "radial-gradient(circle at 30% 28%, rgba(255, 255, 255, 0.44) 0%, rgba(255, 255, 255, 0.11) 46%, rgba(0, 212, 255, 0.18) 82%, rgba(168, 85, 247, 0.16) 100%)",
          border: "1.5px solid rgba(255, 255, 255, 0.62)",
          backdropFilter: "blur(6px) saturate(190%)",
          WebkitBackdropFilter: "blur(6px) saturate(190%)",
          boxShadow:
            "inset 0 2.5px 5px rgba(255, 255, 255, 0.92), inset 0 -4px 8px rgba(0, 212, 255, 0.3), 0 12px 30px rgba(0, 0, 0, 0.34), 0 0 26px rgba(0, 212, 255, 0.32)",
          backfaceVisibility: "hidden",
          contain: "layout style",
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
          backfaceVisibility: "hidden",
          contain: "layout style",
        }}
      />
    </div>
  );
}
