import './style.scss'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

/**
 * Loaders
 */
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')

const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

const cubeTextureLoader = new THREE.CubeTextureLoader()

/**
 * Base
 */
// Debug
const gui = new dat.GUI()
const debugObject: { [key: string]: any } = {}

// Canvas
const canvas = document.querySelector('canvas.webgl') as HTMLElement

// Scene
const scene = new THREE.Scene()

/**
 * Update All Materials
 */
const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
      // child.material.envMap = environmentMap
      child.material.envMapIntensity = debugObject.envMapIntensity
      child.material.needsUpdate = true
      child.castShadow = true
      child.receiveShadow = true
    }
  })
}

/**
 * Environtment Map
 */
const mapIndex = 0
const environmentMap = cubeTextureLoader.load([
  `/textures/environmentMaps/${mapIndex}/px.jpg`,
  `/textures/environmentMaps/${mapIndex}/nx.jpg`,
  `/textures/environmentMaps/${mapIndex}/py.jpg`,
  `/textures/environmentMaps/${mapIndex}/ny.jpg`,
  `/textures/environmentMaps/${mapIndex}/pz.jpg`,
  `/textures/environmentMaps/${mapIndex}/nz.jpg`,
])
environmentMap.encoding = THREE.sRGBEncoding
scene.background = environmentMap
scene.environment = environmentMap
debugObject.envMapIntensity = 2.5
gui.add(debugObject, 'envMapIntensity').min(0).max(10).step(0.001).onChange(updateAllMaterials)

/**
 * Models
 */
gltfLoader.load(
  '/models/FlightHelmet/glTF/FlightHelmet.gltf', // FlightHelmet glTF
  (gltf) => {
    gltf.scene.scale.set(10, 10, 10)
    gltf.scene.position.set(0, -4, -2)
    gltf.scene.rotation.y = Math.PI * 0.5
    scene.add(gltf.scene)

    gui.add(gltf.scene.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.001).name('ModelRotationY')
    updateAllMaterials()
  }
)

gltfLoader.load('/models/hamburger-2.glb', (gltf) => {
  gltf.scene.scale.set(0.3, 0.3, 0.3)
  gltf.scene.position.set(0, -3, 2)
  scene.add(gltf.scene)

  updateAllMaterials()
})
gltfLoader.load('/models/hamburger.glb', (gltf) => {
  gltf.scene.scale.set(0.3, 0.3, 0.3)
  gltf.scene.position.set(0, -1, 2)
  scene.add(gltf.scene)

  updateAllMaterials()
})

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
directionalLight.position.set(0.25, 3, -2.25)
directionalLight.castShadow = true
directionalLight.shadow.camera.far = 15
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.normalBias = 0.05
scene.add(directionalLight)

// const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
// scene.add(directionalLightCameraHelper)

gui.add(directionalLight, 'intensity').min(0).max(10).step(0.001).name('LigthIntensity')
gui.add(directionalLight.position, 'x').min(-5).max(5).step(0.001).name('LigthX')
gui.add(directionalLight.position, 'y').min(-5).max(5).step(0.001).name('LigthY')
gui.add(directionalLight.position, 'z').min(-5).max(5).step(0.001).name('LigthZ')

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
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(7, 1, -4)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ReinhardToneMapping
renderer.toneMappingExposure = 3
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

gui
  .add(renderer, 'toneMapping', {
    No: THREE.NoToneMapping,
    Linear: THREE.LinearToneMapping,
    Reinhard: THREE.ReinhardToneMapping,
    Cineon: THREE.CineonToneMapping,
    ACESFilmic: THREE.ACESFilmicToneMapping,
  })
  .onFinishChange(() => {
    renderer.toneMapping = +renderer.toneMapping
    updateAllMaterials()
  })
gui.add(renderer, 'toneMappingExposure').min(0).max(10).step(0.001)

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
