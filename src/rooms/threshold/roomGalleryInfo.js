export const roomGalleryInfo = {
  title: 'Threshold — cono sobre verde',
  lede:
    'Sala vegetal y un cono como gesto abstracto. Placeholder para pintura mural, objeto cónico o pieza que dialogue con el suelo.',
  sections: [
    {
      heading: 'Composición',
      body:
        'El cono apunta al techo; úsalo como referencia de escala. threshold/RoomPlaceholder.jsx es el punto de partida.',
    },
    {
      heading: 'Autores',
      body: 'Edita créditos y fecha en threshold/roomGalleryInfo.js.',
    },
    {
      heading: 'Paleta',
      body:
        'Verdes apagados y un acento menta en el volumen. Ajusta overlayStyles en el mismo archivo para el panel editorial.',
    },
  ],
  ctaLabel: 'Abrir sala',
  overlayStyles: {
    panel: {
      background: 'linear-gradient(165deg, rgba(18, 36, 28, 0.97) 0%, rgba(12, 24, 18, 0.99) 100%)',
      color: 'rgba(220, 245, 228, 0.93)',
    },
    sectionHeading: { color: 'rgba(120, 220, 160, 0.9)', letterSpacing: '0.12em' },
    lede: { color: 'rgba(170, 210, 185, 0.85)' },
    cta: {
      color: '#082010',
      background: 'linear-gradient(180deg, #b8f0cc 0%, #3d9a5c 100%)',
    },
    reopenButton: {
      border: '1px solid rgba(100, 200, 140, 0.45)',
      background: 'linear-gradient(145deg, rgba(30, 80, 50, 0.5), rgba(12, 28, 20, 0.55))',
    },
  },
}
