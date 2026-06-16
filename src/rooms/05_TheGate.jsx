import RoomSpawnAlign from '../components/RoomSpawnAlign'
import { DEFAULT_ROOM_SPAWN as ROOM_SPAWN } from '../utils/roomSpawn'
import SquareRoomShell from '../components/SquareRoomShell'

/** Placeholder: violetas + octaedro. Sustituir por escena final. */
export default function TheGate() {
  return (
    <RoomSpawnAlign spawn={ROOM_SPAWN}>
    <SquareRoomShell
      floorColor="#3a2d45"
      ceilingColor="#241c30"
      wallColors={['#4c3d5c', '#453456', '#483858', '#403050']}
    >
      <mesh position={[0, 1.2, 0]} castShadow>
        <octahedronGeometry args={[1.05, 0]} />
        <meshStandardMaterial color="#c4a0e8" metalness={0.25} roughness={0.35} />
      </mesh>
    </SquareRoomShell>
    </RoomSpawnAlign>
  )
}
