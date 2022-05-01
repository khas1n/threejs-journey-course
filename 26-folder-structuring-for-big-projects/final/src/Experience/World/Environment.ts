import GUI from 'lil-gui'
import * as THREE from 'three'

import Experience from '../Experience'

interface EnvironmentMap {
  intensity: number
  texture: THREE.CubeTexture
  updateMaterials?: () => void
}

export default class Environment {
  experienceInstance: Experience = new Experience()
  scene: THREE.Scene = this.experienceInstance.scene
  resources = this.experienceInstance.resources
  debug = this.experienceInstance.debug
  sunLight: THREE.DirectionalLight
  environmentMap: EnvironmentMap
  debugFolder: GUI
  constructor() {
    // Debug
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder('Environment')
    }
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
    // Debug
    if (this.debug.active) {
      this.debugFolder.add(this.sunLight, 'intensity').name('sunLightIntensity').min(0).max(10).step(0.001)
      this.debugFolder.add(this.sunLight.position, 'x').name('sunLightX').min(-5).max(5).step(0.001)
      this.debugFolder.add(this.sunLight.position, 'y').name('sunLightY').min(-5).max(5).step(0.001)
      this.debugFolder.add(this.sunLight.position, 'z').name('sunLightZ').min(-5).max(5).step(0.001)
    }
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

      this.environmentMap.updateMaterials = () => {
        this.scene.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            child.material.envMap = this.environmentMap.texture
            child.material.envMapIntensity = this.environmentMap.intensity
            child.material.needsUpdate = true
          }
        })
      }
      this.environmentMap.updateMaterials()

      // Debug
      if (this.debug.active) {
        this.debugFolder
          .add(this.environmentMap, 'intensity')
          .name('envMapIntensity')
          .min(0)
          .max(4)
          .step(0.001)
          .onChange(this.environmentMap.updateMaterials)
      }
    }
  }
}
