import * as THREE from 'three'

import { Source, SourceName, SourceType } from '../sources'
import { EventEmitter } from './EventEmitter'
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

interface Loaders {
  gltfLoader: GLTFLoader
  textureLoader: THREE.TextureLoader
  cubeTextureLoader: THREE.CubeTextureLoader
}

type File = GLTF | THREE.Texture | THREE.CubeTexture

export default class Resources extends EventEmitter {
  items: { [key: string]: File } = {}
  loaders: Loaders
  toLoad: number
  loaded: number = 0
  constructor(private sources: Source[]) {
    super()

    // setup
    this.toLoad = this.sources.length

    this.setLoaders()
    this.startLoading()
  }

  setLoaders() {
    this.loaders = {
      gltfLoader: new GLTFLoader(),
      textureLoader: new THREE.TextureLoader(),
      cubeTextureLoader: new THREE.CubeTextureLoader(),
    }
  }

  startLoading() {
    for (const source of this.sources) {
      if (source.type === SourceType.gltfModel) {
        this.loaders.gltfLoader.load(source.path as string, (file) => {
          this.onSourceLoaded(source, file)
        })
      } else if (source.type === SourceType.texture) {
        this.loaders.textureLoader.load(source.path as string, (file) => {
          this.onSourceLoaded(source, file)
        })
      } else if (source.type === SourceType.cubeTexture) {
        this.loaders.cubeTextureLoader.load(source.path as string[], (file) => {
          this.onSourceLoaded(source, file)
        })
      }
    }
  }

  onSourceLoaded(source: Source, file: File) {
    this.items[source.name] = file
    this.loaded++
    if (this.loaded === this.toLoad) {
      this.trigger('ready')
    }
  }
}
