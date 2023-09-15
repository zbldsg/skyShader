import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three'

const loader = new GLTFLoader()

const lineMaterial = new THREE.LineBasicMaterial({
  // 线的颜色
  color: "#1948BC",
  transparent: true,
  linewidth: 5,
  opacity: 1.0,
  //depthTest: true,
});
//解决z-flighting
lineMaterial.polygonOffset = true;
lineMaterial.depthTest = true;
lineMaterial.polygonOffsetFactor = 1;
lineMaterial.polygonOffsetUnits = 1.0;

export function generateFloor(data) {
  loader.load(data.path, gltf => {
    gltf.scene.traverse(function (obj) {
      if (obj.type === "Mesh") {
        obj.material = new THREE.MeshBasicMaterial({color:0x00092E});
        // obj.rotateY(-Math.PI/2);
        // data.scene.add(obj);
        //建筑物线框模式
        let edges = new THREE.EdgesGeometry(obj.geometry,1);
        let lineS= new THREE.LineSegments(edges, lineMaterial);
        // lineS.rotateY(Math.PI/5);
        lineS.rotation.x = Math.PI/2;
        lineS.scale.set(.01,.01,.01);
        lineS.position.z = -10
        data.scene.add(lineS);
      }
    })

    gltf.scene.position.z = -10
    data.sceneObject = gltf.scene
    data.scene.add(gltf.scene)
  })

  // let plane = new THREE.BoxGeometry(200,.3,200)
  // let material = new THREE.MeshBasicMaterial({color:'#3333ff',transparent:true,opacity:.3})
  // let mesh = new THREE.Mesh(plane,material)
  // mesh.position.y = -0.3
  // data.scene.add(mesh)
}