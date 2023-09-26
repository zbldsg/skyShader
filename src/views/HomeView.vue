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

let mesh, cube, cubeCamera, cubeRenderTarget, hexagon2;
const clock = new THREE.Clock();

//vue3
const menu = ref({
  display: true,
});

onMounted(() => {
  dom = document.querySelector("#shaderTest");
  window.onresize = () => {
    onWindowResize(current.camera, renderers, dom);
  };

  init();
});

function init() {
  let data = { ...baseSceneData };
  initAll(renderers, data, dom, current);
  initShader();
  initReflact();
  // initUnity();
  animate();
}
function animate() {
  render();

  requestAnimationFrame((time) => {
    cube.rotation.x += 0.02;
    cube.rotation.y += 0.03;

    mesh.material.uniforms.u_time.value += 0.03;
    animate();
  });
}
function render() {
  cubeCamera.update(renderers.renderer, current.scene);

  renderers.renderer.render(current.scene, current.camera);
  renderers.labelRenderer.render(current.scene, current.camera);
}

function initShader() {
  const vertexShader = `
          varying vec3 fragPosition;
          void main(){
               fragPosition = position;
               gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`;
  const fragmentShader = `
            uniform float u_time;
            varying vec3 fragPosition;
            uniform sampler2D noise;

            vec3 lightDir = normalize( vec3(0.5,0.6,0.) );
            const mat2 m2 = mat2( 0.60, -0.80, 0.80, 0.60 );

            #define PI 3.14159265359

            vec3 uvToRayDir( vec2 uv ) {
              float fRayPhi = PI * ( 3.0 / 2.0 - 2.0 * uv.x );
              //这里uv.y需要 + 1, 来反转云彩, 要不然云彩在下面
              float fRayTheta = PI * ( uv.y + 1.);
              return vec3(
                  sin( fRayTheta ) * cos( fRayPhi ),
                  -cos( fRayTheta ),
                  sin( fRayTheta ) * sin( fRayPhi )
              );
            }


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
                col += 0.45*vec3(1.0,0.7,0.4)*pow( sundot,5.0 );
                col += 0.45*vec3(1.0,0.8,0.6)*pow( sundot,64.0 );
                col += 0.6*vec3(1.0,0.8,0.6)*pow( sundot,512.0 );
                // clouds
                col = Cloud(col,ro,rd,vec3(1.0,0.95,1.0),1.);
                // .
                col = mix( col, 0.68*vec3(0.4,0.65,1.0), pow( 1.0-max(rd.y,0.0), 16.0 ) );
                return col;
            }


            void main() {
                vec3 col  = vec3 (0.,0.,0.);
                vec3 ro = vec3 (0.,0.,0.);

                float longitude = atan(fragPosition.z, fragPosition.x);
                float latitude = acos(fragPosition.y / length(fragPosition));

                // 映射到纹理坐标
                vec2 texCoord;
                texCoord.x = longitude / (2.0 * PI); // 经度映射到 U 轴
                texCoord.y = latitude / PI;          // 纬度映射到 V 轴

                vec3 rd = uvToRayDir(texCoord);
                col = RayMarchCloud( ro, rd);
                gl_FragColor = vec4(col,1.0);
            }`;
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

  mesh = new THREE.Mesh(new THREE.SphereGeometry(4000, 128, 128), material);
  // mesh.rotation.x = Math.PI;
  current.scene.add(mesh);
}

function initReflact() {
  cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256);
  cubeRenderTarget.texture.type = THREE.HalfFloatType;

  cubeCamera = new THREE.CubeCamera(1, 4000, cubeRenderTarget);
  current.scene.add(cubeCamera);

  let material1 = new THREE.MeshStandardMaterial({
    envMap: cubeRenderTarget.texture,
    roughness: 0.05,
    metalness: 1,
  });

  let sphere = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 64), material1);
  current.scene.add(sphere);

  const material2 = new THREE.MeshStandardMaterial({
    roughness: 0.1,
    metalness: 0,
    color: new THREE.Color(0, 100, 0),
  });
  cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material2);
  cube.position.x = 4;
  current.scene.add(cube);

  renderers.renderer.outputColorSpace = THREE.sRGBColorSpace;
  // renderers.renderer.toneMapping = THREE.ACESFilmicToneMapping;
}

