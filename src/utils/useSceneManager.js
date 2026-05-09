import { useState, useCallback, useRef, useEffect } from 'react'

const FADE_MS = 400

export function useSceneManager() {
  const [activePortal, setActivePortal] = useState(null)
  const [overlayOpacity, setOverlayOpacity] = useState(null)
  const [exitChoreography, setExitChoreography] = useState(null)
  const pendingRef = useRef(null)
  const timerIds   = useRef([])
  const activePortalRef = useRef(null)
  const doorSnapshotRef = useRef(null)
  /** Synchronous guard so CanvasControls stops blocking in the same frame reverse completes */
  const exitControlsBlockRef = useRef(false)

  useEffect(() => {
    activePortalRef.current = activePortal
  }, [activePortal])

  const registerDoorInteractionFreeze = useCallback((snapshot) => {
    doorSnapshotRef.current = snapshot
  }, [])

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
    const snap = doorSnapshotRef.current
    const cur = activePortalRef.current
    if (snap && cur !== null && snap.portalIndex === cur) {
      exitControlsBlockRef.current = true
      setExitChoreography({ snapshot: snap })
      setActivePortal(null)
      return
    }
    triggerTransition(() => setActivePortal(null))
  }, [triggerTransition])

  const onExitReverseComplete = useCallback(() => {
    exitControlsBlockRef.current = false
    setExitChoreography(null)
    doorSnapshotRef.current = null
  }, [])

  return {
    activePortal,
    overlayOpacity,
    handleActivate,
    handleBack,
    FADE_MS,
    exitChoreography,
    registerDoorInteractionFreeze,
    onExitReverseComplete,
    exitControlsBlockRef,
  }
}
