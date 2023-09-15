export function onWindowResize(camera, renderer, dom) {
  camera.aspect = dom.offsetWidth / dom.offsetHeight
  camera.updateProjectionMatrix()
  renderer.setSize(dom.offsetWidth, dom.offsetHeight)
}
