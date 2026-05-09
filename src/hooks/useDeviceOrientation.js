import { useState, useEffect } from 'react'

export function useDeviceOrientation() {
  const [granted, setGranted] = useState(false)
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    if (!window.DeviceOrientationEvent) return

    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      setSupported(true)
      return
    }

    const handler = (e) => {
      if (e.alpha !== null && e.beta !== null && e.gamma !== null) {
        setSupported(true)
        setGranted(true)
        window.removeEventListener('deviceorientation', handler)
      }
    }
    window.addEventListener('deviceorientation', handler)
    return () => window.removeEventListener('deviceorientation', handler)
  }, [])

  const requestPermission = () => {
    DeviceOrientationEvent.requestPermission()
      .then((result) => { if (result === 'granted') setGranted(true) })
  }

  return { supported, granted, requestPermission }
}
