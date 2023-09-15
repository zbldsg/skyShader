import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

export function initOrbitControls(labelRenderer, camera) {
  let control = new OrbitControls(camera, labelRenderer.domElement)
  control.rotateSpeed = .5
  control.maxPolarAngle = Math.PI / 2
  return control
}
