import { DOOR_DATA } from './doorData'

/** Vestíbulo: `activePortal === null` */
export const HUB_GALLERY_INFO = {
  title: 'Drei Gallery',
  lede:
    'Espacio virtual para recorrer salas y obras. Este texto es placeholder: sustituye por la presentación de la galería, curaduría y enlaces.',
  sections: [
    {
      heading: 'Contexto',
      body:
        'Placeholder del vestíbulo: describe el proyecto, la intención del recorrido y qué puede hacer el visitante al abrir cada puerta.',
    },
    {
      heading: 'Autores y créditos',
      body:
        'Placeholder: nombres, roles, agradecimientos y licencias de modelos o HDR si aplica.',
    },
    {
      heading: 'Cómo moverte',
      body:
        'Ratón: arrastra para mirar alrededor. En móvil: puedes activar el giroscopio si el navegador lo permite. Dentro de una sala, usa «Back» para volver al vestíbulo.',
    },
  ],
  ctaLabel: 'Descubrir la galería',
}

const roomPlaceholder = (n, doorHeader) => ({
  title: `Sala ${n} — ${doorHeader}`,
  lede: `Contenido editorial pendiente para la sala ${n}. Sustituye este párrafo por la ficha de la exposición o la obra.`,
  sections: [
    {
      heading: 'Sobre esta sala',
      body: `Placeholder sala ${n}: tema, piezas, duración o notas curatoriales.`,
    },
    {
      heading: 'Autores',
      body: `Placeholder sala ${n}: artistas, colectivos o créditos específicos.`,
    },
    {
      heading: 'Comentarios',
      body: `Placeholder sala ${n}: citas, reflexiones o contexto histórico.`,
    },
    {
      heading: 'Guía rápida',
      body:
        'Misma interacción que en el vestíbulo: orbitar con el ratón o giroscopio. Pulsa «Back» para regresar a las puertas.',
    },
  ],
  ctaLabel: 'Continuar en la sala',
})

/** Un bloque por cada entrada de `DOOR_DATA` (mismo orden e índice). */
export const ROOM_GALLERY_INFO = DOOR_DATA.map((door, i) =>
  roomPlaceholder(i + 1, door.header),
)

export function getGalleryInfo(activePortal) {
  if (activePortal === null) return HUB_GALLERY_INFO
  return ROOM_GALLERY_INFO[activePortal]
}
