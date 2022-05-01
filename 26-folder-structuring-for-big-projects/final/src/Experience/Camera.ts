import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import Experience from './Experience'
import Sizes from './utils/Sizes'

export default class Camera {
  instance: THREE.PerspectiveCamera
  controls: OrbitControls
  experienceInstance: Experience = new Experience()
  sizes: Sizes = this.experienceInstance.sizes
  scene: THREE.Scene = this.experienceInstance.scene
  canvas: HTMLElement | undefined = this.experienceInstance.canvas
  constructor() {
    this.setInstance()
    this.setControls()
  }
  setInstance() {
    this.instance = new THREE.PerspectiveCamera(35, this.sizes.width / this.sizes.height, 0.1, 100)
    this.instance.position.set(6, 4, 8)
    this.scene.add(this.instance)
  }
  setControls() {
    this.controls = new OrbitControls(this.instance, this.canvas)
    this.controls.enableDamping = true
  }
  resize() {
    console.log('RESIZE FROM CAMERA')
    this.instance.aspect = this.sizes.width / this.sizes.height
    this.instance.updateProjectionMatrix()
  }
  update() {
    this.controls.update()
  }
}
