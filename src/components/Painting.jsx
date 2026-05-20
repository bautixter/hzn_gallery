import { useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { Vector3, Quaternion, Euler, MathUtils } from 'three'
import { useControlsHint } from '../contexts/ControlsHintContext'

const CANVAS_DEPTH = 0.04
const LERP = 0.09
const MAX_ZOOM = 5

// Pre-allocated — no GC pressure in useFrame
const _dir = new Vector3()
const _camPos = new Vector3()
const _worldTarget = new Vector3()
const _localTarget = new Vector3()
const _focusQuat = new Quaternion()
const _origQuat = new Quaternion()
const _origPos = new Vector3()

export default function Painting({
  src,
  width = 1.5,
  depth = CANVAS_DEPTH,
  canvasColor = '#ffffff',
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) {
  const texture = useTexture(src)
  const aspect = texture.image.width / texture.image.height
  const height = width / aspect

  const groupRef = useRef()
  const boxMatRef = useRef()
  const glowRef = useRef(0)
  const zoomRef = useRef(1)
  const panRef = useRef({ x: 0, y: 0 })
  const focusQuatRef = useRef(new Quaternion())

  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)

  const { camera } = useThree()
  const { showIfUnseen, setCurrentPage } = useControlsHint()

  const origEuler = useRef(new Euler(...rotation))
  useEffect(() => { origEuler.current.set(...rotation) }, [rotation])
  useEffect(() => { _origPos.set(...position) }, [position])

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : ''
    return () => { document.body.style.cursor = '' }
  }, [hovered])

  useEffect(() => {
    if (!focused) return
    const onKey = (e) => { if (e.key === 'Escape') setFocused(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [focused])

  // Drive the Controls button context and show painting hint once per session
  useEffect(() => {
    if (focused) {
      showIfUnseen('painting')
    } else {
      setCurrentPage('navigation')
    }
  }, [focused, showIfUnseen, setCurrentPage])

  // Capture the orientation the painting should hold while focused (face camera, fixed)
  useEffect(() => {
    if (!focused || !groupRef.current) return
    const g = groupRef.current
    camera.getWorldPosition(_camPos)
    const saved = g.quaternion.clone()
    g.lookAt(_camPos)
    focusQuatRef.current.copy(g.quaternion)
    g.quaternion.copy(saved)
  }, [focused, camera])

  // Full-screen overlay: blocks DragLook (which listens on canvas), handles pan/zoom
  useEffect(() => {
    if (!focused) {
      zoomRef.current = 1
      panRef.current = { x: 0, y: 0 }
      return
    }

    const overlay = document.createElement('div')
    Object.assign(overlay.style, {
      position: 'fixed', inset: '0', zIndex: '100',
      touchAction: 'none', cursor: 'grab',
    })
    document.body.appendChild(overlay)

    // meters-per-pixel at current zoom (how much world space one screen pixel covers)
    const mpp = () => height / (0.9 * zoomRef.current * window.innerHeight)

    const activePointers = new Map() // pointerId → { x, y }
    let lastPinchDist = null
    let lastCentroid = null
    let totalMove = 0

    const onPointerDown = (e) => {
      overlay.setPointerCapture(e.pointerId)
      activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      totalMove = 0
      overlay.style.cursor = 'grabbing'
    }

    const onPointerMove = (e) => {
      if (!activePointers.has(e.pointerId)) return
      const prev = activePointers.get(e.pointerId)
      const dx = e.clientX - prev.x
      const dy = e.clientY - prev.y
      totalMove += Math.abs(dx) + Math.abs(dy)
      activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY })

      const pts = [...activePointers.values()]

      if (pts.length === 1) {
        panRef.current.x -= dx * mpp()
        panRef.current.y -= dy * mpp()
      } else if (pts.length === 2) {
        const [a, b] = pts
        const dist = Math.hypot(b.x - a.x, b.y - a.y)
        const cx = (a.x + b.x) / 2
        const cy = (a.y + b.y) / 2

        if (lastPinchDist !== null) {
          const before = mpp()
          zoomRef.current = Math.max(1, Math.min(MAX_ZOOM, zoomRef.current * (dist / lastPinchDist)))
          const after = mpp()
          // Keep pinch centroid fixed in world space
          panRef.current.x += (cx - window.innerWidth / 2) * (before - after)
          panRef.current.y -= (cy - window.innerHeight / 2) * (before - after)
        }

        if (lastCentroid !== null) {
          panRef.current.x -= (cx - lastCentroid.x) * mpp()
          panRef.current.y -= (cy - lastCentroid.y) * mpp()
        }

        lastPinchDist = dist
        lastCentroid = { x: cx, y: cy }
      }
    }

    const onPointerUp = (e) => {
      activePointers.delete(e.pointerId)
      if (activePointers.size < 2) { lastPinchDist = null; lastCentroid = null }
      if (activePointers.size === 0) overlay.style.cursor = 'grab'
    }

    const onClick = () => {
      if (totalMove < 5) setFocused(false)
    }

    const onWheel = (e) => {
      e.preventDefault()
      const before = mpp()
      const newZoom = Math.max(1, Math.min(MAX_ZOOM, zoomRef.current * Math.pow(0.999, e.deltaY)))
      zoomRef.current = newZoom
      const after = mpp()
      panRef.current.x += (e.clientX - window.innerWidth / 2) * (before - after)
      panRef.current.y -= (e.clientY - window.innerHeight / 2) * (before - after)
      if (zoomRef.current === 1) panRef.current = { x: 0, y: 0 }
    }

    overlay.addEventListener('pointerdown', onPointerDown)
    overlay.addEventListener('pointermove', onPointerMove)
    overlay.addEventListener('pointerup', onPointerUp)
    overlay.addEventListener('pointercancel', onPointerUp)
    overlay.addEventListener('click', onClick)
    overlay.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      overlay.removeEventListener('pointerdown', onPointerDown)
      overlay.removeEventListener('pointermove', onPointerMove)
      overlay.removeEventListener('pointerup', onPointerUp)
      overlay.removeEventListener('pointercancel', onPointerUp)
      overlay.removeEventListener('click', onClick)
      overlay.removeEventListener('wheel', onWheel)
      document.body.removeChild(overlay)
    }
  }, [focused, height])

  useFrame(() => {
    const g = groupRef.current
    if (!g) return

    // Glow
    const glowGoal = focused ? 0.3 : hovered ? 0.12 : 0
    glowRef.current = MathUtils.lerp(glowRef.current, glowGoal, 0.1)
    if (boxMatRef.current) boxMatRef.current.emissiveIntensity = glowRef.current

    if (focused) {
      const fovRad = MathUtils.degToRad(camera.fov)
      // baseDist: distance where painting fills 90% of viewport height at zoom=1
      // dividing by zoom moves painting closer → appears larger
      const activeDist = height / (2 * Math.tan(fovRad / 2) * 0.9) / zoomRef.current

      camera.getWorldDirection(_dir)
      camera.getWorldPosition(_camPos)

      _worldTarget
        .copy(_camPos)
        .addScaledVector(_dir, activeDist)
      _worldTarget.x += panRef.current.x
      _worldTarget.y += panRef.current.y

      g.parent
        ? g.parent.worldToLocal(_localTarget.copy(_worldTarget))
        : _localTarget.copy(_worldTarget)

      g.position.lerp(_localTarget, LERP)

      // Hold fixed orientation (captured once on focus, no per-frame lookAt)
      g.quaternion.slerp(focusQuatRef.current, LERP)

    } else {
      _origPos.set(...position)
      g.position.lerp(_origPos, LERP)
      _origQuat.setFromEuler(origEuler.current)
      g.quaternion.slerp(_origQuat, LERP)
    }
  })

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      onClick={(e) => { e.stopPropagation(); setFocused(f => !f) }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <mesh castShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial ref={boxMatRef} color={canvasColor} emissive="#ffffff" emissiveIntensity={0} />
      </mesh>
      <mesh castShadow position={[0, 0, depth / 2 + 0.001]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={texture} />
      </mesh>
    </group>
  )
}
