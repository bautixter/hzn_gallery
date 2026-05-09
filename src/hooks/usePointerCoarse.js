import { useSyncExternalStore } from 'react'

function subscribe(callback) {
  const mq = window.matchMedia('(pointer: coarse)')
  mq.addEventListener('change', callback)
  return () => mq.removeEventListener('change', callback)
}

function getSnapshot() {
  return window.matchMedia('(pointer: coarse)').matches
}

function getServerSnapshot() {
  return false
}

export function usePointerCoarse() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
