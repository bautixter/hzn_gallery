import { useLayoutEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { DeviceOrientationControls } from '@react-three/drei'
import DragLook from './DragLook'

export default function CanvasControls({ exitCameraSnapshot, pointerCoarse, granted }) {
  const { camera, controls } = useThree()
  const lastRestoreKey = useRef(null)

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
    if (controls?.target && exitCameraSnapshot.orbitTarget) {
      controls.target.fromArray(exitCameraSnapshot.orbitTarget)
      if (typeof controls.update === 'function') controls.update()
    }
    camera.updateMatrixWorld()
  }, [exitCameraSnapshot, camera, controls])

  if (pointerCoarse && granted) {
    return <DeviceOrientationControls makeDefault />
  }

  return <DragLook makeDefault />
}
