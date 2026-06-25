import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { Color, Fog } from 'three'
import RoomSpawnAlign from '../components/RoomSpawnAlign'
import { DEFAULT_ROOM_SPAWN as ROOM_SPAWN } from '../utils/roomSpawn'
import { asset } from '../utils/asset'
import Painting from '../components/Painting'

const FOG_COLOR = '#b0dbff'

const COLORS = { red: '#ff0000', yellow: '#fbff00', green: '#00ff1e', blue: '#006aff' }

// Simple coloured props scattered around the viewer (origin). `pos` is [x, z]; `size` is the
// full height, so a box/sphere of `size` sits centred at size/2 on the grass.
const SHAPES = [
  { type: 'box', pos: [-4, -3], size: 0.9, color: COLORS.red },
  { type: 'sphere', pos: [4, -4], size: 0.7, color: COLORS.yellow },
  { type: 'sphere', pos: [-5.5, 3], size: 0.8, color: COLORS.green },
  { type: 'box', pos: [6, 1.5], size: 1.0, color: COLORS.blue },
  { type: 'box', pos: [-3, 6], size: 0.7, color: COLORS.yellow },
  { type: 'sphere', pos: [3.5, 5.5], size: 0.9, color: COLORS.red },
  { type: 'sphere', pos: [-7.5, -2.5], size: 0.6, color: COLORS.blue },
  { type: 'box', pos: [7.5, -3.5], size: 0.85, color: COLORS.green },
  { type: 'box', pos: [-1.5, -6.5], size: 0.75, color: COLORS.red },
  { type: 'sphere', pos: [-6.5, 7], size: 1.0, color: COLORS.yellow },
  { type: 'sphere', pos: [8.5, 4.5], size: 0.7, color: COLORS.green },
  { type: 'box', pos: [2, 8.5], size: 0.9, color: COLORS.blue },
]

export default function Garabatos() {
  const { scene } = useThree()

  useEffect(() => {
    const prevFog = scene.fog
    const prevBg = scene.background
    scene.fog = new Fog(FOG_COLOR, 12, 60)
    scene.background = new Color(FOG_COLOR)
    return () => {
      scene.fog = prevFog
      scene.background = prevBg
    }
  }, [scene])

  return (
    <RoomSpawnAlign spawn={ROOM_SPAWN}>
      <ambientLight intensity={2.5} />
      <directionalLight
        position={[0, 20, 0]}
        intensity={0.6}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[4000, 4000]} />
        <meshStandardMaterial color="#41ad4a" />
      </mesh>

      {/* simple coloured cubes and spheres scattered around the viewer */}
      {SHAPES.map(({ type, pos, size, color }, i) => (
        <mesh key={i} position={[pos[0], size/2, pos[1]]} castShadow>
          {type === 'box'
            ? <boxGeometry args={[size, size, size]} />
            : <sphereGeometry args={[size / 2, 24, 16]} />}
          <meshStandardMaterial color={color} roughness={0.1} />
        </mesh>
      ))}
      <Painting
        src={asset('/images/d01_01.jpg')}
        width={1.5}
        canvasColor={'#ffffff'}
        position={[-2, 1.6, 0]}
        rotation={[0, Math.PI, 0]}
        spotlight={{ intensity: 5, color: '#ffffff', angle: 0.7, penumbra: 0.6, front: 1, up: 2, targetY: 0, decay: 1, castShadow: false }}
        info={{
          header: 'Corea',
          subheader: 'J.B. Aballay - 2023',
          tags: ['Digital', 'Doodles'],
          description: 'Collection of drawings from my stay in Busan, Republic of Korea',
          color: '#2b211b',
        }}
      />
      <Painting
        src={asset('/images/d01_02.jpg')}
        width={1.5}
        canvasColor={'#ffffff'}
        position={[2, 1.6, 0]}
        rotation={[0, Math.PI, 0]}
        spotlight={{ intensity: 5, color: '#ffffff', angle: 0.7, penumbra: 0.6, front: 1, up: 2, targetY: 0, decay: 1, castShadow: false }}
        info={{
          header: 'Francia y Argentina',
          subheader: 'J.B. Aballay - 2026',
          tags: ['Digital', 'Doodles'],
          description: 'Saint-Étienne and Zavalla, Pérez, Rosario.',
          color: '#2b211b',
        }}
      />
    </RoomSpawnAlign>
  )
}
