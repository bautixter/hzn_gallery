export const roomGalleryInfo = {
  title: 'Aperture — cilindro y pantalla',
  lede:
    'Sala turquesa y un cilindro como “columna de píxeles” o lente. Placeholder para obra generativa, datos o instalación digital.',
  sections: [
    {
      heading: 'Digital',
      body:
        'El cilindro invita a shaders, video mapping o partículas. aperture/RoomPlaceholder.jsx es el hook para tu escena R3F final.',
    },
    {
      heading: 'Autores',
      body: 'aperture/roomGalleryInfo.js — equipo creativo, código, dataset.',
    },
    {
      heading: 'UI del panel',
      body:
        'Verdes aguamarina y cian en overlayStyles; contraste alto con el botón principal para lectura rápida.',
    },
  ],
  ctaLabel: 'Iniciar',
  overlayStyles: {
    panel: {
      background: 'linear-gradient(185deg, rgba(16, 40, 42, 0.98) 0%, rgba(8, 22, 26, 0.99) 100%)',
      color: 'rgba(220, 252, 248, 0.93)',
    },
    sectionHeading: { color: 'rgba(100, 230, 210, 0.92)' },
    lede: { color: 'rgba(160, 220, 210, 0.85)' },
    sectionBody: { color: 'rgba(200, 240, 232, 0.9)' },
    cta: {
      color: '#031818',
      background: 'linear-gradient(180deg, #b8fff4 0%, #20b8a8 100%)',
    },
    reopenButton: {
      border: '1px solid rgba(80, 220, 200, 0.5)',
      background: 'linear-gradient(145deg, rgba(20, 90, 85, 0.5), rgba(8, 28, 30, 0.6))',
    },
  },
}
