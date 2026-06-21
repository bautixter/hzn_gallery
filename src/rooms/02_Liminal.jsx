import { useEffect, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import { Color, Fog, CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'
import { SoftShadows, useTexture } from '@react-three/drei'
import RoomSpawnAlign from '../components/RoomSpawnAlign'
import Painting from '../components/Painting'
import { asset } from '../utils/asset'

/**
 * Liminal — an "infinite" wooden room around a fixed camera. Only a floor and a
 * ceiling (no walls); both use a seamlessly-tiling procedural wood texture whose
 * planks run off into fog, so the space reads as endless. Seven works hang in a
 * ring, each lit by its own cone (see Painting). The viewer only turns in place.
 */

const N = 7
const RADIUS = 5 // ring radius — where the works hang
const CEIL_H = 3.2
const EYE = 1.6 // matches EYE_HEIGHT (camera at the centre)
const EXTENT = 200 // floor/ceiling size — runs out past the fog
const FOG = '#0d0905' // warm near-black the planks dissolve into

// Per-painting source + info tag. `info` (text + colour) drives the placard that fades
// in when you look at a work — every field is optional; edit freely per painting.
const PAINTINGS = [
  { src: 'ali01.jpg', info: { header: 'Study after Pierre Bonnard', subheader: 'Ali · 2024', tags: ['Digital'], description: 'The last light before the room turns to fog.', color: '#f0e8d8' } },
  { src: 'ali02.jpg', info: { header: 'Untitled', subheader: 'Ali · 2025', tags: ['Digital'], description: 'From the Phenomenom Series.', color: '#f0e8d8' } },
  { src: 'ali03.jpg', info: { header: 'Untitled', subheader: 'Ali · 2025', tags: ['Digital'], description: 'From the Phenomenom Series.', color: '#f0e8d8' } },
  { src: 'ali04.jpg', info: { header: 'Abat-jour', subheader: 'Ali · 2025', tags: ['Digital'], color: '#f0e8d8' } },
  { src: 'ali05.jpg', info: { header: 'Landscape study', subheader: 'Ali · 2025', tags: ['Digital'], color: '#f0e8d8' } },
  { src: 'ali06.jpg', info: { header: 'Untitled', subheader: 'Ali · 2025', tags: ['Digital'], description: 'From the Phenomenom Series.', color: '#f0e8d8' } },
  { src: 'ali07.jpg', info: { header: 'Wildflower', subheader: 'Ali · 2025', tags: ['Digital'], color: '#f0e8d8' } },
]

const RING = PAINTINGS.map(({ src, info }, i) => {
  const theta = (i / N) * Math.PI * 2 // position 0 is straight ahead (+z)
  return {
    src,
    info,
    sin: Math.sin(theta),
    cos: Math.cos(theta),
    rotY: theta + Math.PI, // turn the face toward the camera
  }
})

const ROOM_SPAWN = { positionXZ: [0, 0], yaw: 0 }

// Warm the texture cache at module load (registry imports this room at app boot), so the
// ~0.8 MB of works download in the background while the viewer is still in the hub and the
// room renders instantly on entry instead of blocking on the fetch.
PAINTINGS.forEach(({ src }) => useTexture.preload(asset(`/images/${src}`)))

/**
 * Procedural plank texture: base colour + grain + plank seams.
 * Grain is drawn with ±size wrap copies and seams span the full tile, so the
 * texture tiles seamlessly in both directions (loops vertically into the haze).
 */
function makeWoodTexture({ base, planks = 7 }) {
  const size = 512
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')

  ctx.fillStyle = base
  ctx.fillRect(0, 0, size, size)

  // grain — faint curved streaks, each also drawn shifted by ±size so it wraps
  const offsets = [-size, 0, size]
  for (let i = 0; i < 2200; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const len = 30 + Math.random() * 170
    const a = 0.03 + Math.random() * 0.06
    const stroke = Math.random() < 0.55 ? `rgba(40,24,10,${a})` : `rgba(185,143,96,${a})`
    const lw = 0.5 + Math.random() * 1.6
    const cx = (Math.random() - 0.5) * 3
    for (const ox of offsets) {
      for (const oy of offsets) {
        ctx.strokeStyle = stroke
        ctx.lineWidth = lw
        ctx.beginPath()
        ctx.moveTo(x + ox, y + oy)
        ctx.bezierCurveTo(x + ox + 2, y + oy + len * 0.4, x + ox - 2, y + oy + len * 0.7, x + ox + cx, y + oy + len)
        ctx.stroke()
      }
    }
  }

  // plank seams — full-height vertical lines (seamless top↔bottom), with a highlight
  const pw = size / planks
  for (let i = 0; i <= planks; i++) {
    ctx.strokeStyle = 'rgba(25,14,6,0.7)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(i * pw, 0)
    ctx.lineTo(i * pw, size)
    ctx.stroke()
    ctx.strokeStyle = 'rgba(190,150,100,0.15)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(i * pw + 2, 0)
    ctx.lineTo(i * pw + 2, size)
    ctx.stroke()
  }

  const tex = new CanvasTexture(c)
  tex.wrapS = tex.wrapT = RepeatWrapping
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

function RoomAtmosphere() {
  const { scene } = useThree()
  useEffect(() => {
    const prevFog = scene.fog
    const prevBg = scene.background
    scene.fog = new Fog(FOG, 6, 40)
    scene.background = new Color(FOG)
    return () => {
      scene.fog = prevFog
      scene.background = prevBg
    }
  }, [scene])
  return null
}

export default function Liminal() {
  const { floorTex, ceilTex } = useMemo(() => {
    const floorTex = makeWoodTexture({ base: '#5a3b22', planks: 7 })
    floorTex.repeat.set(48, 48)
    const ceilTex = makeWoodTexture({ base: '#4d331e', planks: 7 })
    ceilTex.repeat.set(48, 48)
    return { floorTex, ceilTex }
  }, [])

  useEffect(() => () => {
    floorTex.dispose()
    ceilTex.dispose()
  }, [floorTex, ceilTex])

  return (
    <RoomSpawnAlign spawn={ROOM_SPAWN}>
      <RoomAtmosphere />

      {/* soft penumbra so the cone shadows land smoothly */}
      <SoftShadows size={26} samples={16} focus={0.4} />

      {/* warm fill; the per-work cones (in Painting) are the key + shadow lights */}
      <ambientLight intensity={0.25} color="#ffe6c8" />
      <pointLight position={[0, CEIL_H - 0.3, 0]} intensity={26} distance={18} decay={2} color="#ffdca8" />

      {/* infinite floor + ceiling, dissolving into fog */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[EXTENT, EXTENT]} />
        <meshStandardMaterial map={floorTex} roughness={0.55} metalness={0} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, CEIL_H, 0]}>
        <planeGeometry args={[EXTENT, EXTENT]} />
        <meshStandardMaterial map={ceilTex} roughness={0.8} metalness={0} />
      </mesh>

      {RING.map(({ src, info, sin, cos, rotY }) => (
        <Painting
          key={src}
          src={asset(`/images/${src}`)}
          width={1.5}
          position={[RADIUS * sin, EYE, RADIUS * cos]}
          rotation={[0, rotY, 0]}
          info={info}
        />
      ))}
    </RoomSpawnAlign>
  )
}
