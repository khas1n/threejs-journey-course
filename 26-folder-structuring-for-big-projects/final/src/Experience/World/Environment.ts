import * as THREE from 'three'

import Experience from '../Experience'

interface EnvironmentMap {
  intensity: number
  texture: THREE.CubeTexture
  updateMaterial?: () => void
}

export default class Environment {
  experienceInstance: Experience = new Experience()
  scene: THREE.Scene = this.experienceInstance.scene
  resources = this.experienceInstance.resources
  sunLight: THREE.DirectionalLight
  environmentMap: EnvironmentMap
  constructor() {
    this.setSunLight()
    this.setEnvironmentMap()
  }
  setSunLight() {
    this.sunLight = new THREE.DirectionalLight('#ffffff', 4)
    this.sunLight.castShadow = true
    this.sunLight.shadow.camera.far = 15
    this.sunLight.shadow.mapSize.set(1024, 1024)
    this.sunLight.shadow.normalBias = 0.05
    this.sunLight.position.set(3.5, 2, -1.25)
    this.scene.add(this.sunLight)
  }
  setEnvironmentMap() {
    if (this.resources.items.environmentMapTexture) {
      this.environmentMap = {
        intensity: 0.4,
        texture: this.resources.items.environmentMapTexture as THREE.CubeTexture,
      }
      this.environmentMap.texture.encoding = THREE.sRGBEncoding
      console.log(' this.environmentMap: ', this.environmentMap)
      this.scene.environment = this.environmentMap.texture

      this.environmentMap.updateMaterial = () => {
        this.scene.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            child.material.envMap = this.environmentMap.texture
            child.material.envMapIntensity = this.environmentMap.intensity
            child.material.needsUpdate = true
          }
        })
      }
      this.environmentMap.updateMaterial()
    }
  }
}
