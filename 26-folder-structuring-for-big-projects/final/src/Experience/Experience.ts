import * as THREE from 'three'
import Camera from './Camera'
import Renderer from './Renderer'
import World from './World'

import Sizes from './utils/Sizes'
import Time from './utils/Time'
import Resources from './utils/Resources'
import sources from './sources'

let instance: Experience | null = null
export default class Experience {
  public sizes: Sizes
  public time: Time
  public scene: THREE.Scene
  public camera: Camera
  public renderer: Renderer
  public world: World
  public resources: Resources
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
    this.resources = new Resources(sources)
    this.camera = new Camera()
    this.renderer = new Renderer()
    this.world = new World()

    // global access
    window.experience = this

    // Sizes resize event
    this.sizes.on('resize', () => {
      this.resize()
    })

    // Time tick event
    this.time.on('tick', () => {
      this.update()
    })
  }
  resize() {
    this.camera.resize()
    this.renderer.resize()
  }
  update() {
    this.camera.update()
    this.renderer.update()
    this.world.update()
  }
}
