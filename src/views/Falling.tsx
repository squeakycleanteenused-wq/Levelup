import { useEffect, useRef } from "react";
import { MAPLE, type Season } from "../theme";

type Kind = "leaf" | "flake" | "flower" | "butterfly" | "mote";
type P = { k: Kind; x: number; y: number; vx: number; vy: number; r: number; a: number; va: number; s: number; c: string; sway: number };

const palette: Record<Season, string[]> = {
  autumn: ["#c2410c", "#d97706", "#b91c1c", "#ca8a04", "#9a3412"],
  winter: ["#ffffff", "#dbeafe", "#e0f2fe"],
  spring: ["#f472b6", "#fb7185", "#fbbf24", "#c084fc", "#ffffff"],
  summer: ["#fde047", "#fbbf24", "#fff7ae"],
};
const kinds: Record<Season, Kind[]> = {
  autumn: ["leaf"],
  winter: ["flake"],
  spring: ["flower", "flower", "flower", "butterfly"],
  summer: ["mote"],
};

function drawFlake(c: CanvasRenderingContext2D, r: number) {
  c.lineWidth = 1.4;
  for (let i = 0; i < 6; i++) {
    c.rotate(Math.PI / 3);
    c.beginPath();
    c.moveTo(0, 0); c.lineTo(0, 7 * r);
    c.moveTo(0, 4 * r); c.lineTo(2.5 * r, 6 * r);
    c.moveTo(0, 4 * r); c.lineTo(-2.5 * r, 6 * r);
    c.stroke();
  }
}
function drawFlower(c: CanvasRenderingContext2D, r: number, color: string) {
  c.fillStyle = color;
  for (let i = 0; i < 5; i++) {
    c.rotate((Math.PI * 2) / 5);
    c.beginPath(); c.ellipse(0, -4 * r, 2.6 * r, 4 * r, 0, 0, 6.28); c.fill();
  }
  c.fillStyle = "#fde047";
  c.beginPath(); c.arc(0, 0, 2 * r, 0, 6.28); c.fill();
}
function drawButterfly(c: CanvasRenderingContext2D, r: number, color: string, t: number) {
  const flap = Math.abs(Math.sin(t / 110)); // 0..1
  c.fillStyle = color;
  for (const side of [-1, 1]) {
    c.save(); c.scale(side * (0.25 + 0.75 * flap), 1);
    c.beginPath(); c.ellipse(5 * r, -3 * r, 5 * r, 4 * r, -0.4, 0, 6.28); c.fill();
    c.beginPath(); c.ellipse(4 * r, 4 * r, 3.5 * r, 3 * r, 0.4, 0, 6.28); c.fill();
    c.restore();
  }
  c.fillStyle = "#3b2412";
  c.fillRect(-0.8 * r, -5 * r, 1.6 * r, 10 * r);
}

/** Hooajaline animatsioon: sügisel vahtralehed, talvel lumi, kevadel lilled ja liblikad, suvel päike.
 *  Hiire või sõrmega puudutades lendavad osakesed laiali, klõps kutsub juurde. */
