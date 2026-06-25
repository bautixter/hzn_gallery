import { Html } from '@react-three/drei'
import { useXR } from '@react-three/xr'
import CanvasInfoLabel from './CanvasInfoLabel'

// Museum-placard info tag that fades in when the viewer looks at a work. Text content
// and colour come from the per-painting `info` object (see the room's painting config):
//   { header, subheader, tags: [], description, color }
// Every text field is optional; `color` drives the type and tag-outline colour.

const wrapStyle = {
  width: 220,
  userSelect: 'none',
  pointerEvents: 'none',
  transition: 'opacity 0.4s ease',
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
}

export default function PaintingLabel({ info, visible, anchor = [0, 0, 0] }) {
  const presenting = useXR((s) => s.session != null)
  if (!info) return null
  const color = info.color ?? 'rgba(255, 255, 255, 0.9)'

  // In VR the <Html> tag is invisible, so render the same content as an in-scene label beside the work.
  if (presenting) {
    return (
      <CanvasInfoLabel
        info={info}
        visible={visible}
        // position: [right/left, up/down, toward you]. apparent: on-screen size (smaller = smaller).
        position={[anchor[0] + 0.65, anchor[1] - 0.2, anchor[2]]}
        maxWidth={0.6}
        apparent={0.32}
      />
    )
  }

  return (
    <Html
      position={anchor}
      distanceFactor={4}
      occlude={false}
      style={{ ...wrapStyle, color, opacity: visible ? 1 : 0 }}
    >
      <div>
        {info.header && (
          <div style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.1, marginBottom: 4 }}>
            {info.header}
          </div>
        )}
        {info.subheader && (
          <div style={{ fontSize: 20, fontWeight: 400, opacity: 0.7, marginBottom: 10 }}>
            {info.subheader}
          </div>
        )}
        {info.tags?.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            {info.tags.map(tag => (
              <span
                key={tag}
                style={{ fontSize: 16, padding: '2px 8px', border: `1px solid ${color}`, borderRadius: 20, opacity: 0.8 }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        {info.description && (
          <div style={{ fontSize: 16, lineHeight: 1.5, opacity: 0.85 }}>
            {info.description}
          </div>
        )}
      </div>
    </Html>
  )
}
