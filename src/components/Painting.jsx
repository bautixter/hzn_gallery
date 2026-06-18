import { useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { Vector3, Quaternion, Euler, MathUtils } from 'three'
import { useControlsHint } from '../contexts/ControlsHintContext'

const CANVAS_DEPTH = 0.04
const LERP = 0.09
const MAX_ZOOM = 5
const TILT_SPEED = 0.006        // radians of tilt per pixel dragged
const MAX_TILT = Math.PI / 3    // clamp tilt to ±60° so the work never flips away

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

// Pre-allocated — no GC pressure in useFrame
const _dir = new Vector3()
const _camPos = new Vector3()
const _right = new Vector3()
const _up = new Vector3()
const _worldTarget = new Vector3()
const _localTarget = new Vector3()
const _focusQuat = new Quaternion()
const _origQuat = new Quaternion()
const _origPos = new Vector3()
const _camQuat = new Quaternion()
const _parentQuat = new Quaternion()
const _tiltQuat = new Quaternion()
const _tiltEuler = new Euler()
const _targetQuat = new Quaternion()

export default function Painting({
  src,
  width = 1.5,
  depth = CANVAS_DEPTH,
  canvasColor = '#ffffff',
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  spotlight = true,
}) {
  const texture = useTexture(src)
  const aspect = texture.image.width / texture.image.height
  const height = width / aspect

  // Cone light sized to this work, lit from front-and-above (local +z is the face).
  const spotFront = height * 1.2
  const spotUp = height * 1.8
  const spotDist = Math.hypot(spotUp, spotFront)
  const spotAngle = Math.min(0.85, Math.atan((Math.max(width, height) * 0.65) / spotDist) + 0.1)
  const spotIntensity = 11 * spotDist * spotDist // keep illuminance ~constant across sizes (decay 2)

  const groupRef = useRef()
  const boxMatRef = useRef()
  const spotRef = useRef()
  const spotTargetRef = useRef()
  const glowRef = useRef(0)
  const zoomRef = useRef(1)
  const panRef = useRef({ x: 0, y: 0 })
  const tiltRef = useRef({ x: 0, y: 0 }) // pitch / yaw offsets applied on top of the facing orientation
  const focusQuatRef = useRef(new Quaternion())

  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)

  const { camera } = useThree()
  const { showIfUnseen, setCurrentPage } = useControlsHint()

  const origEuler = useRef(new Euler(...rotation))
  useEffect(() => { origEuler.current.set(...rotation) }, [rotation])
  useEffect(() => { _origPos.set(...position) }, [position])

  // Aim the cone at the work (slightly below centre, so the shadow falls onto the floor)
  useEffect(() => {
    if (spotRef.current && spotTargetRef.current) {
      spotRef.current.target = spotTargetRef.current
      spotRef.current.target.updateMatrixWorld()
    }
  }, [height, spotlight])

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

  // Capture the orientation the painting should hold while focused: its face sits
  // perpendicular to the camera's view direction (parallel to the screen plane).
  // Matching the camera's world quaternion is exact, unlike lookAt(camPos) which
  // tilts slightly once the work is panned off-centre.
  useEffect(() => {
    if (!focused || !groupRef.current) return
    const g = groupRef.current
    camera.getWorldQuaternion(_camQuat)
    if (g.parent) {
      g.parent.getWorldQuaternion(_parentQuat)
      focusQuatRef.current.copy(_parentQuat).invert().multiply(_camQuat)
    } else {
      focusQuatRef.current.copy(_camQuat)
    }
    tiltRef.current = { x: 0, y: 0 } // start each close-up flat-on
  }, [focused, camera])

  // Full-screen overlay: blocks DragLook (which listens on canvas), handles pan/zoom
  useEffect(() => {
    if (!focused) {
      zoomRef.current = 1
      panRef.current = { x: 0, y: 0 }
      tiltRef.current = { x: 0, y: 0 }
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
      if (e.button === 1) e.preventDefault() // middle button: suppress browser autoscroll
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

      // Tilt the work: one finger on touch, middle-button drag on desktop.
      const tilting = e.pointerType === 'touch'
        ? pts.length === 1
        : (e.buttons & 4) === 4

      if (pts.length === 1 && tilting) {
        tiltRef.current.y = clamp(tiltRef.current.y + dx * TILT_SPEED, -MAX_TILT, MAX_TILT)
        tiltRef.current.x = clamp(tiltRef.current.x + dy * TILT_SPEED, -MAX_TILT, MAX_TILT)
      } else if (pts.length === 1) {
        // desktop left-drag: pan (X inverted so the work tracks the cursor)
        panRef.current.x += dx * mpp()
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
          panRef.current.x += (cx - lastCentroid.x) * mpp()
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

    const onMouseDown = (e) => { if (e.button === 1) e.preventDefault() }

    overlay.addEventListener('pointerdown', onPointerDown)
    overlay.addEventListener('pointermove', onPointerMove)
    overlay.addEventListener('pointerup', onPointerUp)
    overlay.addEventListener('pointercancel', onPointerUp)
    overlay.addEventListener('click', onClick)
    overlay.addEventListener('wheel', onWheel, { passive: false })
    overlay.addEventListener('mousedown', onMouseDown)

    return () => {
      overlay.removeEventListener('pointerdown', onPointerDown)
      overlay.removeEventListener('pointermove', onPointerMove)
      overlay.removeEventListener('pointerup', onPointerUp)
      overlay.removeEventListener('pointercancel', onPointerUp)
      overlay.removeEventListener('click', onClick)
      overlay.removeEventListener('wheel', onWheel)
      overlay.removeEventListener('mousedown', onMouseDown)
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

      // Pan in the screen plane — along the camera's right/up axes, not world X/Y —
      // so dragging never pushes the work along the camera's depth axis whatever
      // direction the viewer is facing (the ring of works in Liminal).
      _right.setFromMatrixColumn(camera.matrixWorld, 0)
      _up.setFromMatrixColumn(camera.matrixWorld, 1)

      _worldTarget
        .copy(_camPos)
        .addScaledVector(_dir, activeDist)
        .addScaledVector(_right, panRef.current.x)
        .addScaledVector(_up, panRef.current.y)

      g.parent
        ? g.parent.worldToLocal(_localTarget.copy(_worldTarget))
        : _localTarget.copy(_worldTarget)

      g.position.lerp(_localTarget, LERP)

      // Face the camera (captured on focus), then layer the interactive tilt on top.
      _tiltEuler.set(tiltRef.current.x, tiltRef.current.y, 0)
      _tiltQuat.setFromEuler(_tiltEuler)
      _targetQuat.copy(focusQuatRef.current).multiply(_tiltQuat)
      g.quaternion.slerp(_targetQuat, LERP)

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
      {spotlight && (
        <>
          <spotLight
            ref={spotRef}
            position={[0, spotUp, spotFront]}
            angle={spotAngle}
            penumbra={0.85}
            intensity={spotIntensity}
            decay={2}
            color="#fff4e6"
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-camera-near={0.3}
            shadow-camera-far={20}
            shadow-bias={-0.0005}
            shadow-normalBias={0.02}
          />
          <object3D ref={spotTargetRef} position={[0, -height * 0.4, 0]} />
        </>
      )}
      <mesh>
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
