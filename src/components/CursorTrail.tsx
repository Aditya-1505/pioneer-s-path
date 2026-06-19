import { useEffect, useState } from "react";

// Elegant nature-themed glowing ring cursor trail. Disabled on touch devices.
export function CursorTrail() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    if (isTouch) return;
    setEnabled(true);

    const move = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    const down = () => setActive(true);
    const up = () => setActive(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
    };
  }, []);

  if (!enabled) return null;
  return (
    <div
      aria-hidden
      className="cursor-ring hidden md:block"
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%) scale(${active ? 0.7 : 1})`,
      }}
    />
  );
}
