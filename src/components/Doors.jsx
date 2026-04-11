import Door from './Door'
import { DOOR_COUNT } from '../config'
import { DOOR_DATA } from '../data/doorData'

export default function Doors({ activePortal, onActivate }) {
  return Array.from({ length: DOOR_COUNT }, (_, i) => {
    if (activePortal !== null && activePortal !== i) return null
    const angle = (2 * Math.PI / DOOR_COUNT) * i
    return (
      <Door
        key={i}
        angle={angle}
        data={DOOR_DATA[i]}
        onActivate={() => onActivate(i)}
      />
    )
  })
}
