import { MeshReflectorMaterial } from '@react-three/drei'

export default function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <circleGeometry args={[60, 64]} />
      <MeshReflectorMaterial
        resolution={512}
        color="#f5f5f5"
        depthScale={0}
        mirror={0.7}
      />
    </mesh>
  )
}
