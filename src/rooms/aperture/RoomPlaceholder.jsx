import SquareRoomShell from '../_shared/SquareRoomShell'

/** Placeholder: turquesa + cilindro. Sustituir por escena final. */
export default function RoomPlaceholder() {
  return (
    <SquareRoomShell
      floorColor="#2a4548"
      ceilingColor="#1a3034"
      wallColors={['#355a5e', '#305550', '#325c5e', '#2d5254']}
    >
      <mesh position={[0, 1.15, 0]} castShadow>
        <cylinderGeometry args={[0.65, 0.65, 1.5, 32]} />
        <meshStandardMaterial color="#7ee8e0" metalness={0.45} roughness={0.2} />
      </mesh>
    </SquareRoomShell>
  )
}
