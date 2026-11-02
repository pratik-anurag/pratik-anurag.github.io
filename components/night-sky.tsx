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
      // A composed Bengaluru skyline; landmarks are illustrative, not geographically aligned.
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
      ctx.save();
      const cityScale = Math.min(1, w / 760);
      ctx.translate(0, h - 20);
      ctx.scale(cityScale, cityScale);
      const cityWidth = w / cityScale;

      // Vidhana Soudha: broad colonnade, stepped entrance and central dome.
      ctx.save();
      ctx.translate(cityWidth * .27, 0);
      ctx.fillStyle = "#142536";
      ctx.fillRect(-116, -132, 232, 125);
      ctx.fillRect(-126, -141, 252, 10);
      ctx.fillRect(-104, -153, 208, 12);
      ctx.fillRect(-30, -180, 60, 30);
      const dome = (x: number, y: number, radius: number) => {
        ctx.beginPath(); ctx.arc(x, y, radius, Math.PI, 0);
        ctx.lineTo(x + radius, y + 7); ctx.lineTo(x - radius, y + 7); ctx.closePath(); ctx.fill();
        ctx.fillRect(x - 1, y - radius - 12, 2, 12);
      };
      dome(0, -181, 25);
      dome(-91, -155, 12); dome(91, -155, 12);
      ctx.fillStyle = "rgba(218,185,130,.26)";
      ctx.fillRect(-121, -133, 242, 2);
      for (let column = -101; column <= 101; column += 18) {
        ctx.fillRect(column, -120, 3, 66);
        ctx.fillRect(column - 2, -122, 7, 3);
      }
      ctx.fillStyle = "#0b1725";
      ctx.fillRect(-25, -83, 50, 70);
      for (let step=0; step<4; step++) ctx.fillRect(-42-step*7, -20+step*5, 84+step*14, 5);
      ctx.restore();

      // UB City-inspired tower: tall shaft and tiered, illuminated crown.
      ctx.save();
      ctx.translate(cityWidth * .76, 0);
      ctx.fillStyle = "#122333";
      ctx.fillRect(-30, -222, 60, 220);
      ctx.fillRect(-22, -243, 44, 22);
      ctx.fillRect(-15, -259, 30, 17);
      ctx.beginPath(); ctx.moveTo(-15,-259); ctx.lineTo(0,-285); ctx.lineTo(15,-259); ctx.fill();
      ctx.fillRect(-1,-301,2,20);
      ctx.strokeStyle = "rgba(216,192,142,.45)"; ctx.lineWidth = 1;
      for (const y of [-222,-243,-259]) { ctx.beginPath(); ctx.moveTo(-22,y); ctx.lineTo(22,y); ctx.stroke(); }
      for (let row=0; row<16; row++) for (let col=0; col<5; col++) {
        ctx.fillStyle = (row+col)%3 ? "rgba(141,190,208,.22)" : "rgba(238,194,127,.4)";
        ctx.fillRect(-22+col*10,-214+row*12,3,5);
      }
      ctx.restore();

      // Namma Metro viaduct, with a restrained purple train and lit carriage windows.
      ctx.fillStyle = "#08121f";
      ctx.fillRect(0,-28,cityWidth,9);
      for (let x=15; x<cityWidth; x+=125) {
        ctx.fillRect(x,-23,9,45); ctx.fillRect(x-8,-27,25,7);
      }
      const trainX = cityWidth * .46;
      ctx.fillStyle = "#343044";
      ctx.fillRect(trainX,-47,139,16);
      ctx.fillStyle = "#79648b"; ctx.fillRect(trainX,-34,139,3);
      ctx.fillStyle = "rgba(217,224,211,.45)";
      for (let i=0;i<12;i++) ctx.fillRect(trainX+6+i*11,-43,7,5);
      ctx.restore();
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
