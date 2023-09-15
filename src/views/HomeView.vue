<script setup>
import { ref, onMounted } from "vue";
import * as THREE from "three";
import { onWindowResize } from "./Common/resize";
import { initAll } from "./Init/init";
// import { gsap } from "gsap";

const renderers = {
  renderer: null,
  labelRenderer: null,
};

const current = {
  scene: null,
  camera: null,
  orbitControls: null,
  data: null,
};

let dom;

// 所有场景List
const baseSceneData = {
  id: null,
  name: null,
  path: "./model/city.glb",
  init: false,
  camera: null,
  control: null,
  scene: null,
  sceneObject: null,
};

let mesh;

//vue3
const menu = ref({
  display: true,
});

onMounted(() => {
  dom = document.querySelector("#shaderTest");
  window.onresize = () => {
    onWindowResize(current.camera, renderers.renderer, dom);
  };

  init();
});

function init() {
  let data = { ...baseSceneData };
  initAll(renderers, data, dom, current);
  initShader();
  animate();
}
function animate() {
  render();
  requestAnimationFrame(() => {
    mesh.material.uniforms.u_time.value += 0.005;
    animate();
  });
}
function render() {
  renderers.renderer.render(current.scene, current.camera);
  renderers.labelRenderer.render(current.scene, current.camera);
}

const vertexShader = `
           varying vec2 vUv;
           void main(){
               vUv = uv;
               gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
           }`;

const fragmentShader = `
            #ifdef GL_ES
            precision mediump float;
            #endif
            uniform float u_time;
            varying vec2 vUv;
            uniform sampler2D noise;

            vec3 lightDir = normalize( vec3(0.5,0.6,0.) );
            const mat2 m2 = mat2( 0.60, -0.80, 0.80, 0.60 );

            vec3 Cloud(vec3 bgCol,vec3 ro,vec3 rd,vec3 cloudCol,float spd) {
                vec3 col = bgCol;
                float t = u_time * 0.15* spd;
                vec2 sc = ro.xz + rd.xz*((3.)*40000.0-ro.y)/rd.y;
                vec2 p = 0.00002*sc;
                float f = 0.0;
                float s = 0.5;
                float sum =0.;
                for(int i=0;i<5;i++){
                  p += t;t *=1.5;
                  f += s*texture2D(noise, p/256.0, 0.0).x; p = m2*p*2.02;
                  sum+= s;s*=0.6;
                }
                float val = f/sum;
                col = mix( col, cloudCol, 0.5*smoothstep(0.5,0.8,val) );
                return col;
            }

            vec3 RayMarchCloud(vec3 ro,vec3 rd){
                vec3 col = vec3(0.0,0.0,0.0);
                float sundot = clamp(dot(rd,lightDir),0.0,1.0);

                 // sky
                col = vec3(0.2,0.5,0.85)*1.1 - rd.y*rd.y*0.5;
                col = mix( col, 0.85*vec3(0.7,0.75,0.85), pow( 1.0-max(rd.y,0.0), 4.0 ) );
                // sun
                col += 0.25*vec3(1.0,0.7,0.4)*pow( sundot,5.0 );
                col += 0.25*vec3(1.0,0.8,0.6)*pow( sundot,64.0 );
                col += 0.4*vec3(1.0,0.8,0.6)*pow( sundot,512.0 );
                // clouds
                col = Cloud(col,ro,rd,vec3(1.0,0.95,1.0),1.);
                        // .
                col = mix( col, 0.68*vec3(0.4,0.65,1.0), pow( 1.0-max(rd.y,0.0), 16.0 ) );
                return col;
            }



            vec3 InitCam(vec2 ppp){
                vec2 mo = ppp;
                mo.x *= 3.14159;

                mo.x += smoothstep(0.6,1.,0.5+0.5)-1.5;
                vec3 eyedir = normalize(vec3(cos(mo.x),mo.y*2.-0.2+sin(1.57)*0.1,sin(mo.x)));
                vec3 rightdir = normalize(vec3(cos(mo.x+1.5708),0.,sin(mo.x+1.5708)));
                vec3 updir = normalize(cross(rightdir,eyedir));
                vec3 rd=normalize((ppp.x*rightdir+ppp.y*updir)*1.+eyedir);
                return rd;
            }

            void main() {
                vec3 col  = vec3 (0.,0.,0.);
                vec3 ro = vec3 (0.,0.,0.);

                vec2 uv = (vUv - 0.5) * 2.0;

                vec3 rd = InitCam(uv);
                col = RayMarchCloud( ro, rd);

                gl_FragColor = vec4(col,1.0);
            }`;

function initShader() {
  const loader = new THREE.TextureLoader();
  let texture = loader.load("./textures/noise.png");
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);

  let material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      u_time: { type: "f", value: 0 },
      noise: {
        type: "t",
        value: texture,
      },
    },
    depthTest: true,
    side: THREE.BackSide,
  });

  mesh = new THREE.Mesh(new THREE.SphereGeometry(200, 32, 32), material);

  current.scene.add(mesh);
}
</script>

<template>
  <div class="shader-test" id="shaderTest"></div>
</template>

<style lang="less">
.shader-test {
  width: 100vw;
  height: 100vh;
  background: rgba(66, 58, 184, 0.6);
  overflow: hidden;
  background-color: #070a2b;
  background-image: url("../assets/background.png");
  background-repeat: no-repeat;
  background-size: 100%;

  * {
    margin: 0;
    padding: 0;
  }

  canvas {
    display: block;
  }
}
</style>
