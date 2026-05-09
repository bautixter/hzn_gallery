import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { OrbitControls, DeviceOrientationControls } from '@react-three/drei'

export default function CanvasControls({ granted }) {
  const { camera } = useThree()

  useEffect(() => {
    if (granted) camera.position.set(0, 2.5, 0)
  }, [granted])

  return granted
    ? <DeviceOrientationControls makeDefault />
    : <OrbitControls makeDefault target={[0, 1.6, 0]} maxPolarAngle={Math.PI} />
}
