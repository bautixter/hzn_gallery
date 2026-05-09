export const roomGalleryInfo = {
  title: 'Liminal — esfera y penumbra',
  lede:
    'Sala fría, casi crepuscular: la esfera sugiere lente, luna o foco. Placeholder para fotografía, vídeo o instalación lumínica.',
  sections: [
    {
      heading: 'Luz y borde',
      body:
        'Los muros azul pizarra encuadran un único volumen curvo. Piensa en HDRI, spots o emissive al reemplazar la escena.',
    },
    {
      heading: 'Autores',
      body: 'Créditos en liminal/roomGalleryInfo.js — obra, curaduría, música.',
    },
    {
      heading: 'Archivo 3D',
      body: 'liminal/RoomPlaceholder.jsx: reemplaza el mesh por tu composición o importa desde /public.',
    },
  ],
  ctaLabel: 'Entrar',
  overlayStyles: {
    panel: {
      background: 'linear-gradient(180deg, rgba(22, 28, 40, 0.98) 0%, rgba(14, 18, 28, 0.99) 100%)',
      color: 'rgba(220, 230, 248, 0.92)',
    },
    title: { letterSpacing: '-0.03em', color: 'rgba(235, 242, 255, 0.97)' },
    lede: { color: 'rgba(170, 190, 220, 0.88)' },
    sectionHeading: { color: 'rgba(130, 180, 255, 0.85)', textTransform: 'none', fontSize: '0.85rem' },
    sectionBody: { color: 'rgba(200, 215, 235, 0.9)' },
    cta: {
      color: '#0a1420',
      background: 'linear-gradient(180deg, #e0ecff 0%, #7a9fe0 100%)',
      border: '1px solid rgba(200, 220, 255, 0.5)',
    },
    reopenButton: {
      color: 'rgba(230, 238, 255, 0.95)',
      border: '1px solid rgba(140, 180, 255, 0.4)',
      background: 'linear-gradient(145deg, rgba(50, 70, 120, 0.45), rgba(20, 28, 48, 0.55))',
    },
  },
}
