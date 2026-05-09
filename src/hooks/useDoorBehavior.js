import { useRef, useState, useCallback, useEffect, useLayoutEffect } from 'react'
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

function applyDoorClipAtTime(action, mixer, t) {
  if (!action || !mixer) return
  const clip = action.getClip()
  if (!clip || clip.duration <= 0) return
  action.enabled = true
  action.paused = false
  action.timeScale = 0
  action.time = MathUtils.clamp(t, 0, clip.duration)
  mixer.update(0)
}

export function useDoorBehavior({
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
}) {
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

  const reverseProgress = useRef(1)
  const exitCompleteCalled = useRef(false)

  useLayoutEffect(() => {
    if (!exitReverse || !exitSnapshot || !groupRef.current) return

    exitCompleteCalled.current = false
    reverseProgress.current = 1

    const { slideTarget: st } = exitSnapshot
    const startX = Math.sin(angle) * DOOR_RADIUS
    const startZ = Math.cos(angle) * DOOR_RADIUS
    const p = easeInOut(1)
    const doorX = MathUtils.lerp(startX, st.x, p * OVERSHOOT)
    const doorZ = MathUtils.lerp(startZ, st.z, p * OVERSHOOT)
    const targetRotY = Math.atan2(st.x - doorX, st.z - doorZ)

    groupRef.current.position.set(doorX, 0, doorZ)
    groupRef.current.rotation.set(0, targetRotY, 0)

    const action = actions['puerta_abrir']
    if (action && mixer) {
      action.reset()
      action.setLoop(LoopOnce, 1)
      action.clampWhenFinished = false
      const clip = action.getClip()
      const dur = clip?.duration ?? 0
      applyDoorClipAtTime(action, mixer, dur)
    }
  }, [exitReverse, exitSnapshot, actions, mixer, angle, groupRef])

  const handleClick = useCallback(() => {
    if (isSliding.current) return
    if (dotRef.current < CLICK_THRESHOLD) return

    onInteractionFreeze?.({
      portalIndex,
      cameraPosition: camera.position.toArray(),
      cameraQuaternion: camera.quaternion.toArray(),
      orbitTarget: controls?.target ? controls.target.toArray() : null,
      slideTarget: { x: camera.position.x, z: camera.position.z },
      angle,
    })

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
  }, [actions, controls, camera, onInteractionFreeze, portalIndex, angle])

  useEffect(() => () => {
    if (!disabledControlsForSlide.current) return
    const c = get().controls
    if (c) c.enabled = true
    disabledControlsForSlide.current = false
  }, [get])

  useFrame((state, delta) => {
    const { camera: frameCamera, controls: frameControls } = state

    if (exitReverse && exitSnapshot && groupRef.current) {
      if (frameControls) {
        frameControls.enabled = false
        disabledControlsForSlide.current = true
      }

      const { slideTarget: st } = exitSnapshot
      const startX = Math.sin(angle) * DOOR_RADIUS
      const startZ = Math.cos(angle) * DOOR_RADIUS

      reverseProgress.current = Math.max(0, reverseProgress.current - delta * SLIDE_SPEED)
      const p = easeInOut(reverseProgress.current)
      const doorX = MathUtils.lerp(startX, st.x, p * OVERSHOOT)
      const doorZ = MathUtils.lerp(startZ, st.z, p * OVERSHOOT)

      groupRef.current.position.set(doorX, 0, doorZ)

      const targetRotY = Math.atan2(st.x - doorX, st.z - doorZ)
      const rotDiff = MathUtils.euclideanModulo(targetRotY - groupRef.current.rotation.y + Math.PI, 2 * Math.PI) - Math.PI
      groupRef.current.rotation.y += rotDiff * (1 - Math.exp(-6 * delta))

      const action = actions['puerta_abrir']
      if (action && mixer) {
        const clip = action.getClip()
        const dur = clip?.duration ?? 0
        applyDoorClipAtTime(action, mixer, p * dur)
      }

      if (reverseProgress.current <= 0 && !exitCompleteCalled.current) {
        exitCompleteCalled.current = true
        const actionDone = actions['puerta_abrir']
        if (actionDone && mixer) {
          actionDone.stop()
          actionDone.timeScale = 1
          actionDone.time = 0
          mixer.update(0)
        }
        groupRef.current.position.set(startX, 0, startZ)
        groupRef.current.rotation.set(0, angle + Math.PI, 0)
        y.current = 0
        isVisible.current = false
        setVisible(false)
        if (frameControls) {
          frameControls.enabled = true
          disabledControlsForSlide.current = false
        }
        onExitReverseComplete?.()
      }
      return
    }

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
