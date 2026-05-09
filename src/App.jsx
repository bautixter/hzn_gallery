import { Canvas } from '@react-three/fiber'
import Scene from './Scene'
import CanvasControls from './components/CanvasControls'
import AppChrome from './components/AppChrome'
import { useDeviceOrientation } from './hooks/useDeviceOrientation'
import { useSceneManager } from './utils/useSceneManager'

export default function App() {
  const { supported, granted, requestPermission } = useDeviceOrientation()
  const { activePortal, overlayOpacity, handleActivate, handleBack, FADE_MS } = useSceneManager()

  const showGyroPrompt =
    supported &&
    !granted &&
    typeof DeviceOrientationEvent.requestPermission === 'function'

  return (
    <>
      <Canvas
        camera={{ position: [0, 1.6, 3], fov: 50 }}
        gl={{ antialias: true }}
      >
        <Scene activePortal={activePortal} onActivate={handleActivate} />
        <CanvasControls granted={granted} />
      </Canvas>

      <AppChrome
        overlayOpacity={overlayOpacity}
        FADE_MS={FADE_MS}
        activePortal={activePortal}
        onBack={handleBack}
        showGyroPrompt={showGyroPrompt}
        onRequestGyro={requestPermission}
      />
    </>
  )
}
