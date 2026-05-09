import { asset } from '../utils/asset'
import { roomGalleryInfo as galleryThePassage } from '../rooms/thePassage/roomGalleryInfo'
import { roomGalleryInfo as galleryLiminal } from '../rooms/liminal/roomGalleryInfo'
import { roomGalleryInfo as galleryThreshold } from '../rooms/threshold/roomGalleryInfo'
import { roomGalleryInfo as galleryBetween } from '../rooms/between/roomGalleryInfo'
import { roomGalleryInfo as galleryTheGate } from '../rooms/theGate/roomGalleryInfo'
import { roomGalleryInfo as galleryAperture } from '../rooms/aperture/roomGalleryInfo'

export const DOOR_DATA = [
  {
    header: 'The Passage',
    subheader: 'Room I',
    tags: ['sculpture', 'installation'],
    description: 'An exploration of thresholds and the spaces between states of being.',
    room: { type: 'thePassage' },
    galleryInfo: galleryThePassage,
  },
  {
    header: 'Liminal',
    subheader: 'Room II',
    tags: ['photography', 'light'],
    description: 'A photographic series documenting transitional moments at dusk.',
    room: { type: 'liminal' },
    galleryInfo: galleryLiminal,
  },
  {
    header: 'Threshold',
    subheader: 'Room III',
    tags: ['painting', 'abstract'],
    description: 'Large-scale abstract works examining boundary and belonging.',
    room: { type: 'threshold' },
    galleryInfo: galleryThreshold,
  },
  {
    header: 'Between',
    subheader: 'Room IV',
    tags: ['video', 'sound'],
    description: 'A dual-channel video piece exploring separation and reunion.',
    room: { type: 'between' },
    galleryInfo: galleryBetween,
  },
  {
    header: 'The Gate',
    subheader: 'Room V',
    tags: ['mixed media'],
    description: 'Found objects assembled into a meditation on entry and exclusion.',
    room: { type: 'theGate' },
    galleryInfo: galleryTheGate,
  },
  {
    header: 'Aperture',
    subheader: 'Room VI',
    tags: ['digital', 'generative'],
    description: 'Generative works that respond to the movement of viewers.',
    room: { type: 'aperture' },
    galleryInfo: galleryAperture,
  },
]
