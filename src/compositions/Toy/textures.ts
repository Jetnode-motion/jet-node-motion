import * as THREE from 'three';

/*
 * Procedural textures for the Soviet-flat dioramas, drawn once on a canvas: striped wallpaper,
 * the ornamental wall carpet, the floor rug, flowered curtains, floor boards. Seeded, so every
 * frame of a render draws the same pattern.
 */

const cache = new Map<string, THREE.CanvasTexture>();

const rnd = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

const make = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D, r: () => number) => void, repeat: [number, number] = [1, 1]) => {
  const hit = cache.get(key);
  if (hit) return hit;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d')!;
  draw(g, rnd(7 + key.length * 131));
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(...repeat);
  tex.anisotropy = 8;
  cache.set(key, tex);
  return tex;
};

/** Beige wallpaper: vertical stripes and a small repeating sprig. */
export const wallpaper = (base = '#C9B48A', ink = '#A8915F') =>
  make(`wall${base}${ink}`, 512, 512, (g, r) => {
    g.fillStyle = base;
    g.fillRect(0, 0, 512, 512);
    for (let x = 0; x < 512; x += 64) {
      g.fillStyle = ink;
      g.globalAlpha = 0.35;
      g.fillRect(x + 4, 0, 6, 512);
      g.fillRect(x + 14, 0, 2, 512);
      g.globalAlpha = 0.5;
      for (let y = 16; y < 512; y += 48) {
        g.beginPath();
        g.ellipse(x + 40, y + ((x / 64) % 2) * 24, 5, 9, 0.4, 0, Math.PI * 2);
        g.fill();
      }
    }
    // age: faint stains
    g.globalAlpha = 0.06;
    for (let i = 0; i < 40; i++) {
      g.fillStyle = r() > 0.5 ? '#000' : '#fff';
      g.beginPath();
      g.arc(r() * 512, r() * 512, 10 + r() * 60, 0, Math.PI * 2);
      g.fill();
    }
    g.globalAlpha = 1;
  }, [3, 2]);

/** The wall carpet: red field, gold medallion, layered borders. */
export const carpet = (field = '#8E2A1E', gold = '#D9A441', dark = '#2A1410') =>
  make(`carpet${field}`, 1024, 704, (g, r) => {
    const W = 1024;
    const H = 704;
    g.fillStyle = dark;
    g.fillRect(0, 0, W, H);
    const band = (m: number, c: string) => {
      g.fillStyle = c;
      g.fillRect(m, m, W - 2 * m, H - 2 * m);
    };
    band(14, gold);
    band(30, dark);
    band(44, field);
    // border motifs
    g.fillStyle = gold;
    for (let x = 60; x < W - 40; x += 34) {
      g.beginPath();
      g.moveTo(x, 22);
      g.lineTo(x + 8, 14);
      g.lineTo(x + 16, 22);
      g.lineTo(x + 8, 30);
      g.fill();
      g.beginPath();
      g.moveTo(x, H - 22);
      g.lineTo(x + 8, H - 30);
      g.lineTo(x + 16, H - 22);
      g.lineTo(x + 8, H - 14);
      g.fill();
    }
    // speckle of small flowers across the field
    for (let i = 0; i < 900; i++) {
      const x = 50 + r() * (W - 100);
      const y = 50 + r() * (H - 100);
      g.fillStyle = r() > 0.6 ? gold : r() > 0.5 ? '#E8D6B0' : dark;
      g.globalAlpha = 0.55;
      g.beginPath();
      g.arc(x, y, 2 + r() * 4, 0, Math.PI * 2);
      g.fill();
    }
    g.globalAlpha = 1;
    // central medallion: nested lobed rings
    const cx = W / 2;
    const cy = H / 2;
    const rings: [number, string][] = [
      [230, dark],
      [215, gold],
      [190, field],
      [150, gold],
      [128, dark],
      [100, '#C4572F'],
      [64, gold],
      [36, dark],
    ];
    for (const [rad, c] of rings) {
      g.fillStyle = c;
      g.beginPath();
      for (let a = 0; a <= Math.PI * 2 + 0.01; a += Math.PI / 90) {
        const lob = 1 + 0.12 * Math.cos(a * 8);
        const rr = rad * lob;
        g.lineTo(cx + Math.cos(a) * rr * 1.45, cy + Math.sin(a) * rr);
      }
      g.fill();
    }
    // corner quarter-medallions
    for (const [x, y] of [
      [44, 44],
      [W - 44, 44],
      [44, H - 44],
      [W - 44, H - 44],
    ]) {
      for (const [rad, c] of [
        [120, gold],
        [96, dark],
        [70, '#C4572F'],
        [40, gold],
      ] as [number, string][]) {
        g.fillStyle = c;
        g.beginPath();
        g.arc(x, y, rad, 0, Math.PI * 2);
        g.fill();
      }
    }
    g.strokeStyle = gold;
    g.lineWidth = 3;
    g.strokeRect(44, 44, W - 88, H - 88);
  });

