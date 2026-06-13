// Genera los íconos PWA a partir del corazón de la marca. Uso puntual:
//   npm i -D sharp && node scripts/gen-icons.mjs && npm un sharp
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import path from 'node:path'

const OUT = path.join(process.cwd(), 'public')
mkdirSync(OUT, { recursive: true })

const HEART =
  'M12 21 C5 15.5 2 12 2 8 C2 4.7 4.5 2.5 7.5 2.5 C9.6 2.5 11.2 3.7 12 5.5 ' +
  'C12.8 3.7 14.4 2.5 16.5 2.5 C19.5 2.5 22 4.7 22 8 C22 12 19 15.5 12 21 Z'

// heartScale: tamaño del corazón relativo al lienzo (menor = más padding, para maskable)
function svg({ size = 512, radius = 0.22, heartScale = 0.52 }) {
  const r = Math.round(size * radius)
  const hs = size * heartScale
  const tx = (size - hs) / 2
  const ty = (size - hs) / 2 + size * 0.01
  const s = hs / 24
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#2a1320"/>
      <stop offset="1" stop-color="#0d040a"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.42" r="0.6">
      <stop offset="0" stop-color="#FF6B9D" stop-opacity="0.45"/>
      <stop offset="1" stop-color="#FF6B9D" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="heart" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FFA3C2"/>
      <stop offset="0.55" stop-color="#FF6B9D"/>
      <stop offset="1" stop-color="#E5436A"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="url(#bg)"/>
  <rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="url(#glow)"/>
  <g transform="translate(${tx},${ty}) scale(${s})">
    <path d="${HEART}" fill="url(#heart)"/>
  </g>
</svg>`
}

async function png(opts, file, size) {
  const buf = Buffer.from(svg({ ...opts, size }))
  await sharp(buf).png().toFile(path.join(OUT, file))
  console.log('  ✓', file)
}

const any = { radius: 0.22, heartScale: 0.56 }
const maskable = { radius: 0.001, heartScale: 0.42 } // sin bordes redondeados, más padding

console.log('Generando íconos en public/:')
await png(any, 'pwa-192.png', 192)
await png(any, 'pwa-512.png', 512)
await png(maskable, 'maskable-512.png', 512)
await png(any, 'apple-touch-icon.png', 180)
await png(any, 'favicon-48.png', 48)
console.log('Listo.')
