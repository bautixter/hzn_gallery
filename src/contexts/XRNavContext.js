import { createContext, useContext } from 'react'

/**
 * Bridge between the DOM chrome and the in-canvas VR rig.
 *
 *  - `isPresenting` mirrors the active immersive session (true once the headset is in VR).
 *  - `navRef.current` is populated by <XRRig> with `{ teleportToWork }`, the blink-teleport the
 *    works call instead of the desktop camera fly-in.
 *
 * Provided once at the app root so it reaches both the overlays (outside the Canvas) and the
 * Painting / Model components (inside it).
 */
export const XRNavContext = createContext(null)

export function useXRNav() {
  return useContext(XRNavContext)
}