/** Floor rug: pale ground, brown ornament, fringe-free. */
export const rug = () =>
  make('rug', 1024, 768, (g, r) => {
    g.fillStyle = '#5B3A2A';
    g.fillRect(0, 0, 1024, 768);
    g.fillStyle = '#D8C6A6';
    g.fillRect(30, 30, 964, 708);
    g.fillStyle = '#7A4A30';
    for (let i = 0; i < 2600; i++) {
      const x = 40 + r() * 944;
      const y = 40 + r() * 688;
      const d = Math.hypot((x - 512) / 1.3, y - 384);
      if (d < 120 || (d > 200 && d < 230) || r() > 0.45) {
        g.globalAlpha = 0.35 + r() * 0.4;
        g.beginPath();
        g.ellipse(x, y, 3 + r() * 5, 2 + r() * 3, r() * 3, 0, Math.PI * 2);
        g.fill();
      }
    }
    g.globalAlpha = 1;
    g.strokeStyle = '#7A4A30';
    g.lineWidth = 10;
    g.strokeRect(60, 60, 904, 648);
  });

/** White curtains with red flowers. */
export const curtain = () =>
  make('curtain', 256, 512, (g) => {
    g.fillStyle = '#EDE6DA';
    g.fillRect(0, 0, 256, 512);
    for (let y = 20; y < 512; y += 64) {
      for (let x = 20 + ((y / 64) % 2) * 32; x < 256; x += 64) {
        g.fillStyle = '#C0473C';
        for (let k = 0; k < 6; k++) {
          const a = (k / 6) * Math.PI * 2;
          g.beginPath();
          g.arc(x + Math.cos(a) * 7, y + Math.sin(a) * 7, 6, 0, Math.PI * 2);
          g.fill();
        }
        g.fillStyle = '#7A1E18';
        g.beginPath();
        g.arc(x, y, 4, 0, Math.PI * 2);
        g.fill();
      }
    }
    // folds
    for (let x = 0; x < 256; x += 32) {
      const grd = g.createLinearGradient(x, 0, x + 32, 0);
      grd.addColorStop(0, 'rgba(0,0,0,0.12)');
      grd.addColorStop(0.5, 'rgba(255,255,255,0.05)');
      grd.addColorStop(1, 'rgba(0,0,0,0.12)');
      g.fillStyle = grd;
      g.fillRect(x, 0, 32, 512);
    }
  }, [1, 1]);

/** Painted floor boards. */
export const boards = () =>
  make('boards', 512, 512, (g, r) => {
    for (let i = 0; i < 8; i++) {
      const l = 36 + r() * 8;
      g.fillStyle = `hsl(18, 42%, ${l}%)`;
      g.fillRect(i * 64, 0, 64, 512);
      g.fillStyle = 'rgba(0,0,0,0.35)';
      g.fillRect(i * 64, 0, 2, 512);
      g.fillRect(i * 64, r() * 512, 64, 2);
    }
  }, [3, 3]);

/** Spines of books on a shelf. */
export const books = () =>
  make('books', 512, 128, (g, r) => {
    let x = 0;
    while (x < 512) {
      const w = 8 + r() * 14;
      const h = 80 + r() * 44;
      g.fillStyle = ['#7A2E22', '#2E4A6B', '#3F5B33', '#B08A3E', '#E2D8C4', '#4A3A60'][Math.floor(r() * 6)];
      g.fillRect(x, 128 - h, w - 1, h);
      g.fillStyle = 'rgba(255,255,255,0.35)';
      g.fillRect(x + 2, 128 - h + 10, w - 5, 3);
      x += w;
    }
  });
