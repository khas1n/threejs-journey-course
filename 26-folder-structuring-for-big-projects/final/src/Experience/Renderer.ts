import * as THREE from 'three'
import Camera from './Camera'
import Experience from './Experience'
import Sizes from './utils/Sizes'

export default class Renderer {
  instance: THREE.WebGLRenderer
  experienceInstance: Experience = new Experience()
  canvas: HTMLElement = document.querySelector('canvas.webgl') as HTMLElement
  sizes: Sizes = this.experienceInstance.sizes
  scene: THREE.Scene = this.experienceInstance.scene
  camera: Camera = this.experienceInstance.camera
  constructor() {
    this.setInstance()
  }
  setInstance() {
    this.instance = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    })
    this.instance.physicallyCorrectLights = true
    this.instance.outputEncoding = THREE.sRGBEncoding
    this.instance.toneMapping = THREE.CineonToneMapping
    this.instance.toneMappingExposure = 1.75
    this.instance.shadowMap.enabled = true
    this.instance.shadowMap.type = THREE.PCFSoftShadowMap
    this.instance.setClearColor('#211d20')
    this.instance.setSize(this.sizes.width, this.sizes.height)
    this.instance.setPixelRatio(this.sizes.pixelRatio)
  }
  resize() {
    this.instance.setSize(this.sizes.width, this.sizes.height)
    this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2))
  }
  update() {
    this.instance.render(this.scene, this.camera.instance)
  }
}
