import { Html } from '@react-three/drei'

const htmlStyle = {
  width: 220,
  userSelect: 'none',
  pointerEvents: 'none',
  transition: 'opacity 0.4s ease',
}

const rootStyle = {
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  color: 'rgba(4, 39, 104, 0.51)',
}

const headerStyle = {
  fontSize: 32,
  fontWeight: 700,
  lineHeight: 1.1,
  marginBottom: 4,
}

const subheaderStyle = {
  fontSize: 22,
  fontWeight: 400,
  opacity: 0.7,
  marginBottom: 10,
}

const tagsRowStyle = {
  display: 'flex',
  gap: 6,
  flexWrap: 'wrap',
  marginBottom: 10,
}

const tagStyle = {
  fontSize: 18,
  padding: '2px 8px',
  border: '1px solid rgba(4, 39, 104, 0.51)',
  borderRadius: 20,
  opacity: 0.8,
}

const descriptionStyle = {
  fontSize: 18,
  lineHeight: 1.5,
  opacity: 0.85,
}

export default function DoorLabel({ data, visible }) {
  return (
    <Html
      position={[0.8, 2.5, 0]}
      distanceFactor={4}
      occlude={false}
      style={{
        ...htmlStyle,
        opacity: visible ? 1 : 0,
      }}
    >
      <div style={rootStyle}>
        <div style={headerStyle}>{data.header}</div>
        <div style={subheaderStyle}>{data.subheader}</div>
        <div style={tagsRowStyle}>
          {data.tags.map(tag => (
            <span key={tag} style={tagStyle}>
              {tag}
            </span>
          ))}
        </div>
        <div style={descriptionStyle}>{data.description}</div>
      </div>
    </Html>
  )
}
