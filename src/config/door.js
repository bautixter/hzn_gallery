import { MathUtils } from 'three'
import { DOOR_RADIUS, easeInOut } from '../config'

/** Door interaction / animation tuning (see Door + useDoorBehavior) */
export const SLIDE_SPEED = 0.5
/** Hub return / door close (reverse path only) — lower = slower */
export const REVERSE_SLIDE_SPEED = 0.4
/**
 * Hub → room approach only (see useDoorBehavior).
 * - k < 1: transition (fade / onActivate) when eased progress p ≥ k; door travels the full segment (p → 1).
 * - k ≥ 1: lerp factor is p·k (can exceed 1 → past the camera); transition when p·k ≥ 1.
 */
export const APPROACH_LERP_K = 0.9
/** While sliding: XZ eases toward the point on the view ray (higher = snappier, ~12–24 typical) */
export const APPROACH_RAY_XZ_SMOOTH = 5

/**
 * Hub return only: lerp from ring to frozen slideTarget.
 * clipOpen01 matches blend so puerta_abrir stays in sync with the group (scrubbed action).
 */
export function getDoorSlideExitPose(angle, slideTargetXZ, slideProgress01) {
  const p = easeInOut(slideProgress01)
  const blend = p
  const startX = Math.sin(angle) * DOOR_RADIUS
  const startZ = Math.cos(angle) * DOOR_RADIUS
  const x = MathUtils.lerp(startX, slideTargetXZ.x, blend)
  const z = MathUtils.lerp(startZ, slideTargetXZ.z, blend)
  const rotY = Math.atan2(slideTargetXZ.x - x, slideTargetXZ.z - z)
  return { x, z, rotY, clipOpen01: blend }
}

export const CLICK_THRESHOLD = 0.96
export const Y_LERP_START = 0.88
export const Y_LERP_END = 0.97
