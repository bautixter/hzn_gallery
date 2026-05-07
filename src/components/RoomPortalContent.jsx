import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { asset } from '../utils/asset'

export default function RoomPortalContent() {
  const { scene } = useGLTF(asset('/models/room.glb'))
  const clone = useMemo(() => scene.clone(true), [scene])
  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[2, 4, 2]} intensity={1} />
      <primitive object={clone} />
    </>
  )
}
