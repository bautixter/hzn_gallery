import { usePointerCoarse } from '../hooks/usePointerCoarse'

// ---------------------------------------------------------------------------
// SVG icons
// ---------------------------------------------------------------------------

const IconMouseLook = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <rect x="12" y="6" width="16" height="24" rx="8" stroke="white" strokeWidth="1.5"/>
    <line x1="20" y1="6" x2="20" y2="16" stroke="white" strokeWidth="1.5"/>
    <rect x="18" y="8" width="4" height="5" rx="2" fill="white" opacity="0.5"/>
    <path d="M10 19L3 19 M3 19L7 15 M3 19L7 23" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M30 19L37 19 M37 19L33 15 M37 19L33 23" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IconMouseClickPainting = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    {/* painting frame */}
    <rect x="22" y="4" width="15" height="12" rx="2" stroke="white" strokeWidth="1.5"/>
    <rect x="25" y="7" width="9" height="6" rx="1" stroke="white" strokeWidth="1" opacity="0.4"/>
    {/* cursor */}
    <path d="M7 14L4 28L9 23L12 30L14 29L11 22L17 22Z"
      stroke="white" strokeWidth="1.4" fill="rgba(255,255,255,0.1)"
      strokeLinejoin="round" strokeLinecap="round"/>
  </svg>
)

const IconMousePan = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <rect x="13" y="10" width="14" height="20" rx="7" stroke="white" strokeWidth="1.5"/>
    <line x1="20" y1="10" x2="20" y2="18" stroke="white" strokeWidth="1.5"/>
    <rect x="18" y="12" width="4" height="5" rx="2" fill="white" opacity="0.5"/>
    <path d="M20 7L20 1 M20 1L16 5 M20 1L24 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 33L20 39 M20 39L16 35 M20 39L24 35" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 20L3 20 M3 20L7 16 M3 20L7 24" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M30 20L37 20 M37 20L33 16 M37 20L33 24" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IconTouchDrag = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <rect x="17" y="8" width="6" height="16" rx="3" stroke="white" strokeWidth="1.5"/>
    <path d="M10 16L3 16 M3 16L7 12 M3 16L7 20" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M30 16L37 16 M37 16L33 12 M37 16L33 20" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IconTouchTapPainting = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    {/* painting frame */}
    <rect x="22" y="4" width="15" height="12" rx="2" stroke="white" strokeWidth="1.5"/>
    <rect x="25" y="7" width="9" height="6" rx="1" stroke="white" strokeWidth="1" opacity="0.4"/>
    {/* tap finger */}
    <rect x="17" y="22" width="6" height="14" rx="3" stroke="white" strokeWidth="1.5"/>
    {/* tap ripple */}
    <circle cx="20" cy="19" r="3.5" stroke="white" strokeWidth="1.5" opacity="0.85"/>
    <circle cx="20" cy="19" r="6.5" stroke="white" strokeWidth="1" opacity="0.35"/>
  </svg>
)

