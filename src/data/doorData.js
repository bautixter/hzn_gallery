import { asset } from '../utils/asset'

export const DOOR_DATA = [
  {
    header: 'The Passage',
    subheader: 'Room I',
    tags: ['sculpture', 'installation'],
    description: 'An exploration of thresholds and the spaces between states of being.',
    room: { type: 'thePassage' },
    galleryInfoSrc: asset('/gallery-info/the-passage.html'),
  },
  {
    header: 'Liminal',
    subheader: 'Room II',
    tags: ['photography', 'light'],
    description: 'A photographic series documenting transitional moments at dusk.',
    room: { type: 'liminal' },
    galleryInfoSrc: asset('/gallery-info/liminal.html'),
  },
  {
    header: 'Threshold',
    subheader: 'Room III',
    tags: ['painting', 'abstract'],
    description: 'Large-scale abstract works examining boundary and belonging.',
    room: { type: 'threshold' },
    galleryInfoSrc: asset('/gallery-info/threshold.html'),
  },
  {
    header: 'Between',
    subheader: 'Room IV',
    tags: ['video', 'sound'],
    description: 'A dual-channel video piece exploring separation and reunion.',
    room: { type: 'between' },
    galleryInfoSrc: asset('/gallery-info/between.html'),
  },
  {
    header: 'The Gate',
    subheader: 'Room V',
    tags: ['mixed media'],
    description: 'Found objects assembled into a meditation on entry and exclusion.',
    room: { type: 'theGate' },
    galleryInfoSrc: asset('/gallery-info/the-gate.html'),
  },
  {
    header: 'Aperture',
    subheader: 'Room VI',
    tags: ['digital', 'generative'],
    description: 'Generative works that respond to the movement of viewers.',
    room: { type: 'aperture' },
    galleryInfoSrc: asset('/gallery-info/aperture.html'),
  },
]
