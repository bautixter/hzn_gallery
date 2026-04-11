import { useState, useMemo, useCallback } from 'react'
import { useGLTF, Environment } from '@react-three/drei'
import HazeDome from './components/HazeDome'
import Floor from './components/Floor'
import Doors from './components/Doors'

useGLTF.preload('/models/door.glb')
useGLTF.preload('/models/room.glb')

function RoomScene() {
  const { scene } = useGLTF('/models/room.glb')
  const clone = useMemo(() => scene.clone(true), [scene])
  return (
    <>
      <ambientLight intensity={1.5} />
      <primitive object={clone} />
    </>
  )
}

export default function Scene({ onFlash }) {
  const [activePortal, setActivePortal] = useState(null)

  const handleActivate = useCallback((i) => {
    onFlash()
    // Delay the scene swap to coincide with peak black (45% of the 0.8s animation)
    setTimeout(() => setActivePortal(i), 360)
  }, [onFlash])

  return activePortal === null ? (
    <>
      <Environment files="/textures/citrus_orchard_puresky_4k.hdr" background backgroundBlurriness={0} />
      <HazeDome />
      <Floor />
      <Doors activePortal={activePortal} onActivate={handleActivate} />
    </>
  ) : (
    <RoomScene />
  )
}