const IconMouseTilt = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    {/* mouse body with the scroll-wheel pressed (highlighted) */}
    <rect x="11" y="9" width="14" height="22" rx="7" stroke="white" strokeWidth="1.5"/>
    <line x1="18" y1="9" x2="18" y2="17" stroke="white" strokeWidth="1.5"/>
    <rect x="16" y="11" width="4" height="5" rx="2" fill="white"/>
    {/* tilt / rotation arc */}
    <path d="M30 13a9 9 0 0 1 0 16" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M30 29l-3-1.5M30 29l1.5-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IconTouchRotate = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    {/* single finger */}
    <rect x="17" y="17" width="6" height="15" rx="3" stroke="white" strokeWidth="1.5"/>
    {/* rotation arc above the finger */}
    <path d="M11 13a9 9 0 0 1 18 0" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M29 13l-1.5-3M29 13l-3 1.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IconTouchPan = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <rect x="11" y="12" width="5" height="14" rx="2.5" stroke="white" strokeWidth="1.5"/>
    <rect x="24" y="12" width="5" height="14" rx="2.5" stroke="white" strokeWidth="1.5"/>
    <path d="M20 8L20 1 M20 1L16 5 M20 1L24 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 34L20 39 M20 39L16 35 M20 39L24 35" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 21L1 21 M1 21L5 17 M1 21L5 25" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M32 21L39 21 M39 21L35 17 M39 21L35 25" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IconMouseOrbit = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <rect x="13" y="7" width="14" height="20" rx="7" stroke="white" strokeWidth="1.5"/>
    <line x1="20" y1="7" x2="20" y2="14" stroke="white" strokeWidth="1.5"/>
    {/* orbit ellipse with arrowhead */}
    <ellipse cx="20" cy="31" rx="12" ry="4.5" stroke="white" strokeWidth="1.4" opacity="0.85"/>
    <path d="M8 31l2.4-2.2M8 31l2.8 1.6" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IconScrollZoom = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <rect x="13" y="9" width="14" height="22" rx="7" stroke="white" strokeWidth="1.5"/>
    <rect x="18" y="12" width="4" height="6" rx="2" fill="white"/>
    <path d="M20 6V1 M20 1L17 4 M20 1L23 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 34V39 M20 39L17 36 M20 39L23 36" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IconTouchPinch = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <rect x="8" y="13" width="5" height="14" rx="2.5" stroke="white" strokeWidth="1.5"/>
    <rect x="27" y="13" width="5" height="14" rx="2.5" stroke="white" strokeWidth="1.5"/>
    <path d="M16 20h7 M16 20l2.6-2 M16 20l2.6 2" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M24 20h-7 M24 20l-2.6-2 M24 20l-2.6 2" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// ---------------------------------------------------------------------------
// Hint data
// ---------------------------------------------------------------------------

const HINTS = {
  navigation: {
    desktop: [
      { Icon: IconMouseLook,          text: 'Click and drag to look around' },
      { Icon: IconMouseClickPainting, text: 'Click on a painting for a close-up view' },
    ],
    touch: [
      { Icon: IconTouchDrag,         text: 'Drag to look around' },
      { Icon: IconTouchTapPainting,  text: 'Tap on a painting for a close-up view' },
    ],
  },
  painting: {
    desktop: [
      { Icon: IconMousePan,  text: 'Click and drag to move around' },
      { Icon: IconMouseTilt, text: 'Wheel-click and drag to tilt the painting' },
    ],
    touch: [
      { Icon: IconTouchRotate, text: 'Drag one finger to tilt the painting' },
      { Icon: IconTouchPan,    text: 'Drag or pinch two fingers to move around' },
    ],
  },
  model: {
    desktop: [
      { Icon: IconMouseOrbit, text: 'Click and drag to orbit the model' },
      { Icon: IconScrollZoom, text: 'Scroll to zoom' },
    ],
    touch: [
      { Icon: IconTouchRotate, text: 'Drag one finger to orbit the model' },
      { Icon: IconTouchPinch,  text: 'Pinch to zoom' },
    ],
  },
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ControlsOverlay({ page, visible, onDismiss }) {
  const pointerCoarse = usePointerCoarse()

  if (!visible) return null

  const hints = HINTS[page]?.[pointerCoarse ? 'touch' : 'desktop'] ?? []

  return (
    <div
      onClick={onDismiss}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.62)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        animation: 'overlayFadeIn 0.2s ease',
        cursor: 'pointer',
      }}
    >
      <div style={{
        background: 'rgba(12, 12, 18, 0.82)',
        border: '1px solid rgba(255, 255, 255, 0.13)',
        borderRadius: 20,
        padding: '32px 36px 28px',
        maxWidth: 340,
        width: '85vw',
        display: 'flex',
        flexDirection: 'column',
        gap: 26,
      }}>
        <p style={{
          margin: 0,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.38)',
        }}>
          Controls
        </p>

        {hints.map(({ Icon, text }, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ flexShrink: 0, opacity: 0.9 }}><Icon /></div>
            <p style={{
              margin: 0,
              fontSize: 15,
              lineHeight: 1.45,
              color: 'rgba(255,255,255,0.88)',
            }}>
              {text}
            </p>
          </div>
        ))}

        <p style={{
          margin: 0,
          fontSize: 12,
          color: 'rgba(255,255,255,0.3)',
          textAlign: 'center',
          letterSpacing: '0.04em',
        }}>
          {pointerCoarse ? 'Tap anywhere to continue' : 'Click anywhere to continue'}
        </p>
      </div>

      <style>{`@keyframes overlayFadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>
    </div>
  )
}
