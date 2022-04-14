import './style.scss'
import * as THREE from 'three'
import gsap from 'gsap'

// Canvas
const canvas = document.querySelector('canvas.webgl')!

// Scene
const scene = new THREE.Scene()

// Object
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

// Sizes
const sizes = {
  width: 800,
  height: 600,
}

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.z = 3
scene.add(camera)

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
})
renderer.setSize(sizes.width, sizes.height)

// Native javascript animation
// let time = Date.now()

// const tick = () => {
//   const currentTime = Date.now()
//   const deltaTime = currentTime - time
//   time = currentTime

//   mesh.rotation.y += 0.001 * deltaTime
//   renderer.render(scene, camera)
//   window.requestAnimationFrame(tick)
// }

// const clock = new THREE.Clock()

gsap.to(mesh.position, { x: 2, duration: 2, delay: 1, repeat: -1, yoyo: true, ease: 'sine' })

const tick = () => {
  // Clock

  // const elapsedTime = clock.getElapsedTime()

  // Full rotation in 1 second
  // mesh.rotation.y = elapsedTime * (Math.PI * 2)

  // can use Math.cos() and Math.sin()
  // mesh.position.x = Math.sin(elapsedTime)
  // mesh.position.y = Math.cos(elapsedTime)

  // Update Camera Position
  // camera.position.x = Math.sin(elapsedTime)
  // camera.position.y = Math.cos(elapsedTime)
  // camera.lookAt(scene.position)

  renderer.render(scene, camera)
  window.requestAnimationFrame(tick)
}

tick()
