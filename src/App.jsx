import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import Scene from './rooms/hub/Scene'
import CanvasControls from './components/CanvasControls'
import AppChrome from './components/AppChrome'
import GalleryInfoOverlay from './components/GalleryInfoOverlay'
import LoadingScreen from './components/LoadingScreen'
import ControlsOverlay from './components/ControlsOverlay'
import { ControlsHintContext } from './contexts/ControlsHintContext'
import { useControlsHintState } from './hooks/useControlsHintState'
import { DEFAULT_FOV, DESKTOP_FOV, EYE_HEIGHT, getHubCameraYawTowardDoor } from './config/camera'
import { useDeviceOrientation } from './hooks/useDeviceOrientation'
import { usePointerCoarse } from './hooks/usePointerCoarse'
import { useSceneManager } from './utils/useSceneManager'

function FirstFrameNotifier({ onReady }) {
  const fired = useRef(false)
  useFrame(() => {
    if (!fired.current) {
      fired.current = true
      onReady()
    }
  })
  return null
}

function CameraFovSync({ fov }) {
  const { camera } = useThree()
  useEffect(() => {
    camera.fov = fov
    camera.updateProjectionMatrix()
  }, [camera, fov])
  return null
}

export default function App() {
  const [loaded, setLoaded] = useState(false)
  const { currentPage, visible: hintVisible, showIfUnseen, setCurrentPage, reopenHint, dismissHint } = useControlsHintState()

  // Show navigation hint once the scene is first rendered
  useEffect(() => {
    if (loaded) showIfUnseen('navigation')
  }, [loaded, showIfUnseen])
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
    <ControlsHintContext.Provider value={{ showIfUnseen, setCurrentPage }}>
      <LoadingScreen visible={!loaded} />
      <ControlsOverlay page={currentPage} visible={hintVisible} onDismiss={dismissHint} />
      <GalleryInfoOverlay
        activePortal={activePortal}
        compactWidth={pointerCoarse ? null : 380}
        onOpenControls={reopenHint}
      >
        <Canvas
          camera={{
            position: [0, EYE_HEIGHT, 0],
            rotation: [0, getHubCameraYawTowardDoor(), 0],
            fov,
          }}
          shadows
          gl={{ antialias: true }}
        >
          <FirstFrameNotifier onReady={() => setLoaded(true)} />
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
    </ControlsHintContext.Provider>
  )
}
