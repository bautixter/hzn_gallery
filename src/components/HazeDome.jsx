import { BackSide, Color } from 'three'

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

export default function HazeDome() {
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
