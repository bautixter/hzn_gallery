import { useState } from 'react'
import { useGLTF, Environment } from '@react-three/drei'
import HazeDome from './components/HazeDome'
import Floor from './components/Floor'
import Doors from './components/Doors'

useGLTF.preload('/models/door.glb')
useGLTF.preload('/models/room.glb')

export default function Scene() {
  const [activePortal, setActivePortal] = useState(null)
  return (
    <>
      {activePortal === null && (
        <>
          <Environment files="/textures/citrus_orchard_puresky_4k.hdr" background backgroundBlurriness={0} />
          <HazeDome />
          <Floor />
        </>
      )}
      <Doors activePortal={activePortal} onActivate={setActivePortal} />
    </>
  )
}
