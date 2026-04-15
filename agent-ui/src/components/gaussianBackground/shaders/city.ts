// WGSL background shader — WebGPU rendering path
// Layout must stay in sync with gpuRender.ts UniformBuffer layout

export const wgslCommon = `
struct Uniforms {
  time: f32,
  resolution: vec2f,
  timeOfDay: f32,
  activity: f32,
  energy: f32,
  alert: f32,
  progress: f32,
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
`;

export const wgslVertex = `
@vertex
fn vertexMain(@builtin(vertex_index) vertexIndex: u32) -> @builtin(position) vec4f {
  let pos = array<vec2f, 3>(vec2f(-1.0, -1.0), vec2f(3.0, -1.0), vec2f(-1.0, 3.0));
  return vec4f(pos[vertexIndex], 0.0, 1.0);
}
`;

export const wgslFragmentHeader = `
${wgslCommon}

fn hash(p: vec2f) -> f32 {
  return fract(sin(dot(p, vec2f(127.1, 311.7))) * 43758.5453123);
}

fn hash1(n: f32) -> f32 {
  return fract(sin(n * 127.1) * 43758.5453123);
}

fn noise(p: vec2f) -> f32 {
  let i = floor(p);
  let f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2f(1.0, 0.0)), f.x),
    mix(hash(i + vec2f(0.0, 1.0)), hash(i + vec2f(1.0, 1.0)), f.x),
    f.y
  );
}

fn fbm(p: vec2f) -> f32 {
  var v: f32 = 0.0;
  var a: f32 = 0.5;
  let rot = mat2x2f(0.8, -0.6, 0.6, 0.8);
  for (var i: i32 = 0; i < 5; i = i + 1) {
    v = v + a * noise(p);
    p = rot * p * 2.0 + vec2f(100.0, 100.0);
    a = a * 0.5;
  }
  return v;
}

struct Palette {
  sky: vec3f,
  fog: vec3f,
  ambient: vec3f,
  sunCol: vec3f,
  neonIntensity: f32,
  rainIntensity: f32,
};

fn getTimePalette(tod: f32, prog: f32) -> Palette {
  var p: Palette;
  let dawnMix = (1.0 - smoothstep(0.3, 0.8, prog)) * 0.0 + smoothstep(0.3, 0.8, prog);

  if (tod < 0.2) {
    let t = tod / 0.2;
    p.sky = mix(vec3f(0.01, 0.01, 0.06), vec3f(0.02, 0.02, 0.08), t);
    p.fog = mix(vec3f(0.005, 0.005, 0.03), vec3f(0.01, 0.01, 0.05), t);
    p.ambient = vec3f(0.01, 0.01, 0.04);
    p.sunCol = vec3f(0.02, 0.02, 0.08);
    p.neonIntensity = 1.0;
    p.rainIntensity = 0.8 * (1.0 - t) * (1.0 - dawnMix * 0.5);
  } else if (tod < 0.3) {
    let t = (tod - 0.2) / 0.1;
    p.sky = mix(vec3f(0.02, 0.02, 0.08), vec3f(0.35, 0.12, 0.05), t);
    p.fog = mix(vec3f(0.01, 0.01, 0.05), vec3f(0.15, 0.06, 0.03), t);
    p.ambient = mix(vec3f(0.015, 0.01, 0.05), vec3f(0.2, 0.08, 0.04), t);
    p.sunCol = mix(vec3f(0.02, 0.02, 0.08), vec3f(0.9, 0.4, 0.15), t);
    p.neonIntensity = mix(1.0, 0.2, t);
    p.rainIntensity = mix(0.8, 0.0, t);
  } else if (tod < 0.5) {
    let t = (tod - 0.3) / 0.2;
    p.sky = mix(vec3f(0.35, 0.12, 0.05), vec3f(0.25, 0.22, 0.18), t);
    p.fog = mix(vec3f(0.15, 0.06, 0.03), vec3f(0.12, 0.1, 0.08), t);
    p.ambient = mix(vec3f(0.2, 0.08, 0.04), vec3f(0.35, 0.3, 0.22), t);
    p.sunCol = mix(vec3f(0.9, 0.4, 0.15), vec3f(1.0, 0.9, 0.7), t);
    p.neonIntensity = 0.05;
    p.rainIntensity = 0.0;
  } else if (tod < 0.7) {
    let t = (tod - 0.5) / 0.2;
    p.sky = mix(vec3f(0.25, 0.22, 0.18), vec3f(0.4, 0.15, 0.05), t);
    p.fog = mix(vec3f(0.12, 0.1, 0.08), vec3f(0.2, 0.08, 0.03), t);
    p.ambient = mix(vec3f(0.35, 0.3, 0.22), vec3f(0.4, 0.2, 0.1), t);
    p.sunCol = mix(vec3f(1.0, 0.9, 0.7), vec3f(1.0, 0.5, 0.1), t);
    p.neonIntensity = mix(0.05, 0.5, t);
    p.rainIntensity = 0.0;
  } else if (tod < 0.85) {
    let t = (tod - 0.7) / 0.15;
    p.sky = mix(vec3f(0.4, 0.15, 0.05), vec3f(0.06, 0.02, 0.12), t);
    p.fog = mix(vec3f(0.2, 0.08, 0.03), vec3f(0.03, 0.01, 0.06), t);
    p.ambient = mix(vec3f(0.4, 0.2, 0.1), vec3f(0.04, 0.02, 0.08), t);
    p.sunCol = mix(vec3f(1.0, 0.5, 0.1), vec3f(0.03, 0.02, 0.08), t);
    p.neonIntensity = mix(0.5, 1.0, t);
    p.rainIntensity = mix(0.0, 0.5, t) * (1.0 - dawnMix * 0.3);
  } else {
    let t = (tod - 0.85) / 0.15;
    p.sky = mix(vec3f(0.06, 0.02, 0.12), vec3f(0.01, 0.01, 0.06), t);
    p.fog = mix(vec3f(0.03, 0.01, 0.06), vec3f(0.005, 0.005, 0.03), t);
    p.ambient = vec3f(0.01, 0.01, 0.04);
    p.sunCol = vec3f(0.02, 0.02, 0.08);
    p.neonIntensity = 1.0;
    p.rainIntensity = mix(0.5, 0.8, t) * (1.0 - dawnMix * 0.3);
  }

  p.sky = mix(p.sky, p.sky + vec3f(0.03, 0.02, 0.01) * dawnMix, 0.5);
  return p;
}

fn getNeonColor(id: f32) -> vec3f {
  let h = hash(vec2f(id * 7.3, id * 13.1));
  if (h < 0.2) { return vec3f(0.0, 0.85, 1.0); }
  if (h < 0.4) { return vec3f(1.0, 0.1, 0.4); }
  if (h < 0.6) { return vec3f(0.2, 1.0, 0.4); }
  if (h < 0.8) { return vec3f(0.8, 0.2, 1.0); }
  return vec3f(1.0, 0.5, 0.05);
}

fn getNeonFlicker(id: f32, t: f32, energy: f32) -> f32 {
  let rate = 3.7 + energy * 8.0;
  let f1 = step(0.92, sin(t * rate + id * 5.3));
  let f2 = step(0.95, sin(t * rate * 3.0 + id * 8.1));
  let f3 = step(0.88, sin(t * rate * 2.1 + id * 3.7));
  return 1.0 - (f1 * 0.3 + f2 * 0.4 + f3 * 0.2);
}

fn doRain(uv: vec2f, t: f32, intensity: f32, alert: f32) -> f32 {
  var r: f32 = 0.0;
  for (var i: f32 = 0.0; i < 6.0; i = i + 1.0) {
    let speed = 3.0 + i * 0.8;
    let wind = 0.025 * (i + 1.0) + alert * 0.02;
    let rp = uv * vec2f(0.25, 8.0) + vec2f(wind * t, -speed * t);
    let dropCenter = abs(fract(rp.x + i * 0.37) - 0.5);
    var drop: f32 = 1.0 - (1.0 - smoothstep(0.47, 0.49, dropCenter)) * (1.0 - smoothstep(0.0, 0.02, dropCenter));
    drop = (1.0 - smoothstep(0.02, 0.49, dropCenter)) * (1.0 - smoothstep(0.0, 0.02, dropCenter));
    let y = fract(rp.y);
    let trail = (1.0 - smoothstep(0.0, 0.1, y)) * (1.0 - smoothstep(0.06, 0.14, y));
    drop = drop * trail;
    r = r + drop;
  }
  return r * intensity * 0.3;
}

fn rainSplash(uv: vec2f, t: f32, intensity: f32) -> f32 {
  var s: f32 = 0.0;
  for (var i: f32 = 0.0; i < 4.0; i = i + 1.0) {
    let sp = uv * vec2f(1.5, 0.3) + vec2f(i * 0.7 + sin(t * 0.5 + i) * 0.1, t * 0.3);
    let splash = 1.0 - smoothstep(0.0, 0.03, length(fract(sp) - vec2f(0.5, 0.5)));
    s = s + splash * intensity;
  }
  return s * 0.15;
}

fn flyingLights(p: vec2f, t: f32, cameraX: f32, activity: f32) -> f32 {
  var lights: f32 = 0.0;
  let count = 3.0 + activity * 5.0;
  for (var i: f32 = 0.0; i < 8.0; i = i + 1.0) {
    if (i >= count) { break; }
    let laneY = 0.5 + i * 0.07;
    let speed = 0.08 + i * 0.03 + activity * 0.04;
    let xPos = fract(cameraX * 0.5 * speed + i * 0.6 + t * speed + 1.5) - 1.5;
    let lightPos = vec2f(xPos, laneY + sin(t * 0.3 + i * 2.0) * 0.02);
    let dist = length(p - lightPos);
    let light = 1.0 - smoothstep(0.004, 0.015, dist);
    let glow = exp(-dist * 60.0) * 0.4;
    let blink = 0.7 + 0.3 * sin(t * 5.0 + i * 3.0);
    lights = lights + (light + glow) * blink;
  }
  return lights;
}

fn emberParticle(uv: vec2f, t: f32, id: f32, energy: f32) -> f32 {
  let start = vec2f(hash(vec2f(id, 0.0)) * 2.0 - 1.0, -0.3);
  let speed = 0.05 + hash(vec2f(id, 1.0)) * 0.05 + energy * 0.08;
  let pos = start + vec2f(sin(t * 0.3 + id) * 0.1, fract(t * speed) * 1.2);
  let d = length(uv - vec2f(0.5, 0.5) - pos * 0.5);
  let flicker = 0.5 + 0.5 * sin(t * 8.0 + id * 5.0);
  return (1.0 - smoothstep(0.002, 0.008, d)) * flicker * 0.5;
}

fn dustParticles(uv: vec2f, t: f32) -> f32 {
  var dust: f32 = 0.0;
  for (var i: f32 = 0.0; i < 8.0; i = i + 1.0) {
    var dp = vec2f(
      hash(vec2f(i, 0.0)) * 2.0 - 1.0,
      hash(vec2f(i, 1.0)) * 0.4 - 0.2
    );
    dp.x = dp.x + sin(t * 0.1 + i) * 0.02;
    dp.y = dp.y + t * 0.01 * hash(vec2f(i, 2.0));
    let d = length(uv - vec2f(0.5, 0.5) - dp);
    dust = dust + (1.0 - smoothstep(0.005, 0.015, d)) * 0.15;
  }
  return dust;
}

fn acesTonemap(x: vec3f) -> vec3f {
  return clamp((x * (2.51 * x + vec3f(0.03))) / (x * (2.43 * x + vec3f(0.59)) + vec3f(0.14)), vec3f(0.0), vec3f(1.0));
}
`;

