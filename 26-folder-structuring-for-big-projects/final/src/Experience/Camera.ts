import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import Experience from './Experience'
import Sizes from './utils/Sizes'

export default class Camera {
  instance: THREE.PerspectiveCamera
  controls: OrbitControls
  experience: Experience = new Experience()
  sizes: Sizes = this.experience.sizes
  scene: THREE.Scene = this.experience.scene
  canvas: HTMLElement | undefined = this.experience.canvas
  constructor() {
    this.setInstance()
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
