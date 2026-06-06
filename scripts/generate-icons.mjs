/**
 * Genera íconos PNG para la PWA usando solo Node.js built-ins (sin deps externos).
 * Crea íconos de color aqua marina #017a72 con la letra "R" en blanco.
 */
import { deflateSync } from 'zlib'
import { writeFileSync, mkdirSync, existsSync } from 'fs'

function crc32(buf) {
  let c = 0xFFFFFFFF
  for (const b of buf) {
    c ^= b
    for (let i = 0; i < 8; i++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
  }
  return (c ^ 0xFFFFFFFF) >>> 0
}

function chunk(type, data) {
  const t = Buffer.from(type)
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])))
  return Buffer.concat([len, t, data, crcBuf])
}

function createPNG(size) {
  // Colores
  const BG_R = 1, BG_G = 122, BG_B = 114   // #017a72
  const FG_R = 255, FG_G = 255, FG_B = 255  // blanco

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8   // bit depth
  ihdr[9] = 2   // color type RGB
  ihdr[10] = 0  // compression
  ihdr[11] = 0  // filter
  ihdr[12] = 0  // interlace

  // Construir imagen pixel a pixel
  const pixels = []
  const cx = size / 2
  const cy = size / 2
  const radius = size * 0.42
  const strokeW = size * 0.07

  for (let y = 0; y < size; y++) {
    pixels.push(0) // filter byte por fila
    for (let x = 0; x < size; x++) {
      const dx = x - cx
      const dy = y - cy
      const dist = Math.sqrt(dx * dx + dy * dy)

      // Círculo de fondo con borde blanco
      const inOuter = dist <= radius
      const inInner = dist <= radius - strokeW

      // Letra "R" simplificada centrada
      const lx = (x - cx) / (size * 0.12)  // normalizado
      const ly = (y - cy) / (size * 0.15)
      const inR = drawLetterR(lx, ly)

      if (inOuter) {
        if (inR && inInner) {
          pixels.push(FG_R, FG_G, FG_B)
        } else if (!inInner) {
          pixels.push(FG_R, FG_G, FG_B) // borde blanco
        } else {
          pixels.push(BG_R, BG_G, BG_B)
        }
      } else {
        pixels.push(BG_R, BG_G, BG_B)
      }
    }
  }

  function drawLetterR(lx, ly) {
    // "R" usando formas geométricas normalizadas
    // Barra vertical izquierda
    if (lx >= -1.8 && lx <= -0.6 && ly >= -2.2 && ly <= 2.2) return true
    // Tope horizontal (top)
    if (lx >= -1.8 && lx <= 1.2 && ly >= -2.2 && ly <= -1.0) return true
    // Barra horizontal medio
    if (lx >= -1.8 && lx <= 1.2 && ly >= -0.1 && ly <= 1.0) return true
    // Curva derecha top (semicírculo)
    if (ly >= -2.2 && ly <= 1.0) {
      const midY = -0.6
      const r2 = 1.4
      const ddx = lx - (-0.3)
      const ddy = ly - midY
      if (Math.sqrt(ddx * ddx + ddy * ddy) <= r2 + 0.6 &&
          Math.sqrt(ddx * ddx + ddy * ddy) >= r2 - 0.6 &&
          lx >= -0.3) return true
    }
    // Pata diagonal inferior derecha
    if (ly >= 0.8 && ly <= 2.2) {
      const slope = (ly - 0.8) * 0.8
      if (lx >= slope - 0.6 && lx <= slope + 0.6) return true
    }
    return false
  }

  const raw = Buffer.from(pixels)
  const compressed = deflateSync(raw)

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0))
  ])
}

if (!existsSync('public')) mkdirSync('public', { recursive: true })

writeFileSync('public/icon-192.png', createPNG(192))
writeFileSync('public/icon-512.png', createPNG(512))
// favicon: PNG pequeño (los browsers modernos aceptan PNG como favicon)
writeFileSync('public/favicon.ico', createPNG(32))

console.log('✓ Íconos PWA generados (192×192, 512×512, favicon)')
