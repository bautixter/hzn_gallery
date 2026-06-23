const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: '#000',
  pointerEvents: 'none',
  zIndex: 9999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const backButtonStyle = {
  position: 'fixed',
  top: 24,
  left: 24,
  padding: '10px 20px',
  background: 'rgba(0,0,0,0.35)',
  border: '1px solid rgba(255,255,255,0.25)',
  borderRadius: 8,
  fontSize: 15,
  cursor: 'pointer',
  color: 'rgba(255,255,255,0.85)',
  backdropFilter: 'blur(6px)',
  zIndex: 10,
}

const gyroButtonStyle = {
  position: 'fixed',
  bottom: 32,
  left: '50%',
  transform: 'translateX(-50%)',
  padding: '12px 24px',
  background: 'white',
  border: 'none',
  borderRadius: 8,
  fontSize: 16,
  cursor: 'pointer',
  opacity: 0.9,
  zIndex: 10,
}

export default function AppChrome({
  overlayOpacity,
  FADE_MS,
  showSpinner,
  activePortal,
  onBack,
  showGyroPrompt,
  onRequestGyro,
}) {
  return (
    <>
      {overlayOpacity !== null && (
        <div
          style={{
            ...overlayStyle,
            opacity: overlayOpacity,
            transition: `opacity ${FADE_MS}ms ease`,
          }}
        >
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 18px)',
            gap: 2,
            opacity: showSpinner ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}>
            {[0, 1, 3, 2].map(i => (
              <div
                key={i}
                style={{
                  width: 18,
                  height: 18,
                  background: 'rgba(255,255,255,0.88)',
                  animation: 'sq-dark 1s ease-in-out infinite',
                  animationDelay: `${i * 0.25}s`,
                }}
              />
            ))}
          </div>
          <style>{`
            @keyframes sq-dark {
              0%   { background: rgba(255,255,255,0.88); }
              100% { background: rgba(255,255,255,0.07); }
            }
          `}</style>
        </div>
      )}

      {activePortal !== null && (
        <button type="button" onClick={onBack} style={backButtonStyle}>
          ← Back
        </button>
      )}

      {showGyroPrompt && (
        <button type="button" onClick={onRequestGyro} style={gyroButtonStyle}>
          Enable gyroscope
        </button>
      )}
    </>
  )
}
