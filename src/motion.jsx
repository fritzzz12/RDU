import React, { useLayoutEffect, useRef } from "react";

export function ViewMotion({ motionKey, children }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const node = ref.current;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!node?.animate || preference.matches) return;
    const style = getComputedStyle(node);
    const timing = style.getPropertyValue("--motion-view").trim();
    const duration = parseFloat(timing) * (timing.endsWith("ms") ? 1 : 1000);
    if (!Number.isFinite(duration) || duration <= 0) return;
    const animation = node.animate(
      [
        { opacity: style.getPropertyValue("--motion-reveal-opacity").trim() },
        { opacity: 1 },
      ],
      {
        id: "rdms-view-reveal",
        duration,
        easing: style.getPropertyValue("--motion-ease-in-out").trim(),
      },
    );
    function preferenceChanged(event) {
      if (event.matches) animation.cancel();
    }
    preference.addEventListener("change", preferenceChanged);
    return () => {
      animation.cancel();
      preference.removeEventListener("change", preferenceChanged);
    };
  }, [motionKey]);
  return (
    <div className="motion-view" ref={ref}>
      {children}
    </div>
  );
}
