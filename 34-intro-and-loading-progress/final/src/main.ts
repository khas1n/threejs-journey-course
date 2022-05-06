import './style.scss'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import {
  CubeTextureLoader,
  Scene,
  Mesh,
  MeshStandardMaterial,
  sRGBEncoding,
  DirectionalLight,
  PerspectiveCamera,
  WebGLRenderer,
  ReinhardToneMapping,
  PCFSoftShadowMap,
  PlaneGeometry,
  ShaderMaterial,
  LoadingManager,
} from 'three'
import { gsap } from 'gsap'

/**
 * Loaders
 */
// gsap.set('.loading-bar', { scaleX: 0 })
const loadingElement = document.querySelector('.loading-bar') as HTMLElement
const loadingManager = new LoadingManager(
  () => {
    gsap.delayedCall(3, () => {
      gsap
        .timeline()
        .set('.loading-bar', { transition: 'none' })
        .to('.loading-bar', { duration: 2, scaleX: 0, transformOrigin: 'top right', ease: 'power4.out' })
        .to('.loading-bar', { opacity: 0, duration: 1 })
        .to(overlayMaterial.uniforms.uAlpha, { duration: 2, value: 0 }, '-=1')
    })
  },
  (_itemsUrl, itemsLoaded, itemsTotal) => {
    // loadingElement.style.transform = `scaleX(${itemsLoaded / itemsTotal})`
    gsap.set('.loading-bar', { scaleX: itemsLoaded / itemsTotal, delay: 0.5 })
  }
)
loadingManager.onStart = () => {
  console.log('START')
  // gsap.set('.loading-bar', { scaleX: 0 })
  gsap.to('.loading-bar', { opacity: 1, duration: 1, autoAlpha: 1 })
}
const gltfLoader = new GLTFLoader(loadingManager)
const cubeTextureLoader = new CubeTextureLoader(loadingManager)

/**
 * Base
 */
// Debug
const debugObject: { [key: string]: any } = {}

// Canvas
const canvas = document.querySelector('canvas.webgl') as HTMLElement

// Scene
const scene = new Scene()

// Overlay
const overlayGeometry = new PlaneGeometry(2, 2, 1, 1)
const overlayMaterial = new ShaderMaterial({
  transparent: true,
  uniforms: {
    uAlpha: { value: 1 },
  },
  vertexShader: `
    void main() {
      gl_Position = vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uAlpha;
    void main() { 
      gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
    }
  `,
})
const overlay = new Mesh(overlayGeometry, overlayMaterial)
scene.add(overlay)

/**
 * Update all materials
 */
const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (child instanceof Mesh && child.material instanceof MeshStandardMaterial) {
      // child.material.envMap = environmentMap
      child.material.envMapIntensity = debugObject.envMapIntensity
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

debugObject.envMapIntensity = 2.5

/**
 * Models
 */
gltfLoader.load('/models/FlightHelmet/glTF/FlightHelmet.gltf', (gltf) => {
  gltf.scene.scale.set(10, 10, 10)
  gltf.scene.position.set(0, -4, 0)
  gltf.scene.rotation.y = Math.PI * 0.5
  scene.add(gltf.scene)

  updateAllMaterials()
})

/**
 * Lights
 */
const directionalLight = new DirectionalLight('#ffffff', 3)
directionalLight.castShadow = true
directionalLight.shadow.camera.far = 15
directionalLight.shadow.mapSize.set(1024, 1024)
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
renderer.physicallyCorrectLights = true
renderer.outputEncoding = sRGBEncoding
renderer.toneMapping = ReinhardToneMapping
renderer.toneMappingExposure = 3
renderer.shadowMap.enabled = true
renderer.shadowMap.type = PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const tick = () => {
  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
