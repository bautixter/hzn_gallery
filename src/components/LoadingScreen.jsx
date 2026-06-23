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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 18px)', gap: 2 }}>
        {/* delays ordered TL, TR, BR, BL so the pulse travels around the square (a circle) */}
        {[0, 1, 3, 2].map(i => (
          <div
            key={i}
            style={{
              width: 18,
              height: 18,
              background: 'rgb(226, 230, 236)',
              animation: 'sq 1s ease-in-out infinite',
              animationDelay: `${i * 0.25}s`, // 1s / 4 → evenly spaced so the chase loops seamlessly
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes sq {
          0%   { background: #2c2c2c; }
          100% { background: #fff; }
        }
      `}</style>
    </div>
  )
}
