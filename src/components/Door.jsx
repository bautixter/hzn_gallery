import { useRef, useState, useMemo, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations, Html } from '@react-three/drei'
import { MathUtils, LoopOnce } from 'three'
import { DOOR_RADIUS, SHOW_THRESHOLD, _camDir, _toDoor } from '../config'

export default function Door({ angle, data }) {
  const { scene, animations } = useGLTF('/models/door.glb')
  const clonedScene = useMemo(() => scene.clone(true), [scene])

  const groupRef = useRef()
  const { actions } = useAnimations(animations, groupRef)

  const y = useRef(-3)
  const isVisible = useRef(false)
  const [visible, setVisible] = useState(false)

  const handleClick = useCallback(() => {
    const action = actions['puerta_abrir']
    if (!action) return
    action.reset()
    action.setLoop(LoopOnce, 1)
    action.clampWhenFinished = true
    action.play()
  }, [actions])

  useFrame(({ camera }, delta) => {
    camera.getWorldDirection(_camDir)
    _toDoor.set(Math.sin(angle), 0, Math.cos(angle))
    const dot = _camDir.dot(_toDoor)

    const t = MathUtils.smoothstep(dot, 0.7, 0.97)
    const target = MathUtils.lerp(-3, 0, t)

    const speed = 3
    y.current = MathUtils.lerp(y.current, target, 1 - Math.exp(-speed * delta))
    groupRef.current.position.y = y.current

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
