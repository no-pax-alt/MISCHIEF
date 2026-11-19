import { useEffect } from "react";

export function BlobCursor() {
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const blob = document.querySelector<HTMLElement>(".cursor-blob");
    if (!blob) return;
    let targetX = -120;
    let targetY = -120;
    let currentX = targetX;
    let currentY = targetY;
    let frame = 0;
    const move = (event: MouseEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
    };
    const hover = (event: MouseEvent) => {
      const interactive = (event.target as HTMLElement).closest("button, a, input, select, textarea");
      blob.classList.toggle("is-near", Boolean(interactive));
    };
    const animate = () => {
      currentX += (targetX - currentX) * 0.13;
      currentY += (targetY - currentY) * 0.13;
      blob.style.transform = `translate3d(${currentX - 100}px, ${currentY - 100}px, 0)`;
      frame = requestAnimationFrame(animate);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mousemove", hover);
    frame = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousemove", hover);
    };
  }, []);
  return <div className="cursor-blob" aria-hidden="true" />;
}
