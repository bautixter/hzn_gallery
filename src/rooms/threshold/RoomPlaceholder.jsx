import SquareRoomShell from '../_shared/SquareRoomShell'

/** Placeholder: verdes + cono. Sustituir por escena final. */
export default function RoomPlaceholder() {
  return (
    <SquareRoomShell
      floorColor="#2d4436"
      ceilingColor="#1e3028"
      wallColors={['#3d5c48', '#355445', '#3a5642', '#324f3d']}
    >
      <mesh position={[0, 0.85, 0]} rotation={[0, 0, 0]} castShadow>
        <coneGeometry args={[0.9, 1.6, 32]} />
        <meshStandardMaterial color="#7ec98a" metalness={0.1} roughness={0.5} />
      </mesh>
    </SquareRoomShell>
  )
}
