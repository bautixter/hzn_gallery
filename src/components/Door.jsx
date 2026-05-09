import { useRef, useMemo } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { asset } from '../utils/asset'
import { DOOR_RADIUS } from '../config'
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
  })

  return (
    <group
      ref={groupRef}
      position={[Math.sin(angle) * DOOR_RADIUS, -3, Math.cos(angle) * DOOR_RADIUS]}
      rotation={[0, angle + Math.PI, 0]}
    >
      <primitive object={clonedScene} onClick={handleClick} />
      <DoorLabel data={data} visible={visible} />
    </group>
  )
}
