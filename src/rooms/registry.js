import ThePassageRoom from './01_ThePassage'
import LiminalRoom from './02_Liminal'
import ThresholdRoom from './03_Threshold'
import BetweenRoom from './04_Between'
import TheGateRoom from './05_TheGate'
import ApertureRoom from './06_Aperture'

/** `doorData[].room.type` → componente 3D de esa sala (sustituir el `.jsx` correspondiente). */
export const ROOM_TYPES = {
  thePassage: ThePassageRoom,
  liminal: LiminalRoom,
  threshold: ThresholdRoom,
  between: BetweenRoom,
  theGate: TheGateRoom,
  aperture: ApertureRoom,
}
