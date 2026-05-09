import { useEffect, useLayoutEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { OrbitControls, DeviceOrientationControls } from '@react-three/drei'
import { EYE_HEIGHT } from '../config/camera'

export default function CanvasControls({ granted, exitCameraSnapshot }) {
  const { camera, controls } = useThree()
  const lastRestoreKey = useRef(null)

  useEffect(() => {
    if (granted) camera.position.set(0, EYE_HEIGHT, 0)
  }, [granted, camera])

  useLayoutEffect(() => {
    if (!exitCameraSnapshot) {
      lastRestoreKey.current = null
      return
    }
    const key = exitCameraSnapshot.cameraPosition.join(',')
    if (lastRestoreKey.current === key) return
    lastRestoreKey.current = key

    camera.position.fromArray(exitCameraSnapshot.cameraPosition)
    camera.quaternion.fromArray(exitCameraSnapshot.cameraQuaternion)
    if (!granted && controls?.target && exitCameraSnapshot.orbitTarget) {
      controls.target.fromArray(exitCameraSnapshot.orbitTarget)
      if (typeof controls.update === 'function') controls.update()
    }
    camera.updateMatrixWorld()
  }, [exitCameraSnapshot, granted, camera, controls])

  return granted
    ? <DeviceOrientationControls makeDefault />
    : <OrbitControls makeDefault target={[0, EYE_HEIGHT, 0]} maxPolarAngle={Math.PI} />
}
