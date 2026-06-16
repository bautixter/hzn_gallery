import { Vector3 } from 'three'

const _fwd = new Vector3()

/**
 * Horizontal yaw (radians) from the camera’s world forward, Y flattened.
 * Matches how {@link computeRoomSpawnGroupTransform} interprets `spawn.yaw`.
 */
export function yawFromHorizontalForward(camera) {
  camera.getWorldDirection(_fwd)
  _fwd.y = 0
  if (_fwd.lengthSq() < 1e-10) return 0
  _fwd.normalize()
  return Math.atan2(_fwd.x, _fwd.z)
}

/**
 * @typedef {object} RoomSpawnSpec
 * @property {[number, number]} positionXZ — Floor point in **room local space** (before align) where the player should stand.
 * @property {number} yaw — Horizontal facing in radians; forward = `(sin(yaw), 0, cos(yaw))`, same convention as {@link yawFromHorizontalForward}.
 */

/**
 * World-space position (XZ) and rotation Y for a `<group>` wrapping the whole room so that
 * the authored spawn point and facing match the current camera when the room mounts.
 *
 * @param {RoomSpawnSpec} spawn
 * @param {import('three').Camera} camera
 * @returns {{ x: number, z: number, rotationY: number }}
 */
export function computeRoomSpawnGroupTransform(spawn, camera) {
  const [sx, sz] = spawn.positionXZ
  const yawDesign = spawn.yaw
  const yawWorld = yawFromHorizontalForward(camera)
  const deltaYaw = yawWorld - yawDesign

  const cos = Math.cos(deltaYaw)
  const sin = Math.sin(deltaYaw)
  const rx = cos * sx + sin * sz
  const rz = -sin * sx + cos * sz

  return {
    x: camera.position.x - rx,
    z: camera.position.z - rz,
    rotationY: deltaYaw,
  }
}

/** Stand at room origin, facing +Z (Three.js “into the screen” on XZ). Override per room in `roomSpawn.js`. */
export const DEFAULT_ROOM_SPAWN = {
  positionXZ: [0, -5],
  yaw: 0,
}

/**
 * Snapshot for pasting into a room’s `roomSpawn.js`. Call while the camera shows the desired spawn
 * (e.g. orbit in dev); numbers are **world** XZ + yaw — use as local spawn only when the room is still at identity.
 *
 * @param {import('three').Camera} camera
 * @returns {RoomSpawnSpec}
 */
export function spawnSpecFromCamera(camera) {
  return {
    positionXZ: [camera.position.x, camera.position.z],
    yaw: yawFromHorizontalForward(camera),
  }
}

/**
 * Logs a ready-to-paste `export const ROOM_SPAWN = { ... }` block.
 *
 * @param {import('three').Camera} camera
 * @param {string} [exportName='ROOM_SPAWN']
 * @returns {RoomSpawnSpec}
 */
export function logRoomSpawnFromCamera(camera, exportName = 'ROOM_SPAWN') {
  const spec = spawnSpecFromCamera(camera)
  const [x, z] = spec.positionXZ
  const text = `export const ${exportName} = {\n  positionXZ: [${x}, ${z}],\n  yaw: ${spec.yaw},\n}\n`
  console.log(`[roomSpawn] Paste into roomSpawn.js:\n${text}`)
  return spec
}
