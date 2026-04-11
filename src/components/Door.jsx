import { useRef, useState, useMemo, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, MeshPortalMaterial, useAnimations, Html } from '@react-three/drei'
import { MathUtils, Matrix4, Quaternion, Vector3, LoopOnce } from 'three'
import { DOOR_RADIUS, SHOW_THRESHOLD, PORTAL_ACTIVATE_DOT, PORTAL_DEACTIVATE_DOT, TRANSITION_SPEED, easeInOut, _camDir, _toDoor } from '../config'
import RoomPortalContent from './RoomPortalContent'

export default function Door({ angle, data, onActivate }) {
  const { scene, animations } = useGLTF('/models/door.glb')

  const clonedScene = useMemo(() => scene.clone(true), [scene])

  const portalMeshData = useMemo(() => {
    let stencil = null
    clonedScene.traverse(child => {
      if (child.isMesh && child.name === 'stencil') stencil = child
    })
    if (!stencil) return null

    stencil.visible = false

    clonedScene.updateMatrixWorld(true)
    const invRoot = new Matrix4().copy(clonedScene.matrixWorld).invert()
    const relMat = stencil.matrixWorld.clone().premultiply(invRoot)

    const position = new Vector3()
    const quaternion = new Quaternion()
    const scale = new Vector3()
    relMat.decompose(position, quaternion, scale)

    return { geometry: stencil.geometry, position, quaternion, scale }
  }, [clonedScene])

  const groupRef = useRef()
  const { actions } = useAnimations(animations, groupRef)

  const portalMaterialRef = useRef()
  const isTransitioning = useRef(false)
  const transitionProgress = useRef(0)
  const hasActivated = useRef(false)

  const y = useRef(-3)
  const isVisible = useRef(false)
  const [visible, setVisible] = useState(false)
  const portalActiveRef = useRef(false)
  const [portalActive, setPortalActive] = useState(false)

  const handleClick = useCallback(() => {
    if (isTransitioning.current) return

    const action = actions['puerta_abrir']
    if (action) {
      action.reset()
      action.setLoop(LoopOnce, 1)
      action.clampWhenFinished = true
      action.play()
    }

    if (!portalActiveRef.current) {
      portalActiveRef.current = true
      setPortalActive(true)
    }
    setVisible(false)
    isTransitioning.current = true
    transitionProgress.current = 0
    hasActivated.current = false
  }, [actions])

  useFrame(({ camera }, delta) => {
    camera.getWorldDirection(_camDir)
    _toDoor.set(Math.sin(angle), 0, Math.cos(angle))
    const dot = _camDir.dot(_toDoor)

    if (isTransitioning.current) {
      transitionProgress.current = Math.min(
        transitionProgress.current + delta * TRANSITION_SPEED,
        1
      )
      const p = easeInOut(transitionProgress.current)

      groupRef.current.position.set(
        Math.sin(angle) * DOOR_RADIUS * (1 - p * 1.08),
        0,
        Math.cos(angle) * DOOR_RADIUS * (1 - p * 1.08)
      )

      if (portalMaterialRef.current) {
        portalMaterialRef.current.blend = p
      }

      if (!hasActivated.current && p >= 1 / 1.08) {
        hasActivated.current = true
        onActivate()
      }

      return
    }

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

    if (!portalActiveRef.current && dot > PORTAL_ACTIVATE_DOT) {
      portalActiveRef.current = true
      setPortalActive(true)
    } else if (portalActiveRef.current && dot < PORTAL_DEACTIVATE_DOT) {
      portalActiveRef.current = false
      setPortalActive(false)
    }
  })

  return (
    <group
      ref={groupRef}
      position={[Math.sin(angle) * DOOR_RADIUS, -3, Math.cos(angle) * DOOR_RADIUS]}
      rotation={[0, angle + Math.PI, 0]}
    >
      <primitive object={clonedScene} onClick={handleClick} />

      {portalMeshData && portalActive && (
        <mesh
          geometry={portalMeshData.geometry}
          position={portalMeshData.position}
          quaternion={portalMeshData.quaternion}
          scale={portalMeshData.scale}
          onClick={handleClick}
        >
          <MeshPortalMaterial ref={portalMaterialRef} resolution={512}>
            <RoomPortalContent />
          </MeshPortalMaterial>
        </mesh>
      )}

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
