import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { Color, Fog, DoubleSide } from 'three'
import { SoftShadows, useTexture } from '@react-three/drei'
import RoomSpawnAlign from '../components/RoomSpawnAlign'
import Painting from '../components/Painting'
import { asset } from '../utils/asset'

/**
 * Trip to Switzerland — a white square room whose walls rise into an infinite white haze.
 * Travel photographs hang on the four walls; even, neutral light and white fog dissolve the
 * tops of the walls so the space reads as an endless white cube.
 */

const EYE = 1.6 // camera / photo centre height (viewer stands in the middle)
const SIDE = 9 // square side length
const HALF = SIDE / 2 // distance from centre to each wall
const WALL_H = 60 // very tall — the top fades into the white fog (reads as infinite)
const WALL_LEN = SIDE - 2 // each wall is shorter than its side, so the corners stay open
const INSET = 0.08 // photos sit just in front of their wall
const SPAN = SIDE - 2.6 // width of each wall the photos spread across (centred)
const EXTENT = 140 // floor size — fades into the fog before its edge
const WHITE = '#0f0101' // fog + background the walls dissolve into

// Per-photo source, canvas colour, and info tag. `canvasColor` is the slab/edge behind the
// photo — set it per image (e.g. a dark tone) to kill the white border on shots that need it.
// `info` drives the placard that fades in on gaze (add a `header` title per photo, etc.).
const PHOTOS = [
  { src: 'san01.jpg', canvasColor: '#005e45', info: { subheader: 'Santiago Meneses · 2025', tags: ['Photography'], color: '#ffffff' } },
  { src: 'san02.jpg', canvasColor: '#005e45', info: { subheader: 'Santiago Meneses · 2025', tags: ['Photography'], color: '#ffffff' } },
  { src: 'san03.jpg', canvasColor: '#000000', info: { subheader: 'Santiago Meneses · 2025', tags: ['Photography'], color: '#ffffff' } },
  { src: 'san04.jpg', canvasColor: '#000000', info: { subheader: 'Santiago Meneses · 2025', tags: ['Photography'], color: '#ffffff' } },
  { src: 'san05.jpg', canvasColor: '#0f0f0f', info: { subheader: 'Santiago Meneses · 2025', tags: ['Photography'], color: '#ffffff' } },
  { src: 'san06.jpg', canvasColor: '#ffffff', info: { subheader: 'Santiago Meneses · 2025', tags: ['Photography'], color: '#ffffff' } },
  { src: 'san07.jpg', canvasColor: '#00908f', info: { subheader: 'Santiago Meneses · 2025', tags: ['Photography'], color: '#ffffff' } },
]

// Spread the photos across the four walls as evenly as possible (2,2,2,1 for 7) and place each
// one, centred, on the inner face of its wall. Wall index: 0 = +Z, 1 = +X, 2 = -Z, 3 = -X.
const PER_WALL = Math.ceil(PHOTOS.length / 4)
const WALL_CHUNKS = []
for (let i = 0; i < PHOTOS.length; i += PER_WALL) WALL_CHUNKS.push(PHOTOS.slice(i, i + PER_WALL))

const PLACEMENTS = WALL_CHUNKS.flatMap((chunk, w) => {
  const a = (w * Math.PI) / 2
  const nx = Math.sin(a)
  const nz = Math.cos(a) // outward wall normal
  const tx = Math.cos(a)
  const tz = -Math.sin(a) // tangent along the wall
  const rotY = a + Math.PI // turn the face toward the centre
  const k = chunk.length
  return chunk.map((photo, j) => {
    const off = k > 1 ? ((j + 0.5) / k - 0.5) * SPAN : 0
    return {
      src: photo.src,
      info: photo.info,
      canvasColor: photo.canvasColor,
      position: [nx * (HALF - INSET) + tx * off, EYE, nz * (HALF - INSET) + tz * off],
      rotY,
    }
  })
})

const WALLS = [0, 1, 2, 3].map((w) => {
  const a = (w * Math.PI) / 2
  return { position: [Math.sin(a) * HALF, WALL_H / 2, Math.cos(a) * HALF], rotY: a + Math.PI }
})

const ROOM_SPAWN = { positionXZ: [0, 0], yaw: 0 }

// Warm the texture cache at module load so the photos download while the viewer is still in
// the hub and the room renders without blocking on the fetch.
PHOTOS.forEach(({ src }) => useTexture.preload(asset(`/images/${src}`)))

function RoomAtmosphere() {
  const { scene } = useThree()
  useEffect(() => {
    const prevFog = scene.fog
    const prevBg = scene.background
    // White haze: photos (≈4.5 away) stay crisp, the tall walls dissolve to white as they rise.
    scene.fog = new Fog(WHITE, 7, 42)
    scene.background = new Color(WHITE)
    return () => {
      scene.fog = prevFog
      scene.background = prevBg
    }
  }, [scene])
  return null
}

export default function Switzerland() {
  return (
    <RoomSpawnAlign spawn={ROOM_SPAWN}>
      <RoomAtmosphere />

      {/* soft penumbra for gentle photo drop-shadows on the white walls */}
      <SoftShadows size={26} samples={16} focus={0.5} />

      {/* bright, even neutral light so the walls read white */}
      <ambientLight intensity={1.15} color="#ffffff" />
      <directionalLight
        position={[0, 1, 1]}
        intensity={0.5}
        color="#ffffff"
      />
      <directionalLight
        position={[0, 1, -1]}
        intensity={0.5}
        color="#ffffff"
      />

      {/* white floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[EXTENT, EXTENT]} />
        <meshStandardMaterial color="#370707" roughness={0.95} metalness={0} />
      </mesh>

      {/* square walls rising into the white haze (open top) */}
      {WALLS.map((wall, i) => (
        <mesh key={i} position={wall.position} rotation={[0, wall.rotY, 0]} receiveShadow>
          <planeGeometry args={[WALL_LEN, WALL_H]} />
          <meshStandardMaterial color="#6a1d1d" roughness={1} metalness={0} side={DoubleSide} />
        </mesh>
      ))}

      {PLACEMENTS.map(({ src, info, canvasColor, position, rotY }) => (
        <Painting
          key={src}
          src={asset(`/images/${src}`)}
          width={1.5}
          canvasColor={canvasColor}
          position={position}
          rotation={[0, rotY, 0]}
          spotlight={{ intensity: 5, color: '#ffffff', angle: 0.4, penumbra: 0.6, front: 2, up: 3, targetY: 0, decay: 1, castShadow: false }}
          info={info}
          allowTilt={false}
          hoverPop={0}
        />
      ))}
    </RoomSpawnAlign>
  )
}
