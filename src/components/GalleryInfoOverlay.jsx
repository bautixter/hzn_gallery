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

const panelShellStyle = {
  position: 'fixed',
  inset: 0,
  zIndex: 1100,
  boxSizing: 'border-box',
  background: 'rgba(6, 7, 12, 0.97)',
  overflow: 'hidden',
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

export default function GalleryInfoOverlay({ activePortal, children }) {
  const galleryInfoSrc = getGalleryInfoSrc(activePortal)
  const [panelOpen, setPanelOpen] = useState(true)

  useEffect(() => {
    const onMessage = (e) => {
      if (e.data?.type === 'overlay:close') setPanelOpen(false)
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
          transform: panelOpen ? 'translate3d(8vw, 0, 0)' : 'translate3d(0, 0, 0)',
        }}
      >
        {children}
      </div>

      <div
        role="dialog"
        aria-modal={panelOpen}
        aria-hidden={!panelOpen}
        style={{
          ...panelShellStyle,
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

      {!panelOpen && (
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
    </div>
  )
}
