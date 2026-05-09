import { useRef, useState, useCallback, useEffect, useLayoutEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MathUtils, LoopOnce } from 'three'
import {
  DOOR_RADIUS,
  SHOW_THRESHOLD,
  _camDir,
  _toDoor,
  _horizForward,
  easeInOut,
} from '../config'
import {
  SLIDE_SPEED,
  REVERSE_SLIDE_SPEED,
  APPROACH_LERP_K,
  APPROACH_RAY_XZ_SMOOTH,
  getDoorSlideExitPose,
  CLICK_THRESHOLD,
  Y_LERP_START,
  Y_LERP_END,
} from '../config/door'

/** Scrub clip time with timeScale 0. Must call play() so the action is active — inactive clipActions are skipped by mixer.update (drei only advances the mixer). */
function applyDoorClipAtTime(action, mixer, t) {
  if (!action || !mixer) return
  const clip = action.getClip()
  if (!clip || clip.duration <= 0) return
  action.play()
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
  approachPortalRef,
}) {
  const controls = useThree(state => state.controls)
  const camera = useThree(state => state.camera)

  const isSliding = useRef(false)
  const slideProgress = useRef(0)
  const hasActivated = useRef(false)
  const dotRef = useRef(0)
  const slideDistStart = useRef(1)
  const slideDistEnd = useRef(0)

  const y = useRef(-3)
  const isVisible = useRef(false)
  const [visible, setVisible] = useState(false)

  /** Closing runs 1→0: must start fully open so puerta_abrir reads as a close (portal often opens mid-slide) */
  const reverseSlideProgress = useRef(1)
  const exitCompleteCalled = useRef(false)

  useEffect(() => () => {
    if (approachPortalRef?.current === portalIndex) approachPortalRef.current = null
  }, [approachPortalRef, portalIndex])

  useLayoutEffect(() => {
    if (!exitReverse || !exitSnapshot || !groupRef.current) return

    exitCompleteCalled.current = false
    reverseSlideProgress.current = 1

    const { slideTarget: st } = exitSnapshot
    const { x, z, rotY, clipOpen01 } = getDoorSlideExitPose(angle, st, 1)

    groupRef.current.position.set(x, 0, z)
    groupRef.current.rotation.set(0, rotY, 0)

    const action = actions['puerta_abrir']
    if (action && mixer) {
      action.reset()
      action.setLoop(LoopOnce, 1)
      action.clampWhenFinished = false
      const clip = action.getClip()
      const dur = clip?.duration ?? 0
      applyDoorClipAtTime(action, mixer, clipOpen01 * dur)
    }
  }, [exitReverse, exitSnapshot, actions, mixer, angle, groupRef])

  const handleClick = useCallback(() => {
    if (isSliding.current) return
    if (dotRef.current < CLICK_THRESHOLD) return
    const lock = approachPortalRef?.current
    if (lock != null && lock !== portalIndex) return

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

    camera.getWorldDirection(_horizForward)
    _horizForward.y = 0
    if (_horizForward.lengthSq() < 1e-10) _horizForward.set(0, 0, 1)
    else _horizForward.normalize()

    const startX = Math.sin(angle) * DOOR_RADIUS
    const startZ = Math.cos(angle) * DOOR_RADIUS
    const dx = startX - camera.position.x
    const dz = startZ - camera.position.z
    slideDistStart.current = Math.max(0.15, dx * _horizForward.x + dz * _horizForward.z)
    slideDistEnd.current = 0

    if (approachPortalRef) approachPortalRef.current = portalIndex

    setVisible(false)
    isSliding.current = true
    slideProgress.current = 0
    hasActivated.current = false
  }, [actions, controls, camera, onInteractionFreeze, portalIndex, angle, approachPortalRef])

  // Priority < 0: run after default mixer updates so clip pose applies reliably on return.
  useFrame((state, delta) => {
    const { camera: frameCamera } = state

    if (exitReverse && exitSnapshot && groupRef.current) {
      const { slideTarget: st } = exitSnapshot
      const startX = Math.sin(angle) * DOOR_RADIUS
      const startZ = Math.cos(angle) * DOOR_RADIUS

      reverseSlideProgress.current = Math.max(0, reverseSlideProgress.current - delta * REVERSE_SLIDE_SPEED)
      const { x, z, rotY, clipOpen01 } = getDoorSlideExitPose(angle, st, reverseSlideProgress.current)

      groupRef.current.position.set(x, 0, z)
      groupRef.current.rotation.y = rotY

      const action = actions['puerta_abrir']
      if (action && mixer) {
        const clip = action.getClip()
        const dur = clip?.duration ?? 0
        applyDoorClipAtTime(action, mixer, clipOpen01 * dur)
      }

      if (reverseSlideProgress.current <= 0 && !exitCompleteCalled.current) {
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
        onExitReverseComplete?.()
      }
      return
    }

    const approachLock = approachPortalRef?.current
    const isLockedOut = approachLock != null && approachLock !== portalIndex

    frameCamera.getWorldDirection(_camDir)
    _toDoor.set(Math.sin(angle), 0, Math.cos(angle))
    const dot = _camDir.dot(_toDoor)
    dotRef.current = dot

    const t = MathUtils.smoothstep(dot, Y_LERP_START, Y_LERP_END)
    const yTarget = isSliding.current ? 0 : isLockedOut ? -3 : MathUtils.lerp(-3, 0, t)
    y.current = MathUtils.lerp(y.current, yTarget, 1 - Math.exp(-3 * delta))
    groupRef.current.position.y = y.current

    if (isLockedOut) {
      if (isVisible.current) {
        isVisible.current = false
        setVisible(false)
      }
      return
    }

    if (isSliding.current) {
      slideProgress.current = Math.min(slideProgress.current + delta * SLIDE_SPEED, 1)
      const p = easeInOut(slideProgress.current)
      const k = APPROACH_LERP_K
      const tPos = k >= 1 ? p * k : p

      frameCamera.getWorldDirection(_horizForward)
      _horizForward.y = 0
      if (_horizForward.lengthSq() < 1e-10) _horizForward.set(0, 0, 1)
      else _horizForward.normalize()

      const dist = MathUtils.lerp(slideDistStart.current, slideDistEnd.current, tPos)
      const cx = frameCamera.position.x
      const cz = frameCamera.position.z
      const targetX = cx + _horizForward.x * dist
      const targetZ = cz + _horizForward.z * dist
      const xzEase = 1 - Math.exp(-APPROACH_RAY_XZ_SMOOTH * delta)
      groupRef.current.position.x = MathUtils.lerp(groupRef.current.position.x, targetX, xzEase)
      groupRef.current.position.z = MathUtils.lerp(groupRef.current.position.z, targetZ, xzEase)

      const px = groupRef.current.position.x
      const pz = groupRef.current.position.z
      const targetRotY = Math.atan2(cx - px, cz - pz)
      const rotDiff = MathUtils.euclideanModulo(targetRotY - groupRef.current.rotation.y + Math.PI, 2 * Math.PI) - Math.PI
      groupRef.current.rotation.y += rotDiff * (1 - Math.exp(-6 * delta))

      if (!hasActivated.current) {
        const fire = k >= 1 ? p * k >= 1 : p >= k
        if (fire) {
          hasActivated.current = true
          onActivate()
        }
      }

      if (slideProgress.current >= 1) {
        isSliding.current = false
        if (approachPortalRef?.current === portalIndex) approachPortalRef.current = null
      }
      return
    }

    const shouldShow = t > SHOW_THRESHOLD
    if (shouldShow !== isVisible.current) {
      isVisible.current = shouldShow
      setVisible(shouldShow)
    }
  }, -1)

  return { handleClick, visible }
}
