export default function BoxScene({ wallColor = '#e8ddd0' }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 3.5, 0]} intensity={60} castShadow />

      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#b0a090" />
      </mesh>

      {/* ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4, 0]}>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#f0ece4" />
      </mesh>

      <mesh position={[0, 2, -4]}>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>

      <mesh rotation={[0, Math.PI, 0]} position={[0, 2, 4]}>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>

      <mesh rotation={[0, Math.PI / 2, 0]} position={[-4, 2, 0]}>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>

      <mesh rotation={[0, -Math.PI / 2, 0]} position={[4, 2, 0]}>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
    </>
  )
}
