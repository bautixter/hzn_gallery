export const roomGalleryInfo = {
  title: 'Drei Gallery',
  lede:
    'Vestíbulo de la galería virtual. Cada puerta lleva a una sala placeholder: colores, forma central y texto distintos hasta que sustituyas por las escenas finales.',
  sections: [
    {
      heading: 'Recorrido',
      body:
        'Avanza por las salas en cualquier orden. Dentro de cada una verás un volumen geométrico distinto sobre un suelo y muros propios: son puntos de anclaje para tu montaje 3D definitivo.',
    },
    {
      heading: 'Créditos',
      body:
        'Edita este bloque en rooms/hub/roomGalleryInfo.js con nombres, fecha y agradecimientos.',
    },
    {
      heading: 'Controles',
      body:
        'Ratón: arrastra para mirar. En móvil puedes activar el giroscopio si el navegador lo permite. «Back» te devuelve aquí.',
    },
  ],
  ctaLabel: 'Entrar a la galería',
  overlayStyles: {
    panel: {
      background: 'linear-gradient(160deg, rgba(14, 16, 32, 0.98) 0%, rgba(8, 10, 22, 0.99) 100%)',
    },
    sectionHeading: { color: 'rgba(150, 190, 255, 0.92)' },
    lede: { color: 'rgba(210, 218, 240, 0.85)' },
  },
}
