import './style.scss'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { DotScreenPass } from 'three/examples/jsm/postprocessing/DotScreenPass'
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader'
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader'
import { SSAARenderPass } from 'three/examples/jsm/postprocessing/SSAARenderPass'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'

import * as dat from 'lil-gui'
import {
  Scene,
  CubeTextureLoader,
  TextureLoader,
  Mesh,
  MeshStandardMaterial,
  sRGBEncoding,
  DirectionalLight,
  PerspectiveCamera,
  WebGLRenderer,
  PCFShadowMap,
  ReinhardToneMapping,
  Clock,
  WebGLRenderTarget,
  Vector2,
  Shader,
  Vector3,
} from 'three'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()
const debugObject: { [key: string]: any } = {
  exposure: 1.5,
}

// Canvas
const canvas = document.querySelector('canvas.webgl') as HTMLElement

// Scene
const scene = new Scene()

/**
 * Loaders
 */
const gltfLoader = new GLTFLoader()
const cubeTextureLoader = new CubeTextureLoader()
const textureLoader = new TextureLoader()

/**
 * Update all materials
 */
const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (child instanceof Mesh && child.material instanceof MeshStandardMaterial) {
      child.material.envMapIntensity = 2.5
      child.material.needsUpdate = true
      child.castShadow = true
      child.receiveShadow = true
    }
  })
}

/**
 * Environment map
 */
const environmentMap = cubeTextureLoader.load([
  '/textures/environmentMaps/0/px.jpg',
  '/textures/environmentMaps/0/nx.jpg',
  '/textures/environmentMaps/0/py.jpg',
  '/textures/environmentMaps/0/ny.jpg',
  '/textures/environmentMaps/0/pz.jpg',
  '/textures/environmentMaps/0/nz.jpg',
])
environmentMap.encoding = sRGBEncoding

scene.background = environmentMap
scene.environment = environmentMap

/**
 * Models
 */
gltfLoader.load('/models/DamagedHelmet/glTF/DamagedHelmet.gltf', (gltf) => {
  gltf.scene.scale.set(2, 2, 2)
  gltf.scene.rotation.y = Math.PI * 0.5
  scene.add(gltf.scene)

  updateAllMaterials()
})

/**
 * Lights
 */
const directionalLight = new DirectionalLight('#ffffff', 3)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.normalBias = 0.05
directionalLight.position.set(0.25, 3, -2.25)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  // Update Composer
  effectComposer.setSize(sizes.width, sizes.height)
  effectComposer.setPixelRatio(renderer.getPixelRatio())
})

/**
 * Camera
 */
// Base camera
const camera = new PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(4, 1, -4)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new WebGLRenderer({
  canvas: canvas,
  antialias: true,
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = PCFShadowMap
renderer.physicallyCorrectLights = true
renderer.outputEncoding = sRGBEncoding
renderer.toneMapping = ReinhardToneMapping
renderer.toneMappingExposure = 1.5
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

gui.add(debugObject, 'exposure', 0.1, 2).onChange((value: number) => {
  renderer.toneMappingExposure = Math.pow(value, 4.0)
})

/**
 * Post-Processing
 */

// Render Target
const webglRenderTargetOption: any = {
  samples: renderer.getPixelRatio() === 1 ? 2 : 0,
}
const renderTarget = new WebGLRenderTarget(sizes.width, sizes.height, webglRenderTargetOption)

const effectComposer = new EffectComposer(renderer, renderTarget)
effectComposer.setPixelRatio(renderer.getPixelRatio())
effectComposer.setSize(sizes.width, sizes.height)

const renderPass = new RenderPass(scene, camera) // Render scene into texture
effectComposer.addPass(renderPass)

const dotScreenPass = new DotScreenPass()
dotScreenPass.enabled = false
effectComposer.addPass(dotScreenPass)

const glitchPass = new GlitchPass()
glitchPass.enabled = false
glitchPass.goWild = false
effectComposer.addPass(glitchPass)

const rgbShiftPass = new ShaderPass(RGBShiftShader)
rgbShiftPass.enabled = false
effectComposer.addPass(rgbShiftPass)

const unrealBloomPass = new UnrealBloomPass(new Vector2(sizes.width, sizes.height), 1.5, 0.4, 0.85)
effectComposer.addPass(unrealBloomPass)

gui.add(unrealBloomPass, 'enabled')
gui.add(unrealBloomPass, 'strength').min(0).max(2).step(0.001)
gui.add(unrealBloomPass, 'radius').min(0).max(2).step(0.001)
gui.add(unrealBloomPass, 'threshold').min(0).max(1).step(0.001)

// Tint Pass
const TintShader: Shader = {
  uniforms: { tDiffuse: { value: null }, uTint: { value: null } },
  vertexShader: `
      varying vec2 vUv;
      void main()
      {
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          vUv = uv;
      }
  `,
  fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform vec3 uTint;

      varying vec2 vUv;
      void main()
      {
          vec4 color = texture2D(tDiffuse, vUv);
          color.rgb += uTint;
          gl_FragColor = color;
      }
  `,
}
const tintPass = new ShaderPass(TintShader)
tintPass.material.uniforms.uTint.value = new Vector3(0, 0, 0)
effectComposer.addPass(tintPass)

gui.add(tintPass.material.uniforms.uTint.value, 'x').min(-1).max(1).step(0.001).name('red')
gui.add(tintPass.material.uniforms.uTint.value, 'y').min(-1).max(1).step(0.001).name('green')
gui.add(tintPass.material.uniforms.uTint.value, 'z').min(-1).max(1).step(0.001).name('blue')

// Tint Pass
const DisplacementShader: Shader = {
  uniforms: {
    tDiffuse: { value: null },
    uNormalMap: { value: null },
  },
  vertexShader: `
      varying vec2 vUv;
      void main()
      {
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          vUv = uv;
      }
  `,
  fragmentShader: `
  uniform sampler2D tDiffuse;
  uniform float uTime;
  uniform sampler2D uNormalMap;

  varying vec2 vUv;

  void main()
  {
      vec3 normalColor = texture2D(uNormalMap, vUv).xyz * 2.0 - 1.0;
      vec2 newUv = vUv + normalColor.xy * 0.1;
      vec4 color = texture2D(tDiffuse, newUv);

      vec3 lightDirection = normalize(vec3(- 1.0, 1.0, 0.0));
      float lightness = clamp(dot(normalColor, lightDirection), 0.0, 1.0);
      color.rgb += lightness * 2.0;

      gl_FragColor = color;
  }
  `,
}
const displacementPass = new ShaderPass(DisplacementShader)
displacementPass.material.uniforms.uNormalMap.value = textureLoader.load('/textures/interfaceNormalMap.png')
effectComposer.addPass(displacementPass)

const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader)
gammaCorrectionPass.enabled = true
effectComposer.addPass(gammaCorrectionPass)

if (renderer.getPixelRatio() === 1 && !renderer.capabilities.isWebGL2) {
  const smaaPass = new SMAAPass(sizes.width, sizes.height)
  effectComposer.addPass(smaaPass)

  console.log('Using SMAA')
}

/**
 * Animate
 */
const clock = new Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  // Update controls
  controls.update()

  // update uniforms
  // displacementPass.material.uniforms.uTime.value = elapsedTime

  // Render
  // renderer.render(scene, camera)
  effectComposer.render()

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
