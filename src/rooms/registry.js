import ThePassageRoom from './thePassage/RoomPlaceholder'
import LiminalRoom from './liminal/RoomPlaceholder'
import ThresholdRoom from './threshold/RoomPlaceholder'
import BetweenRoom from './between/RoomPlaceholder'
import TheGateRoom from './theGate/RoomPlaceholder'
import ApertureRoom from './aperture/RoomPlaceholder'

/** `doorData[].room.type` → componente 3D de esa carpeta (sustituir `RoomPlaceholder.jsx`). */
export const ROOM_TYPES = {
  thePassage: ThePassageRoom,
  liminal: LiminalRoom,
  threshold: ThresholdRoom,
  between: BetweenRoom,
  theGate: TheGateRoom,
  aperture: ApertureRoom,
}
