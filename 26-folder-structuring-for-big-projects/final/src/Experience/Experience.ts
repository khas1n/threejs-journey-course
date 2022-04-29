import * as THREE from 'three'
import Camera from './Camera'

import Sizes from './utils/Sizes'
import Time from './utils/Time'

let instance: Experience | null = null

export default class Experience {
  public sizes: Sizes
  public time: Time
  public scene: THREE.Scene
  public camera: Camera
  constructor(public canvas?: HTMLElement) {
    // Singleton
    if (instance) {
      return instance
    }
    instance = this

    // setup
    this.sizes = new Sizes()
    this.time = new Time()
    this.scene = new THREE.Scene()
    this.camera = new Camera()
    // global access
    window.experience = this

    // Sizes resize event
    this.sizes.on('resize', () => {
      this.resize()
    })

    // Time tick event
    this.time.on('tick', () => {})
  }
  resize() {
    this.camera.resize()
  }
  update() {
    this.camera.update()
  }
}
