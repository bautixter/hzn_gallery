export const roomGalleryInfo = {
  title: 'The Passage — volumen cúbico',
  lede:
    'Sala de tonos tierra y un cubo como pieza única. Pensada como placeholder de escultura e instalación: aquí irá tu modelo o composición final.',
  sections: [
    {
      heading: 'Concepto',
      body:
        'El umbral como objeto: el cubo marca un centro gravedad en la sala. Sustituye la primitiva por malla, GLB o instancing según tu pieza.',
    },
    {
      heading: 'Autores',
      body: 'Añade créditos de obra, sonido o diseño en este archivo (thePassage/roomGalleryInfo.js).',
    },
    {
      heading: 'Nota técnica',
      body:
        'Escena en thePassage/RoomPlaceholder.jsx. Mantiene iluminación básica y sala 8×8; copia el archivo o renómbralo al integrar assets.',
    },
  ],
  ctaLabel: 'Ver la sala',
  overlayStyles: {
    panel: {
      background:
        'linear-gradient(170deg, rgba(48, 26, 22, 0.97) 0%, rgba(24, 14, 12, 0.99) 100%)',
      color: 'rgba(255, 232, 220, 0.94)',
    },
    innerColumn: { fontFamily: 'Georgia, "Times New Roman", serif' },
    title: { color: 'rgba(255, 240, 230, 0.98)', fontWeight: 500 },
    lede: { color: 'rgba(230, 190, 170, 0.88)' },
    sectionHeading: { color: 'rgba(255, 160, 120, 0.9)', letterSpacing: '0.1em' },
    sectionBody: { color: 'rgba(250, 220, 205, 0.9)' },
    cta: {
      color: '#2a1008',
      background: 'linear-gradient(180deg, #ffc8a8 0%, #c96d48 100%)',
      borderRadius: 10,
    },
    reopenButton: {
      border: '1px solid rgba(255, 170, 130, 0.45)',
      background: 'linear-gradient(145deg, rgba(140, 60, 40, 0.4), rgba(40, 20, 16, 0.5))',
    },
    closeButton: { color: 'rgba(255, 200, 170, 0.8)' },
  },
}
