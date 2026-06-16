/**
 * Sala cúbica 8×8 m, altura 4 m. Sustituye el contenido por la escena final;
 * coloca la obra en `children` (centro ~y = 1.2).
 */
export default function SquareRoomShell({
  floorColor,
  ceilingColor,
  wallColor = '#6a6a72',
  wallColors,
  children,
}) {
  const [n, s, e, w] = wallColors ?? [wallColor, wallColor, wallColor, wallColor]

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 3.3, 1.5]} intensity={55} />
      <directionalLight position={[4, 6, 3]} intensity={0.55} castShadow />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color={floorColor} />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4, 0]}>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color={ceilingColor} />
      </mesh>

      <mesh position={[0, 2, -4]}>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color={n} />
      </mesh>

      <mesh rotation={[0, Math.PI, 0]} position={[0, 2, 4]}>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color={s} />
      </mesh>

      <mesh rotation={[0, Math.PI / 2, 0]} position={[-4, 2, 0]}>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color={w} />
      </mesh>

      <mesh rotation={[0, -Math.PI / 2, 0]} position={[4, 2, 0]}>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color={e} />
      </mesh>

      {children}
    </>
  )
}
