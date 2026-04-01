import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'

const DissolveMaterial = shaderMaterial(
  { threshold: 0, color: [1, 1, 1], minY: -1, maxY: 1 },
  `varying vec2 vUv;
   varying float vY;
   void main() {
     vUv = uv;
     vY = position.y;
     gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
   }`,
  `varying vec2 vUv;
   varying float vY;
   uniform float threshold;
   uniform float minY;
   uniform float maxY;
   uniform vec3 color;

   float noise(vec2 p) {
     return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
   }

   void main() {
     // normalize Y from 0 (bottom) to 1 (top)
     float normalizedY = (vY - minY) / (maxY - minY);
     float n = noise(vUv * 20.0) * 0.15; // small noise for jagged edge
     float dissolve = normalizedY + n;
     if (dissolve > threshold) discard;
     float edge = smoothstep(threshold - 0.08, threshold, dissolve);
     vec3 edgeColor = mix(color, vec3(1.0, 0.6, 0.1), edge);
     gl_FragColor = vec4(edgeColor, 1.0);
   }`
)

extend({ DissolveMaterial })

export default DissolveMaterial
