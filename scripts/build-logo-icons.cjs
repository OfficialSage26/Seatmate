/**
 * Generates the Seatmate launcher/splash icons from the brand mark, matching the
 * "Seatmate Logo" design: a 150deg blue gradient + top sheen + Ella.
 *
 *   node scripts/build-logo-icons.cjs
 *
 * Inputs : assets/images/Ella/ella-avatar.png (transparent Ella)
 * Outputs: icon.png, splash-icon.png, adaptive foreground/background, favicon.png
 *
 * Pure pngjs (no native deps) so it runs anywhere. Re-run if the mark changes.
 */
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const ROOT = path.join(__dirname, '..');
const IMG = path.join(ROOT, 'assets', 'images');
const mark = PNG.sync.read(fs.readFileSync(path.join(IMG, 'Ella', 'ella-avatar.png')));

// --- color helpers ----------------------------------------------------------
const STOPS = [
  [0.0, [0x2e, 0xa6, 0xff]],
  [0.52, [0x1c, 0x7f, 0xe0]],
  [1.0, [0x0e, 0x5b, 0xb0]],
];
const lerp = (a, b, t) => a + (b - a) * t;
function gradient(t) {
  t = Math.max(0, Math.min(1, t));
  for (let i = 1; i < STOPS.length; i++) {
    if (t <= STOPS[i][0]) {
      const [t0, c0] = STOPS[i - 1];
      const [t1, c1] = STOPS[i];
      const k = (t - t0) / (t1 - t0);
      return [lerp(c0[0], c1[0], k), lerp(c0[1], c1[1], k), lerp(c0[2], c1[2], k)];
    }
  }
  return STOPS[STOPS.length - 1][1].slice();
}

// 150deg CSS gradient direction (sinθ, -cosθ) -> (0.5, 0.866).
const DIR = [Math.sin((150 * Math.PI) / 180), -Math.cos((150 * Math.PI) / 180)];

function sampleMark(u, v) {
  // bilinear sample of the mark in normalized [0,1] coords; outside -> transparent
  if (u < 0 || u > 1 || v < 0 || v > 1) return [0, 0, 0, 0];
  const x = u * (mark.width - 1);
  const y = v * (mark.height - 1);
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = Math.min(x0 + 1, mark.width - 1);
  const y1 = Math.min(y0 + 1, mark.height - 1);
  const fx = x - x0;
  const fy = y - y0;
  const px = (xx, yy) => {
    const i = (yy * mark.width + xx) * 4;
    return [mark.data[i], mark.data[i + 1], mark.data[i + 2], mark.data[i + 3]];
  };
  const a = px(x0, y0);
  const b = px(x1, y0);
  const c = px(x0, y1);
  const d = px(x1, y1);
  return [0, 1, 2, 3].map((k) => lerp(lerp(a[k], b[k], fx), lerp(c[k], d[k], fx), fy));
}

// rounded-rect (squircle-ish) coverage at normalized pixel, radius ratio r
function insideRounded(nx, ny, r) {
  const dx = Math.min(nx, 1 - nx);
  const dy = Math.min(ny, 1 - ny);
  if (dx >= r || dy >= r) return true;
  const cx = nx < 0.5 ? r : 1 - r;
  const cy = ny < 0.5 ? r : 1 - r;
  return (nx - cx) ** 2 + (ny - cy) ** 2 <= r * r;
}

/**
 * @param {number} size
 * @param {object} o  { rounded, bg, ella: {w, cy} | null }
 */
function render(size, o) {
  const png = new PNG({ width: size, height: size });
  const ellaW = o.ella ? o.ella.w : 0; // normalized width
  const ellaCy = o.ella ? o.ella.cy : 0.5;
  const r = 0.2227;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = (x + 0.5) / size;
      const ny = (y + 0.5) / size;
      let R = 0;
      let G = 0;
      let B = 0;
      let A = 0;
      if (o.bg) {
        const t = 0.5 + ((nx - 0.5) * DIR[0] + (ny - 0.5) * DIR[1]);
        const g = gradient(t);
        // top sheen
        const dxs = (nx - 0.5) / 0.8;
        const dys = (ny + 0.08) / 0.6;
        const rs = Math.sqrt(dxs * dxs + dys * dys);
        const sheen = rs < 0.6 ? 0.28 * (1 - rs / 0.6) : 0;
        R = lerp(g[0], 255, sheen);
        G = lerp(g[1], 255, sheen);
        B = lerp(g[2], 255, sheen);
        A = 255;
      }
      if (o.ella) {
        const u = (nx - (0.5 - ellaW / 2)) / ellaW;
        const v = (ny - (ellaCy - ellaW / 2)) / ellaW;
        const s = sampleMark(u, v);
        const sa = s[3] / 255;
        if (sa > 0) {
          R = lerp(R, s[0], sa);
          G = lerp(G, s[1], sa);
          B = lerp(B, s[2], sa);
          A = Math.max(A, s[3]);
        }
      }
      if (o.rounded && !insideRounded(nx, ny, r)) A = 0;
      const i = (y * size + x) * 4;
      png.data[i] = Math.round(R);
      png.data[i + 1] = Math.round(G);
      png.data[i + 2] = Math.round(B);
      png.data[i + 3] = Math.round(A);
    }
  }
  return PNG.sync.write(png);
}

const out = (name, buf) => {
  fs.writeFileSync(path.join(IMG, name), buf);
  console.log('wrote', name, (buf.length / 1024).toFixed(0) + 'KB');
};

// Launcher icon: full-bleed gradient + Ella (OS applies its own mask).
out('icon.png', render(1024, { bg: true, ella: { w: 1.18, cy: 0.52 } }));
// Splash: rounded logo tile on the brand background.
out('splash-icon.png', render(1024, { bg: true, rounded: true, ella: { w: 1.18, cy: 0.52 } }));
// Android adaptive: Ella in the safe zone over a gradient background layer.
out('android-icon-foreground.png', render(1024, { ella: { w: 0.64, cy: 0.5 } }));
out('android-icon-background.png', render(1024, { bg: true }));
// Web favicon.
out('favicon.png', render(48, { bg: true, ella: { w: 1.18, cy: 0.52 } }));
