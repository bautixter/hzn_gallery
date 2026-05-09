/**
 * Texto editorial genérico. Las salas con `roomGalleryInfo` propio no lo usan.
 */
export function placeholderRoomGalleryInfo(roomNumber, doorHeader) {
  return {
    title: `Sala ${roomNumber} — ${doorHeader}`,
    lede: `Contenido editorial pendiente para la sala ${roomNumber}. Sustituye este párrafo por la ficha de la exposición o la obra.`,
    sections: [
      {
        heading: 'Sobre esta sala',
        body: `Placeholder sala ${roomNumber}: tema, piezas, duración o notas curatoriales.`,
      },
      {
        heading: 'Autores',
        body: `Placeholder sala ${roomNumber}: artistas, colectivos o créditos específicos.`,
      },
      {
        heading: 'Comentarios',
        body: `Placeholder sala ${roomNumber}: citas, reflexiones o contexto histórico.`,
      },
      {
        heading: 'Guía rápida',
        body:
          'Misma interacción que en el vestíbulo: orbitar con el ratón o giroscopio. Pulsa «Back» para regresar a las puertas.',
      },
    ],
    ctaLabel: 'Continuar en la sala',
  }
}
