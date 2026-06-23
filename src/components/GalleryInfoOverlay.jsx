import { useEffect, useState } from 'react'
import { getGalleryInfoSrc } from '../data/roomGalleryInfo'

const TRANSITION_MS = 520
const easing = 'cubic-bezier(0.33, 1, 0.38, 1)'

const reopenButtonStyle = {
  position: 'fixed',
  top: 24,
  right: 24,
  zIndex: 1110,
  padding: '10px 18px',
  fontSize: 14,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  fontWeight: 600,
  color: 'rgba(255,255,255,0.92)',
  background: 'linear-gradient(145deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06))',
  border: '1px solid rgba(255,255,255,0.35)',
  borderRadius: 999,
  cursor: 'pointer',
  backdropFilter: 'blur(10px)',
  boxShadow:
    '0 0 0 1px rgba(255,255,255,0.06) inset, 0 12px 32px rgba(0,0,0,0.35), 0 0 24px rgba(120, 200, 255, 0.12)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
}

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
const TAB_DEFAULT_ACCENT = { bg: 'rgb(200,215,235)', fg: 'rgba(0,0,0,0.55)' }

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

export default function GalleryInfoOverlay({ activePortal, children, compactWidth = null, onOpenControls }) {
  const isTabMode = compactWidth != null
  const baseSrc = getGalleryInfoSrc(activePortal)
  const galleryInfoSrc = isTabMode ? `${baseSrc}?chrome=tab` : baseSrc
  const [panelOpen, setPanelOpen] = useState(true)
  const [tabAccent, setTabAccent] = useState(TAB_DEFAULT_ACCENT)
  const panelWidth = isTabMode ? `${compactWidth}px` : '100%'

  useEffect(() => { setTabAccent(TAB_DEFAULT_ACCENT) }, [galleryInfoSrc])

  useEffect(() => {
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

      {isTabMode && (
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

      {!panelOpen && (
        <>
          {!isTabMode && (
            <button
              type="button"
              onClick={() => setPanelOpen(true)}
              style={reopenButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow =
                  '0 0 0 1px rgba(255,255,255,0.1) inset, 0 16px 40px rgba(0,0,0,0.45), 0 0 32px rgba(140, 210, 255, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = ''
                e.currentTarget.style.boxShadow = reopenButtonStyle.boxShadow
              }}
            >
              Info
            </button>
          )}

          {onOpenControls && (
            <button
              type="button"
              onClick={onOpenControls}
              style={{ ...reopenButtonStyle, top: isTabMode ? 24 : 72 }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow =
                  '0 0 0 1px rgba(255,255,255,0.1) inset, 0 16px 40px rgba(0,0,0,0.45), 0 0 32px rgba(140, 210, 255, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = ''
                e.currentTarget.style.boxShadow = reopenButtonStyle.boxShadow
              }}
            >
              Controls
            </button>
          )}
        </>
      )}
    </div>
  )
}
