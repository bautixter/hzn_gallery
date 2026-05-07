import { useGLTF, Environment } from '@react-three/drei'
import HazeDome from './components/HazeDome'
import Floor from './components/Floor'
import Doors from './components/Doors'
import { DOOR_DATA } from './data/doorData'
import RoomScene from './scenes/RoomScene'
import BoxScene from './scenes/BoxScene'

const SCENE_TYPES = {
  room: RoomScene,
  box:  BoxScene,
}

const doorModels = [...new Set(DOOR_DATA.map(d => d.model ?? '/models/door.glb'))]
doorModels.forEach(m => useGLTF.preload(m))
const sceneModels = [...new Set(DOOR_DATA.map(d => d.scene?.model).filter(Boolean))]
sceneModels.forEach(m => useGLTF.preload(m))

export default function Scene({ activePortal, onActivate }) {
  if (activePortal !== null) {
    const { type, ...sceneProps } = DOOR_DATA[activePortal].scene
    const ActiveScene = SCENE_TYPES[type]
    return <ActiveScene {...sceneProps} />
  }

  return (
    <>
      <Environment files="/textures/citrus_orchard_puresky_4k.hdr" background backgroundBlurriness={0} />
      <HazeDome />
      <Floor />
      <Doors activePortal={activePortal} onActivate={onActivate} />
    </>
  )
}
