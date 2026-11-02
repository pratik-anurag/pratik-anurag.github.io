"use client";

import { useEffect, useRef, useState } from "react";
import catalog from "@/lib/sky-catalog.json";

// Equatorial catalog coordinates; a composed winter-sky view, not a live local sky.
export function NightSky() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lines, setLines] = useState(true);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0, last = 0;
    const draw = (time: number) => {
      if (!motion.matches) frame = requestAnimationFrame(draw);
      if (time - last < 40 && time !== 0) return;
      last = time;
      const w = innerWidth, h = innerHeight, dpr = Math.min(devicePixelRatio || 1, 2);
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr; canvas.height = h * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const scale = Math.max(w / 2.7, h / 1.8);
      const rad = Math.PI / 180;
      const project = (ra: number, dec: number) => {
        const lon = (ra - 85) * rad, lat = dec * rad, center = 22 * rad;
        const depth = Math.sin(center) * Math.sin(lat) + Math.cos(center) * Math.cos(lat) * Math.cos(lon);
        const k = 2 / (1 + depth);
        return [w * .64 - scale * k * Math.cos(lat) * Math.sin(lon),
          h * .38 - scale * k * (Math.cos(center) * Math.sin(lat) - Math.sin(center) * Math.cos(lat) * Math.cos(lon)), depth];
      };
      if (lines) {
        ctx.strokeStyle = "rgba(159,193,218,.22)"; ctx.lineWidth = .65;
        for (const group of catalog.constellations) for (const line of group.lines) {
          ctx.beginPath();
          let connected = false;
          for (const [ra, dec] of line) {
            const [x,y,z] = project(ra,dec);
            if (z < .2) { connected = false; continue; }
            if (connected) ctx.lineTo(x,y); else ctx.moveTo(x,y);
            connected = true;
          }
          ctx.stroke();
        }
      }
      for (const [ra, dec, mag, bv] of catalog.stars) {
        const [x,y,z] = project(ra,dec);
        if (z < .2 || x < -10 || x > w+10 || y < -10 || y > h+10) continue;
        const size = Math.max(.35, 1.75 - mag * .23);
        const alpha = Math.max(.14, Math.min(1, 1.1 - mag * .16));
        const twinkle = motion.matches ? 1 : .9 + .1 * Math.sin(time * .0017 + ra * 4) * Math.sin(time * .0007 + dec);
        const color = bv > 1 ? "255,210,163" : bv < .2 ? "185,213,255" : "239,237,223";
        if (mag < 2) {
          const glow = ctx.createRadialGradient(x,y,0,x,y,9-size);
          glow.addColorStop(0, "rgba(" + color + ",.26)"); glow.addColorStop(1,"rgba(" + color + ",0)");
          ctx.fillStyle = glow; ctx.fillRect(x-10,y-10,20,20);
        }
        ctx.fillStyle = "rgba(" + color + "," + alpha * twinkle + ")";
        ctx.beginPath(); ctx.arc(x,y,size,0,Math.PI*2); ctx.fill();
      }
      // Three deterministic city layers, cached by the browser's canvas backing store.
      for (let layer = 0; layer < 3; layer++) {
        const base = h - layer * 14;
        const bw = 32 + layer * 15;
        ctx.fillStyle = ["#142333","#0b1725","#060f1b"][layer];
        for (let i=0; i < w/bw+1; i++) {
          const height = 35 + ((i * 73 + layer * 41) % 115) + layer * 18;
          const x = i * bw, y = base-height;
          ctx.fillRect(x,y,bw-2,height+50);
          if (i%5===0) ctx.fillRect(x+bw*.48,y-22,2,22);
          for (let row=0; row<height/11-1; row++) for (let col=0; col<bw/9-1; col++) {
            if ((i*17+row*7+col*13+layer)%9>2) continue;
            ctx.fillStyle = (row+col)%4===0 ? "rgba(112,178,194,.25)" : "rgba(239,187,112,.32)";
            ctx.fillRect(x+5+col*9,y+9+row*11,2,3);
          }
          ctx.fillStyle = ["#142333","#0b1725","#060f1b"][layer];
        }
      }
    };
    const restart = () => { cancelAnimationFrame(frame); last=0; draw(0); };
    restart();
    window.addEventListener("resize",restart); motion.addEventListener("change",restart);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize",restart); motion.removeEventListener("change",restart); };
  }, [lines]);
  return <>
    <canvas className="night-sky" ref={canvasRef} aria-hidden="true" />
    <button className="sky-toggle" onClick={() => setLines(!lines)} aria-pressed={lines}>Constellations {lines ? "on" : "off"}</button>
  </>;
}
