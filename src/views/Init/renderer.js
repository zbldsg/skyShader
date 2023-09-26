import * as THREE from "three";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer";

export function createRenderer(dom) {
  let h = dom.offsetHeight;
  let w = dom.offsetWidth;

  // let renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, logarithmicDepthBuffer: true }) // 实例化渲染器  打开抗锯齿
  let renderer = new THREE.WebGL1Renderer({
    antialias: true,
    alpha: true,
    logarithmicDepthBuffer: true,
  }); // 实例化渲染器  打开抗锯齿
  renderer.setClearAlpha(0.01); // 打开渲染器透明
  renderer.setSize(w, h); // 设置宽和高
  renderer.setPixelRatio(window.devicePixelRatio);
  // renderer.sortObjects = true;
  // renderer.shadowMap.enabled = true; // open the shadow
  // renderer.setClearColor(0x0a1639);
  // renderer.autoClear = false;
  //   renderer.toneMapping = THREE.ACESFilmicToneMapping;
  // renderer.toneMapping = THREE.ReinhardToneMapping
  dom.appendChild(renderer.domElement); // 添加到dom
  return renderer;
}

export function createLabelRenderer(dom) {
  let h = dom.offsetHeight;
  let w = dom.offsetWidth;
  let labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(w, h); // 设置宽和高
  labelRenderer.domElement.style.position = "absolute";
  labelRenderer.domElement.style.top = 0;
  dom.appendChild(labelRenderer.domElement);
  return labelRenderer;
}
