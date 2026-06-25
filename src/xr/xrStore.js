import { createXRStore } from '@react-three/xr'

// Single immersive store for the whole app. The defaults render controller ray pointers
// (and hands) whose pointer events drive the very same onClick / onPointerEnter handlers the
// works already use on desktop and touch, so selecting a painting in VR needs no extra wiring.
export const xrStore = createXRStore()
