import { useState, useCallback, useRef } from 'react'

const FADE_MS = 400

export function useSceneManager() {
  const [activePortal, setActivePortal] = useState(null)
  const [overlayOpacity, setOverlayOpacity] = useState(null)
  const pendingRef = useRef(null)
  const timerIds   = useRef([])

  const triggerTransition = useCallback((action) => {
    timerIds.current.forEach(clearTimeout)
    timerIds.current = []

    const schedule = (ms, fn) => {
      const id = setTimeout(fn, ms)
      timerIds.current.push(id)
    }

    pendingRef.current = action
    setOverlayOpacity(0)

    // Double rAF: wait for layout/paint so opacity:0 is committed before animating to 1
    requestAnimationFrame(() => requestAnimationFrame(() => {
      setOverlayOpacity(1)

      schedule(FADE_MS, () => {
        pendingRef.current?.()
        pendingRef.current = null

        requestAnimationFrame(() => requestAnimationFrame(() => {
          setOverlayOpacity(0)
          schedule(FADE_MS, () => setOverlayOpacity(null))
        }))
      })
    }))
  }, [])

  const handleActivate = useCallback((i) => {
    triggerTransition(() => setActivePortal(i))
  }, [triggerTransition])

  const handleBack = useCallback(() => {
    triggerTransition(() => setActivePortal(null))
  }, [triggerTransition])

  return { activePortal, overlayOpacity, handleActivate, handleBack, FADE_MS }
}
