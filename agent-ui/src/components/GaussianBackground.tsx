import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import {
  DEFAULT_VISUAL_STATE,
  type PhoenixVisualState,
  type GaussianBackgroundProps,
} from './gaussianBackground/types';

const Container = styled.div`
  position: absolute;
  inset: 0;
  z-index: -1;
  overflow: hidden;
`;

const Canvas = styled.canvas`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
`;

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  twinkleSpeed: number;
  twinklePhase: number;
  twinkleDepth: number;
  baseBrightness: number;
}

interface TerrainLayer {
  speed: number;
  colorTop: string;
  colorBot: string;
  freq: number;
  amp: number;
  offset: number;
}

interface Tower {
  x: number;
  width: number;
  height: number;
  twist: number;
  windowGrid: number;
  seed: number;
  hue: number;
  scrollSpeed: number;
  isoAngle: number;
  level: number;
}

interface Flora {
  x: number;
  type: 'saguaro' | 'pricklypear' | 'yucca' | 'tumbleweed' | 'desertgrass';
  height: number;
  width: number;
  seed: number;
  swayPhase: number;
  swaySpeed: number;
  scrollSpeed: number;
  depth: number;
}

interface Fauna {
  x: number;
  y: number;
  type: 'hawk' | 'vulture' | 'rabbit';
  seed: number;
  speed: number;
  drift: number;
  phase: number;
  size: number;
}

const HORIZON = 0.52;

