"use client";
import { useEffect, useRef } from "react";
export function NightSky() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current; const context = canvas?.getContext("2d"); if (!canvas || !context) return;
    const stars = Array.from({ length: 560 }, (_, index) => ({ x: (index * 47.13 + (index % 7) * 3.7) % 100, y: (index * 23.71 + (index % 11) * 1.9) % 100, size: index % 37 === 0 ? 2.7 : index % 9 === 0 ? 1.6 : .8, phase: (index * 19) % 100, color: ["#c0d9ec", "#eee2c0", "#88aaca", "#ced5ef", "#f4c7a1"][index % 5] }));
    const constellations = [
      { name: "Orion", points: [[19, 22], [27, 25], [23, 35], [28, 35], [33, 34], [20, 48], [36, 47]], edges: [[0, 1], [0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6], [5, 6]] },
      { name: "Cassiopeia", points: [[59, 25], [65, 19], [71, 27], [78, 18], [84, 25]], edges: [[0, 1], [1, 2], [2, 3], [3, 4]] },
      { name: "Ursa Major", points: [[69, 62], [75, 55], [82, 57], [87, 51], [91, 55], [95, 63], [88, 66]], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0], [2, 6]] }
    ];
    let frame = 0;
    const draw = (time: number) => {
      const dpr = window.devicePixelRatio || 1, width = window.innerWidth, height = window.innerHeight;
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) { canvas.width = width * dpr; canvas.height = height * dpr; canvas.style.width = `${width}px`; canvas.style.height = `${height}px`; }
      context.setTransform(dpr, 0, 0, dpr, 0, 0); context.clearRect(0, 0, width, height);
      const milkyWay = context.createLinearGradient(width * .1, height * .9, width * .9, height * .05);
      milkyWay.addColorStop(0, "rgba(110, 150, 190, 0)"); milkyWay.addColorStop(.5, "rgba(110, 150, 190, .08)"); milkyWay.addColorStop(1, "rgba(110, 150, 190, 0)");
      context.fillStyle = milkyWay; context.fillRect(0, 0, width, height);
      context.lineWidth = 1;
      for (const constellation of constellations) {
        context.strokeStyle = "rgba(142, 220, 232, .22)"; context.beginPath();
        for (const [from, to] of constellation.edges) { const a = constellation.points[from], b = constellation.points[to]; context.moveTo((a[0] / 100) * width, (a[1] / 100) * height); context.lineTo((b[0] / 100) * width, (b[1] / 100) * height); }
        context.stroke();
        for (const [x, y] of constellation.points) { context.fillStyle = "#f4ead0"; context.globalAlpha = .8; context.beginPath(); context.arc((x / 100) * width, (y / 100) * height, 1.8, 0, Math.PI * 2); context.fill(); }
      }
      for (const star of stars) {
        const shimmer = 0.28 + 0.72 * (0.5 + 0.5 * Math.sin(time * 0.0012 + star.phase));
        const x = (star.x / 100) * width, y = (star.y / 100) * height;
        context.globalAlpha = shimmer * 0.62; context.fillStyle = star.color;
        if (star.size > 2) { const glow = context.createRadialGradient(x, y, 0, x, y, 8); glow.addColorStop(0, `${star.color}cc`); glow.addColorStop(1, `${star.color}00`); context.fillStyle = glow; context.beginPath(); context.arc(x, y, 8, 0, Math.PI * 2); context.fill(); }
        context.fillStyle = star.color; context.fillRect(x, y, star.size, star.size);
        if (star.size > 2 && shimmer > .82) { context.globalAlpha = (shimmer - .8) * 2; context.fillRect(x - 4, y, 9, 1); context.fillRect(x, y - 4, 1, 9); }
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
