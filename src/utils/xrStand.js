import { Vector3 } from 'three'

const _center = new Vector3()
const _eye = new Vector3()
const _dir = new Vector3()

/**
 * Floor standing pose for VR: where the user's feet should land so they view `group` from
 * `dist` metres away, staying on the side the camera is currently on. Returns
 * `{ position: [x, 0, z], yaw }` with `yaw` turning the rig to face the work.
 *
 * `faceNormal` (optional world-space THREE.Vector3) is the fallback side used only when the
 * camera sits directly above / below the work and the horizontal direction is degenerate.
 */
export function computeStandPose(group, camera, dist, faceNormal = null) {
  group.getWorldPosition(_center)
  camera.getWorldPosition(_eye)
  _dir.copy(_eye).sub(_center)
  _dir.y = 0
  if (_dir.lengthSq() < 1e-6) {
    if (faceNormal) { _dir.set(faceNormal.x, 0, faceNormal.z) }
    if (_dir.lengthSq() < 1e-6) _dir.set(0, 0, 1)
  }
  _dir.normalize()
  return {
    position: [_center.x + _dir.x * dist, 0, _center.z + _dir.z * dist],
    yaw: Math.atan2(_dir.x, _dir.z),
  }
}
