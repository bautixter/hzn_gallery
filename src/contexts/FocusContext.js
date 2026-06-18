import { createContext, useContext } from 'react'

// Tracks whether any work (painting or model) currently holds the camera in close-up
// view, so the gaze-revealed info tags on *other* works stay hidden while you're looking
// at one. Count-based: nested/overlapping focus transitions can't leave it stuck on.
export const FocusContext = createContext({
  acquireFocus: () => {},
  releaseFocus: () => {},
  isAnyFocused: () => false,
})

export const useFocusRegistry = () => useContext(FocusContext)
