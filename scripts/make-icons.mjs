import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'

function png(width, height, rgb) {
  const [r, g, b] = rgb
  // raw image: each scanline filtered (filter 0) + RGB bytes
  const raw = Buffer.alloc((1 + width * 3) * height)
  let o = 0
  for (let y = 0; y < height; y++) {
    raw[o++] = 0 // filter type 0
    for (let x = 0; x < width; x++) {
      raw[o++] = r; raw[o++] = g; raw[o++] = b
    }
  }
  const idat = zlib.deflateSync(raw)

  function chunk(type, data) {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0)
    const t = Buffer.from(type, 'ascii')
    const crc = crc32(Buffer.concat([t, data]))
    const c = Buffer.alloc(4); c.writeUInt32BE(crc, 0)
    return Buffer.concat([len, t, data, c])
  }

  // CRC32
  function crc32(buf) {
    let crc = 0xffffffff
    for (let i = 0; i < buf.length; i++) {
      crc ^= buf[i]
      for (let k = 0; k < 8; k++) crc = (crc >>> 1) ^ (0xedb88320 * (crc & 1))
    }
    return (crc ^ 0xffffffff) >>> 0
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 2 // color type RGB
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

const outDir = path.resolve(process.argv[1], '..', '..', 'public')
for (const [w, name] of [[192, 'icon-192.png'], [512, 'icon-512.png']]) {
  fs.writeFileSync(path.join(outDir, name), png(w, w, [15, 118, 110]))
  console.log('wrote', name)
}
// favicon already svg; also create a simple maskable by reusing
fs.writeFileSync(path.join(outDir, 'icon-512-maskable.png'), png(512, 512, [15, 118, 110]))
console.log('done')
