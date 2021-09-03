import {
  AmbientLight,
  BoxGeometry,
  CameraHelper,
  CanvasTexture,
  Color,
  CubeTextureLoader,
  DoubleSide,
  Fog,
  HSL,
  Mesh,
  MeshStandardMaterial,
  MeshPhysicalMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Scene,
  SpotLight,
  SpotLightHelper,
  sRGBEncoding,
  RepeatWrapping,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as Stats from 'stats.js';
import TWEEN from '@tweenjs/tween.js';

const generateCheckerBoardTexture = () => {
  const imageCanvas = document.createElement("canvas");
  const context = imageCanvas.getContext("2d");

  imageCanvas.width = imageCanvas.height = 128;

  context.fillStyle = "#000";
  context.fillRect(0, 0, 128, 128);

  context.fillStyle = "#fff";
  context.fillRect(0, 0, 64, 64);
  context.fillRect(64, 64, 64, 64);

  const textureCanvas = new CanvasTexture(imageCanvas);
  textureCanvas.repeat.set(100, 100)
  textureCanvas.wrapS = RepeatWrapping;
  textureCanvas.wrapT = RepeatWrapping;

  return textureCanvas;
};

const randomColor = () => {
  const color = new Color();
  color.setHSL(Math.random(), 1, .5);
  return color.getHex();
};


const tweenLight = (light: SpotLight) => {

  light.color.setHSL(Math.random(), 1, .5);

  new TWEEN.Tween(light).to({
    angle: (Math.random() * 0.7) + 0.1,
    penumbra: Math.random(),
    //color: randomColor(),
  }, Math.random() * 3000 + 2000).easing(TWEEN.Easing.Quadratic.Out).start();

  new TWEEN.Tween(light.position).to({
    x: (Math.random() * 10) - 5,
    z: (Math.random() * 10) - 5
  }, Math.random() * 3000 + 2000).easing(TWEEN.Easing.Quadratic.Out).start();
};

const buildLight = () => {
  var spotLight = new SpotLight(randomColor());
  spotLight.angle = Math.PI / 8;
  spotLight.castShadow = true;
  spotLight.decay = 2;
  spotLight.intensity = 100;
  spotLight.penumbra = 1;
  return spotLight;
}

const main = () => {

  const stats = new Stats();
  stats.showPanel(0);
  document.body.appendChild(stats.dom);

  const renderer = new WebGLRenderer();
  document.body.appendChild(renderer.domElement);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = sRGBEncoding;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  renderer.physicallyCorrectLights = true;

  const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.y = 5;
  camera.position.z = 5;

  const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  onWindowResize();
  window.addEventListener('resize', onWindowResize);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.listenToKeyEvents(window.document.body);
  controls.autoRotate = true;
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.target.set(0, 0, 0);
  controls.update();

  const scene = new Scene();

  scene.add(new AmbientLight(0x202020));

  scene.fog = new Fog(0x0, 1, 100);

  const spotLight1 = buildLight();
  spotLight1.position.set(3, 5, 3);
  scene.add(spotLight1);

  const lightHelper1 = new SpotLightHelper(spotLight1)
  //scene.add(lightHelper1);

  const spotLight2 = buildLight();
  spotLight2.position.set(-3, 5, -3);
  scene.add(spotLight2);

  const lightHelper2 = new SpotLightHelper(spotLight2)
  //scene.add(lightHelper2);

  const spotLight3 = buildLight();
  spotLight3.position.set(-3, 5, 3);
  scene.add(spotLight3);

  const lightHelper3 = new SpotLightHelper(spotLight3)
  //scene.add(lightHelper3);

  // const loader = new CubeTextureLoader();
  // scene.background = loader.load([
  //   "/textures/sky/right.jpg",
  //   "/textures/sky/left.jpg",
  //   "/textures/sky/top.jpg",
  //   "/textures/sky/bottom.jpg",
  //   "/textures/sky/front.jpg",
  //   "/textures/sky/back.jpg",
  // ]);

  const planeGeometry = new BoxGeometry(100, 100, .1);
  const planeMaterial = new MeshPhysicalMaterial({
    map: generateCheckerBoardTexture(),
    metalness: 0.5,
    clearcoat: 1.0,
  });
  const plane = new Mesh(planeGeometry, planeMaterial);
  plane.receiveShadow = true;
  plane.rotation.x = - Math.PI / 2;
  scene.add(plane);

  const cubeGeometry = new BoxGeometry();
  const cubeMaterial = new MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.25,
    roughness: 0.25,
    clearcoat: 1.0,
    transparent: true,
    transmission: 1,
  });
  const cube = new Mesh(cubeGeometry, cubeMaterial);
  cube.position.y = 2;
  cube.position.x = 2;
  cube.position.z = -2;
  cube.castShadow = true;
  cube.receiveShadow = true;
  scene.add(cube);

  const gltfLoader = new GLTFLoader();
  gltfLoader.load('/models/greek.glb', function(gltf) {

    gltf.scene.castShadow = true;
    gltf.scene.receiveShadow = true;
    gltf.scene.scale.set(.03, .03, .03);
    gltf.scene.position.y = 1;

    spotLight1.target = gltf.scene;
    spotLight2.target = gltf.scene;
    spotLight3.target = gltf.scene;

    scene.add(gltf.scene);

  }, undefined, function(error) {
    console.error(error);
  });

  const animateLight = (light: SpotLight, delay: number) => {
    tweenLight(light);
    setTimeout(animateLight, 5000, light, delay);
  };

  const updateScene = (ts: number) => {
    lightHelper1.update();
    lightHelper2.update();
    lightHelper3.update();

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.015;
    cube.rotation.z += 0.02;
  }

  const animate = (ts: number) => {
    stats.begin();

    updateScene(ts);
    controls.update();
    TWEEN.update(ts);

    renderer.render(scene, camera);

    stats.end();

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);

  setTimeout(() => {
    animateLight(spotLight1, 5000);
  }, Math.random() * 5000);
  setTimeout(() => {
    animateLight(spotLight2, 5000);
  }, Math.random() * 5000);
  setTimeout(() => {
    animateLight(spotLight3, 5000);
  }, Math.random() * 5000);

};
main();


