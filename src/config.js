import { Vector3 } from 'three'

export const DOOR_COUNT = 6
export const DOOR_RADIUS = 5

export const SHOW_THRESHOLD = 0.85
export const PORTAL_ACTIVATE_DOT = 0.3
export const PORTAL_DEACTIVATE_DOT = 0.0
export const TRANSITION_SPEED = 0.55

export const easeInOut = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2

// Reusable scratch vectors — allocated once, reused in useFrame to avoid GC pressure
export const _camDir = new Vector3()
export const _toDoor = new Vector3()