function initUnity() {
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

    uniform vec2 u_resolution;
    varying vec2 vUv;

    #define LIGHT_DIR normalize( vec3( -3.0, 3.0, -3.0 ) )
    #define CAMERA_HEIGHT 1.000001
    #define INV_WAVE_LENGTH vec3( 5.60204474633241, 9.4732844379203038, 19.643802610477206 )
    #define INNER_RADIUS 1.0
    #define OUTER_RADIUS 1.025
    #define ESUN 10.0
    #define KR 0.0025
    #define KM 0.0015
    #define SCALE_DEPTH 0.25
    #define SAMPLES 2
    #define G -0.99
    #define GROUND_COLOR vec3( 0.37, 0.35, 0.34 )
    #define GAMMA 1.0 / 2.2

    #define PI 3.14159265

    mat2 rotate2D( float t ) {
        return mat2( cos( t ), -sin( t ), sin( t ), cos( t ) );
    }

    float scale( float fCos ) {
        float x = 1.0 - fCos;
        return SCALE_DEPTH * exp( -0.00287 + x * ( 0.459 + x * ( 3.83 + x * ( -6.80 + x * 5.25 ) ) ) );
    }

    vec2 getIntersections( vec3 pos, vec3 dir, float dist2, float rad2 ) {
        float B = 2.0 * dot( pos, dir );
        float C = dist2 - rad2;
        float det = max( 0.0, B * B - 4.0 * C );
        return 0.5 * vec2(
            ( -B - sqrt( det ) ),
            ( -B + sqrt( det ) )
        );
    }

    float getRayleighPhase( float fCos2 ) {
        return 0.75 * ( 2.0 + 0.5 * fCos2 );
    }

    float getMiePhase( float fCos, float fCos2, float g, float g2 ) {
        return 1.5 * ( ( 1.0 - g2 ) / ( 2.0 + g2 ) ) * ( 1.0 + fCos2 )
            / pow( 1.0 + g2 - 2.0 * g * fCos, 1.5 );
    }

    vec3 uvToRayDir( vec2 uv ) {
        vec2 v = PI * ( vec2( 1.5, 1.0 ) - vec2( 2.0, 1.0 ) * uv );
        return vec3(
            sin( v.y ) * cos( v.x ),
            cos( v.y ),
            sin( v.y ) * sin( v.x )
        );
    }

    void mainImage( out vec4 fragColor, in vec2 fragCoord )
    {
        // Variables
        float fInnerRadius2 = INNER_RADIUS * INNER_RADIUS;
        float fOuterRadius2 = OUTER_RADIUS * OUTER_RADIUS;
        float fKrESun = KR * ESUN;
        float fKmESun = KM * ESUN;
        float fKr4PI = KR * 4.0 * PI;
        float fKm4PI = KM * 4.0 * PI;
        float fScale = 1.0 / ( OUTER_RADIUS - INNER_RADIUS );
        float fScaleOverScaleDepth = fScale / SCALE_DEPTH;
        float fG2 = G * G;

        // Light diection
        vec3 v3LightDir = LIGHT_DIR;
        // if ( 0.5 < u_mouse.y ) {
      // 	vec2 m = u_mouse.xy / u_resolution.xy;
        //     v3LightDir = uvToRayDir( m );
        // }

        // Ray initialization
        // vec2 v2uv = fragCoord.xy / u_resolution.xy;
        vec2 v2uv = vUv;

        vec3 v3RayOri = vec3( 0.0, CAMERA_HEIGHT, 0.0 );
        float fRayPhi = PI * ( 3.0 / 2.0 - 2.0 * v2uv.x );
        float fRayTheta = PI * ( v2uv.y );
        vec3 v3RayDir = vec3(
            sin( fRayTheta ) * cos( fRayPhi ),
            -cos( fRayTheta ),
            sin( fRayTheta ) * sin( fRayPhi )
        );
        float fCameraHeight = length( v3RayOri );
        float fCameraHeight2 = fCameraHeight * fCameraHeight;

        vec2 v2InnerIsects = getIntersections( v3RayOri, v3RayDir, fCameraHeight2, fInnerRadius2 );
        vec2 v2OuterIsects = getIntersections( v3RayOri, v3RayDir, fCameraHeight2, fOuterRadius2 );
        bool isGround = 0.0 < v2InnerIsects.x;

        if ( v2OuterIsects.x == v2OuterIsects.y ) // vacuum space
            {
            fragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
            return;
        }

        float fNear = max( 0.0, v2OuterIsects.x );
        float fFar = isGround ? v2InnerIsects.x : v2OuterIsects.y;
        vec3 v3FarPos = v3RayOri + v3RayDir * fFar;
        vec3 v3FarPosNorm = normalize( v3FarPos );

        vec3 v3StartPos = v3RayOri + v3RayDir * fNear;
        float fStartPosHeight = length( v3StartPos );
        vec3 v3StartPosNorm = v3StartPos / fStartPosHeight;
        float fStartAngle = dot( v3RayDir, v3StartPosNorm );
        float fStartDepth = exp( fScaleOverScaleDepth * ( INNER_RADIUS - fStartPosHeight ) );
        float fStartOffset = fStartDepth * scale( fStartAngle );

        float fCameraAngle = dot( -v3RayDir, v3FarPosNorm );
        float fCameraScale = scale( fCameraAngle );
        float fCameraOffset = exp( ( INNER_RADIUS - fCameraHeight ) / SCALE_DEPTH ) * fCameraScale;

        float fTemp = scale( dot( v3FarPosNorm, v3LightDir ) ) + scale( dot( v3FarPosNorm, -v3RayDir ) );

        float fSampleLength = ( fFar - fNear ) / float( SAMPLES );
        float fScaledLength = fSampleLength * fScale;
        vec3 v3SampleDir = v3RayDir * fSampleLength;
        vec3 v3SamplePoint = v3StartPos + v3SampleDir * 0.5;

        vec3 v3FrontColor = vec3( 0.0 );
        vec3 v3Attenuate;
        for ( int i = 0; i < SAMPLES; i ++ )
            {
            float fHeight = length( v3SamplePoint );
            float fDepth = exp( fScaleOverScaleDepth * ( INNER_RADIUS - fHeight ) );
            float fLightAngle = dot( v3LightDir, v3SamplePoint ) / fHeight;
            float fCameraAngle = dot( v3RayDir, v3SamplePoint ) / fHeight;
            float fScatter = isGround
                ? fDepth * fTemp - fCameraOffset
                : ( fStartOffset + fDepth * ( scale( fLightAngle ) - scale( fCameraAngle ) ) );
            v3Attenuate = exp( -fScatter * ( INV_WAVE_LENGTH * fKr4PI + fKm4PI ) );
            v3FrontColor += v3Attenuate * ( fDepth * fScaledLength );
            v3SamplePoint += v3SampleDir;
        }

        v3FrontColor = clamp( v3FrontColor, 0.0, 3.0 );
        vec3 c0 = v3FrontColor * ( INV_WAVE_LENGTH * fKrESun );
        vec3 c1 = v3FrontColor * fKmESun;

        if ( isGround )
            {
            vec3 v3RayleighColor = c0 + c1;
            vec3 v3MieColor = clamp( v3Attenuate, 0.0, 3.0 );
            fragColor = vec4( 1.0 - exp( -( v3RayleighColor + GROUND_COLOR * v3MieColor ) ), 1.0 );
            fragColor.xyz = pow( fragColor.xyz, vec3( GAMMA ) );
            return;
        }

        float fCos = dot( -v3LightDir, v3RayDir );
        float fCos2 = fCos * fCos;

        fragColor = vec4(
            getRayleighPhase( fCos2 ) * c0 + getMiePhase( fCos, fCos2, G, fG2 ) * c1,
            1.0
        );
        fragColor.xyz = pow( fragColor.xyz, vec3( GAMMA ) );
    }


    void main(){
        mainImage(gl_FragColor,gl_FragCoord.xy);
    }`;

  let material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {},
    depthTest: true,
    side: THREE.BackSide,
  });

  mesh = new THREE.Mesh(new THREE.SphereGeometry(20, 32, 32), material);
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
