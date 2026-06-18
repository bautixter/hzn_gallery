import { useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { Vector3, Quaternion, Euler, MathUtils } from 'three'
import { useControlsHint } from '../contexts/ControlsHintContext'
import { SHOW_THRESHOLD } from '../config'
import PaintingLabel from './PaintingLabel'

const CANVAS_DEPTH = 0.04
const LERP = 0.09
const MAX_ZOOM = 5
const TILT_SPEED = 0.006        // radians of tilt per pixel dragged
const MAX_TILT = Math.PI / 3    // clamp tilt to ±60° so the work never flips away

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

const FOCUS_DURATION = 1.2 // seconds for the eased camera fly to / from a work
const smootherstep = (t) => t * t * t * (t * (t * 6 - 15) + 10) // ease-in-out 0→1

// Pre-allocated — no GC pressure in useFrame
const _right = new Vector3()
const _up = new Vector3()
const _normal = new Vector3()
const _center = new Vector3()
const _camTarget = new Vector3()
const _origQuat = new Quaternion()
const _origPos = new Vector3()
const _parentQuat = new Quaternion()
const _baseQuat = new Quaternion()
const _tiltQuat = new Quaternion()
const _tiltEuler = new Euler()
const _targetQuat = new Quaternion()
const _eye = new Vector3()      // camera world position (gaze test)
const _toWork = new Vector3()   // camera → work direction
const _camFwd = new Vector3()   // camera world forward

export default function Painting({
  src,
  width = 1.5,
  depth = CANVAS_DEPTH,
  canvasColor = '#ffffff',
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  spotlight = true,
  info = null,
}) {
  const texture = useTexture(src)
  const aspect = texture.image.width / texture.image.height
  const height = width / aspect

  // Cone light sized to this work, lit from front-and-above (local +z is the face).
  const spotFront = height * 1.2
  const spotUp = height * 1.8
  const spotDist = Math.hypot(spotUp, spotFront)
  const spotAngle = Math.min(0.85, Math.atan((Math.max(width, height) * 0.65) / spotDist) + 0.1)
  const spotIntensity = 5 * spotDist * spotDist // keep illuminance ~constant across sizes (decay 2)

  const groupRef = useRef()
  const boxMatRef = useRef()
  const spotRef = useRef()
  const spotTargetRef = useRef()
  const glowRef = useRef(0)
  const zoomRef = useRef(1)
  const panRef = useRef({ x: 0, y: 0 })
  const tiltRef = useRef({ x: 0, y: 0 }) // pitch / yaw offsets that tilt the work in place
  const savedCamPos = useRef(new Vector3())   // viewer pose to fly back to on exit
  const savedCamQuat = useRef(new Quaternion())
  const fromPos = useRef(new Vector3())       // pose the current transition eases from
  const fromQuat = useRef(new Quaternion())
  const wasFocused = useRef(false)            // true once this work has taken the camera
  const tween = useRef(0)                     // eased 0→1 progress of the active transition

  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [labelVisible, setLabelVisible] = useState(false)
  const labelShown = useRef(false)

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

  // Each time focus toggles, capture the pose the camera starts this transition from,
  // so the eased fly always begins from where the camera actually is (after any pan or
  // tilt). On first focus we also remember the look-around pose to return to. The work
  // itself never leaves the wall, so its lighting is unchanged throughout.
  useEffect(() => {
    camera.getWorldPosition(fromPos.current)
    camera.getWorldQuaternion(fromQuat.current)
    tween.current = 0
    if (focused) {
      if (!wasFocused.current) {
        savedCamPos.current.copy(fromPos.current)
        savedCamQuat.current.copy(fromQuat.current)
      }
      wasFocused.current = true
      tiltRef.current = { x: 0, y: 0 } // start each close-up flat-on
    }
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

  useFrame((_, delta) => {
    const g = groupRef.current
    if (!g) return

    // Glow
    const glowGoal = focused ? 0.3 : hovered ? 0.12 : 0
    glowRef.current = MathUtils.lerp(glowRef.current, glowGoal, 0.1)
    if (boxMatRef.current) boxMatRef.current.emissiveIntensity = glowRef.current

    // Info tag: reveal when the viewer looks straight at the work (and isn't focused).
    if (info) {
      g.getWorldPosition(_center)
      camera.getWorldPosition(_eye)
      _toWork.copy(_center).sub(_eye)
      camera.getWorldDirection(_camFwd)
      const gazing = _toWork.lengthSq() > 1e-6 && _camFwd.dot(_toWork.normalize()) > SHOW_THRESHOLD
      const show = gazing && !focused && !wasFocused.current
      if (show !== labelShown.current) {
        labelShown.current = show
        setLabelVisible(show)
      }
    }

    // The work never leaves its hung position; focus only tilts it in place.
    _origPos.set(...position)
    g.position.lerp(_origPos, LERP)
    _origQuat.setFromEuler(origEuler.current)
    if (focused) {
      _tiltEuler.set(tiltRef.current.x, tiltRef.current.y, 0)
      _tiltQuat.setFromEuler(_tiltEuler)
      _targetQuat.copy(_origQuat).multiply(_tiltQuat)
      g.quaternion.slerp(_targetQuat, LERP)
    } else {
      g.quaternion.slerp(_origQuat, LERP)
    }

    if (!wasFocused.current) return // this work never took the camera

    // Advance the eased transition (always 0→1, from the pose captured on the toggle).
    tween.current = clamp(tween.current + delta / FOCUS_DURATION, 0, 1)
    const e = smootherstep(tween.current)

    // Destination pose: the work itself while focused, else the saved look-around pose.
    if (focused) {
      // World centre and base (untilted) orientation of the work.
      g.getWorldPosition(_center)
      if (g.parent) {
        g.parent.getWorldQuaternion(_parentQuat)
        _baseQuat.copy(_parentQuat).multiply(_origQuat)
      } else {
        _baseQuat.copy(_origQuat)
      }
      _normal.set(0, 0, 1).applyQuaternion(_baseQuat) // the work's face direction
      _right.set(1, 0, 0).applyQuaternion(_baseQuat)
      _up.set(0, 1, 0).applyQuaternion(_baseQuat)

      // Distance at which the work fills 90% of the viewport — fitting BOTH dimensions
      // (camera.fov is vertical; width is bound by the horizontal fov via aspect), so
      // landscape works sit fully in view too. /zoom then dollies closer.
      const tanV = Math.tan(MathUtils.degToRad(camera.fov) / 2)
      const fitHeight = height / (2 * tanV * 0.9)
      const fitWidth = width / (2 * tanV * camera.aspect * 0.9)
      const activeDist = Math.max(fitHeight, fitWidth) / zoomRef.current

      // Camera sits square-on in front of the work; pan strafes parallel to its plane.
      // (Moving the camera by −pan reproduces exactly the old "move the work by +pan"
      // view, so the pan/zoom maths in the overlay need no changes.)
      _camTarget
        .copy(_center)
        .addScaledVector(_normal, activeDist)
        .addScaledVector(_right, -panRef.current.x)
        .addScaledVector(_up, -panRef.current.y)
    } else {
      _camTarget.copy(savedCamPos.current)
      _baseQuat.copy(savedCamQuat.current)
    }

    // Ease from the pose captured when this transition began to the destination, so a
    // return always starts from wherever the camera currently is (post pan / tilt).
    camera.position.copy(fromPos.current).lerp(_camTarget, e)
    camera.quaternion.copy(fromQuat.current).slerp(_baseQuat, e)
    camera.updateMatrixWorld()

    if (!focused && tween.current === 1) wasFocused.current = false // returned; release
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
        {/* Matte, light-responsive surface — the cone above shapes it like a gallery wash */}
        <meshStandardMaterial map={texture} roughness={0.9} metalness={0} />
      </mesh>
      <PaintingLabel info={info} visible={labelVisible} anchor={[width / 2 + 0.3, height / 2, 0]} />
    </group>
  )
}
