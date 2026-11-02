"use client";
import { useEffect, useRef } from "react";
export function NightSky() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current; const context = canvas?.getContext("2d"); if (!canvas || !context) return;
    const stars = Array.from({ length: 420 }, (_, index) => ({ x: (index * 47.13) % 100, y: (index * 23.71) % 100, size: index % 19 === 0 ? 2 : 1, phase: (index * 19) % 100, color: ["#c0d9ec", "#eee2c0", "#88aaca", "#ced5ef"][index % 4] }));
    const constellations = [
      [[10, 26], [16, 19], [24, 22], [31, 15], [38, 21]],
      [[62, 23], [68, 18], [74, 24], [81, 16], [88, 22]],
      [[72, 62], [78, 55], [85, 59], [91, 51], [95, 56]]
    ];
    let frame = 0;
    const draw = (time: number) => {
      const dpr = window.devicePixelRatio || 1, width = window.innerWidth, height = window.innerHeight;
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) { canvas.width = width * dpr; canvas.height = height * dpr; canvas.style.width = `${width}px`; canvas.style.height = `${height}px`; }
      context.setTransform(dpr, 0, 0, dpr, 0, 0); context.clearRect(0, 0, width, height);
      context.lineWidth = 1;
      for (const constellation of constellations) {
        context.strokeStyle = "rgba(142, 220, 232, .16)";
        context.beginPath();
        constellation.forEach(([x, y], index) => index ? context.lineTo((x / 100) * width, (y / 100) * height) : context.moveTo((x / 100) * width, (y / 100) * height));
        context.stroke();
      }
      for (const star of stars) {
        const shimmer = 0.28 + 0.72 * (0.5 + 0.5 * Math.sin(time * 0.0012 + star.phase));
        const x = (star.x / 100) * width, y = (star.y / 100) * height;
        context.globalAlpha = shimmer * 0.62; context.fillStyle = star.color; context.fillRect(x, y, star.size, star.size);
        if (star.size === 2 && shimmer > .82) { context.globalAlpha = (shimmer - .8) * 2; context.fillRect(x - 3, y, 7, 1); context.fillRect(x, y - 3, 1, 7); }
      }
      const meteor = (time * 0.000018) % 1;
      context.globalAlpha = Math.sin(meteor * Math.PI) * .65;
      context.strokeStyle = "#b2e4ff"; context.lineWidth = 1.5;
      context.beginPath(); context.moveTo(width * (.1 + meteor * .55), height * (.16 + meteor * .22)); context.lineTo(width * (.06 + meteor * .55), height * (.12 + meteor * .22)); context.stroke();
      context.globalAlpha = 1; frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw); return () => cancelAnimationFrame(frame);
  }, []);
  return <canvas className="night-sky" ref={canvasRef} aria-hidden="true" />;
}