const GaussianBackground: React.FC<GaussianBackgroundProps> = ({ visualState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(visualState ?? DEFAULT_VISUAL_STATE);
  const rafRef = useRef(0);
  const scrollRef = useRef(0);

  useEffect(() => {
    stateRef.current = visualState ?? DEFAULT_VISUAL_STATE;
  }, [visualState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let stars: Star[] = [];
    let towers: Tower[] = [];
    let flora: Flora[] = [];
    let fauna: Fauna[] = [];
    let lastTime = 0;

    const hash11 = (p: number) => {
      p = ((p << 13) ^ p) * 127.1;
      p = ((p << 13) ^ p) * 127.1;
      return (((p * 0.0001) % 1) + 1) % 1;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      initStars();
      initTowers();
      initFlora();
      initFauna();
    };

    const initStars = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const count = Math.floor((w * h) / 12000);
      const goldenAngle = Math.PI * (3 - Math.sqrt(5));
      stars = Array.from({ length: count }, (_, i) => {
        const r = Math.sqrt(i / count);
        const theta = i * goldenAngle;
        return {
          x: w * 0.5 + Math.cos(theta) * r * w * 1.2,
          y: h * HORIZON * 0.4 * r,
          z: 0.5 + r * 3,
          size: 0.3 + (1 - r) * 1.4,
          twinkleSpeed: 0.001 + hash11(i * 43.7) * 0.004,
          twinklePhase: hash11(i * 91.3) * 6.28,
          twinkleDepth: 0.3 + hash11(i * 67.9) * 0.5,
          baseBrightness: 0.2 + hash11(i * 23.1) * 0.4,
        };
      });
    };

    const initTowers = () => {
      const w = window.innerWidth;
      towers = [];
      for (let level = 0; level < 3; level++) {
        const count = 8 + level * 4;
        for (let i = 0; i < count; i++) {
          towers.push({
            x: (i / count) * w * 1.4 - w * 0.2,
            width: 6 + hash11(i * 31.7 + level * 100) * 12 + (2 - level) * 4,
            height: 30 + hash11(i * 51.3 + level * 100) * 90 + (2 - level) * 25,
            twist: (hash11(i * 71.1 + level * 100) - 0.5) * 0.3,
            windowGrid: 3 + Math.floor(hash11(i * 41.1 + level * 100) * 5),
            seed: hash11(i * 91.3 + level * 100) * 1000,
            hue: 20 + hash11(i * 61.7 + level * 100) * 30,
            scrollSpeed: 0.08 + level * 0.06 + hash11(i * 23.7 + level * 100) * 0.04,
            isoAngle: 0.3 + hash11(i * 37.1 + level * 100) * 0.4,
            level,
          });
        }
      }
      towers.sort((a, b) => a.level - b.level);
    };

    const initFlora = () => {
      const w = window.innerWidth;
      flora = [];
      for (let i = 0; i < 10; i++) {
        flora.push({
          x: (i / 10) * w * 2.5 + hash11(i * 73.1) * w * 0.4,
          type: 'saguaro',
          height: 60 + hash11(i * 31.7) * 100,
          width: 15 + hash11(i * 51.3) * 20,
          seed: hash11(i * 91.3) * 1000,
          swayPhase: hash11(i * 17.9) * 6.28,
          swaySpeed: 0.0004 + hash11(i * 41.1) * 0.0004,
          scrollSpeed: 2.5 + hash11(i * 23.7) * 1.5,
          depth: 0.6 + hash11(i * 11.1) * 0.4,
        });
      }
      for (let i = 0; i < 8; i++) {
        flora.push({
          x: hash11(i * 97.3) * w * 2.5,
          type: 'pricklypear',
          height: 15 + hash11(i * 61.7) * 25,
          width: 20 + hash11(i * 37.1) * 25,
          seed: hash11(i * 47.9) * 1000,
          swayPhase: hash11(i * 23.1) * 6.28,
          swaySpeed: 0.0003 + hash11(i * 53.3) * 0.0003,
          scrollSpeed: 2.2 + hash11(i * 31.7) * 1.0,
          depth: 0.5 + hash11(i * 13.7) * 0.5,
        });
      }
      for (let i = 0; i < 6; i++) {
        flora.push({
          x: hash11(i * 113.1) * w * 2.5,
          type: 'yucca',
          height: 40 + hash11(i * 29.3) * 50,
          width: 20 + hash11(i * 57.1) * 15,
          seed: hash11(i * 83.1) * 1000,
          swayPhase: hash11(i * 13.7) * 6.28,
          swaySpeed: 0.0005 + hash11(i * 37.9) * 0.0005,
          scrollSpeed: 2.6 + hash11(i * 19.3) * 1.2,
          depth: 0.5 + hash11(i * 7.3) * 0.5,
        });
      }
      for (let i = 0; i < 20; i++) {
        flora.push({
          x: hash11(i * 43.7) * w * 3,
          type: 'desertgrass',
          height: 8 + hash11(i * 29.3) * 18,
          width: 6 + hash11(i * 57.1) * 10,
          seed: hash11(i * 83.1) * 1000,
          swayPhase: hash11(i * 13.7) * 6.28,
          swaySpeed: 0.001 + hash11(i * 37.9) * 0.002,
          scrollSpeed: 2.8 + hash11(i * 19.3) * 1.2,
          depth: 0.4 + hash11(i * 7.3) * 0.6,
        });
      }
      for (let i = 0; i < 3; i++) {
        flora.push({
          x: hash11(i * 131.3) * w * 3,
          type: 'tumbleweed',
          height: 12 + hash11(i * 71.7) * 15,
          width: 12 + hash11(i * 43.1) * 15,
          seed: hash11(i * 91.1) * 1000,
          swayPhase: hash11(i * 17.3) * 6.28,
          swaySpeed: 0.002 + hash11(i * 53.1) * 0.002,
          scrollSpeed: 3.5 + hash11(i * 31.3) * 2,
          depth: 0.3 + hash11(i * 11.7) * 0.3,
        });
      }
    };

    const initFauna = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      fauna = [];
      for (let i = 0; i < 2; i++) {
        fauna.push({
          x: hash11(i * 113.7) * w * 0.4 + w * 0.3,
          y: h * 0.12 + hash11(i * 127.3) * h * 0.12,
          type: 'hawk',
          seed: hash11(i * 139.1) * 1000,
          speed: 0.3 + hash11(i * 151.7) * 0.3,
          drift: 8 + hash11(i * 163.3) * 12,
          phase: hash11(i * 173.9) * 6.28,
          size: 5 + hash11(i * 181.7) * 3,
        });
      }
      for (let i = 0; i < 4; i++) {
        fauna.push({
          x: hash11(i * 191.3) * w,
          y: h * 0.15 + hash11(i * 197.7) * h * 0.1,
          type: 'vulture',
          seed: hash11(i * 211.1) * 1000,
          speed: 0.15 + hash11(i * 223.7) * 0.2,
          drift: 15 + hash11(i * 233.3) * 20,
          phase: hash11(i * 241.9) * 6.28,
          size: 6 + hash11(i * 251.7) * 4,
        });
      }
      for (let i = 0; i < 3; i++) {
        fauna.push({
          x: hash11(i * 263.3) * w,
          y: h * 0.8 + hash11(i * 271.7) * h * 0.1,
          type: 'rabbit',
          seed: hash11(i * 281.1) * 1000,
          speed: 0.6 + hash11(i * 293.3) * 0.5,
          drift: 5,
          phase: hash11(i * 307.7) * 6.28,
          size: 4 + hash11(i * 311.3) * 3,
        });
      }
    };

    const terrainLayers: TerrainLayer[] = [
      { speed: 0.3, colorTop: '#8b6b4a', colorBot: '#6b4e33', freq: 0.0006, amp: 60, offset: 0 },
      { speed: 0.6, colorTop: '#7a5c3e', colorBot: '#5a4028', freq: 0.001, amp: 45, offset: 100 },
      { speed: 1.0, colorTop: '#6b4e33', colorBot: '#4a3520', freq: 0.0018, amp: 30, offset: 200 },
      { speed: 1.8, colorTop: '#5a4028', colorBot: '#3a2515', freq: 0.003, amp: 18, offset: 350 },
    ];

    const noise = (x: number, freq: number, seed: number) => {
      return (
        Math.sin(x * freq + seed) * 0.5 +
        Math.sin(x * freq * 2.3 + seed * 1.7) * 0.25 +
        Math.sin(x * freq * 5.1 + seed * 3.1) * 0.125
      );
    };

    const drawSky = (w: number, h: number, vs: PhoenixVisualState) => {
      const grad = ctx.createLinearGradient(0, 0, 0, h * HORIZON + 40);
      grad.addColorStop(0, '#1a0a2e');
      grad.addColorStop(0.15, '#2d1b4e');
      grad.addColorStop(0.3, '#6b2f5a');
      grad.addColorStop(0.45, '#c44e3d');
      grad.addColorStop(0.6, '#e8833a');
      grad.addColorStop(0.75, '#f0a844');
      grad.addColorStop(0.88, '#f7c96b');
      grad.addColorStop(1, '#fde8a8');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h * HORIZON + 40);

      const sunX = w * (0.6 + vs.progress * 0.15);
      const sunY = h * HORIZON * 0.75;
      const sunR = 30 + vs.energy * 10;
      const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR * 8);
      sunGrad.addColorStop(0, 'rgba(255, 240, 200, 0.9)');
      sunGrad.addColorStop(0.05, 'rgba(255, 220, 150, 0.5)');
      sunGrad.addColorStop(0.15, 'rgba(255, 180, 80, 0.2)');
      sunGrad.addColorStop(0.4, 'rgba(230, 120, 50, 0.05)');
      sunGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = sunGrad;
      ctx.fillRect(0, 0, w, h * HORIZON + 40);

      ctx.beginPath();
      ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 250, 230, 0.95)';
      ctx.fill();

      const hazeIntensity = 0.08 + vs.energy * 0.04;
      for (let i = 0; i < 4; i++) {
        const t = scrollRef.current * 0.00003 * (i + 1);
        const cx = w * 0.4 + Math.sin(t + i * 1.8) * w * 0.3;
        const cy = h * HORIZON * (0.5 + i * 0.08);
        const hazeGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.4);
        const hue = 30 + i * 8 + vs.alert * 20;
        hazeGrad.addColorStop(0, `hsla(${hue}, 60%, 65%, ${hazeIntensity})`);
        hazeGrad.addColorStop(0.5, `hsla(${hue + 10}, 40%, 50%, ${hazeIntensity * 0.3})`);
        hazeGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = hazeGrad;
        ctx.fillRect(0, 0, w, h * HORIZON + 40);
      }
    };

    const drawStars = (w: number, h: number, vs: PhoenixVisualState) => {
      const speed = 0.1 + vs.activity * 0.3;
      const skyH = h * HORIZON * 0.4;
      for (const s of stars) {
        s.x -= s.z * speed;
        if (s.x < -10) s.x += w + 20;

        const twinkleRaw = Math.sin(scrollRef.current * s.twinkleSpeed + s.twinklePhase);
        const twinkle = 1 - s.twinkleDepth + twinkleRaw * s.twinkleDepth;
        const fade = 1 - (s.y / skyH) * 0.4;
        const brightness = s.baseBrightness * twinkle * fade;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * (1 / s.z + 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(40, 30%, 95%, ${brightness})`;
        ctx.fill();

        if (twinkleRaw > 0.7 && s.baseBrightness > 0.4) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(40, 20%, 90%, ${brightness * 0.12})`;
          ctx.fill();
        }
      }
    };

    const drawTower = (t: Tower, w: number, h: number) => {
      const horizonPx = h * HORIZON;
      const scroll = (scrollRef.current * t.scrollSpeed) % (w * 1.6);
      const baseX = ((((t.x - scroll) % (w * 1.4)) + w * 1.6) % (w * 1.4)) - w * 0.2;
      const baseY = horizonPx - 5 + t.level * 8;

      const twist = Math.sin(scrollRef.current * 0.0004 + t.seed) * t.twist;
      const breathe = Math.sin(scrollRef.current * 0.001 + t.seed * 0.7) * 3;

      const tw = t.width;
      const th = t.height + breathe;
      const topX = baseX + Math.sin(twist) * th * 0.3;
      const topY = baseY - th;

      const iso = t.isoAngle * tw;
      ctx.save();
      ctx.globalAlpha = 0.2 + (2 - t.level) * 0.12;

      ctx.beginPath();
      ctx.moveTo(baseX, baseY);
      ctx.lineTo(baseX + tw, baseY);
      ctx.lineTo(topX + tw, topY);
      ctx.lineTo(topX, topY);
      ctx.closePath();
      const faceGrad = ctx.createLinearGradient(baseX, baseY, baseX + tw, topY);
      faceGrad.addColorStop(0, `hsla(${t.hue}, 40%, 18%, 0.9)`);
      faceGrad.addColorStop(1, `hsla(${t.hue + 10}, 30%, 12%, 0.7)`);
      ctx.fillStyle = faceGrad;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(baseX + tw, baseY);
      ctx.lineTo(baseX + tw + iso, baseY - iso * 2);
      ctx.lineTo(topX + tw + iso, topY - iso * 2);
      ctx.lineTo(topX + tw, topY);
      ctx.closePath();
      ctx.fillStyle = `hsla(${t.hue - 5}, 30%, 10%, 0.8)`;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(topX, topY);
      ctx.lineTo(topX + tw, topY);
      ctx.lineTo(topX + tw + iso, topY - iso * 2);
      ctx.closePath();
      ctx.fillStyle = `hsla(${t.hue + 15}, 45%, 22%, 0.6)`;
      ctx.fill();

      const gridStep = tw / t.windowGrid;
      const rowStep = th / (t.windowGrid * 2);
      for (let row = 0; row < t.windowGrid * 2; row++) {
        for (let col = 0; col < t.windowGrid; col++) {
          const hv = hash11(t.seed + row * 17.3 + col * 31.7);
          if (hv > 0.5) continue;
          const flickerPhase = hv * 6.28 + row * 0.5;
          const flicker = Math.sin(scrollRef.current * 0.002 + flickerPhase);
          if (flicker < 0.1) continue;

          const tRatio = (row * rowStep) / th;
          const warpX = Math.sin(twist * tRatio) * th * 0.3 * tRatio;
          const wx = baseX + col * gridStep + gridStep * 0.2 + warpX * (col / t.windowGrid);
          const wy = baseY - row * rowStep;
          const ww = gridStep * 0.5;
          const wh = rowStep * 0.4;

          const wHue = 30 + hv * 30;
          const brightness = 50 + flicker * 30 + hv * 15;
          ctx.fillStyle = `hsla(${wHue}, 80%, ${brightness}%, ${0.25 + flicker * 0.25})`;
          ctx.fillRect(wx, wy, ww, wh);
        }
      }

      if (t.level === 0 && t.height > 60) {
        const pulse = Math.sin(scrollRef.current * 0.003 + t.seed) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.arc(topX + tw * 0.5, topY - 3, 2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(25, 100%, 70%, ${pulse * 0.5})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(topX + tw * 0.5, topY - 3, 5 + pulse * 4, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(25, 100%, 70%, ${pulse * 0.08})`;
        ctx.fill();
      }

      ctx.restore();
    };

    const drawTerrain = (w: number, h: number, vs: PhoenixVisualState) => {
      const horizonPx = h * HORIZON;
      const baseSpeed = 0.3 + vs.activity * 0.8;

      for (const layer of terrainLayers) {
        const scroll = scrollRef.current * layer.speed * baseSpeed * 0.01;
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 2) {
          const n = noise(x + scroll + layer.offset, layer.freq, layer.offset * 0.1);
          ctx.lineTo(x, horizonPx - layer.amp * (0.5 + n * 0.5));
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        const tGrad = ctx.createLinearGradient(0, horizonPx - layer.amp, 0, h);
        tGrad.addColorStop(0, layer.colorTop);
        tGrad.addColorStop(1, layer.colorBot);
        ctx.fillStyle = tGrad;
        ctx.fill();
      }

      for (const tower of towers) {
        drawTower(tower, w, h);
      }

      const glowGrad = ctx.createLinearGradient(0, horizonPx - 40, 0, horizonPx + 60);
      glowGrad.addColorStop(0, 'transparent');
      glowGrad.addColorStop(0.3, `rgba(220, 160, 80, ${0.06 + vs.energy * 0.03})`);
      glowGrad.addColorStop(0.6, 'rgba(180, 100, 50, 0.04)');
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, horizonPx - 40, w, 100);
    };

    // Swept-skeleton tube with ribbed cross-section: ρ(θ) = 1 + ε·cos(mθ)
    // Support function h(ψ) = max_θ [ ρ(θ)·cos(θ − ψ) ] gives apparent half-width

    interface Vec2 {
      x: number;
      y: number;
    }

    const v2len = (a: Vec2): number => Math.sqrt(a.x * a.x + a.y * a.y);
    const v2norm = (a: Vec2): Vec2 => {
      const l = v2len(a) || 1;
      return { x: a.x / l, y: a.y / l };
    };

    // h(ψ) = max_θ [ (1 + ε·cos(mθ)) · cos(θ − ψ) ]
    const supportLUTCache = new Map<string, Float32Array>();
    const getSupportLUT = (ribs: number, amp: number): Float32Array => {
      const key = `${ribs}:${amp.toFixed(4)}`;
      const cached = supportLUTCache.get(key);
      if (cached) return cached;
      const N = 64;
      const lut = new Float32Array(N);
      const sampleTheta = 128;
      for (let i = 0; i < N; i++) {
        const psi = (i / N) * Math.PI * 2;
        let maxVal = 0;
        for (let j = 0; j < sampleTheta; j++) {
          const theta = (j / sampleTheta) * Math.PI * 2;
          const rho = 1 + amp * Math.cos(ribs * theta);
          const val = rho * Math.cos(theta - psi);
          if (val > maxVal) maxVal = val;
        }
        lut[i] = maxVal;
      }
      supportLUTCache.set(key, lut);
      return lut;
    };

    const sampleSupport = (lut: Float32Array, psi: number): number => {
      const N = lut.length;
      const idx = (((psi / (Math.PI * 2)) % 1) + 1) % 1;
      const fi = idx * N;
      const i0 = Math.floor(fi) % N;
      const i1 = (i0 + 1) % N;
      const frac = fi - Math.floor(fi);
      return lut[i0] * (1 - frac) + lut[i1] * frac;
    };

    // Natural taper: r(t) = r0·(1 − 0.18·t^1.35 + 0.08·(1−t)^4)
    const saguaroRadius = (t: number, r0: number): number =>
      r0 * (1 - 0.18 * Math.pow(t, 1.35) + 0.08 * Math.pow(1 - t, 4));

    // Arm: smooth ramp then taper: rMax·smoothstep(0,0.18,s)·(1 − 0.22·s^1.3)
    const armRadius = (s: number, rMax: number): number =>
      rMax * smoothstep(0, 0.08, s) * (1 - 0.15 * Math.pow(s, 1.3));

    const smoothstep = (edge0: number, edge1: number, x: number): number => {
      const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
      return t * t * (3 - 2 * t);
    };

    // Hermite ease: anchored at base (t=0), free at top (t=1)
    const swayEase = (t: number): number => t * t * (3 - 2 * t);

    const traceTube = (leftPts: Vec2[], rightPts: Vec2[]) => {
      ctx.beginPath();
      ctx.moveTo(rightPts[0].x, rightPts[0].y);
      for (let i = 1; i < rightPts.length; i++) {
        ctx.lineTo(rightPts[i].x, rightPts[i].y);
      }
      for (let i = leftPts.length - 1; i >= 0; i--) {
        ctx.lineTo(leftPts[i].x, leftPts[i].y);
      }
      ctx.closePath();
    };

    const buildTubePoints = (
      centerFn: (t: number) => Vec2,
      tangentFn: (t: number) => Vec2,
      radiusFn: (t: number) => number,
      widthScaleR: (t: number) => number,
      widthScaleL: (t: number) => number,
      samples: number
    ): { left: Vec2[]; right: Vec2[] } => {
      const left: Vec2[] = [];
      const right: Vec2[] = [];
      for (let i = 0; i <= samples; i++) {
        const t = i / samples;
        const p = centerFn(t);
        const d = v2norm(tangentFn(t));
        const n: Vec2 = { x: -d.y, y: d.x };
        const r = radiusFn(t);
        left.push({ x: p.x - n.x * r * widthScaleL(t), y: p.y - n.y * r * widthScaleL(t) });
        right.push({ x: p.x + n.x * r * widthScaleR(t), y: p.y + n.y * r * widthScaleR(t) });
      }
      return { left, right };
    };

    const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

    const drawFlora = (w: number, h: number, vs: PhoenixVisualState) => {
      const baseSpeed = 0.3 + vs.activity * 0.8;

      for (const f of flora) {
        const scroll = scrollRef.current * f.scrollSpeed * baseSpeed * 0.01;
        const range = f.type === 'tumbleweed' ? w * 4 : w * 2.5;
        const baseX = ((((f.x - scroll) % range) + range) % range) - w * 0.3;
        const sway = Math.sin(scrollRef.current * f.swaySpeed + f.swayPhase) * (2 + f.depth * 3);
        const baseY = h - 5 - f.depth * 15;
        const alpha =
          f.type === 'saguaro' || f.type === 'pricklypear'
            ? 0.45 + f.depth * 0.35
            : 0.2 + f.depth * 0.3;

        ctx.save();
        ctx.globalAlpha = alpha;

        if (f.type === 'saguaro') {
          const trunkH = f.height;
          const r0 = f.width * 0.3;
          const lean = (hash11(f.seed + 5) - 0.5) * 4;
          const trunkX = baseX;

          const ribs = 8 + Math.floor(hash11(f.seed + 1) * 3);
          const ribAmp = 0.1 + 0.08 * hash11(f.seed + 2);
          const lut = getSupportLUT(ribs, ribAmp);
          const psi0 = Math.PI * 2 * hash11(f.seed + 3);
          const twist = 0.25 + 0.25 * hash11(f.seed + 4);

          const trunkCenter = (t: number): Vec2 => ({
            x: trunkX + lean * t + sway * 0.2 * swayEase(t),
            y: baseY - trunkH * t,
          });
          const trunkTangent = (t: number): Vec2 => ({
            x: lean + sway * 0.2 * (6 * t - 6 * t * t),
            y: -trunkH,
          });

          const wR = (t: number) =>
            sampleSupport(
              lut,
              psi0 + twist * t + 0.15 * Math.sin(scrollRef.current * 0.0004 + 1.7 * t)
            );
          const wL = (t: number) =>
            sampleSupport(
              lut,
              psi0 + twist * t + Math.PI + 0.15 * Math.sin(scrollRef.current * 0.0004 + 1.7 * t)
            );

          const samples = Math.max(12, Math.min(20, Math.round(trunkH / 8)));
          const trunkPts = buildTubePoints(
            trunkCenter,
            trunkTangent,
            t => saguaroRadius(t, r0),
            wR,
            wL,
            samples
          );

          ctx.fillStyle = '#2a4422';
          traceTube(trunkPts.left, trunkPts.right);
          ctx.fill();

          ctx.beginPath();
          for (let i = 0; i <= samples; i++) {
            const t = i / samples;
            const p = trunkCenter(t);
            const d = v2norm(trunkTangent(t));
            const n: Vec2 = { x: -d.y, y: d.x };
            const rad = saguaroRadius(t, r0);
            const x = p.x + n.x * rad * 0.85 * wR(t);
            const y = p.y + n.y * rad * 0.85 * wR(t);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.strokeStyle = 'rgba(50, 100, 40, 0.25)';
          ctx.lineWidth = 2.0;
          ctx.stroke();

          if (trunkH > 50) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(trunkPts.right[0].x, trunkPts.right[0].y);
            for (let i = 1; i < trunkPts.right.length; i++)
              ctx.lineTo(trunkPts.right[i].x, trunkPts.right[i].y);
            for (let i = trunkPts.left.length - 1; i >= 0; i--)
              ctx.lineTo(trunkPts.left[i].x, trunkPts.left[i].y);
            ctx.closePath();
            ctx.clip();

            const ribStrokes = trunkH > 100 ? 5 : 3;
            for (let r = 0; r < ribStrokes; r++) {
              const u = (r - (ribStrokes - 1) / 2) / ((ribStrokes - 1) / 2 || 1);
              ctx.beginPath();
              for (let i = 0; i <= samples; i++) {
                const t = i / samples;
                const p = trunkCenter(t);
                const d = v2norm(trunkTangent(t));
                const n: Vec2 = { x: -d.y, y: d.x };
                const rad = saguaroRadius(t, r0);
                const px = p.x + n.x * u * rad * 0.7;
                const py = p.y + n.y * u * rad * 0.7;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
              }
              const fade = 0.15 + Math.abs(u) * 0.1;
              ctx.strokeStyle = `rgba(10, 20, 8, ${fade})`;
              ctx.lineWidth = 0.8;
              ctx.stroke();
            }
            ctx.restore();
          }

          const armCount = trunkH < 90 ? 1 : 1 + (hash11(f.seed + 6) > 0.45 ? 1 : 0);
          for (let a = 0; a < armCount; a++) {
            const side: number =
              a === 0
                ? hash11(f.seed + 7) > 0.5
                  ? 1
                  : -1
                : -(a === 0 ? 1 : hash11(f.seed + 70) > 0.5 ? 1 : -1);
            const attachT = 0.3 + 0.25 * hash11(f.seed + 8 + a);
            const armLen = trunkH * (0.35 + 0.15 * hash11(f.seed + 10 + a));
            const armR0 = r0 * (0.9 + 0.1 * hash11(f.seed + 12 + a));

            const attachPt = trunkCenter(attachT);
            const attachTang = v2norm(trunkTangent(attachT));
            const attachNorm: Vec2 = { x: -attachTang.y, y: attachTang.x };

            const outDist = armLen * (0.65 + hash11(f.seed + 14 + a) * 0.25);
            const upDist = armLen * (0.45 + hash11(f.seed + 16 + a) * 0.25);
            const armSwayAmt = sway * 0.1 * side;

            const armCenter = (s: number): Vec2 => {
              const outProg = 1 - Math.pow(1 - s, 2.5);
              const upProg = Math.pow(s, 1.6);
              return {
                x: attachPt.x + side * attachNorm.x * outDist * outProg + armSwayAmt * s,
                y: attachPt.y + side * attachNorm.y * outDist * outProg - upDist * upProg,
              };
            };
            const armTangent = (s: number): Vec2 => {
              const dOut = 2.5 * Math.pow(1 - s, 1.5);
              const dUp = 1.6 * Math.pow(s, 0.6);
              return {
                x: side * attachNorm.x * outDist * dOut + armSwayAmt,
                y: side * attachNorm.y * outDist * dOut - upDist * dUp,
              };
            };

            const armWR = (s: number) => sampleSupport(lut, psi0 + 0.5 + twist * s * 0.3);
            const armWL = (s: number) => sampleSupport(lut, psi0 + 0.5 + twist * s * 0.3 + Math.PI);
            const armSamples = Math.max(8, Math.min(14, Math.round(armLen / 8)));

            const armPts = buildTubePoints(
              armCenter,
              armTangent,
              s => armRadius(s, armR0),
              armWR,
              armWL,
              armSamples
            );
            ctx.fillStyle = '#2a4422';
            traceTube(armPts.left, armPts.right);
            ctx.fill();
          }

          if (trunkH > 40) {
            const spineCount = Math.min(12, Math.floor(trunkH / 8));
            for (let i = 0; i < spineCount; i++) {
              const t = 0.1 + (i / spineCount) * 0.8;
              const p = trunkCenter(t);
              const side2 = hash11(f.seed + i * 31) > 0.5 ? 1 : -1;
              const d = v2norm(trunkTangent(t));
              const n: Vec2 = { x: -d.y, y: d.x };
              const rad = saguaroRadius(t, r0);
              const base2 = { x: p.x + n.x * side2 * rad * 0.9, y: p.y + n.y * side2 * rad * 0.9 };
              const spLen = 2 + hash11(f.seed + i * 17) * 4;
              const spAngle = Math.atan2(n.y, n.x) * side2 + (hash11(f.seed + i * 23) - 0.5) * 0.6;

              ctx.beginPath();
              ctx.moveTo(base2.x, base2.y);
              ctx.lineTo(base2.x + Math.cos(spAngle) * spLen, base2.y + Math.sin(spAngle) * spLen);
              ctx.strokeStyle = 'rgba(80, 120, 60, 0.25)';
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        } else if (f.type === 'pricklypear') {
          const padCount = 3 + Math.floor(hash11(f.seed) * 3);
          const bulge = 0.18 + hash11(f.seed + 50) * 0.15;

          interface PadInfo {
            cx: number;
            cy: number;
            rx: number;
            ry: number;
            rot: number;
          }

          const pads: PadInfo[] = [];
          const rootRx = f.width * (0.4 + hash11(f.seed + 11) * 0.15);
          const rootRy = rootRx * (0.6 + hash11(f.seed + 13) * 0.25);
          pads.push({
            cx: baseX + sway * 0.3,
            cy: baseY - rootRy * 0.5,
            rx: rootRx,
            ry: rootRy,
            rot: (hash11(f.seed + 15) - 0.5) * 0.4,
          });

          for (let p = 1; p < padCount; p++) {
            const parent = pads[Math.floor(hash11(f.seed + p * 7) * Math.min(p, pads.length))];
            const attachAngle =
              (hash11(f.seed + p * 11) * Math.PI * 0.8 + Math.PI * 0.1) *
              (hash11(f.seed + p * 3) > 0.5 ? 1 : -1);
            const scale = 0.6 + hash11(f.seed + p * 17) * 0.3;

            const childRx = parent.rx * scale;
            const childRy = childRx * (0.55 + hash11(f.seed + p * 19) * 0.2);

            // Pear-curve boundary point: R(φ) = 1 + β·cos(φ)
            const R = 1 + bulge * Math.cos(attachAngle + parent.rot);
            const px = parent.cx + parent.rx * R * Math.cos(attachAngle) * 0.85;
            const py = parent.cy + parent.ry * R * Math.sin(attachAngle) * 0.85;

            const childRot = attachAngle + Math.PI + (hash11(f.seed + p * 23) - 0.5) * 0.3;

            pads.push({ cx: px, cy: py, rx: childRx, ry: childRy, rot: childRot });
          }

          for (let pi = 0; pi < pads.length; pi++) {
            const pad = pads[pi];
            const padBulge = bulge + hash11(f.seed + pi * 29) * 0.05;
            const padSamples = 14;

            // Pad shape: R(φ) = 1 + β·cos(φ)
            ctx.beginPath();
            for (let i = 0; i <= padSamples; i++) {
              const phi = (i / padSamples) * Math.PI * 2;
              const R = 1 + padBulge * Math.cos(phi);
              const lx = pad.rx * R * Math.cos(phi);
              const ly = pad.ry * R * Math.sin(phi);
              const rx2 = lx * Math.cos(pad.rot) - ly * Math.sin(pad.rot);
              const ry2 = lx * Math.sin(pad.rot) + ly * Math.cos(pad.rot);
              const px = pad.cx + rx2;
              const py = pad.cy + ry2;
              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fillStyle = `hsla(${108 + pi * 5}, 40%, ${18 + pi * 3}%, 1)`;
            ctx.fill();
            ctx.strokeStyle = `hsla(${100 + pi * 5}, 30%, ${10 + pi * 2}%, 0.5)`;
            ctx.lineWidth = 0.8;
            ctx.stroke();

            // Golden-angle phyllotaxis areole placement
            const areoleCount = Math.max(4, Math.floor(pad.rx * 0.5));
            for (let a = 0; a < areoleCount; a++) {
              const phi = hash11(f.seed + pi * 100 + a * 7) * Math.PI * 2 + a * GOLDEN_ANGLE;
              const rho = 0.15 + 0.75 * Math.sqrt((a + 0.5) / areoleCount);
              const R = 1 + padBulge * Math.cos(phi);
              const lx = pad.rx * rho * R * Math.cos(phi);
              const ly = pad.ry * rho * R * Math.sin(phi);
              const rx2 = lx * Math.cos(pad.rot) - ly * Math.sin(pad.rot);
              const ry2 = lx * Math.sin(pad.rot) + ly * Math.cos(pad.rot);

              ctx.beginPath();
              ctx.arc(pad.cx + rx2, pad.cy + ry2, 1.0, 0, Math.PI * 2);
              ctx.fillStyle = 'rgba(180, 160, 100, 0.3)';
              ctx.fill();
            }
          }
        } else if (f.type === 'yucca') {
          const stemSway = sway * 0.4;
          ctx.beginPath();
          ctx.moveTo(baseX, baseY);
          ctx.quadraticCurveTo(
            baseX + stemSway * 0.3,
            baseY - f.height * 0.6,
            baseX + stemSway,
            baseY - f.height
          );
          ctx.strokeStyle = '#2a2515';
          ctx.lineWidth = 3;
          ctx.stroke();

          const leaves = 8;
          const headX = baseX + stemSway;
          const headY = baseY - f.height;
          for (let l = 0; l < leaves; l++) {
            const angle = (l / leaves) * Math.PI * 2 + scrollRef.current * 0.0002;
            const leafLen = f.width * (0.5 + hash11(f.seed + l) * 0.3);
            const leafDroop = Math.sin(angle) * 0.4;
            const lx = headX + Math.cos(angle) * leafLen;
            const ly = headY + Math.sin(angle) * leafLen * 0.4 + leafDroop * leafLen;

            ctx.beginPath();
            ctx.moveTo(headX, headY);
            ctx.quadraticCurveTo(
              headX + Math.cos(angle) * leafLen * 0.5,
              headY + Math.sin(angle) * leafLen * 0.2 - 5,
              lx,
              ly
            );
            ctx.strokeStyle = `hsla(75, 30%, ${15 + hash11(f.seed + l) * 10}%, 1)`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }

          const bloomOpen = Math.sin(scrollRef.current * 0.0005 + f.seed) * 0.3 + 0.7;
          ctx.beginPath();
          ctx.arc(headX, headY - 3, 4 * bloomOpen, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(50, 70%, 80%, ${0.4 * bloomOpen})`;
          ctx.fill();
        } else if (f.type === 'desertgrass') {
          const blades = 4 + Math.floor(hash11(f.seed) * 4);
          for (let b = 0; b < blades; b++) {
            const bx = baseX + (b / blades) * f.width - f.width * 0.5;
            const bladeSway = sway * (0.5 + hash11(f.seed + b) * 0.5);
            const bladeH = f.height * (0.4 + hash11(f.seed + b * 3) * 0.6);
            ctx.beginPath();
            ctx.moveTo(bx, baseY);
            ctx.quadraticCurveTo(
              bx + bladeSway * 0.5,
              baseY - bladeH * 0.5,
              bx + bladeSway,
              baseY - bladeH
            );
            ctx.strokeStyle = `hsla(35, 35%, ${18 + hash11(f.seed + b) * 10}%, 1)`;
            ctx.lineWidth = 1 + hash11(f.seed + b * 2) * 1.2;
            ctx.stroke();
          }
        } else if (f.type === 'tumbleweed') {
          const bounce = Math.abs(Math.sin(scrollRef.current * 0.003 + f.seed)) * 20;
          const twX = baseX;
          const twY = baseY - 10 - bounce;
          const twR = f.width * 0.5;

          ctx.beginPath();
          ctx.arc(twX, twY, twR, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(80, 60, 30, 0.3)';
          ctx.fill();

          for (let b = 0; b < 8; b++) {
            const ba = (b / 8) * Math.PI * 2 + scrollRef.current * 0.002 + f.seed;
            const br1 = twR * (0.6 + hash11(f.seed + b) * 0.4);
            const br2 = twR * (0.6 + hash11(f.seed + b * 3) * 0.4);
            ctx.beginPath();
            ctx.moveTo(twX + Math.cos(ba) * br1, twY + Math.sin(ba) * br1);
            ctx.lineTo(twX + Math.cos(ba + 1) * br2, twY + Math.sin(ba + 1) * br2);
            ctx.strokeStyle = 'rgba(100, 75, 40, 0.35)';
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        ctx.restore();
      }
    };

    const drawFauna = (w: number) => {
      for (const c of fauna) {
        const t = scrollRef.current;

        if (c.type === 'hawk') {
          const hx = (c.x + t * c.speed * 0.04) % (w * 1.5);
          const hy = c.y + Math.sin(t * 0.0008 + c.phase) * c.drift;
          const wing = Math.sin(t * 0.005 * c.speed + c.phase) * 10;
          const soar = Math.sin(t * 0.001 + c.phase * 2) * 5;

          ctx.beginPath();
          ctx.moveTo(hx - c.size * 4, hy + wing + soar);
          ctx.quadraticCurveTo(hx - c.size * 1.5, hy - Math.abs(wing) * 0.2 + soar, hx, hy + soar);
          ctx.quadraticCurveTo(
            hx + c.size * 1.5,
            hy - Math.abs(wing) * 0.2 + soar,
            hx + c.size * 4,
            hy + wing + soar
          );
          ctx.fillStyle = 'rgba(50, 30, 20, 0.4)';
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(hx, hy + soar);
          ctx.lineTo(hx - 1, hy + c.size * 0.8 + soar);
          ctx.lineTo(hx + 1, hy + c.size * 0.8 + soar);
          ctx.closePath();
          ctx.fillStyle = 'rgba(50, 30, 20, 0.35)';
          ctx.fill();
        } else if (c.type === 'vulture') {
          const vx = (c.x + t * c.speed * 0.03) % (w * 1.8);
          const vy = c.y + Math.sin(t * 0.0005 + c.phase) * c.drift;
          const wing = Math.sin(t * 0.003 * c.speed + c.phase) * 12;
          const tilt = Math.sin(t * 0.0007 + c.phase * 3) * 0.1;

          ctx.save();
          ctx.translate(vx, vy);
          ctx.rotate(tilt);
          ctx.beginPath();
          ctx.moveTo(-c.size * 5, wing * 0.5);
          ctx.quadraticCurveTo(-c.size * 2, -Math.abs(wing) * 0.15, 0, 0);
          ctx.quadraticCurveTo(c.size * 2, -Math.abs(wing) * 0.15, c.size * 5, wing * 0.5);
          ctx.strokeStyle = 'rgba(30, 20, 15, 0.25)';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(-c.size * 5, wing * 0.5);
          ctx.lineTo(-c.size * 6, wing * 0.5 + 3);
          ctx.strokeStyle = 'rgba(30, 20, 15, 0.2)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(c.size * 5, wing * 0.5);
          ctx.lineTo(c.size * 6, wing * 0.5 + 3);
          ctx.stroke();
          ctx.restore();
        } else if (c.type === 'rabbit') {
          const rx = (c.x + t * c.speed * 0.06) % (w * 1.5);
          const hopPhase = Math.sin(t * 0.004 * c.speed + c.phase);
          const hopY = hopPhase > 0.3 ? Math.sin((hopPhase - 0.3) * 3.14) * 15 : 0;
          const ry = c.y - hopY;

          ctx.save();
          ctx.globalAlpha = 0.3;
          ctx.beginPath();
          ctx.ellipse(rx, ry, c.size * 1.2, c.size * 0.8, 0, 0, Math.PI * 2);
          ctx.fillStyle = '#3a2a1a';
          ctx.fill();

          ctx.beginPath();
          ctx.ellipse(
            rx + c.size * 0.8,
            ry - c.size * 0.3,
            c.size * 0.4,
            c.size * 0.35,
            0.2,
            0,
            Math.PI * 2
          );
          ctx.fill();

          ctx.beginPath();
          ctx.ellipse(
            rx + c.size * 0.6,
            ry - c.size * 0.9,
            1.2,
            c.size * 0.5,
            -0.1,
            0,
            Math.PI * 2
          );
          ctx.fillStyle = '#4a3a2a';
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(
            rx + c.size * 1.0,
            ry - c.size * 0.85,
            1.2,
            c.size * 0.45,
            0.1,
            0,
            Math.PI * 2
          );
          ctx.fill();

          const tailBob = Math.sin(t * 0.006 + c.phase) * 2;
          ctx.beginPath();
          ctx.arc(rx - c.size * 1.1, ry - c.size * 0.2 + tailBob, c.size * 0.35, 0, Math.PI * 2);
          ctx.fillStyle = '#6a5a4a';
          ctx.fill();

          ctx.restore();
        }
      }
    };

    const drawGroundHaze = (w: number, h: number) => {
      const hazeY = h * 0.8;
      const grad = ctx.createLinearGradient(0, hazeY - 30, 0, h);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.4, 'rgba(90, 60, 30, 0.15)');
      grad.addColorStop(1, 'rgba(50, 30, 15, 0.5)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, hazeY - 30, w, h - hazeY + 30);
    };

    const render = (timestamp: number) => {
      const dt = lastTime ? timestamp - lastTime : 16;
      lastTime = timestamp;
      scrollRef.current += dt * 0.06;

      const vs = stateRef.current;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio, 2);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      drawSky(w, h, vs);
      drawStars(w, h, vs);
      drawTerrain(w, h, vs);
      drawFauna(w);
      drawFlora(w, h, vs);
      drawGroundHaze(w, h);

      rafRef.current = requestAnimationFrame(render);
    };

    resize();
    window.addEventListener('resize', resize);
    rafRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <Container>
      <Canvas ref={canvasRef} />
    </Container>
  );
};

export default GaussianBackground;
