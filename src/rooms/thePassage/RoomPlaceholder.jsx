import RoomSpawnAlign from '../_shared/RoomSpawnAlign'
import { DEFAULT_ROOM_SPAWN as ROOM_SPAWN } from '../_shared/roomSpawn'
import SquareRoomShell from '../_shared/SquareRoomShell'

/** Placeholder: sala cálida + cubo central. Sustituir por escena final en esta carpeta. */
export default function RoomPlaceholder() {
  return (
    <RoomSpawnAlign spawn={ROOM_SPAWN}>
    <SquareRoomShell
      floorColor="#4a3028"
      ceilingColor="#2c1c18"
      wallColors={['#6b4540', '#5a3a35', '#624038', '#55332e']}
    >
      <mesh position={[0, 1.15, 0]} castShadow>
        <boxGeometry args={[1.25, 1.25, 1.25]} />
        <meshStandardMaterial color="#e8a090" metalness={0.15} roughness={0.45} />
      </mesh>
    </SquareRoomShell>
    </RoomSpawnAlign>
  )
}
