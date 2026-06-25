import { MeshReflectorMaterial } from '@react-three/drei'
import { useXR } from '@react-three/xr'

export default function Floor() {
  // MeshReflectorMaterial renders an off-screen reflection pass every frame (it rebinds the render
  // target mid-frame). Inside a WebXR session that clobbers the headset's framebuffer and blacks out
  // the whole view, so fall back to a plain matte floor while presenting.
  const presenting = useXR((s) => s.session != null)

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <circleGeometry args={[60, 64]} />
      {presenting ? (
        <meshStandardMaterial color="#f0f0f0" roughness={0.65} metalness={0.1} />
      ) : (
        <MeshReflectorMaterial
          resolution={512}
          color="#f5f5f5"
          depthScale={0}
          mirror={0.7}
        />
      )}
    </mesh>
  )
}
