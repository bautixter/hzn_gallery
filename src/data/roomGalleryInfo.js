import { DOOR_DATA } from './doorData'
import { roomGalleryInfo as hubGallery } from '../rooms/hub/roomGalleryInfo'

export { hubGallery as HUB_GALLERY_INFO }

/**
 * Resuelve el bloque editorial según `activePortal` (`null` = vestíbulo).
 * Cada puerta enlaza su `galleryInfo` en `doorData` → archivo `rooms/gallery/<sala>/roomGalleryInfo.js`.
 */
export function getGalleryInfo(activePortal) {
  if (activePortal === null) return hubGallery
  const row = DOOR_DATA[activePortal]
  if (!row?.galleryInfo) {
    throw new Error(`doorData[${activePortal}] no define galleryInfo`)
  }
  return row.galleryInfo
}
