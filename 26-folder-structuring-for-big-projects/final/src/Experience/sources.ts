export enum SourceType {
  gltfModel = 'gltfModel',
  cubeTexture = 'cubeTexture',
  texture = 'texture',
}

export enum SourceName {
  environmentMapTexture = 'environmentMapTexture',
  gltf = 'gltf',
  texture = 'texture',
  grassNormalTexture = 'grassNormalTexture',
  grassColorTexture = 'grassColorTexture',
  foxModel = 'foxModel',
}

export interface Source {
  name: SourceName
  type: SourceType
  path: string[] | string
}

const sources: Source[] = [
  {
    name: SourceName.environmentMapTexture,
    type: SourceType.cubeTexture,
    path: [
      '/textures/environmentMap/px.jpg',
      '/textures/environmentMap/nx.jpg',
      '/textures/environmentMap/py.jpg',
      '/textures/environmentMap/ny.jpg',
      '/textures/environmentMap/pz.jpg',
      '/textures/environmentMap/nz.jpg',
    ],
  },
  {
    name: SourceName.grassColorTexture,
    type: SourceType.texture,
    path: '/textures/dirt/color.jpg',
  },
  {
    name: SourceName.grassNormalTexture,
    type: SourceType.texture,
    path: '/textures/dirt/normal.jpg',
  },
  {
    name: SourceName.foxModel,
    type: SourceType.gltfModel,
    path: 'models/Fox/glTF/Fox.gltf',
  },
]

export default sources
