#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const BASE_URL = process.env.BACKGROUND_EVAL_URL || 'http://localhost:5173/background-lab';
const OUTPUT_ROOT = path.join(__dirname, '..', 'artifacts', 'background-eval');
const PRESET_IDS = ['baseline-noir', 'active-grid', 'alert-storm', 'dawn-recovery', 'motion-pass'];

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function $(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
  } catch (e) {
    return null;
  }
}

// Decompress all IDAT chunks from a PNG, sample a 20x20 grid of pixels.
// PNG row format: filter_byte + RGBA * width. We skip filter_byte and sample R+G+B.
function samplePixels(filePath) {
  const buf = fs.readFileSync(filePath);
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);

  let idatData = Buffer.alloc(0);
  let offset = 8;
  while (offset < buf.length - 12) {
    const len = buf.readUInt32BE(offset);
    const type = buf.slice(offset + 4, offset + 8).toString('ascii');
    if (type === 'IDAT') {
      idatData = Buffer.concat([idatData, buf.slice(offset + 8, offset + 8 + len)]);
    }
    offset += 12 + len;
    if (type === 'IEND') break;
  }

  const raw = zlib.inflateSync(idatData);
  const bpp = 4;
  const stride = width * bpp + 1;
  let sum = 0, max = 0, count = 0;

  for (let y = 0; y < height; y += Math.max(1, Math.floor(height / 20))) {
    const rowStart = y * stride + 1;
    for (let x = 0; x < width; x += Math.max(1, Math.floor(width / 20))) {
      const idx = rowStart + x * bpp;
      if (idx + 2 < raw.length) {
        const lum = raw[idx] + raw[idx + 1] + raw[idx + 2];
        sum += lum;
        max = Math.max(max, lum);
        count++;
      }
    }
  }

  return { width, height, avg: count ? (sum / count / 3) : 0, max, samples: count };
}

function capture(url, filePath) {
  $(`agent-browser close --all 2>/dev/null`);
  $(`agent-browser open "${url}"`);
  $(`agent-browser wait 3000`);
  $(`agent-browser set viewport 1280 720`);
  $(`agent-browser wait 1000`);
  $(`agent-browser screenshot "${filePath}"`);

  if (!fs.existsSync(filePath)) return { exists: false };
  const size = fs.statSync(filePath).size;
  const px = samplePixels(filePath);
  return { exists: true, sizeKB: (size / 1024).toFixed(1), ...px, nonBlack: size > 10240 };
}

function main() {
  const runDir = path.join(OUTPUT_ROOT, stamp());
  fs.mkdirSync(runDir, { recursive: true });

  console.log(`\n=== Background Capture (agent-browser) ===`);
  console.log(`URL: ${BASE_URL}`);
  console.log(`Output: ${runDir}\n`);

  const summary = [];

  for (const id of PRESET_IDS) {
    console.log(`[${id}]`);
    const still = capture(`${BASE_URL}?capture=true&preset=${id}`, path.join(runDir, `${id}-still.png`));
    const motion = capture(`${BASE_URL}?capture=true&motion=true&preset=${id}`, path.join(runDir, `${id}-motion.png`));
    summary.push({ presetId: id, still, motion });

    const tag = (r) => r.nonBlack ? 'PASS' : (r.exists ? 'BLACK' : 'MISS');
    console.log(`  still:  ${tag(still)}  ${still.sizeKB || '?'}KB  avg=${(still.avg||0).toFixed(1)}  max=${still.max||0}`);
    console.log(`  motion: ${tag(motion)}  ${motion.sizeKB || '?'}KB  avg=${(motion.avg||0).toFixed(1)}  max=${motion.max||0}`);
  }

  const pass = summary.filter(e => e.still.nonBlack || e.motion.nonBlack).length;
  console.log(`\nResult: ${pass}/${PRESET_IDS} presets non-black`);

  fs.writeFileSync(
    path.join(runDir, 'pixel-analysis.json'),
    JSON.stringify({ baseUrl: BASE_URL, generatedAt: new Date().toISOString(), summary }, null, 2),
  );
  console.log(`Artifacts: ${runDir}`);

  $(`agent-browser close --all 2>/dev/null`);
}

main();
