export const roomGalleryInfo = {
  title: 'Between — anillo y resonancia',
  lede:
    'Sala cálida con un toro dorado: sugiere bucle, sonido o proyección. Placeholder para vídeo dual o pieza sonora.',
  sections: [
    {
      heading: 'Metáfora',
      body:
        'El anillo sin fin encaja con “entre” estados. between/RoomPlaceholder.jsx centraliza el volumen para que lo sustituyas por pantallas o altavoces virtuales.',
    },
    {
      heading: 'Autores',
      body: 'between/roomGalleryInfo.js — lista de artistas, técnico de sonido, etc.',
    },
    {
      heading: 'Estética del panel',
      body:
        'Tipografía sans y acentos ámbar en overlayStyles; alinea con la sala o cámbialo a frío si tu obra lo pide.',
    },
  ],
  ctaLabel: 'Continuar',
  overlayStyles: {
    panel: {
      background: 'linear-gradient(200deg, rgba(40, 28, 18, 0.97) 0%, rgba(18, 12, 8, 0.99) 100%)',
      color: 'rgba(255, 236, 210, 0.93)',
    },
    title: { color: 'rgba(255, 220, 160, 0.98)' },
    sectionHeading: { color: 'rgba(255, 180, 90, 0.92)' },
    lede: { color: 'rgba(230, 190, 140, 0.86)' },
    sectionBody: { color: 'rgba(250, 225, 195, 0.88)' },
    cta: {
      color: '#281000',
      background: 'linear-gradient(180deg, #ffe0a0 0%, #d08020 100%)',
    },
    reopenButton: {
      border: '1px solid rgba(255, 180, 80, 0.5)',
      background: 'linear-gradient(145deg, rgba(120, 70, 20, 0.45), rgba(30, 18, 8, 0.6))',
    },
  },
}
