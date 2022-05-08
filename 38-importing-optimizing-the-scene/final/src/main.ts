import './style.scss'
import * as dat from 'lil-gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import {
  AdditiveBlending,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Clock,
  Color,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  ShaderMaterial,
  sRGBEncoding,
  TextureLoader,
  WebGLRenderer,
} from 'three'

import firefliesFragmentShader from './shaders/fireflies/fragment.glsl?raw'
import firefliesVertexShader from './shaders/fireflies/vertex.glsl?raw'

import portalFragmentShader from './shaders/portal/fragment.glsl?raw'
import portalVertexShader from './shaders/portal/vertex.glsl?raw'

const pixelRatio = Math.min(window.devicePixelRatio, 2)

/**
 * Base
 */
// Debug
const debugObject: { [key: string]: any } = {}
const gui = new dat.GUI({
  width: 400,
})

// Canvas
const canvas = document.querySelector('canvas.webgl') as HTMLElement

// Scene
const scene = new Scene()

/**
 * Loaders
 */
// Texture loader
const textureLoader = new TextureLoader()

// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

/**
 * Textures
 */
const bakedTexture = textureLoader.load('/baked.jpg')
bakedTexture.flipY = false
bakedTexture.encoding = sRGBEncoding

/**
 * Object
 */

/**
 * Materials
 */
// Baked Material
const bakedMaterial = new MeshBasicMaterial({ map: bakedTexture })

// Pole Light Material
const poleLightMaterial = new MeshBasicMaterial({ color: 0xffae83 })

// Portal Light Material
// const portalLightMaterial = new MeshBasicMaterial({ color: 0x6037ff, side: DoubleSide })
debugObject.portalColorStart = '#2a004d'
debugObject.portalColorEnd = '#d4b8ff'

gui.addColor(debugObject, 'portalColorStart').onChange(() => {
  portalLightMaterial.uniforms.uColorStart.value.set(debugObject.portalColorStart)
})

gui.addColor(debugObject, 'portalColorEnd').onChange(() => {
  portalLightMaterial.uniforms.uColorEnd.value.set(debugObject.portalColorEnd)
})
const portalLightMaterial = new ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uColorStart: { value: new Color(debugObject.portalColorStart) },
    uColorEnd: { value: new Color(debugObject.portalColorEnd) },
  },
  vertexShader: portalVertexShader,
  fragmentShader: portalFragmentShader,
  side: DoubleSide,
})

/**
 * Model
 */
gltfLoader.load('/portal.glb', (gltf) => {
  // Get each object
  const bakedMesh = gltf.scene.children.find((child) => child.name === 'Cube060') as Mesh
  const portalLightMesh = gltf.scene.children.find((child) => child.name === 'portalLight') as Mesh
  const poleLightAMesh = gltf.scene.children.find((child) => child.name === 'poleLightA') as Mesh
  const poleLightBMesh = gltf.scene.children.find((child) => child.name === 'poleLightB') as Mesh

  // Apply materials
  bakedMesh.material = bakedMaterial
  portalLightMesh.material = portalLightMaterial
  poleLightAMesh.material = poleLightMaterial
  poleLightBMesh.material = poleLightMaterial
  scene.add(gltf.scene)
})

/** Fireflies */
// Fireflies Geometry
const firefliesGeometry = new BufferGeometry()
const firefliesCount = 30
const firefliesPositionsArray = new Float32Array(firefliesCount * 3)
const scaleArray = new Float32Array(firefliesCount)

for (let i = 0; i < firefliesCount; i++) {
  firefliesPositionsArray[i * 3 + 0] = (Math.random() - 0.5) * 4
  firefliesPositionsArray[i * 3 + 1] = (Math.random() + 0.15) * 1.5
  firefliesPositionsArray[i * 3 + 2] = (Math.random() - 0.5) * 4

  scaleArray[i] = Math.random()
}

firefliesGeometry.setAttribute('position', new BufferAttribute(firefliesPositionsArray, 3))
firefliesGeometry.setAttribute('aScale', new BufferAttribute(scaleArray, 1))

// Fireflies Material
const firefliesMaterial = new ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uPixelRatio: { value: pixelRatio },
    uSize: { value: 100 },
  },
  vertexShader: firefliesVertexShader,
  fragmentShader: firefliesFragmentShader,
  transparent: true,
  blending: AdditiveBlending,
  depthWrite: false,
})
gui.add(firefliesMaterial.uniforms.uSize, 'value').min(0).max(500).step(1).name('firefliesSize')
// Fireflies Points
const fireflies = new Points(firefliesGeometry, firefliesMaterial)

scene.add(fireflies)

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
  renderer.setPixelRatio(pixelRatio)

  // update fireflies
  firefliesMaterial.uniforms.uPixelRatio.value = pixelRatio
})

/**
 * Camera
 */
// Base camera
const camera = new PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 4
camera.position.y = 2
camera.position.z = 4
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.maxPolarAngle = Math.PI / 2 - 0.05

/**
 * Renderer
 */
const renderer = new WebGLRenderer({
  canvas: canvas,
  antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputEncoding = sRGBEncoding

debugObject.clearColor = '#0e0029'

renderer.setClearColor(debugObject.clearColor)

gui.addColor(debugObject, 'clearColor').onChange((value: string) => renderer.setClearColor(value))

/**
 * Animate
 */
const clock = new Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  firefliesMaterial.uniforms.uTime.value = elapsedTime
  portalLightMaterial.uniforms.uTime.value = elapsedTime

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
