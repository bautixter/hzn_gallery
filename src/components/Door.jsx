import { useRef, useState, useMemo, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations, Html } from '@react-three/drei'
import { asset } from '../utils/asset'
import { MathUtils, LoopOnce } from 'three'
import { DOOR_RADIUS, SHOW_THRESHOLD, _camDir, _toDoor, easeInOut } from '../config'

const SLIDE_SPEED = 0.4  // tune: higher = faster charge toward camera
const OVERSHOOT   = 2.5  // >1 makes the door travel past the camera; 1/OVERSHOOT is the p where it crosses through

export default function Door({ angle, data, model, onActivate }) {
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
  const { actions } = useAnimations(animations, groupRef)

  const isSliding     = useRef(false)
  const slideProgress = useRef(0)
  const hasActivated  = useRef(false)

  const y         = useRef(-3)
  const isVisible = useRef(false)
  const [visible, setVisible] = useState(false)

  const handleClick = useCallback(() => {
    if (isSliding.current) return

    const action = actions['puerta_abrir']
    if (action) {
      action.reset()
      action.setLoop(LoopOnce, 1)
      action.clampWhenFinished = true
      action.play()
    }

    setVisible(false)
    isSliding.current    = true
    slideProgress.current = 0
    hasActivated.current  = false
  }, [actions])

  useFrame(({ camera }, delta) => {
    camera.getWorldDirection(_camDir)
    _toDoor.set(Math.sin(angle), 0, Math.cos(angle))
    const dot = _camDir.dot(_toDoor)

    // Y spring — always runs; targets 0 while sliding so door is fully raised
    const t       = MathUtils.smoothstep(dot, 0.7, 0.97)
    const yTarget = isSliding.current ? 0 : MathUtils.lerp(-3, 0, t)
    y.current = MathUtils.lerp(y.current, yTarget, 1 - Math.exp(-3 * delta))
    groupRef.current.position.y = y.current

    if (isSliding.current) {
      slideProgress.current = Math.min(slideProgress.current + delta * SLIDE_SPEED, 1)
      const p = easeInOut(slideProgress.current)

      // XZ slides toward and through the camera; Y left to the spring above
      groupRef.current.position.x = Math.sin(angle) * DOOR_RADIUS * (1 - p * OVERSHOOT)
      groupRef.current.position.z = Math.cos(angle) * DOOR_RADIUS * (1 - p * OVERSHOOT)

      // Fire when the door crosses through the camera (position = 0), i.e. p = 1/OVERSHOOT
      if (!hasActivated.current && p >= 1 / OVERSHOOT) {
        hasActivated.current = true
        onActivate()
      }
      return
    }

    const shouldShow = t > SHOW_THRESHOLD
    if (shouldShow !== isVisible.current) {
      isVisible.current = shouldShow
      setVisible(shouldShow)
    }
  })

  return (
    <group
      ref={groupRef}
      position={[Math.sin(angle) * DOOR_RADIUS, -3, Math.cos(angle) * DOOR_RADIUS]}
      rotation={[0, angle + Math.PI, 0]}
    >
      <primitive object={clonedScene} onClick={handleClick} />

      <Html
        position={[0.8, 2.5, 0]}
        distanceFactor={4}
        occlude={false}
        style={{
          width: 220,
          userSelect: 'none',
          pointerEvents: 'none',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }}
      >
        <div style={{ fontFamily: 'sans-serif', color: 'rgba(4, 39, 104, 0.51)' }}>
          <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.1, marginBottom: 4 }}>
            {data.header}
          </div>
          <div style={{ fontSize: 22, fontWeight: 400, opacity: 0.7, marginBottom: 10 }}>
            {data.subheader}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            {data.tags.map(tag => (
              <span key={tag} style={{
                fontSize: 18, padding: '2px 8px',
                border: '1px solid rgba(4, 39, 104, 0.51)',
                borderRadius: 20, opacity: 0.8,
              }}>
                {tag}
              </span>
            ))}
          </div>
          <div style={{ fontSize: 18, lineHeight: 1.5, opacity: 0.85 }}>
            {data.description}
          </div>
        </div>
      </Html>
    </group>
  )
}
