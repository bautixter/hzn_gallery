import { useLayoutEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { computeRoomSpawnGroupTransform } from '../utils/roomSpawn'

/**
 * Wrap a room’s contents. On mount, translates (XZ) and rotates (Y) the whole room so the
 * authored spawn (floor XZ + yaw in room space) lines up with the camera’s position and horizontal view.
 *
 * @param {{ spawn: { positionXZ: [number, number], yaw: number }, children: import('react').ReactNode }} props
 */
export default function RoomSpawnAlign({ spawn, children }) {
  const groupRef = useRef(null)
  const camera = useThree(s => s.camera)

  useLayoutEffect(() => {
    const g = groupRef.current
    if (!g) return
    const { x, z, rotationY } = computeRoomSpawnGroupTransform(spawn, camera)
    g.position.set(x, 0, z)
    g.rotation.set(0, rotationY, 0)
  }, [camera, spawn])

  return <group ref={groupRef}>{children}</group>
}
