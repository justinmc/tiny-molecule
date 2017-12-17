import * as THREE from 'three';
import parsePdb from 'parse-pdb';

window.THREE = THREE;

import OrbitControls from 'three/examples/js/controls/OrbitControls';

THREE.OrbitControls = OrbitControls;

let camera;
let scene;
let renderer;
let cameraControls;

const clock = new THREE.Clock();

function fillScene(pdbString) {
  scene = new THREE.Scene();
  const geometry = new THREE.Geometry();

  const { atoms } = parsePdb(pdbString);

  atoms.forEach((atom) => {
    const vertex = new THREE.Vector3(atom.x, atom.y, atom.z);
    geometry.vertices.push(vertex);
  });

  const disk = new THREE.TextureLoader().load('./src/images/sphere.png');
  const material = new THREE.PointsMaterial({
    alphaTest: 0.5,
    size: 5,
    sizeAttenuation: true,
    map: disk,
    transparent: true,
  });
  material.color.setHSL(0.9, 0.2, 0.6);

  const particles = new THREE.Points(geometry, material);
  particles.sortParticles = true;
  scene.add(particles);
}

function init() {
  const canvasWidth = window.innerWidth;
  const canvasHeight = window.innerHeight;
  const canvasRatio = canvasWidth / canvasHeight;

  // RENDERER
  renderer = new THREE.WebGLRenderer({ antialias: true, clearAlpha: 1 });
  renderer.gammaInput = true;
  renderer.gammaOutput = true;
  renderer.setSize(canvasWidth, canvasHeight);
  renderer.setClearColor(0xAAAAAA, 1.0);

  // CAMERA
  camera = new THREE.PerspectiveCamera(55, canvasRatio, 2, 8000);
  camera.position.set(10, 5, 15);
  // CONTROLS
  cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
  cameraControls.target.set(0, 0, 0);
}

function addToDOM(element) {
  const canvas = element.getElementsByTagName('canvas');
  if (canvas.length > 0) {
    element.removeChild(canvas[0]);
  }
  element.appendChild(renderer.domElement);
}

function render() {
  const delta = clock.getDelta();
  cameraControls.update(delta);
  renderer.render(scene, camera);
}

function animate() {
  window.requestAnimationFrame(animate);
  render();
}

/**
 * Creates a new instance of TinyMolecule
 * @param {DOM Element} element
 * @param {String} pdbString - the PDB of the molecule to display
 */
export default function tinyMolecule(element, pdbString) {
  try {
    init();
    fillScene(pdbString);
    addToDOM(element);
    animate();
  } catch (e) {
    const errorReport = 'Your program encountered an unrecoverable error, can not draw on canvas. Error was:';
    element.append(`${errorReport}${e}`);
    console.error(e);
  }
}
