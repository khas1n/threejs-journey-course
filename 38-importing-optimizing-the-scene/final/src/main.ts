import './style.scss'
import * as dat from 'lil-gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import {
  BoxGeometry,
  Clock,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  sRGBEncoding,
  TextureLoader,
  WebGLRenderer,
} from 'three'

/**
 * Base
 */
// Debug
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
const portalLightMaterial = new MeshBasicMaterial({ color: 0x6037ff, side: DoubleSide })

/**
 * Model
 */
gltfLoader.load('/portal.glb', (gltf) => {
  // Get each object
  const bakedMesh = gltf.scene.children.find((child) => child.name === 'Cube060') as Mesh
  console.log('gltf.scene.children: ', gltf.scene.children)
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

/**
 * Animate
 */
const clock = new Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
