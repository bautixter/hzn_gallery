import { useState, useCallback, useRef, useEffect } from 'react'
import { useProgress } from '@react-three/drei'
import { xrStore } from '../xr/xrStore'

const FADE_MS = 400
const SPINNER_THRESHOLD_MS = 600
const SAFETY_TIMEOUT_MS = 8000

export function useSceneManager() {
  const [activePortal, setActivePortal] = useState(null)
  const [overlayOpacity, setOverlayOpacity] = useState(null)
  const [showSpinner, setShowSpinner] = useState(false)
  const [waitingForScene, setWaitingForScene] = useState(false)
  const [exitChoreography, setExitChoreography] = useState(null)
  const pendingRef = useRef(null)
  const timerIds = useRef([])
  const activePortalRef = useRef(null)
  const doorSnapshotRef = useRef(null)

  const { active } = useProgress()

  useEffect(() => {
    activePortalRef.current = activePortal
  }, [activePortal])

  const fadeOut = useCallback(() => {
    timerIds.current.forEach(clearTimeout)
    timerIds.current = []
    setShowSpinner(false)
    setWaitingForScene(false)
    requestAnimationFrame(() => requestAnimationFrame(() => {
      setOverlayOpacity(0)
      const id = setTimeout(() => setOverlayOpacity(null), FADE_MS)
      timerIds.current.push(id)
    }))
  }, [])

  // Fade out as soon as three.js loading completes
  useEffect(() => {
    if (!waitingForScene || active) return
    fadeOut()
  }, [active, waitingForScene, fadeOut])

  const triggerTransition = useCallback((action) => {
    timerIds.current.forEach(clearTimeout)
    timerIds.current = []

    // Immersive XR freezes window.requestAnimationFrame (only the headset's frame loop runs) and the
    // DOM fade overlay isn't visible in the headset, so the normal choreography never completes and the
    // scene never swaps. Apply the change directly instead.
    if (xrStore.getState().session != null) {
      action()
      return
    }

    pendingRef.current = action
    setOverlayOpacity(0)

    requestAnimationFrame(() => requestAnimationFrame(() => {
      setOverlayOpacity(1)

      const id = setTimeout(() => {
        pendingRef.current?.()
        pendingRef.current = null

        setWaitingForScene(true)

        // Show spinner after threshold if scene still loading
        timerIds.current.push(
          setTimeout(() => setShowSpinner(true), SPINNER_THRESHOLD_MS)
        )
        // Safety net: fade out even if useProgress never signals
        timerIds.current.push(
          setTimeout(fadeOut, SAFETY_TIMEOUT_MS)
        )
      }, FADE_MS)

      timerIds.current.push(id)
    }))
  }, [fadeOut])

  const handleActivate = useCallback((i) => {
    triggerTransition(() => setActivePortal(i))
  }, [triggerTransition])

  const handleBack = useCallback(() => {
    const snap = doorSnapshotRef.current
    const cur = activePortalRef.current
    // The exit choreography slides/closes the door back into the hub using the camera position
    // captured on entry. In an XR session that position is stale (the headset drives the camera, only
    // matrixWorld updates), so the door animates from the hub centre and sweeps across the whole view
    // -- hiding the sky -- until it lands on the ring. Skip it in VR and just return to the hub.
    const presenting = xrStore.getState().session != null
    if (!presenting && snap && cur !== null && snap.portalIndex === cur) {
      triggerTransition(() => {
        setExitChoreography({ snapshot: snap })
        setActivePortal(null)
      })
      return
    }
    triggerTransition(() => setActivePortal(null))
  }, [triggerTransition])

  const onExitReverseComplete = useCallback(() => {
    setExitChoreography(null)
    doorSnapshotRef.current = null
  }, [])

  const registerDoorInteractionFreeze = useCallback((snapshot) => {
    doorSnapshotRef.current = snapshot
  }, [])

  return {
    activePortal,
    overlayOpacity,
    showSpinner,
    handleActivate,
    handleBack,
    FADE_MS,
    exitChoreography,
    registerDoorInteractionFreeze,
    onExitReverseComplete,
  }
}
