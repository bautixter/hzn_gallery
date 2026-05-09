import { useGLTF, Environment } from '@react-three/drei'
import { asset } from './utils/asset'
import HazeDome from './components/HazeDome'
import Floor from './components/Floor'
import Doors from './components/Doors'
import { DOOR_DATA } from './data/doorData'
import { ROOM_TYPES } from './rooms/registry'

const doorModels = [...new Set(DOOR_DATA.map(d => d.model ?? asset('/models/door.glb')))]
doorModels.forEach(m => useGLTF.preload(m))

export default function Scene({ activePortal, onActivate }) {
  if (activePortal !== null) {
    const { type } = DOOR_DATA[activePortal].room
    const ActiveRoom = ROOM_TYPES[type]
    if (!ActiveRoom) {
      console.warn(`ROOM_TYPES missing: ${type}`)
      return null
    }
    return <ActiveRoom />
  }

  return (
    <>
      <Environment files={asset('/textures/citrus_orchard_puresky_4k.hdr')} background backgroundBlurriness={0} />
      <HazeDome />
      <Floor />
      <Doors activePortal={activePortal} onActivate={onActivate} />
    </>
  )
}
