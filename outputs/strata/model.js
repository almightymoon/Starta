import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const stage = document.getElementById('modelStage');
const host = document.getElementById('houseCanvas');
const fallback = document.getElementById('modelFallback');
if (!stage || !host) throw new Error('Model stage missing');

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.35;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
host.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 50);
camera.position.set(1.15, 0.72, 1.55);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.7;
controls.minDistance = 0.95;
controls.maxDistance = 2.8;
controls.target.set(0, 0.22, 0);
controls.update();

const hemi = new THREE.HemisphereLight(0xf2f0e6, 0x6d7368, 1.05);
scene.add(hemi);
const key = new THREE.DirectionalLight(0xffe1c4, 2.1);
key.position.set(2.4, 3.2, 1.6);
key.castShadow = true;
key.shadow.mapSize.set(1024, 1024);
scene.add(key);
const fill = new THREE.DirectionalLight(0xc6d6ff, 0.85);
fill.position.set(-2.2, 1.4, -1.2);
scene.add(fill);

const ground = new THREE.Mesh(
  new THREE.CircleGeometry(3.2, 64),
  new THREE.ShadowMaterial({ opacity: 0.18 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.01;
ground.receiveShadow = true;
scene.add(ground);

const loader = new GLTFLoader();
loader.load(
  'assets/curved-roof-house.glb',
  (gltf) => {
    const root = gltf.scene;
    root.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        if (obj.material) {
          obj.material.envMapIntensity = 1.05;
          obj.material.needsUpdate = true;
        }
      }
    });

    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    root.position.sub(center);
    root.position.y += size.y * 0.5;

    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    root.scale.setScalar(1.72 / maxDim);

    scene.add(root);
    stage.classList.add('is-ready');
    if (fallback) fallback.setAttribute('aria-hidden', 'true');
  },
  undefined,
  (err) => {
    console.error('GLB load failed', err);
    stage.classList.add('is-error');
  }
);

const resize = () => {
  const { clientWidth: w, clientHeight: h } = host;
  if (!w || !h) return;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
};
resize();

new ResizeObserver(resize).observe(host);

stage.addEventListener('pointerenter', () => { controls.autoRotate = false; });
stage.addEventListener('pointerleave', () => { controls.autoRotate = true; });

let visible = true;
new IntersectionObserver((entries) => {
  visible = entries.some((e) => e.isIntersecting);
}, { threshold: 0.05 }).observe(stage);

const tick = () => {
  requestAnimationFrame(tick);
  if (!visible) return;
  controls.update();
  renderer.render(scene, camera);
};
tick();
