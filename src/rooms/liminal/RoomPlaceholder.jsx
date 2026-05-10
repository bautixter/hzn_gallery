import RoomSpawnAlign from '../_shared/RoomSpawnAlign'
import { DEFAULT_ROOM_SPAWN as ROOM_SPAWN } from '../_shared/roomSpawn'
import SquareRoomShell from '../_shared/SquareRoomShell'

/** Placeholder: grises azulados + esfera. Sustituir por escena final. */
export default function RoomPlaceholder() {
  return (
    <RoomSpawnAlign spawn={ROOM_SPAWN}>
    <SquareRoomShell
      floorColor="#3a4555"
      ceilingColor="#2a3340"
      wallColors={['#4a5a6e', '#445468', '#485c70', '#3f4f62']}
    >
      <mesh position={[0, 1.2, 0]} castShadow>
        <sphereGeometry args={[0.85, 48, 48]} />
        <meshStandardMaterial color="#c8d8f0" metalness={0.35} roughness={0.25} />
      </mesh>
    </SquareRoomShell>
    </RoomSpawnAlign>
  )
}