export const wgslColorFn = `
fn getNeonColor(id: f32) -> vec3f {
  let h = hash(vec2f(id * 7.3, id * 13.1));
  if (h < 0.2) { return vec3f(0.0, 0.85, 1.0); }
  if (h < 0.4) { return vec3f(1.0, 0.1, 0.4); }
  if (h < 0.6) { return vec3f(0.2, 1.0, 0.4); }
  if (h < 0.8) { return vec3f(0.8, 0.2, 1.0); }
  return vec3f(1.0, 0.5, 0.05);
}

fn getNeonFlicker(id: f32, t: f32, energy: f32) -> f32 {
  let rate = 3.7 + energy * 8.0;
  let f1 = step(0.92, sin(t * rate + id * 5.3));
  let f2 = step(0.95, sin(t * rate * 3.0 + id * 8.1));
  let f3 = step(0.88, sin(t * rate * 2.1 + id * 3.7));
  return 1.0 - (f1 * 0.3 + f2 * 0.4 + f3 * 0.2);
}
`;

export const wgslMain = `
@fragment
fn fragmentMain(@builtin(position) pos: vec4f) -> @location(0) vec4f {
  let uv = pos.xy / uniforms.resolution;
  let p = (2.0 * pos.xy - uniforms.resolution) / uniforms.resolution.y;
  let aspect = uniforms.resolution.x / uniforms.resolution.y;

  let t = uniforms.time;
  let tod = uniforms.timeOfDay;
  let activity = uniforms.activity;
  let energy = uniforms.energy;
  let alert = uniforms.alert;
  let progress = uniforms.progress;

  var col: vec3f = vec3f(0.01, 0.01, 0.06);

  let pal = getTimePalette(tod, progress);

  let rainMul = 1.0 + alert * 0.6 - progress * 0.3;
  var rainIntensity = clamp(pal.rainIntensity * rainMul, 0.0, 1.0);

  let activityNeonBoost = 0.6 + activity * 0.4;
  var neonIntensity = pal.neonIntensity * activityNeonBoost;

  let lightningTime = fract(t / (40.0 - alert * 20.0)) * (40.0 - alert * 20.0);
  var lightning: f32 = 0.0;
  if ((tod < 0.25 || tod > 0.8) && rainIntensity > 0.2) {
    let lightningProb = 0.3 + alert * 0.7;
    if (lightningTime < 0.1 && hash(vec2f(floor(t / 45.0), 0.0)) < lightningProb) {
      lightning = (1.0 - smoothstep(0.0, 0.1, lightningTime)) * 0.5;
    } else if (lightningTime > 2.0 && lightningTime < 2.15) {
      lightning = (1.0 - smoothstep(0.0, 0.15, lightningTime - 2.0)) * 0.3;
    }
  }

  let horizY = -0.05 + 0.03 * sin(t * 0.02);
  let horizLine = uv.y - (0.5 + horizY * 0.5);

  let fogNoise = fbm(vec2f(uv.x * 3.0 + t * 0.01, uv.y * 0.5 + t * 0.005));
  let fogLayer = (1.0 - smoothstep(-0.1, 0.3, horizLine)) * (0.3 + fogNoise * 0.4);
  let fogDensity = 0.3 + alert * 0.3;
  col = mix(col, pal.fog * 2.0, fogLayer * fogDensity);

  let scrollSpeed = t * 0.015;
  let cameraX = scrollSpeed;

  var neonEmit = vec3f(0.0);
  var windowEmit = vec3f(0.0);

  // --- FAR CITY LAYER ---
  {
    let scrollFar = cameraX * 0.3;
    let farCount = 25.0 + activity * 15.0;

    for (var i: f32 = 0.0; i < 40.0; i = i + 1.0) {
      if (i >= farCount) { break; }
      var bx = (i / farCount - 0.5) * 2.0 * aspect + scrollFar;
      bx = bx - floor(bx / (2.0 * aspect) + 0.5) * (2.0 * aspect);

      let bid = floor(i + floor(cameraX * 0.3 * farCount / (2.0 * aspect)));
      var bh = 0.03 + hash1(bid * 1.7) * 0.12;
      let bw = 0.015 + hash1(bid * 3.1) * 0.03;

      if (hash1(bid * 6.6) > 0.7) { bh = bh * 1.3; }

      let buildingMask = 1.0 - smoothstep(bw - 0.001, bw + 0.001, abs(p.x - bx));
      let bTop = bh;
      let yMask = (1.0 - smoothstep(bTop - 0.001, bTop + 0.001, horizLine)) * step(0.0, horizLine);
      let bMask = buildingMask * yMask;

      let fadeFar = (1.0 - smoothstep(-0.3, 0.0, horizLine)) * 0.4;
      let bCol = mix(vec3f(0.04, 0.04, 0.05), vec3f(0.08, 0.07, 0.09), hash1(bid * 5.3));
      col = mix(col, bCol, bMask * fadeFar);

      let edgeGlow = (1.0 - smoothstep(0.001, 0.003, abs(abs(p.x - bx) - bw))) * yMask;
      let edgeCol = getNeonColor(bid * 3.7) * 0.15;
      neonEmit = neonEmit + edgeCol * edgeGlow * fadeFar * neonIntensity;

      if (hash1(bid * 8.3) > 0.6 && bh > 0.05) {
        if (hash1(bid * 9.1) > 0.5) {
          let antX = bx;
          let antH = bh + 0.02 + hash1(bid * 2.3) * 0.03;
          let antW = 0.002;
          let antMask = 1.0 - smoothstep(antW, antW + 0.001, abs(p.x - antX));
          let antTop = 1.0 - smoothstep(antH - 0.001, antH, horizLine);
          let blink = step(0.5, sin(t * 2.0 + bid)) * 0.5;
          neonEmit = neonEmit + vec3f(1.0, 0.1, 0.1) * antMask * antTop * yMask * fadeFar * blink * neonIntensity;
        }
      }

      let winProb = 0.35 + activity * 0.35;
      if (hash1(bid * 11.3) > (1.0 - winProb) && bh > 0.04) {
        let winRows = floor(bh / 0.008);
        for (var w: f32 = 0.0; w < 6.0; w = w + 1.0) {
          if (w >= winRows) { break; }
          let wy = horizLine - (w * 0.008 + 0.004);
          let winRand = hash1(bid * 100.0 + w);
          let lit = step(0.4, winRand);
          let broken = step(0.85, winRand);
          let winMask = (1.0 - smoothstep(0.001, 0.003, abs(wy))) * buildingMask * lit;
          var winCol = getNeonColor(bid + w * 0.1);
          if (broken > 0.5) { winCol = winCol * 0.5; }
          windowEmit = windowEmit + winCol * winMask * neonIntensity * 0.25 * fadeFar;
        }
      }
    }
  }

  // --- MID CITY LAYER ---
  {
    let scrollMid = cameraX * 0.6;
    let midCount = 15.0 + activity * 10.0;

    for (var i: f32 = 0.0; i < 25.0; i = i + 1.0) {
      if (i >= midCount) { break; }
      var bx = (i / midCount - 0.5) * 2.5 * aspect + scrollMid;
      bx = bx - floor(bx / (2.5 * aspect) + 0.5) * (2.5 * aspect);

      let bid = floor(i + floor(cameraX * 0.6 * midCount / (2.5 * aspect))) + 100.0;
      var bh = 0.06 + hash1(bid * 1.7) * 0.2;
      let bw = 0.02 + hash1(bid * 3.1) * 0.05;

      if (hash1(bid * 7.7) > 0.7) { bh = bh * 1.5; }

      var setback: f32 = 0.0;
      if (hash1(bid * 6.6) > 0.6) {
        setback = bh * 0.3 * (1.0 - smoothstep(bw * 0.4, bw * 0.6, abs(p.x - bx)));
      }

      var taper: f32 = 0.0;
      if (hash1(bid * 4.4) > 0.7) {
        taper = bw * 0.2 * (1.0 - smoothstep(0.0, bh, horizLine));
      }

      let buildingMask = 1.0 - smoothstep(bw - taper - 0.001, bw - taper + 0.001, abs(p.x - bx));
      let bTop = bh + setback;
      let yMask = (1.0 - smoothstep(bTop - 0.002, bTop + 0.002, horizLine)) * step(0.0, horizLine);
      let bMask = buildingMask * yMask;

      let fadeMid = (1.0 - smoothstep(-0.25, 0.05, horizLine)) * 0.7;
      let bCol = mix(vec3f(0.05, 0.05, 0.06), vec3f(0.1, 0.09, 0.11), hash1(bid * 5.3));
      col = mix(col, bCol, bMask * fadeMid);

      let edgeGlow = (1.0 - smoothstep(0.001, 0.003, abs(abs(p.x - bx) - bw))) * yMask;
      let edgeCol = getNeonColor(bid * 2.1) * 0.2;
      neonEmit = neonEmit + edgeCol * edgeGlow * fadeMid * neonIntensity;

      if (bh > 0.12) {
        let ledgeY = bh * 0.4;
        let ledgeMask = (1.0 - smoothstep(0.001, 0.003, abs(horizLine - ledgeY))) * buildingMask;
        col = mix(col, bCol * 1.3, ledgeMask * fadeMid * 0.5);
      }

      if (bh > 0.1 && hash1(bid * 4.4) > 0.5) {
        let roofY = bh + 0.01;
        let roofMask = (1.0 - smoothstep(0.002, 0.008, abs(horizLine - roofY))) * buildingMask;
        col = mix(col, bCol * 1.2, roofMask * fadeMid * 0.6);
      }

      if (hash1(bid * 9.9) > 0.65) {
        let tankY = bh + 0.005;
        let tankW = bw * 0.3;
        let tankX = bx + (hash1(bid * 12.0) - 0.5) * bw * 0.5;
        let tankMask = 1.0 - smoothstep(tankW - 0.001, tankW + 0.001, abs(p.x - tankX));
        let tankTop = (1.0 - smoothstep(tankY, tankY + 0.015, horizLine)) * step(tankY, horizLine);
        col = mix(col, vec3f(0.04, 0.04, 0.05), tankMask * tankTop * yMask * fadeMid * 0.7);
      }

      if (bh > 0.05) {
        let winSpacing = 0.012;
        let winRows = floor(bh / winSpacing);
        for (var w: f32 = 0.0; w < 10.0; w = w + 1.0) {
          if (w >= winRows) { break; }
          let wy = horizLine - (w * winSpacing + winSpacing * 0.5);
          let winRand = hash1(bid * 100.0 + w);
          let lit = step(0.4, winRand);
          let broken = step(0.88, winRand);
          let flickering = step(0.92, sin(t * (4.0 + energy * 6.0) + bid + w)) * step(0.7, winRand);
          let winXMask = 1.0 - smoothstep(bw * 0.15, bw * 0.3, abs(p.x - bx));
          let winMask = (1.0 - smoothstep(0.001, 0.003, abs(wy))) * winXMask * lit;
          var winCol = getNeonColor(bid + w);
          if (broken > 0.5) { winCol = winCol * 0.6; }
          let pulse = 0.7 + 0.3 * sin(t * 1.5 + bid + w * 0.7);
          let flickerMod = 1.0 - flickering * 0.7;
          windowEmit = windowEmit + winCol * winMask * neonIntensity * 0.4 * fadeMid * pulse * flickerMod;
        }
      }

      if (hash1(bid * 9.3) > 0.55 && bh > 0.08) {
        let signY = horizLine - bh * 0.65;
        let signH = 1.0 - smoothstep(0.003, 0.012, abs(horizLine - (horizLine - signY)));
        let signW = 1.0 - smoothstep(bw * 0.5, bw * 0.9, abs(p.x - bx));
        let signMask = signH * signW * buildingMask;
        let signCol = getNeonColor(bid + 0.5);
        let flicker = getNeonFlicker(bid + 0.5, t, energy);
        let pulse = 0.6 + 0.4 * sin(t * 2.0 + bid * 1.7);
        neonEmit = neonEmit + signCol * signMask * neonIntensity * 1.5 * fadeMid * pulse * flicker;

        let spillDist = 0.1;
        let spill = (1.0 - smoothstep(0.0, spillDist, abs(horizLine - signY)))
                    * (1.0 - smoothstep(bw * 0.5, bw * 1.5, abs(p.x - bx)))
                    * buildingMask;
        neonEmit = neonEmit + signCol * spill * neonIntensity * 0.2 * fadeMid * pulse * flicker;

        let shaftWidth = bw * 2.0;
        var shaft: vec3f = (1.0 - smoothstep(0.0, shaftWidth, abs(p.x - bx)))
                    * (1.0 - smoothstep(0.0, 0.15, signY - horizLine))
                    * signCol;
        let shaftNoise = fbm(vec2f(p.x * 8.0 + t * 0.1, signY * 5.0));
        shaft = shaft * shaftNoise * neonIntensity * 0.05 * fadeMid * flicker;
        neonEmit = neonEmit + shaft;
      }
    }
  }

  // --- NEAR LAYER ---
  {
    let scrollNear = cameraX * 1.0;

    for (var i: f32 = 0.0; i < 8.0; i = i + 1.0) {
      var bx = (i / 8.0 - 0.5) * 3.0 * aspect + scrollNear;
      bx = bx - floor(bx / (3.0 * aspect) + 0.5) * (3.0 * aspect);

      let bid = floor(i + floor(cameraX * 1.0 * 8.0 / (3.0 * aspect))) + 200.0;

      if (hash1(bid * 2.1) > 0.5) {
        let bh = 0.3 + hash1(bid * 4.1) * 0.4;
        let bw = 0.04 + hash1(bid * 5.1) * 0.06;
        let bMask = 1.0 - smoothstep(bw - 0.002, bw + 0.002, abs(p.x - bx));
        let yMask = (1.0 - smoothstep(bh - 0.003, bh, horizLine)) * step(0.0, horizLine);
        col = mix(col, vec3f(0.02, 0.02, 0.03), bMask * yMask * 0.9);

        let edgeGlow = (1.0 - smoothstep(0.001, 0.003, abs(abs(p.x - bx) - bw))) * yMask;
        let edgeCol = getNeonColor(bid * 1.3) * 0.25;
        neonEmit = neonEmit + edgeCol * edgeGlow * neonIntensity;
      }
    }

    {
      let ax = p.x + 0.85;
      let aw = 0.28;
      let ah = 0.4;
      let archMask = 1.0 - smoothstep(aw - 0.004, aw + 0.004, abs(ax));
      let archTop = (1.0 - smoothstep(0.0, ah, horizLine)) * step(-ah, horizLine);
      let innerW = 1.0 - smoothstep(aw - 0.09, aw - 0.08, abs(ax));
      let innerH = step(horizLine + ah * 0.35, 0.0);
      let arch = archMask * archTop * (1.0 - innerW * innerH * 0.85);
      col = mix(col, vec3f(0.03, 0.03, 0.04), arch * 0.9);

      let edgeOuter = (1.0 - smoothstep(0.004, 0.012, abs(ax - (aw - 0.05)))) * archTop;
      let edgeInner = (1.0 - smoothstep(0.002, 0.008, abs(ax - (aw - 0.08)))) * archTop;
      let edgeCol = getNeonColor(500.0);
      neonEmit = neonEmit + edgeCol * edgeOuter * neonIntensity * 0.5;
      neonEmit = neonEmit + edgeCol * edgeInner * neonIntensity * 0.3;

      let wispNoise = fbm(vec2f(ax * 2.0 + t * 0.05, horizLine * 3.0));
      let wisp = (1.0 - smoothstep(-0.1, 0.1, horizLine + ah * 0.3)) * wispNoise * 0.15;
      col = mix(col, pal.fog * 2.0, wisp * archTop);
    }

    {
      let cx = p.x - 1.0;
      let cw = 0.045;
      let colMask = 1.0 - smoothstep(cw - 0.002, cw + 0.002, abs(cx));
      let colH = (1.0 - smoothstep(0.0, 0.65, horizLine)) * step(-0.65, horizLine);
      col = mix(col, vec3f(0.03, 0.03, 0.04), colMask * colH * 0.9);

      let groove = (1.0 - smoothstep(0.005, 0.01, abs(abs(cx) - cw * 0.5))) * colH;
      col = mix(col, vec3f(0.025, 0.025, 0.035), groove * 0.3);

      let capY = horizLine + 0.65;
      let capMask = (1.0 - smoothstep(0.003, 0.01, abs(capY))) * (1.0 - smoothstep(cw * 0.8, cw * 1.5, abs(cx)));
      col = mix(col, vec3f(0.04, 0.04, 0.05), capMask * 0.8);

      let trimGlow = (1.0 - smoothstep(0.002, 0.006, abs(capY - 0.02))) * (1.0 - smoothstep(cw * 0.5, cw * 1.2, abs(cx)));
      let trimCol = getNeonColor(501.0);
      neonEmit = neonEmit + trimCol * trimGlow * neonIntensity * 0.4;
    }
  }

  col = col + neonEmit * 0.6 + windowEmit * 0.4;

  // --- GROUND ---
  let groundFade = 1.0 - smoothstep(-0.4, 0.0, horizLine);
  if (horizLine < 0.0) {
    let gridX = fract(p.x * 2.0 + cameraX * 2.0);
    let gridZ = fract(horizLine * 8.0);
    let grid = (1.0 - smoothstep(0.97, 1.0, gridX)) + (1.0 - smoothstep(0.97, 1.0, gridZ));
    let gridCol = mix(pal.ambient, vec3f(0.0, 0.4, 0.6), 0.3) * neonIntensity * 0.2;
    col = col + gridCol * grid * groundFade * 0.4;

    if (rainIntensity > 0.1) {
      var puddle = fbm(vec2f(p.x * 3.0 + t * 0.01, horizLine * 4.0 + t * 0.02));
      puddle = (1.0 - smoothstep(0.4, 0.6, puddle)) * groundFade;

      let reflGrid = grid * puddle * rainIntensity;
      let reflCol = mix(vec3f(0.0, 0.3, 0.5), vec3f(0.4, 0.0, 0.4), sin(t * 0.1) * 0.5 + 0.5);
      col = col + reflCol * reflGrid * 0.3;

      let wetSheen = fbm(vec2f(p.x * 2.0 + t * 0.03, t * 0.02));
      col = col + pal.fog * wetSheen * puddle * rainIntensity * 0.2;
    }

    if (rainIntensity > 0.15) {
      var ripples: f32 = 0.0;
      for (var ri: f32 = 0.0; ri < 4.0; ri = ri + 1.0) {
        let rippleCenter = vec2f(hash(vec2f(ri, 0.0)) * 2.0 - 1.0, -0.2 - ri * 0.1);
        let rippleTime = fract(t * 0.5 + ri * 1.3) * 3.0;
        let rippleRadius = rippleTime * 0.15;
        let d = length(p - rippleCenter);
        let ripple = (1.0 - smoothstep(0.0, 0.01, abs(d - rippleRadius)))
                     * (1.0 - smoothstep(0.0, 0.1, rippleTime))
                     * (1.0 - smoothstep(0.3, 0.5, rippleTime));
        ripples = ripples + ripple * groundFade;
      }
      col = col + vec3f(0.1, 0.15, 0.2) * ripples * rainIntensity * 0.3;
    }
  }

  let depthHaze = (1.0 - smoothstep(-0.3, 0.0, horizLine)) * (0.2 + alert * 0.15);
  col = mix(col, pal.fog * 1.5, depthHaze);

  if (horizLine < 0.1 && horizLine > -0.2) {
    var fogWisp = fbm(vec2f(p.x * 1.5 + t * 0.02, t * 0.01));
    fogWisp = (1.0 - smoothstep(0.3, 0.7, fogWisp)) * (1.0 - smoothstep(-0.1, 0.1, horizLine)) * 0.15;
    col = mix(col, pal.fog * 2.0, fogWisp);
  }

  if (rainIntensity > 0.01) {
    let rainAmt = doRain(uv, t, rainIntensity, alert);
    col = col + vec3f(0.15, 0.18, 0.25) * rainAmt;

    if (horizLine < 0.0) {
      let splash = rainSplash(uv, t, rainIntensity);
      col = col + vec3f(0.1, 0.12, 0.15) * splash * groundFade;
    }
  }

  if (neonIntensity > 0.3) {
    let flyLights = flyingLights(p, t, cameraX, activity);
    let flyCol = mix(vec3f(1.0, 0.3, 0.3), vec3f(0.3, 0.8, 1.0), sin(t * 0.1) * 0.5 + 0.5);
    col = col + flyCol * flyLights * neonIntensity * 0.5;
  }

  let emberCount = 3.0 + energy * 8.0;
  for (var i: f32 = 0.0; i < 11.0; i = i + 1.0) {
    if (i >= emberCount) { break; }
    let embers = emberParticle(uv, t, i, energy);
    var emberCol = mix(vec3f(1.0, 0.4, 0.1), vec3f(0.8, 0.2, 0.2), hash1(floor(t)));
    let timeFade: f32 = (tod > 0.6 || energy > 0.2) ? 1.0 : 0.0;
    col = col + emberCol * embers * timeFade;
  }

  if (horizLine < 0.15 && horizLine > -0.15) {
    let dust = dustParticles(uv, t);
    col = col + vec3f(0.3, 0.25, 0.2) * dust * 0.1;
  }

  if (neonIntensity > 0.2) {
    let neonBleed = exp(-abs(horizLine) * 2.5) * neonIntensity;
    var bleedCol = mix(
      vec3f(0.0, 0.5, 0.8),
      vec3f(0.6, 0.1, 0.7),
      sin(t * 0.05) * 0.5 + 0.5
    );
    bleedCol = mix(bleedCol, bleedCol * vec3f(1.0, 0.3, 0.3), alert);
    col = col + bleedCol * neonBleed * 0.08;
  }

  if (tod < 0.25 || tod > 0.8) {
    let nightFade = tod < 0.25 ? 1.0 - tod / 0.25 : (tod - 0.8) / 0.2;
    let starCoord = floor(pos.xy / 1.5);
    let starHash = hash(starCoord);
    let starField = step(0.997, starHash);
    let twinkle = 0.5 + 0.5 * sin(t * 3.0 + starHash * 6.28);
    col = col + starField * vec3f(0.6, 0.7, 1.0) * nightFade * twinkle * 0.6 * step(0.0, horizLine);
  }

  col = col + vec3f(0.8, 0.85, 1.0) * lightning;

  let vig = uv - vec2f(0.5, 0.5);
  let vignette = 1.0 - dot(vig, vig) * 0.8;
  col = col * vignette;

  let bloom = neonEmit * 0.18 + windowEmit * 0.12;
  col = col + bloom * 0.3;

  col = acesTonemap(col);

  col = pow(col, vec3f(0.92));

  let shadowTint = vec3f(0.85, 0.95, 1.05);
  let highlightTint = vec3f(1.05, 0.98, 0.92);
  let lum = dot(col, vec3f(0.299, 0.587, 0.114));
  col = col * mix(shadowTint, highlightTint, (1.0 - smoothstep(0.2, 0.8, lum)));

  col = mix(col, col * vec3f(1.0, 0.7, 0.7), alert * 0.3);

  let aberration = length(vig) * 0.02;
  let colR = col * (1.0 + aberration);
  let colB = col * (1.0 - aberration);
  col = vec3f(colR.r, col.g, colB.b);

  let grainCoord = pos.xy + vec2f(floor(t * 24.0) * 7.13, floor(t * 24.0) * 11.31);
  let grain = (hash(grainCoord) - 0.5) * 0.04;
  col = col + vec3f(grain);

  return vec4f(col, 1.0);
}
`;

export function getWGSLFragmentShader(): string {
  return `${wgslFragmentHeader}
${wgslMain}`;
}