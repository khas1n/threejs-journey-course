import * as THREE from 'three'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import Experience from '../Experience'

export default class Fox {
  experienceInstance = new Experience()
  time = this.experienceInstance.time
  scene = this.experienceInstance.scene
  resources = this.experienceInstance.resources
  resource = this.resources.items.foxModel as GLTF
  model: THREE.Group
  animation: {
    mixer?: THREE.AnimationMixer
    action?: THREE.AnimationAction
  } = {}
  constructor() {
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
    this.animation.action = this.animation.mixer.clipAction(this.resource.animations[0])
    this.animation.action.play()
  }
  update() {
    if (this.animation.mixer) this.animation.mixer.update(this.time.delta * 0.001)
  }
}
