"use client";
import { useEffect, useRef } from "react";
export function NightSky() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current; const context = canvas?.getContext("2d"); if (!canvas || !context) return;
    const stars = Array.from({ length: 180 }, (_, index) => ({ x: (index * 47.13) % 100, y: (index * 23.71) % 100, size: index % 17 === 0 ? 2 : 1, phase: (index * 19) % 100, color: ["#c0d9ec", "#eee2c0", "#88aaca", "#ced5ef"][index % 4] }));
    let frame = 0;
    const draw = (time: number) => {
      const dpr = window.devicePixelRatio || 1, width = window.innerWidth, height = window.innerHeight;
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) { canvas.width = width * dpr; canvas.height = height * dpr; canvas.style.width = `${width}px`; canvas.style.height = `${height}px`; }
      context.setTransform(dpr, 0, 0, dpr, 0, 0); context.clearRect(0, 0, width, height);
      for (const star of stars) { context.globalAlpha = (0.28 + 0.72 * (0.5 + 0.5 * Math.sin(time * 0.0012 + star.phase))) * 0.58; context.fillStyle = star.color; context.fillRect((star.x / 100) * width, (star.y / 100) * height, star.size, star.size); }
      context.globalAlpha = 1; frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw); return () => cancelAnimationFrame(frame);
  }, []);
  return <canvas className="night-sky" ref={canvasRef} aria-hidden="true" />;
}
