import { asset } from '../utils/asset'

export const DOOR_DATA = [
  {
    header: 'Marginalia',
    subheader: 'J.B. Aballay',
    tags: ['digital', 'cartoon'],
    description: 'Drawings accumulated over the years. A quick-line archive where absurdity, humour and everyday observation coexist.',
    room: { type: 'garabatos' },
    galleryInfoSrc: asset('/gallery-info/garabatos.html'),
  },
  {
    header: 'Microfriends',
    subheader: 'Téo Perrier',
    tags: ['3D', 'modelling'],
    description: 'A menagerie of restless, impossible little organisms. Wild, organic sculptures born from an exploration of the microscopic world.',
    room: { type: 'microfriends' },
    galleryInfoSrc: asset('/gallery-info/microfriends.html'),
  },
  {
    header: 'Light and Wood',
    subheader: 'Ali Garaki Nezhad',
    tags: ['painting', 'cartoon'],
    description: 'A series of digital paintings analyzing light behaviour.',
    room: { type: 'lightAndWood' },
    galleryInfoSrc: asset('/gallery-info/light-and-wood.html'),
  },
]
