import { useGLTF, Environment } from '@react-three/drei'
import HazeDome from './components/HazeDome'
import Floor from './components/Floor'
import Doors from './components/Doors'

useGLTF.preload('/models/door.glb')

export default function Scene() {
  return (
    <>
      <Environment files="/textures/citrus_orchard_puresky_4k.hdr" background backgroundBlurriness={0} />
      <HazeDome />
      <Floor />
      <Doors />
    </>
  )
}
