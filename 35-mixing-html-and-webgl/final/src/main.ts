import './style.scss'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader'
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js'
import { gsap } from 'gsap'
import {
  LoadingManager,
  CubeTextureLoader,
  Scene,
  PlaneGeometry,
  ShaderMaterial,
  Mesh,
  MeshStandardMaterial,
  sRGBEncoding,
  DirectionalLight,
  PerspectiveCamera,
  WebGLRenderer,
  ReinhardToneMapping,
  PCFSoftShadowMap,
  Vector3,
  Raycaster,
  WebGLRenderTarget,
} from 'three'

/**
 * Loaders
 */
let sceneReady = false
const loadingElement = document.querySelector('.loading-bar') as HTMLElement
const loadingManager = new LoadingManager(
  () => {
    gsap.delayedCall(1, () => {
      gsap
        .timeline()
        .set('.loading-bar', { transition: 'none' })
        .to('.loading-bar', { duration: 2, scaleX: 0, transformOrigin: 'top right', ease: 'power4.out' })
        .to('.loading-bar', {
          opacity: 0,
          duration: 1,
          onComplete: () => {
            sceneReady = true
            gsap.set('.point', { visibility: 'visible' })
          },
        })
        .to(
          overlayMaterial.uniforms.uAlpha,
          {
            duration: 2,
            value: 0,
          },
          '-=1'
        )
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

/**
 * Overlay
 */
const overlayGeometry = new PlaneGeometry(2, 2, 1, 1)
const overlayMaterial = new ShaderMaterial({
  // wireframe: true,
  transparent: true,
  uniforms: {
    uAlpha: { value: 1 },
  },
  vertexShader: `
        void main()
        {
            gl_Position = vec4(position, 1.0);
        }
    `,
  fragmentShader: `
        uniform float uAlpha;

        void main()
        {
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
const envCount = 3
const environmentMap = cubeTextureLoader.load([
  `/textures/environmentMaps/${envCount}/px.jpg`,
  `/textures/environmentMaps/${envCount}/nx.jpg`,
  `/textures/environmentMaps/${envCount}/py.jpg`,
  `/textures/environmentMaps/${envCount}/ny.jpg`,
  `/textures/environmentMaps/${envCount}/pz.jpg`,
  `/textures/environmentMaps/${envCount}/nz.jpg`,
])

environmentMap.encoding = sRGBEncoding

scene.background = environmentMap
scene.environment = environmentMap

debugObject.envMapIntensity = 2.5

/**
 * Models
 */
gltfLoader.load('/models/DamagedHelmet/glTF/DamagedHelmet.gltf', (gltf) => {
  gltf.scene.scale.set(2.5, 2.5, 2.5)
  gltf.scene.rotation.y = Math.PI * 0.5
  scene.add(gltf.scene)

  updateAllMaterials()
})

/**
 * Point of interest
 */
const raycaster = new Raycaster()
const points = [
  {
    position: new Vector3(1.55, 0.3, -0.6),
    element: document.querySelector('.point-0'),
  },
  {
    position: new Vector3(0.5, 0.8, -1.6),
    element: document.querySelector('.point-1'),
  },
  {
    position: new Vector3(1.6, -1.3, -0.7),
    element: document.querySelector('.point-2'),
  },
  {
    position: new Vector3(-1.2, 0.6, 2.3),
    element: document.querySelector('.point-3'),
  },
]

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
renderer.physicallyCorrectLights = true
renderer.outputEncoding = sRGBEncoding
renderer.toneMapping = ReinhardToneMapping
renderer.toneMappingExposure = 3
renderer.shadowMap.enabled = true
renderer.shadowMap.type = PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const webglRenderTargetOption: any = {
  samples: renderer.getPixelRatio() === 1 ? 2 : 0,
}
const renderTarget = new WebGLRenderTarget(sizes.width, sizes.height, webglRenderTargetOption)

const effectComposer = new EffectComposer(renderer, renderTarget)

const renderPass = new RenderPass(scene, camera) // Render scene into texture
effectComposer.addPass(renderPass)

const rgbShiftPass = new ShaderPass(RGBShiftShader)
rgbShiftPass.enabled = false
effectComposer.addPass(rgbShiftPass)

const bokehPass = new BokehPass(scene, camera, {
  focus: 1.0,
  aperture: 0.025,
  maxblur: 0.01,

  width: sizes.width,
  height: sizes.height,
})
bokehPass.enabled = true
effectComposer.addPass(bokehPass)

const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader)
gammaCorrectionPass.enabled = true
effectComposer.addPass(gammaCorrectionPass)

/**
 * Animate
 */
const tick = () => {
  // Update controls
  controls.update()
  if (sceneReady) {
    for (const point of points) {
      const element = point.element as HTMLElement
      const screenPosition = point.position.clone()
      screenPosition.project(camera)

      raycaster.setFromCamera(screenPosition, camera)
      const intersects = raycaster.intersectObjects(scene.children, true)

      if (intersects.length === 0) {
        element.classList.add('visible')
      } else {
        const intersectionDistance = intersects[0].distance
        const pointDistance = point.position.distanceTo(camera.position)

        if (intersectionDistance < pointDistance) {
          element.classList.remove('visible')
        } else {
          element.classList.add('visible')
        }
      }

      const translateX = screenPosition.x * sizes.width * 0.5
      const translateY = -screenPosition.y * sizes.height * 0.5
      element.style.transform = `translate(${translateX}px, ${translateY}px) `
    }
  }

  // Render
  // renderer.render(scene, camera)
  effectComposer.render()

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
