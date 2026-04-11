import { useState, useEffect } from 'react'
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

  return (
    <>
      <Canvas
        camera={{ position: [0, 1.6, 3], fov: 50 }}
        gl={{ antialias: true }}
      >
        <Scene />
        <Controls granted={granted} />
      </Canvas>

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
