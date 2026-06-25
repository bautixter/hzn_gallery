import { useEffect, useState } from 'react'
import { xrStore } from '../xr/xrStore'

const buttonStyle = {
  position: 'fixed',
  bottom: 32,
  left: '50%',
  transform: 'translateX(-50%)',
  padding: '12px 28px',
  background: 'white',
  border: 'none',
  borderRadius: 8,
  fontSize: 16,
  fontWeight: 600,
  letterSpacing: '0.04em',
  cursor: 'pointer',
  opacity: 0.92,
  zIndex: 10,
}

/**
 * Shown only on headsets that report immersive-VR support. Hidden while presenting (the headset
 * is already in VR) so it never floats inside the scene's 2D mirror.
 */
export default function VRButton({ hidden }) {
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    if (!navigator.xr?.isSessionSupported) return
    let alive = true
    navigator.xr
      .isSessionSupported('immersive-vr')
      .then((ok) => { if (alive) setSupported(!!ok) })
      .catch(() => {})
    return () => { alive = false }
  }, [])

  if (!supported || hidden) return null

  return (
    <button type="button" onClick={() => xrStore.enterVR()} style={buttonStyle}>
      Enter VR
    </button>
  )
}
