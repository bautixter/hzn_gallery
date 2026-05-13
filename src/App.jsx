import { useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import Scene from './rooms/hub/Scene'
import CanvasControls from './components/CanvasControls'
import AppChrome from './components/AppChrome'
import GalleryInfoOverlay from './components/GalleryInfoOverlay'
import { DEFAULT_FOV, DESKTOP_FOV, EYE_HEIGHT, getHubCameraYawTowardDoor } from './config/camera'
import { useDeviceOrientation } from './hooks/useDeviceOrientation'
import { usePointerCoarse } from './hooks/usePointerCoarse'
import { useSceneManager } from './utils/useSceneManager'

function CameraFovSync({ fov }) {
  const { camera } = useThree()
  useEffect(() => {
    camera.fov = fov
    camera.updateProjectionMatrix()
  }, [camera, fov])
  return null
}

export default function App() {
  const { supported, granted, requestPermission } = useDeviceOrientation()
  const {
    activePortal,
    overlayOpacity,
    handleActivate,
    handleBack,
    FADE_MS,
    exitChoreography,
    registerDoorInteractionFreeze,
    onExitReverseComplete,
  } = useSceneManager()
  const pointerCoarse = usePointerCoarse()
  const fov = pointerCoarse ? DEFAULT_FOV : DESKTOP_FOV

  const showGyroPrompt =
    supported &&
    !granted &&
    typeof DeviceOrientationEvent.requestPermission === 'function'

  return (
    <>
      <GalleryInfoOverlay activePortal={activePortal} compactWidth={pointerCoarse ? null : 380}>
        <Canvas
          camera={{
            position: [0, EYE_HEIGHT, 0],
            rotation: [0, getHubCameraYawTowardDoor(), 0],
            fov,
          }}
          gl={{ antialias: true }}
        >
          <CameraFovSync fov={fov} />
          <Scene
            activePortal={activePortal}
            onActivate={handleActivate}
            exitChoreography={exitChoreography}
            onDoorInteractionFreeze={registerDoorInteractionFreeze}
            onExitReverseComplete={onExitReverseComplete}
          />
          <CanvasControls
            pointerCoarse={pointerCoarse}
            granted={granted}
            exitCameraSnapshot={exitChoreography?.snapshot ?? null}
          />
        </Canvas>
      </GalleryInfoOverlay>

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
