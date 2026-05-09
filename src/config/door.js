import { MathUtils } from 'three'
import { DOOR_RADIUS, easeInOut } from '../config'

/** Door interaction / animation tuning (see Door + useDoorBehavior) */
export const SLIDE_SPEED = 0.4
/** Hub return / door close (reverse path only) — lower = slower */
export const REVERSE_SLIDE_SPEED = 0.4
export const OVERSHOOT = 2.5

/**
 * Hub return only: lerp capped at slideTarget (no overshoot past camera).
 * clipOpen01 0–1 for puerta_abrir sampling.
 */
export function getDoorSlideExitPose(angle, slideTargetXZ, slideProgress01) {
  const p = easeInOut(slideProgress01)
  const blend = Math.min(1, p * OVERSHOOT)
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
