import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Color, Fog } from 'three'
import { SoftShadows } from '@react-three/drei'
import RoomSpawnAlign from '../components/RoomSpawnAlign'
import Model from '../components/Model'
import { asset } from '../utils/asset'

/**
 * Threshold — sibling of Liminal, but for 3D works. A foggy "infinite" room around a fixed
 * camera with Teo's sculptures arranged in a ring, each lit by its own cone (see Model).
 * Look at a work for its info tag; click it to fly in and orbit it. The viewer turns in place.
 */

const RADIUS = 4.5         // ring radius — where the works stand
const CEIL_H = 3.2
const DISPLAY_H = 1.4      // model centre height (near eye level)
const EXTENT = 50          // floor/ceiling size — just past the fog end (38); fog hides the edge
const FOG = '#070a09'    // cool near-black the room dissolves into

// Per-model source (under public/models/teo) + info tag. `info` (text + colour) drives the
// placard that fades in when you look at a work — every field is optional; edit per model.
const MODELS = [
  { src: 'Belz mewing 3.glb',        info: { header: 'Belz', subheader: 'Teo · 2025', tags: ['3D'], description: 'A small thing, mid-cry.', color: '#d8ead8' } },
  { src: 'Cocon finito.glb',         info: { header: 'Cocon', subheader: 'Teo · 2025', tags: ['3D'], description: 'Finished, and waiting.', color: '#d8ead8' } },
  { src: 'Cocoon yeux opn mid low.glb', info: { header: 'Cocoon, Eyes Open', subheader: 'Teo · 2025', tags: ['3D'], color: '#d8ead8' } },
  { src: 'Muriculus .glb',           info: { header: 'Muriculus', subheader: 'Teo · 2025', tags: ['3D'], color: '#d8ead8' } },
  { src: 'Symbiote 1.glb',           info: { header: 'Symbiote', subheader: 'Teo · 2025', tags: ['3D'], description: 'Two forms, one body.', color: '#d8ead8' } },
]

const N = MODELS.length

const RING = MODELS.map(({ src, info }, i) => {
  const theta = (i / N) * Math.PI * 2 // position 0 is straight ahead (+z)
  return {
    src,
    info,
    sin: Math.sin(theta),
    cos: Math.cos(theta),
    rotY: theta + Math.PI, // turn the front toward the camera
  }
})

const ROOM_SPAWN = { positionXZ: [0, 0], yaw: 0 }

function RoomAtmosphere() {
  const { scene } = useThree()
  useEffect(() => {
    const prevFog = scene.fog
    const prevBg = scene.background
    scene.fog = new Fog(FOG, 5, 38)
    scene.background = new Color(FOG)
    return () => {
      scene.fog = prevFog
      scene.background = prevBg
    }
  }, [scene])
  return null
}

// This room is static — models and their cone lights never move — so its shadow maps only
// need to be drawn once. Render them for a short settle window after mount (covers async
// GLTF loads + the spotlights wiring their targets), then freeze, sparing every later frame
// five shadow passes. Restores auto-update on exit so the Hub's animated doors still cast live.
function FreezeShadows({ settle = 0.6 }) {
  const { gl } = useThree()
  const elapsed = useRef(0)
  const frozen = useRef(false)
  useEffect(() => {
    const prevAuto = gl.shadowMap.autoUpdate
    gl.shadowMap.autoUpdate = false
    gl.shadowMap.needsUpdate = true
    elapsed.current = 0
    frozen.current = false
    return () => {
      gl.shadowMap.autoUpdate = prevAuto
      gl.shadowMap.needsUpdate = true
    }
  }, [gl])
  useFrame((_, delta) => {
    if (frozen.current) return
    elapsed.current += delta
    gl.shadowMap.needsUpdate = true // keep drawing shadows while the scene settles
    if (elapsed.current >= settle) frozen.current = true
  })
  return null
}

export default function Threshold() {
  return (
    <RoomSpawnAlign spawn={ROOM_SPAWN}>
      <RoomAtmosphere />
      <FreezeShadows />

      {/* soft penumbra so the cone shadows land smoothly */}
      <SoftShadows size={26} samples={8} focus={0.4} />

      {/* cool fill; the per-work cones (in Model) are the key + shadow lights */}
      <ambientLight intensity={0.3} color="#cfe6d6" />
      <pointLight position={[0, CEIL_H - 0.3, 0]} intensity={20} distance={18} decay={2} color="#bfe3cf" />

      {/* infinite floor + ceiling, dissolving into fog */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[EXTENT, EXTENT]} />
        <meshStandardMaterial color="#16201b" roughness={0.9} metalness={0} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, CEIL_H, 0]}>
        <planeGeometry args={[EXTENT, EXTENT]} />
        <meshStandardMaterial color="#101814" roughness={1} metalness={0} />
      </mesh>

      {RING.map(({ src, info, sin, cos, rotY }) => (
        <Model
          key={src}
          src={asset(`/models/teo/${encodeURIComponent(src)}`)}
          position={[RADIUS * sin, DISPLAY_H, RADIUS * cos]}
          rotation={[0, rotY, 0]}
          scaleTo={1.4}
          info={info}
        />
      ))}
    </RoomSpawnAlign>
  )
}
