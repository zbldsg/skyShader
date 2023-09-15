import * as THREE from 'three'

export function createCamera (x, y, z) {
  let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 5000) // 实例化相机
  camera.position.set(x, y, z)
  camera.layers.enable(1)
  return camera

  // let camera = new THREE.PerspectiveCamera(80,window.innerWidth/window.innerHeight,1,5000);
  // camera.position.z = -750;
  // return camera
}
