import Experience from '../Experience'
import Environment from './Environment'
import Floor from './Floor'
import Fox from './Fox'

export default class World {
  experienceInstance = new Experience()
  scene = this.experienceInstance.scene
  resources = this.experienceInstance.resources
  environtment: Environment
  floor: Floor
  fox: Fox
  constructor() {
    this.resources.on('ready', () => {
      // Setup
      this.fox = new Fox()
      this.floor = new Floor()
      this.environtment = new Environment()
    })
  }
  update() {
    if (this.fox) {
      this.fox.update()
    }
  }
}
