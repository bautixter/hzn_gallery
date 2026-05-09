import { useRef, useState, useCallback, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MathUtils, LoopOnce } from 'three'
import {
  DOOR_RADIUS,
  SHOW_THRESHOLD,
  _camDir,
  _toDoor,
  easeInOut,
} from '../config'
import {
  SLIDE_SPEED,
  OVERSHOOT,
  CLICK_THRESHOLD,
  Y_LERP_START,
  Y_LERP_END,
} from '../config/door'

export function useDoorBehavior({ angle, groupRef, actions, onActivate }) {
  const controls = useThree(state => state.controls)
  const camera = useThree(state => state.camera)
  const get = useThree(state => state.get)

  const disabledControlsForSlide = useRef(false)

  const isSliding = useRef(false)
  const slideProgress = useRef(0)
  const hasActivated = useRef(false)
  const dotRef = useRef(0)
  const slideTarget = useRef({ x: 0, z: 0 })

  const y = useRef(-3)
  const isVisible = useRef(false)
  const [visible, setVisible] = useState(false)

  const handleClick = useCallback(() => {
    if (isSliding.current) return
    if (dotRef.current < CLICK_THRESHOLD) return

    const action = actions['puerta_abrir']
    if (action) {
      action.reset()
      action.setLoop(LoopOnce, 1)
      action.clampWhenFinished = true
      action.play()
    }

    if (controls) {
      controls.enabled = false
      disabledControlsForSlide.current = true
    }
    slideTarget.current.x = camera.position.x
    slideTarget.current.z = camera.position.z
    setVisible(false)
    isSliding.current = true
    slideProgress.current = 0
    hasActivated.current = false
  }, [actions, controls, camera])

  useEffect(() => () => {
    if (!disabledControlsForSlide.current) return
    const c = get().controls
    if (c) c.enabled = true
    disabledControlsForSlide.current = false
  }, [get])

  useFrame((state, delta) => {
    const { camera: frameCamera, controls: frameControls } = state
    frameCamera.getWorldDirection(_camDir)
    _toDoor.set(Math.sin(angle), 0, Math.cos(angle))
    const dot = _camDir.dot(_toDoor)
    dotRef.current = dot

    const t = MathUtils.smoothstep(dot, Y_LERP_START, Y_LERP_END)
    const yTarget = isSliding.current ? 0 : MathUtils.lerp(-3, 0, t)
    y.current = MathUtils.lerp(y.current, yTarget, 1 - Math.exp(-3 * delta))
    groupRef.current.position.y = y.current

    if (isSliding.current) {
      if (frameControls) {
        frameControls.enabled = false
        disabledControlsForSlide.current = true
      }
      slideProgress.current = Math.min(slideProgress.current + delta * SLIDE_SPEED, 1)
      const p = easeInOut(slideProgress.current)

      const startX = Math.sin(angle) * DOOR_RADIUS
      const startZ = Math.cos(angle) * DOOR_RADIUS
      const doorX = MathUtils.lerp(startX, slideTarget.current.x, p * OVERSHOOT)
      const doorZ = MathUtils.lerp(startZ, slideTarget.current.z, p * OVERSHOOT)
      groupRef.current.position.x = doorX
      groupRef.current.position.z = doorZ

      const targetRotY = Math.atan2(slideTarget.current.x - doorX, slideTarget.current.z - doorZ)
      const rotDiff = MathUtils.euclideanModulo(targetRotY - groupRef.current.rotation.y + Math.PI, 2 * Math.PI) - Math.PI
      groupRef.current.rotation.y += rotDiff * (1 - Math.exp(-6 * delta))

      if (!hasActivated.current && p >= 1 / OVERSHOOT) {
        hasActivated.current = true
        onActivate()
      }

      if (slideProgress.current >= 1) {
        isSliding.current = false
        if (frameControls) {
          frameControls.enabled = true
          disabledControlsForSlide.current = false
        }
      }
      return
    }

    const shouldShow = t > SHOW_THRESHOLD
    if (shouldShow !== isVisible.current) {
      isVisible.current = shouldShow
      setVisible(shouldShow)
    }
  })

  return { handleClick, visible }
}
