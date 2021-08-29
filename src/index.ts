import {
  AmbientLight,
  BoxGeometry,
  CanvasTexture,
  CubeTextureLoader,
  DirectionalLight,
  DoubleSide,
  Fog,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  sRGBEncoding,
  WebGLRenderer,
  RepeatWrapping,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

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
  textureCanvas.repeat.set(10, 10)
  textureCanvas.wrapS = RepeatWrapping;
  textureCanvas.wrapT = RepeatWrapping;

  return textureCanvas;
};


const main = () => {
  const renderer = new WebGLRenderer();
  renderer.outputEncoding = sRGBEncoding;
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.listenToKeyEvents(window.document.body);
  controls.target.set(0, 0, 0);
  controls.update();

  const scene = new Scene();
  scene.fog = new Fog(0xffffff, 10, 100);

  var dirLight = new DirectionalLight(0xffffff);
  dirLight.position.set(10, 10, 10);
  scene.add(dirLight)

  const loader = new CubeTextureLoader();
  scene.background = loader.load([
    "/textures/sky/right.jpg",
    "/textures/sky/left.jpg",
    "/textures/sky/top.jpg",
    "/textures/sky/bottom.jpg",
    "/textures/sky/front.jpg",
    "/textures/sky/back.jpg",
  ]);

  const planeGeometry = new BoxGeometry(10, 10, .1);
  const planeMaterial = new MeshBasicMaterial({ map: generateCheckerBoardTexture() });
  const plane = new Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = - Math.PI / 2;
  scene.add(plane);

  const cubeGeometry = new BoxGeometry();
  const cubeMaterial = new MeshStandardMaterial({
    color: 0x3333ccc,
    opacity: 1,
    roughness: 1,
    metalness: 1,
    side: DoubleSide,
  });
  const cube = new Mesh(cubeGeometry, cubeMaterial);
  cube.position.y = 2;
  cube.position.x = 2;
  cube.position.z = 2;
  scene.add(cube);

  camera.position.y = 5;
  camera.position.z = 5;

  const gltfLoader = new GLTFLoader();

  gltfLoader.load('/models/greek.glb', function(gltf) {
    scene.add(gltf.scene);
    gltf.scene.scale.set(.03, .03, .03);
    gltf.scene.position.y = 1;
  }, undefined, function(error) {
    console.error(error);
  });

  function animate() {
    requestAnimationFrame(animate);

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    controls.update();

    renderer.render(scene, camera);
  }
  animate();

};
main();


