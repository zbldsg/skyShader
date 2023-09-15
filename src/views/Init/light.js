import * as THREE from 'three'

export function createLight (scene) {
  let ambientLight = new THREE.AmbientLight(0xFFFFFF,.4)
  scene.add(ambientLight)

  // let sceneLight = new THREE.DirectionalLight(0xffffff,0.5);
  // sceneLight.position.set(0,0,1);
  // scene.add(sceneLight);


  // 60, 17 ,4.5
  // let spotLight = new THREE.SpotLight(0xffffff, .5);
  // spotLight.castShadow = true;
  // spotLight.shadow.camera.visible = true;
  // spotLight.position.set(50,100,0);
  // spotLight.shadow.mapSize.width = spotLight.shadow.mapSize.height = 1024 * 4;
  // scene.add(spotLight);

  // 左下
  // let light2 = new THREE.DirectionalLight(0xFFFFFF, .8)
  // light2.position.set(-30, 5, -10)
  // // light2.lookAt(new THREE.Vector3(0, 0, 0))
  // scene.add(light2)

  // // 右上
  // let light3 = new THREE.DirectionalLight(0xFFFFFF, .8)
  // light3.position.set(30, 80, 10)
  // // light3.lookAt(new THREE.Vector3(0, 0, 0))
  // scene.add(light3)

  let light3 = new THREE.DirectionalLight(0xD1D1CE, 0.8)
  light3.position.set(10, 20, 10)
  scene.add(light3)

  // 右上
  let light4 = new THREE.DirectionalLight(0xD1D1CE, 0.8)
  light4.position.set(-10, 20, 10)
  scene.add(light4)

}
