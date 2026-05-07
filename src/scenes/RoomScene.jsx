import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'

export default function RoomScene({ model = '/models/room.glb' }) {
  const { scene } = useGLTF(model)
  const clone = useMemo(() => scene.clone(true), [scene])
  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[2, 4, 2]} intensity={1} />
      <primitive object={clone} />
    </>
  )
}
