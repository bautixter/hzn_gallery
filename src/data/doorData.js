import { asset } from '../utils/asset'

export const DOOR_DATA = [
  {
    header: 'Garabatos',
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
    description: 'Large-scale abstract works examining boundary and belonging.',
    room: { type: 'microfriends' },
    galleryInfoSrc: asset('/gallery-info/microfriends.html'),
  },
  {
    header: 'Light and Wood',
    subheader: 'Ali Garaki Nezhad',
    tags: ['painting', 'cartoon'],
    description: 'A photographic series documenting transitional moments at dusk.',
    room: { type: 'lightAndWood' },
    galleryInfoSrc: asset('/gallery-info/light-and-wood.html'),
  },
]
