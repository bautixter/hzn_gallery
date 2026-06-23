import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { Vector3, Quaternion, Matrix4, Box3, MathUtils } from 'three'
import { useControlsHint } from '../contexts/ControlsHintContext'
import { useFocusRegistry } from '../contexts/FocusContext'
import { SHOW_THRESHOLD } from '../config'
import PaintingLabel from './PaintingLabel'

const LERP = 0.09
const MAX_ZOOM = 5
const ORBIT_SPEED = 0.008      // radians of orbit per pixel dragged
const MAX_EL = 1.45            // clamp elevation just short of the poles (gimbal)

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

const FOCUS_DURATION = 1.2 // seconds for the eased camera fly to / from a work
const smootherstep = (t) => t * t * t * (t * (t * 6 - 15) + 10) // ease-in-out 0→1

// Pre-allocated — no GC pressure in useFrame
const _center = new Vector3()
const _camTarget = new Vector3()
const _baseQuat = new Quaternion()
const _offset = new Vector3()
const _lookMat = new Matrix4()
const _eye = new Vector3()      // camera world position (gaze test)
const _toModel = new Vector3()  // camera → model direction
const _camFwd = new Vector3()   // camera world forward
const WORLD_UP = new Vector3(0, 1, 0)

export default function Model({
  src,
  scaleTo = 1.4,            // normalise every model so its largest dimension is this many metres
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  spotlight = true,
  info = null,
}) {
  const { scene } = useGLTF(src)

  // Clone (so the same GLTF can appear more than once), recentre on the origin, scale to a
  // common display size, and enable shadows. `radius` is the bounding sphere used to frame it.
  const { model, offset, fitScale, radius, half } = useMemo(() => {
    const model = scene.clone(true)
    model.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true } })
    model.updateWorldMatrix(true, true)

    const box = new Box3().setFromObject(model)
    const size = new Vector3(); box.getSize(size)
    const center = new Vector3(); box.getCenter(center)
    const maxDim = Math.max(size.x, size.y, size.z) || 1
    const fitScale = scaleTo / maxDim
    const radius = 0.5 * size.length() * fitScale
    const half = [0.5 * size.x * fitScale, 0.5 * size.y * fitScale, 0.5 * size.z * fitScale] // scaled half-extents
    const offset = center.multiplyScalar(-fitScale) // recentre after scaling
    return { model, offset: offset.toArray(), fitScale, radius, half }
  }, [scene, scaleTo])

  // Cone light sized to this work, from front-and-above (model sits at the group origin).
  const spotUp = radius * 2.2
  const spotFront = radius * 1.4
  const spotDist = Math.hypot(spotUp, spotFront)
  const spotAngle = Math.min(0.95, Math.atan((radius * 1.3) / spotDist) + 0.12)
  const spotIntensity = 4 * spotDist * spotDist // keep illuminance ~constant across sizes (decay 2)

  // Rear fill from floor level behind, so the back stays lit when you orbit around the piece.
  const backDown = radius * 1.6
  const backBehind = radius * 1.8
  const backDist = Math.hypot(backDown, backBehind)
  const backAngle = Math.min(0.95, Math.atan((radius * 1.3) / backDist) + 0.12)
  const backIntensity = 2.5 * backDist * backDist // softer than the key light

  const groupRef = useRef()
  const innerRef = useRef()
  const spotRef = useRef()
  const spotTargetRef = useRef()
  const backRef = useRef()
  const backTargetRef = useRef()
  const hoverScale = useRef(1)
  const zoomRef = useRef(1)
  const orbitRef = useRef({ az: 0, el: 0 })   // azimuth / elevation of the camera around the model
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
  const { acquireFocus, releaseFocus, isAnyFocused } = useFocusRegistry()
  const focusHeld = useRef(false)

  // Count this work in the shared registry from the moment it takes the camera until the
  // fly-back has fully landed (released in useFrame), so other works' gaze tags don't
  // reappear mid-transition. Release on unmount too, so the count can't leak.
  useEffect(() => {
    if (focused && !focusHeld.current) {
      focusHeld.current = true
      acquireFocus()
    }
  }, [focused, acquireFocus])

  useEffect(() => () => {
    if (focusHeld.current) { focusHeld.current = false; releaseFocus() }
  }, [releaseFocus])

  useEffect(() => {
    if (spotRef.current && spotTargetRef.current) {
      spotRef.current.target = spotTargetRef.current
      spotRef.current.target.updateMatrixWorld()
    }
    if (backRef.current && backTargetRef.current) {
      backRef.current.target = backTargetRef.current
      backRef.current.target.updateMatrixWorld()
    }
  }, [radius, spotlight])

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

  // Drive the Controls button context and show the model hint once per session
  useEffect(() => {
    if (focused) showIfUnseen('model')
    else setCurrentPage('navigation')
  }, [focused, showIfUnseen, setCurrentPage])

  // Each time focus toggles, capture the pose the camera starts this transition from, so the
  // eased fly always begins from where the camera actually is. On first focus we also remember
  // the look-around pose to return to, and seed the orbit angles from the current view so the
  // fly-in is continuous. The model itself never moves, so its lighting is unchanged throughout.
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
      if (groupRef.current) {
        groupRef.current.getWorldPosition(_center)
        _offset.copy(fromPos.current).sub(_center)
        const len = _offset.length() || 1
        orbitRef.current.az = Math.atan2(_offset.x, _offset.z)
        orbitRef.current.el = clamp(Math.asin(clamp(_offset.y / len, -1, 1)), -MAX_EL, MAX_EL)
      }
    }
  }, [focused, camera])

  // Full-screen overlay: blocks DragLook (which listens on canvas), handles orbit + zoom.
  useEffect(() => {
    if (!focused) {
      zoomRef.current = 1
      return
    }

    const overlay = document.createElement('div')
    Object.assign(overlay.style, {
      position: 'fixed', inset: '0', zIndex: '100',
      touchAction: 'none', cursor: 'grab',
    })
    document.body.appendChild(overlay)

    const activePointers = new Map() // pointerId → { x, y }
    let lastPinchDist = null
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
        // orbit the camera around the model
        orbitRef.current.az -= dx * ORBIT_SPEED
        orbitRef.current.el = clamp(orbitRef.current.el - dy * ORBIT_SPEED, -MAX_EL, MAX_EL)
      } else if (pts.length === 2) {
        // pinch to zoom (dolly the orbit radius)
        const [a, b] = pts
        const dist = Math.hypot(b.x - a.x, b.y - a.y)
        if (lastPinchDist !== null) {
          zoomRef.current = clamp(zoomRef.current * (dist / lastPinchDist), 1, MAX_ZOOM)
        }
        lastPinchDist = dist
      }
    }

    const onPointerUp = (e) => {
      activePointers.delete(e.pointerId)
      if (activePointers.size < 2) lastPinchDist = null
      if (activePointers.size === 0) overlay.style.cursor = 'grab'
    }

    const onClick = () => {
      if (totalMove < 5) setFocused(false)
    }

    const onWheel = (e) => {
      e.preventDefault()
      zoomRef.current = clamp(zoomRef.current * Math.pow(0.999, e.deltaY), 1, MAX_ZOOM)
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
  }, [focused])

  useFrame((_, delta) => {
    const g = groupRef.current
    if (!g) return

    // Subtle hover swell for affordance.
    const sGoal = hovered && !focused ? 1.05 : 1
    hoverScale.current = MathUtils.lerp(hoverScale.current, sGoal, 0.1)
    if (innerRef.current) innerRef.current.scale.setScalar(hoverScale.current)

    // Info tag: reveal when the viewer looks straight at the work (and isn't focused).
    if (info) {
      g.getWorldPosition(_center)
      camera.getWorldPosition(_eye)
      _toModel.copy(_center).sub(_eye)
      camera.getWorldDirection(_camFwd)
      const gazing = _toModel.lengthSq() > 1e-6 && _camFwd.dot(_toModel.normalize()) > SHOW_THRESHOLD
      const show = gazing && !focused && !wasFocused.current && !isAnyFocused()
      if (show !== labelShown.current) {
        labelShown.current = show
        setLabelVisible(show)
      }
    }

    if (!wasFocused.current) return // this work never took the camera

    // Advance the eased transition (always 0→1, from the pose captured on the toggle).
    tween.current = clamp(tween.current + delta / FOCUS_DURATION, 0, 1)
    const e = smootherstep(tween.current)

    // Destination pose: orbiting the model while focused, else the saved look-around pose.
    if (focused) {
      g.getWorldPosition(_center)

      // Orbit radius that frames the model at 90% of the viewport (both dimensions); /zoom in.
      const tanV = Math.tan(MathUtils.degToRad(camera.fov) / 2)
      const fitV = radius / (tanV * 0.9)
      const fitH = radius / (tanV * camera.aspect * 0.9)
      const dist = Math.max(fitV, fitH) / zoomRef.current

      const { az, el } = orbitRef.current
      const ce = Math.cos(el)
      _offset.set(Math.sin(az) * ce, Math.sin(el), Math.cos(az) * ce)
      _camTarget.copy(_center).addScaledVector(_offset, dist)
      _lookMat.lookAt(_camTarget, _center, WORLD_UP) // camera looks at the model
      _baseQuat.setFromRotationMatrix(_lookMat)
    } else {
      _camTarget.copy(savedCamPos.current)
      _baseQuat.copy(savedCamQuat.current)
    }

    // Ease from the pose captured when this transition began to the destination, so a
    // return always starts from wherever the camera currently is (post orbit / zoom).
    camera.position.copy(fromPos.current).lerp(_camTarget, e)
    camera.quaternion.copy(fromQuat.current).slerp(_baseQuat, e)
    camera.updateMatrixWorld()

    if (!focused && tween.current === 1) {
      wasFocused.current = false // returned; release the camera
      if (focusHeld.current) { focusHeld.current = false; releaseFocus() } // re-enable other works' tags
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
            shadow-mapSize={[512, 512]}
            shadow-camera-near={0.3}
            shadow-camera-far={20}
            shadow-bias={-0.0005}
            shadow-normalBias={0.02}
          />
          <object3D ref={spotTargetRef} position={[0, -radius * 0.3, 0]} />
          <spotLight
            ref={backRef}
            position={[0, -backDown, -backBehind]}
            angle={backAngle}
            penumbra={0.85}
            intensity={backIntensity}
            decay={2}
            color="#e6f0ff"
          />
          <object3D ref={backTargetRef} position={[0, radius * 0.3, 0]} />
        </>
      )}
      <group ref={innerRef}>
        <primitive object={model} position={offset} scale={fitScale} />
      </group>
      <PaintingLabel info={info} visible={labelVisible} anchor={[half[0] + 0.2, half[1] * 0.7, 0]} />
    </group>
  )
}
