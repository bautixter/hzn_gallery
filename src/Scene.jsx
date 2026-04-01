import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, MeshReflectorMaterial, Environment, Html } from '@react-three/drei'
import { BackSide, Color, MathUtils, Vector3 } from 'three'

const hazeVert = `
  varying float vY;
  void main() {
    vY = normalize(position).y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const hazeFrag = `
  uniform vec3 color;
  varying float vY;
  void main() {
    float alpha = 1.0 - smoothstep(-0.05, 0.2, vY);
    gl_FragColor = vec4(color, alpha);
  }
`

function HazeDome() {
  return (
    <mesh scale={100}>
      <sphereGeometry args={[1, 32, 16]} />
      <shaderMaterial
        side={BackSide}
        transparent
        depthWrite={false}
        vertexShader={hazeVert}
        fragmentShader={hazeFrag}
        uniforms={{ color: { value: new Color('#ffffff') } }}
      />
    </mesh>
  )
}

const DOOR_COUNT = 6
const DOOR_RADIUS = 5

const DOOR_DATA = [
  {
    header: 'The Passage',
    subheader: 'Room I',
    tags: ['sculpture', 'installation'],
    description: 'An exploration of thresholds and the spaces between states of being.',
  },
  {
    header: 'Liminal',
    subheader: 'Room II',
    tags: ['photography', 'light'],
    description: 'A photographic series documenting transitional moments at dusk.',
  },
  {
    header: 'Threshold',
    subheader: 'Room III',
    tags: ['painting', 'abstract'],
    description: 'Large-scale abstract works examining boundary and belonging.',
  },
  {
    header: 'Between',
    subheader: 'Room IV',
    tags: ['video', 'sound'],
    description: 'A dual-channel video piece exploring separation and reunion.',
  },
  {
    header: 'The Gate',
    subheader: 'Room V',
    tags: ['mixed media'],
    description: 'Found objects assembled into a meditation on entry and exclusion.',
  },
  {
    header: 'Aperture',
    subheader: 'Room VI',
    tags: ['digital', 'generative'],
    description: 'Generative works that respond to the movement of viewers.',
  },
]

const _camDir = new Vector3()
const _toDoor = new Vector3()

const SHOW_THRESHOLD = 0.85

function Door({ angle, data }) {
  const { scene } = useGLTF('/models/door.glb')
  const groupRef = useRef()
  const labelRef = useRef()
  const y = useRef(-3)
  const isVisible = useRef(false)
  const [visible, setVisible] = useState(false)

  useFrame(({ camera }, delta) => {
    camera.getWorldDirection(_camDir)
    _toDoor.set(Math.sin(angle), 0, Math.cos(angle))

    const dot = _camDir.dot(_toDoor)
    const t = MathUtils.smoothstep(dot, 0.7, 0.97)
    const target = MathUtils.lerp(-3, 0, t)

    const speed = 3
    y.current = MathUtils.lerp(y.current, target, 1 - Math.exp(-speed * delta))
    groupRef.current.position.y = y.current

    const shouldShow = t > SHOW_THRESHOLD
    if (shouldShow !== isVisible.current) {
      isVisible.current = shouldShow
      setVisible(shouldShow)
    }
  })

  return (
    <group
      ref={groupRef}
      position={[Math.sin(angle) * DOOR_RADIUS, -3, Math.cos(angle) * DOOR_RADIUS]}
      rotation={[0, angle, 0]}
    >
      <primitive object={scene.clone()} />

      <Html
        position={[-0.8, 2.5, 0]}
        ref={labelRef}
        distanceFactor={4}
        occlude={false}
        style={{
          width: 220,
          userSelect: 'none',
          pointerEvents: 'none',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }}
      >
        <div style={{ fontFamily: 'sans-serif', color: 'rgba(4, 39, 104, 0.51)' }}>
          <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.1, marginBottom: 4 }}>
            {data.header}
          </div>
          <div style={{ fontSize: 22, fontWeight: 400, opacity: 0.7, marginBottom: 10 }}>
            {data.subheader}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            {data.tags.map(tag => (
              <span key={tag} style={{
                fontSize: 18, padding: '2px 8px',
                border: '1px solid rgba(4, 39, 104, 0.51)',
                borderRadius: 20, opacity: 0.8,
              }}>
                {tag}
              </span>
            ))}
          </div>
          <div style={{ fontSize: 18, lineHeight: 1.5, opacity: 0.85 }}>
            {data.description}
          </div>
        </div>
      </Html>
    </group>
  )
}

function Doors() {
  return Array.from({ length: DOOR_COUNT }, (_, i) => {
    const angle = (2 * Math.PI / DOOR_COUNT) * i
    return <Door key={i} angle={angle} data={DOOR_DATA[i]} />
  })
}

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <circleGeometry args={[100, 64]} />
      <MeshReflectorMaterial
        resolution={1024}
        color="#f5f5f5"
        depthScale={0}
        mirror={0.7}
      />
    </mesh>
  )
}

function DebugCube() {
  return (
    <mesh position={[1.5, 0.5, 0.5]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="red" />
    </mesh>
  )
}

export default function Scene() {
  return (
    <>
      <Environment
        files="/textures/citrus_orchard_puresky_4k.hdr"
        background
        backgroundBlurriness={0}
      />
      <HazeDome />
      <Floor />
      <Doors />
    </>
  )
}
