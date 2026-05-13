import { DOOR_DATA } from './doorData'
import { asset } from '../utils/asset'

export const HUB_GALLERY_INFO_SRC = asset('/gallery-info/hub.html')

/**
 * Resuelve el HTML editorial según `activePortal` (`null` = vestíbulo).
 * Cada puerta enlaza su `galleryInfoSrc` en `doorData` -> archivo public/gallery-info/<sala>.html.
 */
export function getGalleryInfoSrc(activePortal) {
  if (activePortal === null) return HUB_GALLERY_INFO_SRC
  const row = DOOR_DATA[activePortal]
  if (!row?.galleryInfoSrc) {
    throw new Error(`doorData[${activePortal}] no define galleryInfoSrc`)
  }
  return row.galleryInfoSrc
}
