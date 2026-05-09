import SquareRoomShell from '../_shared/SquareRoomShell'

/** Placeholder: cálido oscuro + toro. Sustituir por escena final. */
export default function RoomPlaceholder() {
  return (
    <SquareRoomShell
      floorColor="#3a3028"
      ceilingColor="#1f1a16"
      wallColors={['#4a3828', '#453428', '#4a3626', '#403224']}
    >
      <mesh position={[0, 1.25, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.95, 0.28, 24, 48]} />
        <meshStandardMaterial color="#f0a848" metalness={0.4} roughness={0.35} emissive="#402008" emissiveIntensity={0.15} />
      </mesh>
    </SquareRoomShell>
  )
}
