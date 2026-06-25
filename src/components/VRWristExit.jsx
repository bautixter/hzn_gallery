import { useMemo, useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useXRInputSourceState, XRSpace } from '@react-three/xr'
import { CanvasTexture, DoubleSide, SRGBColorSpace, Vector3 } from 'three'

const _camPos = new Vector3()

// Wrist-local placement of the panel (metres) and its size. The wrist joint's axes vary between
// runtimes, so these are the knobs to nudge on-device if the panel sits awkwardly against the hand.
const WRIST_OFFSET = [0, 0.055, 0]
const PANEL_W = 0.09
const PANEL_H = 0.045

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

// A back-arrow + "Salir" baked to a canvas, so the button needs no external font / CDN at runtime.
function makeLabelTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 128
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = 'rgba(16,17,23,0.92)'
  roundRect(ctx, 6, 6, 244, 116, 28)
  ctx.fill()
  ctx.lineWidth = 3
  ctx.strokeStyle = 'rgba(255,255,255,0.2)'
  roundRect(ctx, 6, 6, 244, 116, 28)
  ctx.stroke()

  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 10
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(80, 64); ctx.lineTo(46, 64)                       // shaft
  ctx.moveTo(62, 48); ctx.lineTo(46, 64); ctx.lineTo(62, 80)   // head
  ctx.stroke()

  ctx.fillStyle = '#ffffff'
  ctx.font = '600 44px system-ui, sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('Salir', 100, 67)

  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

/**
 * Hand-tracking exit affordance: a small "Salir" panel riding the wrist joint of `hand`. Poke it
 * with the other hand's finger, or pinch-select it from a distance, to call `onExit`. It billboards
 * to the viewer so the label is always readable, and renders nothing until the hand is tracked.
 *
 * Must be mounted inside <XROrigin> so the wrist transform inherits the rig offset after a teleport.
 */
export default function VRWristExit({ hand = 'left', onExit }) {
  const handState = useXRInputSourceState('hand', hand)
  const wristSpace = handState?.inputSource?.hand?.get?.('wrist')
  const texture = useMemo(makeLabelTexture, [])
  useEffect(() => () => texture.dispose(), [texture])

  const billboardRef = useRef(null)
  const camera = useThree((s) => s.camera)
  const [hovered, setHovered] = useState(false)

  useFrame(() => {
    const b = billboardRef.current
    if (!b) return
    camera.getWorldPosition(_camPos)
    b.lookAt(_camPos)
  })

  if (!wristSpace) return null

  return (
    <XRSpace space={wristSpace}>
      <group ref={billboardRef} position={WRIST_OFFSET}>
        <mesh
          scale={hovered ? 1.1 : 1}
          onClick={(e) => { e.stopPropagation(); onExit?.() }}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
        >
          <planeGeometry args={[PANEL_W, PANEL_H]} />
          <meshBasicMaterial map={texture} transparent side={DoubleSide} toneMapped={false} />
        </mesh>
      </group>
    </XRSpace>
  )
}
