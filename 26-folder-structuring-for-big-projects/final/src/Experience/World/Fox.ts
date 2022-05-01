import * as THREE from 'three'
import GUI from 'lil-gui'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import Experience from '../Experience'

export default class Fox {
  experienceInstance = new Experience()
  time = this.experienceInstance.time
  scene = this.experienceInstance.scene
  resources = this.experienceInstance.resources
  debug = this.experienceInstance.debug
  resource = this.resources.items.foxModel as GLTF
  model: THREE.Group
  animation: {
    mixer?: THREE.AnimationMixer
    actions?: { [key: string]: THREE.AnimationAction }
    play?: (name: string) => void
  } = {}
  debugFolder: GUI
  constructor() {
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder('Fox')
    }
    this.setModel()
    this.setAnimation()
  }
  setModel() {
    this.model = this.resource.scene
    this.model.scale.set(0.02, 0.02, 0.02)
    this.scene.add(this.model)

    this.model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
      }
    })
  }
  setAnimation() {
    this.animation.mixer = new THREE.AnimationMixer(this.model)
    this.animation.actions = {
      idle: this.animation.mixer.clipAction(this.resource.animations[0]),
      walking: this.animation.mixer.clipAction(this.resource.animations[1]),
      running: this.animation.mixer.clipAction(this.resource.animations[2]),
    }
    this.animation.actions.current = this.animation.actions.idle
    this.animation.actions.current.play()

    this.animation.play = (name: string) => {
      if (this.animation.actions) {
        const newAction = this.animation.actions[name]
        const oldAction = this.animation.actions.current

        newAction.reset()
        newAction.play()
        newAction.crossFadeFrom(oldAction, 1, true)
        this.animation.actions.current = newAction
      }
    }

    if (this.debug.active) {
      const debugObject = {
        playIdle: () => this.animation.play!('idle'),
        playWalking: () => this.animation.play!('walking'),
        playRunning: () => this.animation.play!('running'),
      }

      this.debugFolder.add(debugObject, 'playIdle')
      this.debugFolder.add(debugObject, 'playWalking')
      this.debugFolder.add(debugObject, 'playRunning')
    }
  }
  update() {
    if (this.animation.mixer) this.animation.mixer.update(this.time.delta * 0.001)
  }
}
