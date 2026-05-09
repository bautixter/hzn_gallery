import { useRef, useMemo } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { asset } from '../utils/asset'
import { DOOR_RADIUS } from '../config'
import { getDoorSlideExitPose } from '../config/door'
import { useDoorBehavior } from '../hooks/useDoorBehavior'
import DoorLabel from './DoorLabel'

export default function Door({
  angle,
  data,
  model,
  onActivate,
  portalIndex,
  onInteractionFreeze,
  exitReverse,
  exitSnapshot,
  onExitReverseComplete,
  approachPortalRef,
}) {
  if (!model) model = asset('/models/door.glb')
  const { scene, animations } = useGLTF(model)

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse(child => {
      if (child.isMesh && child.name === 'stencil') child.visible = false
    })
    return clone
  }, [scene])

  const exitStart = useMemo(() => {
    if (!exitReverse || !exitSnapshot?.slideTarget) return null
    return getDoorSlideExitPose(angle, exitSnapshot.slideTarget, 1)
  }, [exitReverse, exitSnapshot, angle])

  const groupRef = useRef()
  const { actions, mixer } = useAnimations(animations, groupRef)
  const { handleClick, visible } = useDoorBehavior({
    angle,
    groupRef,
    actions,
    mixer,
    onActivate,
    portalIndex,
    onInteractionFreeze,
    exitReverse,
    exitSnapshot,
    onExitReverseComplete,
    approachPortalRef,
  })

  const ringX = Math.sin(angle) * DOOR_RADIUS
  const ringZ = Math.cos(angle) * DOOR_RADIUS

  return (
    <group
      ref={groupRef}
      position={
        exitStart
          ? [exitStart.x, 0, exitStart.z]
          : [ringX, -3, ringZ]
      }
      rotation={[0, exitStart ? exitStart.rotY : angle + Math.PI, 0]}
    >
      <primitive object={clonedScene} onClick={handleClick} />
      <DoorLabel data={data} visible={visible} />
    </group>
  )
}
