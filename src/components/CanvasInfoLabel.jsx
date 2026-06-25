import { useMemo, useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { CanvasTexture, DoubleSide, SRGBColorSpace, Vector3 } from 'three'

// In-scene replacement for the drei <Html> placards, which don't render inside an immersive headset.
// The text is baked to a canvas (no external font / CDN needed) and shown on a billboarded plane that
// fades with `visible`. Same content shape as the HTML labels: { header, subheader, tags, description, color }.

const _cam = new Vector3()
const _self = new Vector3()

// Keep a constant on-screen size regardless of distance (like the old <Html distanceFactor>): the
// label's apparent width stays ~APPARENT × its distance, so it's just as readable across the hub as
// up close. Bump this to make every placard bigger on screen.
const APPARENT = 0.5

function parseColor(c) {
  if (typeof c === 'string' && c[0] === '#') {
    let h = c.slice(1)
    if (h.length === 3) h = h.split('').map((x) => x + x).join('')
    const n = parseInt(h, 16)
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
  }
  const m = typeof c === 'string' && c.match(/rgba?\(([^)]+)\)/)
  if (m) {
    const [r, g, b] = m[1].split(',').map((s) => parseFloat(s))
    return { r, g, b }
  }
  return { r: 20, g: 34, b: 80 }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function wrapText(ctx, text, font, maxWidth) {
  ctx.font = font
  const words = String(text).split(/\s+/)
  const lines = []
  let cur = ''
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w
    if (ctx.measureText(test).width > maxWidth && cur) {
      lines.push(cur)
      cur = w
    } else {
      cur = test
    }
  }
  if (cur) lines.push(cur)
  return lines
}

// Supersample the canvas: lay everything out in logical px, then back it with SS× more pixels so the
// text stays crisp when a high-DPI headset magnifies the (small) world-space plane.
const SS = 4

function buildLabelTexture(info, anisotropy = 4) {
  const { header, subheader, tags = [], description, color = 'rgb(20,34,80)' } = info || {}
  const W = 512
  const PAD = 30
  const innerW = W - PAD * 2
  const rgb = parseColor(color)
  const textColor = `rgb(${rgb.r | 0},${rgb.g | 0},${rgb.b | 0})`
  const lum = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255
  const panel = lum < 0.55 ? 'rgba(250,250,250,0.9)' : 'rgba(16,16,22,0.84)'

  const mctx = document.createElement('canvas').getContext('2d')
  const F = (px, w = 400) => `${w} ${px}px system-ui, -apple-system, sans-serif`
  const blocks = []
  if (header) blocks.push({ lines: wrapText(mctx, header, F(42, 700), innerW), font: F(42, 700), lineH: 48, alpha: 1, gap: 6 })
  if (subheader) blocks.push({ lines: wrapText(mctx, subheader, F(28), innerW), font: F(28), lineH: 36, alpha: 0.72, gap: 14 })
  if (tags.length) blocks.push({ lines: [tags.join('    ·    ')], font: F(24, 500), lineH: 32, alpha: 0.85, gap: 14 })
  if (description) blocks.push({ lines: wrapText(mctx, description, F(25), innerW), font: F(25), lineH: 34, alpha: 0.9, gap: 0 })

  let H = PAD
  for (const b of blocks) H += b.lines.length * b.lineH + b.gap
  H += PAD
  H = Math.max(1, Math.ceil(H))

  const canvas = document.createElement('canvas')
  canvas.width = W * SS
  canvas.height = H * SS
  const ctx = canvas.getContext('2d')
  ctx.scale(SS, SS) // draw in logical px; the backing store holds SS× the detail

  ctx.fillStyle = panel
  roundRect(ctx, 2, 2, W - 4, H - 4, 22)
  ctx.fill()

  ctx.textBaseline = 'top'
  ctx.textAlign = 'left'
  let y = PAD
  for (const b of blocks) {
    ctx.font = b.font
    ctx.fillStyle = textColor
    ctx.globalAlpha = b.alpha
    for (const line of b.lines) {
      ctx.fillText(line, PAD, y)
      y += b.lineH
    }
    y += b.gap
  }
  ctx.globalAlpha = 1

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = anisotropy
  return { texture, aspect: W / H }
}

export default function CanvasInfoLabel({ info, visible, position = [0, 0, 0], maxWidth = 0.6, apparent = APPARENT }) {
  const gl = useThree((s) => s.gl)
  const camera = useThree((s) => s.camera)
  const maxAniso = gl.capabilities.getMaxAnisotropy()
  // Rebuild only when the actual content changes (the parent may pass a fresh object each render).
  const key = `${info?.header}|${info?.subheader}|${info?.tags?.join(',')}|${info?.description}|${info?.color}|${maxAniso}`
  const { texture, aspect } = useMemo(() => buildLabelTexture(info, maxAniso), [key]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => texture.dispose(), [texture])

  const groupRef = useRef(null)
  const matRef = useRef(null)
  const opacity = useRef(0)

  useFrame(() => {
    const g = groupRef.current
    if (!g) return
    camera.getWorldPosition(_cam)
    g.getWorldPosition(_self)
    g.lookAt(_cam)
    g.scale.setScalar(Math.max(0.001, _self.distanceTo(_cam)) * (apparent / maxWidth))
    opacity.current += ((visible ? 1 : 0) - opacity.current) * 0.15
    g.visible = opacity.current > 0.01
    if (matRef.current) matRef.current.opacity = opacity.current
  })

  return (
    <group ref={groupRef} position={position}>
      <mesh>
        <planeGeometry args={[maxWidth, maxWidth / aspect]} />
        <meshBasicMaterial
          ref={matRef}
          map={texture}
          transparent
          opacity={0}
          depthTest={false}
          depthWrite={false}
          side={DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}
