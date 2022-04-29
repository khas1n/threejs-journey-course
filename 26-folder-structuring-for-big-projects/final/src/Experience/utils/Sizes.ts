import { EventEmitter } from './EventEmitter'

export default class Sizes extends EventEmitter {
  width: number = window.innerWidth
  height: number = window.innerHeight
  pixelRatio = Math.min(window.devicePixelRatio, 2)
  constructor() {
    super()
    window.addEventListener('resize', () => {
      this.width = window.innerWidth
      this.height = window.innerHeight
      this.pixelRatio = Math.min(window.devicePixelRatio, 2)
      this.trigger('resize')
    })
  }
}
