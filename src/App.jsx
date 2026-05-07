import { useState, useEffect, useCallback } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, DeviceOrientationControls } from '@react-three/drei'
import Scene from './Scene'

function useDeviceOrientation() {
  const [granted, setGranted] = useState(false)
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    if (!window.DeviceOrientationEvent) return

    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      setSupported(true)
      return
    }

    const handler = (e) => {
      if (e.alpha !== null && e.beta !== null && e.gamma !== null) {
        setSupported(true)
        setGranted(true)
        window.removeEventListener('deviceorientation', handler)
      }
    }
    window.addEventListener('deviceorientation', handler)
    return () => window.removeEventListener('deviceorientation', handler)
  }, [])

  const requestPermission = () => {
    DeviceOrientationEvent.requestPermission()
      .then((result) => { if (result === 'granted') setGranted(true) })
  }

  return { supported, granted, requestPermission }
}

function Controls({ granted }) {
  const { camera } = useThree()

  useEffect(() => {
    if (granted) camera.position.set(0, 2.5, 0)
  }, [granted])

  return granted
    ? <DeviceOrientationControls />
    : <OrbitControls target={[0, 1.6, 0]} maxPolarAngle={Math.PI} />
}

export default function App() {
  const { supported, granted, requestPermission } = useDeviceOrientation()

  const [flashKey, setFlashKey] = useState(0)
  const triggerFlash = useCallback(() => setFlashKey(k => k + 1), [])

  const [activePortal, setActivePortal] = useState(null)

  const handleActivate = useCallback((i) => {
    triggerFlash()
    setTimeout(() => setActivePortal(i), 400)
  }, [triggerFlash])

  const handleBack = useCallback(() => {
    triggerFlash()
    setTimeout(() => setActivePortal(null), 400)
  }, [triggerFlash])

  return (
    <>
      <style>{`
        @keyframes fadeBlack {
          0%   { opacity: 0; }
          35%  { opacity: 1; }
          65%  { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>

      <Canvas
        camera={{ position: [0, 1.6, 3], fov: 50 }}
        gl={{ antialias: true }}
      >
        <Scene activePortal={activePortal} onActivate={handleActivate} />
        <Controls granted={granted} />
      </Canvas>

      {flashKey > 0 && (
        <div
          key={flashKey}
          style={{
            position: 'fixed', inset: 0,
            background: '#000',
            pointerEvents: 'none',
            zIndex: 1000,
            animation: 'fadeBlack 0.8s ease-in-out forwards',
          }}
        />
      )}

      {activePortal !== null && (
        <button
          onClick={handleBack}
          style={{
            position: 'fixed', top: 24, left: 24,
            padding: '10px 20px',
            background: 'rgba(0,0,0,0.35)',
            border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: 8, fontSize: 15, cursor: 'pointer',
            color: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(6px)',
            zIndex: 10,
          }}
        >
          ← Back
        </button>
      )}

      {supported && !granted && typeof DeviceOrientationEvent.requestPermission === 'function' && (
        <button
          onClick={requestPermission}
          style={{
            position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
            padding: '12px 24px', background: 'white', border: 'none',
            borderRadius: 8, fontSize: 16, cursor: 'pointer', opacity: 0.9,
            zIndex: 10,
          }}
        >
          Enable gyroscope
        </button>
      )}
    </>
  )
}
