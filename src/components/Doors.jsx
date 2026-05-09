import { useRef } from 'react'
import Door from './Door'
import { DOOR_COUNT } from '../config'
import { DOOR_DATA } from '../data/doorData'

export default function Doors({
  activePortal,
  onActivate,
  exitChoreography,
  onDoorInteractionFreeze,
  onExitReverseComplete,
}) {
  const approachPortalRef = useRef(null)

  return Array.from({ length: DOOR_COUNT }, (_, i) => {
    if (activePortal !== null && activePortal !== i) return null
    const angle = (2 * Math.PI / DOOR_COUNT) * i
    const exitReverse =
      !!exitChoreography && exitChoreography.snapshot.portalIndex === i
    return (
      <Door
        key={i}
        portalIndex={i}
        angle={angle}
        data={DOOR_DATA[i]}
        model={DOOR_DATA[i].model}
        onActivate={() => onActivate(i)}
        onInteractionFreeze={onDoorInteractionFreeze}
        exitReverse={exitReverse}
        exitSnapshot={exitReverse ? exitChoreography.snapshot : null}
        onExitReverseComplete={onExitReverseComplete}
        approachPortalRef={approachPortalRef}
      />
    )
  })
}
