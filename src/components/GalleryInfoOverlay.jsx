import { useEffect, useLayoutEffect, useState } from 'react'
import { getGalleryInfoSrc } from '../data/roomGalleryInfo'
import { IconButton, InfoIcon } from './IconButton'

const TRANSITION_MS = 520
const easing = 'cubic-bezier(0.33, 1, 0.38, 1)'

const panelShellBase = {
  position: 'fixed',
  top: 0,
  left: 0,
  bottom: 0,
  zIndex: 1100,
  boxSizing: 'border-box',
  overflow: 'hidden',
  boxShadow: '0 0 5px 0 rgba(0, 0, 0, 0.3)',
  transition: `transform ${TRANSITION_MS}ms ${easing}`,
  willChange: 'transform',
}

const canvasWrapStyle = {
  position: 'absolute',
  inset: 0,
  transition: `transform ${TRANSITION_MS}ms ${easing}`,
}


const iframeStyle = {
  width: '100%',
  height: '100%',
  border: 0,
  display: 'block',
  background: 'transparent',
}

const TAB_WIDTH = 26

const TAB_SHADOW = '0 0 5px rgba(0,0,0,0.28)'
const TAB_SHADOW_HOVER = '0 0 7px rgba(0,0,0,0.38)'
// Matches hub.html's accent — the overlay always opens on the hub, so this is the correct
// first-frame colour and a safe fallback if an accent message is ever missed.
const TAB_DEFAULT_ACCENT = { bg: 'rgb(226,230,236)', fg: 'rgba(0,0,0,0.55)' }

function makeTabBase({ bg, fg }) {
  return {
    position: 'fixed',
    top: '50%',
    left: 0,
    zIndex: 1110,
    width: TAB_WIDTH,
    height: 76,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    color: fg,
    background: bg,
    border: '1px solid rgba(0,0,0,0.1)',
    borderLeft: 'none',
    borderRadius: '0 13px 13px 0',
    cursor: 'pointer',
    boxShadow: TAB_SHADOW,
    clipPath: 'inset(-12px -12px -12px 0)',
    transition: `transform ${TRANSITION_MS}ms ${easing}, box-shadow 0.2s ease, background 0.3s ease, color 0.3s ease`,
    willChange: 'transform',
  }
}

export default function GalleryInfoOverlay({ activePortal, children, compactWidth = null, hidden = false }) {
  const isTabMode = compactWidth != null
  const baseSrc = getGalleryInfoSrc(activePortal)
  const galleryInfoSrc = isTabMode ? `${baseSrc}?chrome=tab` : baseSrc
  const [panelOpen, setPanelOpen] = useState(true)
  const [tabAccent, setTabAccent] = useState(TAB_DEFAULT_ACCENT)
  const panelWidth = isTabMode ? `${compactWidth}px` : '100%'

  // Registered in a layout effect (synchronous, pre-paint) so the listener is in place
  // before the iframe can post its one-shot `overlay:accent` on load — otherwise that
  // message can be missed and the tab stays stuck on the default colour. The tab keeps the
  // previous room's colour until the next accent arrives (no reset → no celeste flash).
  useLayoutEffect(() => {
    const onMessage = (e) => {
      if (e.data?.type === 'overlay:close') setPanelOpen(false)
      if (e.data?.type === 'overlay:accent') setTabAccent({ bg: e.data.bg, fg: e.data.fg ?? 'rgba(0,0,0,0.55)' })
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      if (!panelOpen) return
      e.preventDefault()
      setPanelOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [panelOpen])

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          ...canvasWrapStyle,
          transform: 'translate3d(0, 0, 0)',
        }}
      >
        {children}
      </div>

      {/* In VR the headset shows only the 3D scene, so the DOM info panel and its handles are
          suppressed entirely while presenting. */}
      {!hidden && (
      <div
        role="dialog"
        aria-modal={panelOpen}
        aria-hidden={!panelOpen}
        style={{
          ...panelShellBase,
          width: panelWidth,
          transform: panelOpen ? 'translateX(0)' : 'translateX(-100%)',
          pointerEvents: panelOpen ? 'auto' : 'none',
        }}
      >
        <iframe
          title="Room gallery information"
          src={galleryInfoSrc}
          style={iframeStyle}
        />
      </div>
      )}

      {!hidden && isTabMode && (
        <button
          type="button"
          aria-label={panelOpen ? 'Cerrar información' : 'Abrir información'}
          onClick={() => setPanelOpen((open) => !open)}
          style={{
            ...makeTabBase(tabAccent),
            transform: `translate3d(${panelOpen ? compactWidth : 0}px, -50%, 0)`,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = TAB_SHADOW_HOVER }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = TAB_SHADOW }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: panelOpen ? 'rotate(0deg)' : 'rotate(180deg)',
              transition: `transform ${TRANSITION_MS}ms ${easing}`,
            }}
          >
            <polyline points="14.5 6 8.5 12 14.5 18" />
          </svg>
        </button>
      )}

      {/* Mobile reopen handle (desktop uses the side tab instead); kept top-left so it
          clears the top-right home/help icon cluster in AppChrome. */}
      {!hidden && !panelOpen && !isTabMode && (
        <IconButton
          onClick={() => setPanelOpen(true)}
          label="Abrir información"
          style={{ position: 'fixed', top: 20, left: 20, zIndex: 1115 }}
        >
          <InfoIcon />
        </IconButton>
      )}
    </div>
  )
}
