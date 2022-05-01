import * as THREE from 'three'
import Experience from '../Experience'

export default class Floor {
  experienceInstance = new Experience()
  scene = this.experienceInstance.scene
  resources = this.experienceInstance.resources
  geometry: THREE.CircleGeometry
  textures: { [key: string]: THREE.Texture } = {}
  material: THREE.MeshStandardMaterial
  mesh: THREE.Mesh
  constructor() {
    this.setGeometry()
    this.setTextures()
    this.setMaterial()
    this.setMesh()
  }
  setGeometry() {
    this.geometry = new THREE.CircleGeometry(5, 64)
  }
  setTextures() {
    this.textures.color = this.resources.items.grassColorTexture as THREE.Texture
    this.textures.color.encoding = THREE.sRGBEncoding
    this.textures.color.repeat.set(1.5, 1.5)
    this.textures.color.wrapS = THREE.RepeatWrapping
    this.textures.color.wrapT = THREE.RepeatWrapping

    this.textures.normal = this.resources.items.grassNormalTexture as THREE.Texture
    this.textures.normal.repeat.set(1.5, 1.5)
    this.textures.normal.wrapS = THREE.RepeatWrapping
    this.textures.normal.wrapT = THREE.RepeatWrapping
  }
  setMaterial() {
    this.material = new THREE.MeshStandardMaterial({
      map: this.textures.color,
      normalMap: this.textures.normal,
    })
  }
  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.mesh.rotation.x = -Math.PI * 0.5
    this.mesh.receiveShadow = true
    this.scene.add(this.mesh)
  }
}
