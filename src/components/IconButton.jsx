// Shared glass icon button used by the top-right chrome cluster (home / help) and the
// mobile info reopen handle. Semi-transparent with the same subtle shadow as the info panel.

const iconButtonStyle = {
  width: 42,
  height: 42,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.18)',
  background: 'rgba(20,20,22,0.32)',
  color: 'rgba(255,255,255,0.9)',
  cursor: 'pointer',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  boxShadow: '0 0 5px 0 rgba(0,0,0,0.3)',
  transition: 'background 0.2s ease, transform 0.2s ease',
}

const onEnter = (e) => {
  e.currentTarget.style.background = 'rgba(45,45,50,0.5)'
  e.currentTarget.style.transform = 'translateY(-1px)'
}
const onLeave = (e) => {
  e.currentTarget.style.background = iconButtonStyle.background
  e.currentTarget.style.transform = ''
}

export function IconButton({ onClick, label, style, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      style={{ ...iconButtonStyle, ...style }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {children}
    </button>
  )
}

const iconProps = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export const HomeIcon = () => (
  <svg {...iconProps}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <path d="M9 22V12h6v10" />
  </svg>
)

export const HelpIcon = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <path d="M12 17h.01" />
  </svg>
)

export const InfoIcon = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
)
