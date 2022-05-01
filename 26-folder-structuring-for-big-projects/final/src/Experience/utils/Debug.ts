import GUI from 'lil-gui'

export default class Debug {
  active: boolean
  ui: GUI
  constructor() {
    this.active = window.location.hash === '#debug'
    console.log('this.active: ', this.active)
    if (this.active) {
      this.ui = new GUI()
    }
  }
}
