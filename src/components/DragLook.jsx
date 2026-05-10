import { useEffect, useLayoutEffect, useRef } from 'react'
import { Euler, MathUtils } from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import {
  DRAG_LOOK_SENSITIVITY,
  DRAG_LOOK_MOMENTUM_DAMPING,
  DRAG_LOOK_MOMENTUM_SCALE,
  DRAG_LOOK_MOMENTUM_MAX_RAD_S,
} from '../config/camera'

const _euler = new Euler(0, 0, 0, 'YXZ')

/**
 * Fixed camera position; yaw/pitch from primary pointer drag (mouse button or one finger).
 * No pointer lock — cursor stays visible on desktop. Coasts briefly after release.
 */
export default function DragLook({ makeDefault }) {
  const camera = useThree(s => s.camera)
  const gl = useThree(s => s.gl)
  const invalidate = useThree(s => s.invalidate)
  const get = useThree(s => s.get)
  const set = useThree(s => s.set)

  const cameraRef = useRef(camera)
  useLayoutEffect(() => {
    cameraRef.current = camera
  })

  const applyLookRadiansRef = useRef(() => {})
  applyLookRadiansRef.current = (dyaw, dpitch) => {
    const cam = cameraRef.current
    _euler.setFromQuaternion(cam.quaternion, 'YXZ')
    _euler.y += dyaw
    _euler.x += dpitch
    _euler.x = MathUtils.clamp(_euler.x, -Math.PI / 2 + 0.05, Math.PI / 2 - 0.05)
    cam.quaternion.setFromEuler(_euler)
  }

  useEffect(() => {
    if (!makeDefault) return
    const noop = { enabled: true, update() {} }
    const prev = get().controls
    set({ controls: noop })
    return () => set({ controls: prev })
  }, [makeDefault, get, set])

  const activePointerId = useRef(null)
  const lastRef = useRef({ x: 0, y: 0 })
  const lastMoveTime = useRef(0)
  const lastSegVel = useRef({ y: 0, x: 0 })
  const angularVel = useRef({ y: 0, x: 0 })
  const dragging = useRef(false)

  useEffect(() => {
    const el = gl.domElement

    const applyPixels = (dx, dy) => {
      applyLookRadiansRef.current(-dx * DRAG_LOOK_SENSITIVITY, -dy * DRAG_LOOK_SENSITIVITY)
      invalidate()
    }

    const onPointerDown = (e) => {
      if (activePointerId.current != null) return
      if (e.pointerType === 'mouse' && e.button !== 0) return
      activePointerId.current = e.pointerId
      dragging.current = true
      angularVel.current.y = 0
      angularVel.current.x = 0
      lastSegVel.current.y = 0
      lastSegVel.current.x = 0
      lastMoveTime.current = performance.now()
      lastRef.current = { x: e.clientX, y: e.clientY }
      try {
        el.setPointerCapture(e.pointerId)
      } catch (_) {
        /* ignore */
      }
      if (e.pointerType === 'mouse') el.style.cursor = 'grabbing'
    }

    const onPointerMove = (e) => {
      if (e.pointerId !== activePointerId.current) return
      const dx = e.clientX - lastRef.current.x
      const dy = e.clientY - lastRef.current.y
      lastRef.current.x = e.clientX
      lastRef.current.y = e.clientY

      const now = performance.now()
      const dtSec = (now - lastMoveTime.current) / 1000
      lastMoveTime.current = now

      if (dx !== 0 || dy !== 0) {
        applyPixels(dx, dy)
        if (dtSec > 1e-4 && dtSec < 0.08) {
          lastSegVel.current.y = (-dx * DRAG_LOOK_SENSITIVITY) / dtSec
          lastSegVel.current.x = (-dy * DRAG_LOOK_SENSITIVITY) / dtSec
        }
      }
    }

    const onPointerUp = (e) => {
      if (e.pointerId !== activePointerId.current) return
      activePointerId.current = null
      dragging.current = false
      try {
        if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId)
      } catch (_) {
        /* ignore */
      }
      el.style.cursor = ''

      const vy = MathUtils.clamp(
        lastSegVel.current.y * DRAG_LOOK_MOMENTUM_SCALE,
        -DRAG_LOOK_MOMENTUM_MAX_RAD_S,
        DRAG_LOOK_MOMENTUM_MAX_RAD_S,
      )
      const vx = MathUtils.clamp(
        lastSegVel.current.x * DRAG_LOOK_MOMENTUM_SCALE,
        -DRAG_LOOK_MOMENTUM_MAX_RAD_S,
        DRAG_LOOK_MOMENTUM_MAX_RAD_S,
      )
      angularVel.current.y = vy
      angularVel.current.x = vx
      if (Math.abs(vy) > 1e-4 || Math.abs(vx) > 1e-4) invalidate()
    }

    el.addEventListener('pointerdown', onPointerDown)
    el.addEventListener('pointermove', onPointerMove)
    el.addEventListener('pointerup', onPointerUp)
    el.addEventListener('pointercancel', onPointerUp)

    return () => {
      el.removeEventListener('pointerdown', onPointerDown)
      el.removeEventListener('pointermove', onPointerMove)
      el.removeEventListener('pointerup', onPointerUp)
      el.removeEventListener('pointercancel', onPointerUp)
      el.style.cursor = ''
    }
  }, [gl, invalidate])

  useFrame((_, delta) => {
    if (dragging.current) return
    let vy = angularVel.current.y
    let vx = angularVel.current.x
    if (Math.abs(vy) < 1e-5 && Math.abs(vx) < 1e-5) return

    applyLookRadiansRef.current(vy * delta, vx * delta)
    invalidate()

    const damp = Math.exp(-DRAG_LOOK_MOMENTUM_DAMPING * delta)
    vy *= damp
    vx *= damp
    if (Math.abs(vy) < 1e-4) vy = 0
    if (Math.abs(vx) < 1e-4) vx = 0
    angularVel.current.y = vy
    angularVel.current.x = vx
  })

  return null
}
