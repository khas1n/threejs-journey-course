uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
uniform vec2 uFrequency;
uniform float uTime;

attribute vec3 position;
attribute vec2 uv;
attribute float aRandom;

varying vec2 vUv;
varying float vElevation;

// varying float vRandom;

void main() {

  vec4 modelPosition = modelMatrix * vec4(position, 1.0);

  float elevation = sin(modelPosition.x * uFrequency.x - uTime) * 0.1;
  elevation += sin(modelPosition.y * uFrequency.y - uTime) * 0.1;
  modelPosition.z = elevation;

  vElevation = elevation;

  // modelPosition.z = aRandom * 0.1;
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition; // gl_Position is the final position of the vertex

  // vRandom = aRandom;

  vUv = uv;

  // gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}