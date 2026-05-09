import { useEffect, useState } from 'react'
import { getGalleryInfo } from '../data/roomGalleryInfo'

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
  padding: 'clamp(24px, 5vw, 72px)',
  background: 'rgba(6, 7, 12, 0.97)',
  color: 'rgba(245, 246, 250, 0.92)',
  overflowY: 'auto',
  overflowAnchor: 'none',
  overscrollBehavior: 'contain',
  WebkitOverflowScrolling: 'touch',
  transition: `transform ${TRANSITION_MS}ms ${easing}`,
  willChange: 'transform',
}

const canvasWrapStyle = {
  position: 'absolute',
  inset: 0,
  transition: `transform ${TRANSITION_MS}ms ${easing}`,
}

export default function GalleryInfoOverlay({ activePortal, children }) {
  const info = getGalleryInfo(activePortal)
  const [panelOpen, setPanelOpen] = useState(true)
  const [hasEnteredOnce, setHasEnteredOnce] = useState(false)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      if (!hasEnteredOnce || !panelOpen) return
      e.preventDefault()
      setPanelOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [hasEnteredOnce, panelOpen])

  const dismissPanel = () => {
    setPanelOpen(false)
    setHasEnteredOnce(true)
  }

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
        <div
          style={{
            position: 'relative',
            maxWidth: 560,
            margin: '0 auto',
            paddingRight: hasEnteredOnce ? 40 : 0,
            fontFamily:
              'system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            lineHeight: 1.55,
          }}
        >
          {hasEnteredOnce && panelOpen && (
            <button
              type="button"
              onClick={dismissPanel}
              aria-label="Cerrar panel editorial"
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                zIndex: 1,
                padding: '6px 12px',
                fontSize: 13,
                color: 'rgba(255,255,255,0.65)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          )}

          <h1
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.35rem)',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              marginBottom: '0.75rem',
              lineHeight: 1.15,
            }}
          >
            {info.title}
          </h1>
          <p
            style={{
              fontSize: '1.05rem',
              color: 'rgba(235, 237, 245, 0.78)',
              marginBottom: '2rem',
            }}
          >
            {info.lede}
          </p>

          {info.sections.map((s) => (
            <section key={s.heading} style={{ marginBottom: '1.75rem' }}>
              <h2
                style={{
                  fontSize: '0.78rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                  color: 'rgba(180, 195, 220, 0.85)',
                  marginBottom: '0.5rem',
                  fontWeight: 600,
                }}
              >
                {s.heading}
              </h2>
              <p style={{ margin: 0, color: 'rgba(230, 232, 240, 0.88)' }}>{s.body}</p>
            </section>
          ))}

          <div style={{ marginTop: '2.5rem', paddingBottom: '1rem' }}>
            <button
              type="button"
              onClick={dismissPanel}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                maxWidth: 360,
                padding: '16px 28px',
                fontSize: 16,
                fontWeight: 600,
                letterSpacing: '0.03em',
                color: '#0a0c10',
                background: 'linear-gradient(180deg, #f2f6ff 0%, #dbe7ff 100%)',
                border: '1px solid rgba(255,255,255,0.65)',
                borderRadius: 12,
                cursor: 'pointer',
                boxShadow:
                  '0 1px 0 rgba(255,255,255,0.85) inset, 0 18px 40px rgba(30, 80, 200, 0.22), 0 0 0 1px rgba(120, 170, 255, 0.35)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.98)'
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = ''
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = ''
              }}
            >
              {info.ctaLabel}
            </button>
          </div>
        </div>
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
