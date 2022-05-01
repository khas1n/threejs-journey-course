import * as THREE from 'three'
import Camera from './Camera'
import Renderer from './Renderer'
import World from './World'

import Sizes from './utils/Sizes'
import Time from './utils/Time'
import Resources from './utils/Resources'
import sources from './sources'
import Debug from './utils/Debug'

let instance: Experience | null = null
export default class Experience {
  public debug: Debug
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
    this.debug = new Debug()
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
  destroy() {
    this.sizes.off('resize')
    this.time.off('tick')

    // Traverse the whole scene
    this.scene.traverse((child) => {
      // Test if it's a mesh
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()

        // Loop through the material properties
        for (const key in child.material) {
          const value = child.material[key]

          // Test if there is a dispose function
          if (value && typeof value.dispose === 'function') {
            value.dispose()
          }
        }
      }
    })
    this.camera.controls.dispose()
    this.renderer.instance.dispose()
  }
}