export default function Falling({ season }: { season: Season }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext("2d")!;
    const leaf = new Path2D(MAPLE);
    let w = 0, h = 0, raf = 0;
    const list: P[] = [];
    const count = season === "summer" ? 14 : season === "spring" ? 22 : 28;
    const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

    const make = (x = Math.random() * w, y = -20): P => {
      const k = pick(kinds[season]);
      const rise = k === "mote" ? -1 : 1; // suvised sädemed hõljuvad üles
      return {
        k, x, y: k === "mote" ? Math.random() * h : y, vx: 0,
        vy: k === "butterfly" ? 0 : rise * (0.3 + Math.random() * 0.6),
        r: k === "butterfly" ? 0.9 + Math.random() * 0.4 : 0.5 + Math.random() * 0.7,
        a: Math.random() * 6.28, va: k === "butterfly" ? 0 : (Math.random() - 0.5) * 0.03,
        s: Math.random() * 6.28, sway: 0.3 + Math.random() * 0.6, c: pick(palette[season]),
      };
    };
    const resize = () => { w = cv.width = innerWidth; h = cv.height = innerHeight; };
    resize();
    for (let i = 0; i < count; i++) {
      const p = make(Math.random() * w, Math.random() * h);
      list.push(p);
    }

    const blow = (x: number, y: number, power: number) =>
      list.forEach((p) => {
        const dx = p.x - x, dy = p.y - y, d = Math.hypot(dx, dy);
        if (d < 100) { p.vx += (dx / (d || 1)) * power; p.vy += (dy / (d || 1)) * power * 0.6; p.va += (Math.random() - 0.5) * 0.2; }
      });
    const move = (e: PointerEvent) => blow(e.clientX, e.clientY, 1.2);
    const down = (e: PointerEvent) => {
      blow(e.clientX, e.clientY, 5);
      if (season !== "summer") for (let i = 0; i < 4 && list.length < 60; i++) list.push(make(e.clientX + (Math.random() - 0.5) * 60, e.clientY - 10));
    };

    const sun = (t: number) => {
      ctx.save();
      ctx.translate(w - 46, 118);
      const g = ctx.createRadialGradient(0, 0, 10, 0, 0, 90);
      g.addColorStop(0, "#fde04799"); g.addColorStop(1, "#fde04700");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 90, 0, 6.28); ctx.fill();
      ctx.rotate(t / 6000);
      ctx.strokeStyle = "#f59e0b"; ctx.lineWidth = 3; ctx.lineCap = "round";
      for (let i = 0; i < 12; i++) { ctx.rotate(Math.PI / 6); ctx.beginPath(); ctx.moveTo(0, 26); ctx.lineTo(0, 38); ctx.stroke(); }
      ctx.fillStyle = "#fbbf24"; ctx.beginPath(); ctx.arc(0, 0, 20, 0, 6.28); ctx.fill();
      ctx.restore();
    };

    const tick = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      if (season === "summer") sun(t);
      list.forEach((p, i) => {
        p.vx *= 0.96;
        if (p.k === "butterfly") {
          // kõigub ringi, põgeneb puudutuse eest
          p.a += Math.sin(t / 700 + p.s) * 0.04;
          p.x += Math.cos(p.a) * 0.9 + p.vx;
          p.y += Math.sin(p.a) * 0.6 + Math.sin(t / 300 + p.s) * 0.4 + p.vy;
          p.vy *= 0.96;
          if (p.x < -30) p.x = w + 20; if (p.x > w + 30) p.x = -20;
          if (p.y < -30) p.y = h + 20; if (p.y > h + 30) p.y = -20;
        } else {
          p.x += p.vx + Math.sin(t / 900 + p.s) * p.sway;
          p.y += p.vy;
          p.a += p.va;
          const out = p.vy >= 0 ? p.y > h + 30 : p.y < -30;
          if (out || p.x < -40 || p.x > w + 40) {
            if (list.length > count) list.splice(i, 1);
            else Object.assign(p, make());
          }
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.globalAlpha = p.k === "mote" ? 0.6 : 0.88;
        if (p.k === "butterfly") ctx.rotate(p.a + Math.PI / 2);
        else ctx.rotate(p.a);
        ctx.fillStyle = ctx.strokeStyle = p.c;
        if (p.k === "leaf") { ctx.scale(p.r * 1.1, p.r * 1.1); ctx.translate(-12, -12); ctx.fill(leaf); }
        else if (p.k === "flake") { ctx.strokeStyle = "#7fb2e5"; drawFlake(ctx, p.r); }
        else if (p.k === "flower") drawFlower(ctx, p.r, p.c);
        else if (p.k === "butterfly") drawButterfly(ctx, p.r, p.c, t + p.s * 100);
        else { ctx.beginPath(); ctx.arc(0, 0, 2 * p.r, 0, 6.28); ctx.fill(); }
        ctx.restore();
      });
      raf = requestAnimationFrame(tick);
    };

    addEventListener("resize", resize);
    addEventListener("pointermove", move);
    addEventListener("pointerdown", down);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize);
      removeEventListener("pointermove", move);
      removeEventListener("pointerdown", down);
    };
  }, [season]);

  return <canvas ref={ref} aria-hidden style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 50 }} />;
}
