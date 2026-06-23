import { DOOR_RADIUS } from '../config'
import { DOOR_DATA } from '../data/doorData'

export const EYE_HEIGHT = 1.6
export const DEFAULT_FOV = 50
export const DESKTOP_FOV = 60

/** `DOOR_DATA` index to face when entering the hub (0 = Garabatos). */
export const HUB_DEFAULT_FACE_DOOR_INDEX = 0

/**
 * Y rotation (radians) so the default camera looks horizontally toward a door on the hub ring.
 * Matches door placement: `(sin(angle)*R, cos(angle)*R)` with `angle = (2π/N)*doorIndex`.
 */
export function getHubCameraYawTowardDoor(doorIndex = HUB_DEFAULT_FACE_DOOR_INDEX) {
  const ringAngle = (2 * Math.PI / DOOR_DATA.length) * doorIndex
  const tx = Math.sin(ringAngle) * DOOR_RADIUS
  const tz = Math.cos(ringAngle) * DOOR_RADIUS
  return Math.atan2(tx, tz) + Math.PI
}

/** Primary pointer drag look (mouse or touch); radians per pixel */
export const DRAG_LOOK_SENSITIVITY = 0.0025
/** After releasing drag: higher = coast stops sooner (per second, exponential) */
export const DRAG_LOOK_MOMENTUM_DAMPING = 5.5
/** Scales throw-inertia from the last segment of the drag */
export const DRAG_LOOK_MOMENTUM_SCALE = 0.85
/** Caps post-release spin (rad/s per axis) */
export const DRAG_LOOK_MOMENTUM_MAX_RAD_S = 8
