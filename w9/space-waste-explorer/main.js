import * as THREE from 'three';

let scene, camera, renderer, earth;

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 3;

  renderer = new THREE.WebGLRenderer({ antialias: true, canvas: document.getElementById('scene') });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // Earth sphere
  const geometry = new THREE.SphereGeometry(1, 32, 32);
  const textureLoader = new THREE.TextureLoader();
  const earthTexture = textureLoader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg');
  const material = new THREE.MeshStandardMaterial({ map: earthTexture });
  earth = new THREE.Mesh(geometry, material);
  scene.add(earth);

  // lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(5, 3, 5);
  scene.add(dirLight);

  // placeholder for waste particles
  const wasteGroup = new THREE.Group();
  scene.add(wasteGroup);

  // generate some random "debris" points around earth
  const debrisGeom = new THREE.SphereGeometry(0.01, 8, 8);
  const debrisMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
  for (let i = 0; i < 200; i++) {
    const debris = new THREE.Mesh(debrisGeom, debrisMat);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 1.5 + Math.random() * 0.5;
    debris.position.set(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi)
    );
    wasteGroup.add(debris);
  }

  window.addEventListener('resize', onWindowResize);

  animate();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  earth.rotation.y += 0.001;
  renderer.render(scene, camera);
}

init();
