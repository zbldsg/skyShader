export function onWindowResize(camera, renderers, dom) {
  camera.aspect = dom.offsetWidth / dom.offsetHeight;
  camera.updateProjectionMatrix();
  renderers.renderer.setSize(dom.offsetWidth, dom.offsetHeight);
  renderers.labelRenderer.setSize(dom.offsetWidth, dom.offsetHeight);
}
