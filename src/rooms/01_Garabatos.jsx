import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { Color, Fog } from 'three'
import RoomSpawnAlign from '../components/RoomSpawnAlign'
import { DEFAULT_ROOM_SPAWN as ROOM_SPAWN } from '../utils/roomSpawn'
import { asset } from '../utils/asset'
import Painting from '../components/Painting'

const FOG_COLOR = '#b0dbff'

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
      <directionalLight position={[0, 20, 0]} intensity={0.6} castShadow />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[4000, 4000]} />
        <meshStandardMaterial color="#41ad4a" />
      </mesh>
      <Painting
        src={asset('/images/d01_01.jpg')}
        width={1.5}
        canvasColor={'#ffffff'}
        position={[0, 1.6, 0]}
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
    </RoomSpawnAlign>
  )
}
