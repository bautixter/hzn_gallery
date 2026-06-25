import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { XROrigin, useXR } from '@react-three/xr'
import { BackSide } from 'three'
import VRWristExit from './VRWristExit'

// Comfort blink: fade both eyes to black, snap the rig at full black, fade back in.
const FADE_IN = 0.16   // seconds, eyes -> black
const HOLD = 0.06      // seconds held fully black (covers the snap)
const FADE_OUT = 0.26  // seconds, black -> eyes
const HOME = [0, 0, 0] // the room spawn (rig origin); selecting the active work again returns here

/**
 * The VR player rig. Renders the <XROrigin> (the player's feet — moving it moves the user) plus
 * a black shell locked to the headset that performs the teleport blink. Registers a
 * `teleportToWork` API into `navRef` so the works can move the user instead of flying the camera.
 */
export default function XRRig({ navRef, roomKey = null, onExit }) {
  const originRef = useRef(null)
  const fadeRef = useRef(null)
  const matRef = useRef(null)
  const camera = useThree((s) => s.camera)
  const session = useXR((s) => s.session)

  const blink = useRef({ active: false, phase: 'idle', t: 0, fired: false, onBlack: null })
  const activeId = useRef(null)

  useEffect(() => {
    const moveRig = (position, yaw) => {
      const o = originRef.current
      if (!o) return
      o.position.set(position[0], 0, position[2])
      o.rotation.set(0, yaw, 0)
    }

    const startBlink = (position, yaw) => {
      const b = blink.current
      b.active = true
      b.phase = 'in'
      b.t = 0
      b.fired = false
      b.onBlack = () => moveRig(position, yaw)
    }

    const api = {
      // Toggle: a fresh work teleports you in front of it; selecting the work you're already at
      // returns you to the room spawn. Either way the move happens behind a blink.
      teleportToWork(id, position, yaw) {
        if (activeId.current === id) {
          activeId.current = null
          startBlink(HOME, 0)
        } else {
          activeId.current = id
          startBlink(position, yaw)
        }
      },
    }
    navRef.current = api
    return () => { if (navRef.current === api) navRef.current = null }
  }, [navRef])

  // Recentre the rig (and clear any pending blink / target) whenever a session starts or ends, or
  // the room changes — so each room is entered from its authored spawn rather than a carried-over
  // teleport offset.
  useEffect(() => {
    const o = originRef.current
    if (o) { o.position.set(0, 0, 0); o.rotation.set(0, 0, 0) }
    activeId.current = null
    blink.current.active = false
    blink.current.phase = 'idle'
    if (matRef.current) matRef.current.opacity = 0
  }, [session, roomKey])

  useFrame((_, delta) => {
    // Keep the shell centred on the headset so it always fills both eyes.
    if (fadeRef.current) camera.getWorldPosition(fadeRef.current.position)

    const b = blink.current
    if (!b.active) return
    b.t += delta
    let opacity = 0
    if (b.phase === 'in') {
      opacity = Math.min(1, b.t / FADE_IN)
      if (b.t >= FADE_IN) {
        if (!b.fired) { b.fired = true; b.onBlack?.() }
        b.phase = 'hold'; b.t = 0; opacity = 1
      }
    } else if (b.phase === 'hold') {
      opacity = 1
      if (b.t >= HOLD) { b.phase = 'out'; b.t = 0 }
    } else {
      opacity = Math.max(0, 1 - b.t / FADE_OUT)
      if (b.t >= FADE_OUT) { b.active = false; b.phase = 'idle'; opacity = 0 }
    }
    if (matRef.current) matRef.current.opacity = opacity
  })

  return (
    <>
      <XROrigin ref={originRef}>
        {/* Wrist exit appears only inside a room (in the hub you use the doors). Mounted here so
            its wrist transform inherits the rig offset after a teleport. */}
        {session != null && roomKey != null && onExit && (
          <VRWristExit hand="left" onExit={onExit} />
        )}
      </XROrigin>
      <mesh ref={fadeRef} renderOrder={9999} frustumCulled={false}>
        <sphereGeometry args={[0.2, 16, 12]} />
        <meshBasicMaterial
          ref={matRef}
          color="black"
          side={BackSide}
          transparent
          opacity={0}
          depthTest={false}
          depthWrite={false}
          toneMapped={false}
          fog={false}
        />
      </mesh>
    </>
  )
}
