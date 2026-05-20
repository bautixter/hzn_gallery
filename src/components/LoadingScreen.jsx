import { useEffect, useState } from 'react'

export default function LoadingScreen({ visible }) {
  const [unmounted, setUnmounted] = useState(false)

  useEffect(() => {
    if (!visible) {
      const t = setTimeout(() => setUnmounted(true), 700)
      return () => clearTimeout(t)
    }
  }, [visible])

  if (unmounted) return null

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.6s ease',
      pointerEvents: visible ? 'all' : 'none',
    }}>
      <div style={{ display: 'flex', gap: 14 }}>
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            style={{
              width: 18,
              height: 18,
              background: '#000',
              animation: 'sq 1.4s ease-in-out infinite',
              animationDelay: `${i * 0.22}s`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes sq {
          0%, 100% { opacity: 0.08; }
          40%       { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
