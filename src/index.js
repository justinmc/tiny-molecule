import * as THREE from 'three';
import parsePdb from 'parse-pdb';
import parseMmcif from 'parse-mmcif';

window.THREE = THREE;

import OrbitControls from 'three/examples/js/controls/OrbitControls';

THREE.OrbitControls = OrbitControls;

const FOV = 55;
const TYPES = {
  PDB: 'PDB',
  MMCIF: 'MMCIF',
};
const REPRESENTATIONS = {
  PARTICLE: 'particle',
  SPHERE: 'sphere',
};

let camera;
let scene;
let renderer;
let cameraControls;

const clock = new THREE.Clock();

/**
 * @param {String} dataString the pdb or mmcif data to display
 * @param {Object} options
 * @param {PDB|MMCIF} options.type
 * @param {REPRESENTATIONS} options.representation
 */
function fillScene(dataString, options) {
  scene = new THREE.Scene();

  let atoms;
  if (options.type === TYPES.PDB) {
    ({ atoms } = parsePdb(dataString));
  } else if (options.type === TYPES.MMCIF) {
    ({ atoms } = parseMmcif(dataString));
  } else {
    throw new Error('Please pass a valid options.type; either "PDB" or "MMCIF"');
  }

  const geometry = new THREE.Geometry();
  atoms.forEach((atom) => {
    const vertex = new THREE.Vector3(atom.x, atom.y, atom.z);
    geometry.vertices.push(vertex);
  });

  // Calculate midpoint
  geometry.computeBoundingBox();
  let { boundingBox } = geometry;
  let midpoint = new THREE.Vector3(
    boundingBox.min.x + ((boundingBox.max.x - boundingBox.min.x) / 2),
    boundingBox.min.y + ((boundingBox.max.y - boundingBox.min.y) / 2),
    boundingBox.min.z + ((boundingBox.max.z - boundingBox.min.z) / 2),
  );

  // Calculate the bounding sphere radius
  const boundingSphereRadius = atoms.reduce((greatestDistance, atom) => {
    const atomPosition = new THREE.Vector3(atom.x, atom.y, atom.z);
    const distance = midpoint.distanceTo(atomPosition);
    if (distance > greatestDistance) {
      return distance;
    }
    return greatestDistance;
  }, 0);

  // Translate midpoint to origin and update midpoint and boundingBox
  geometry.translate(
    0 - midpoint.x,
    0 - midpoint.y,
    0 - midpoint.z,
  );
  geometry.computeBoundingBox();
  ({ boundingBox } = geometry);
  midpoint = new THREE.Vector3(
    boundingBox.min.x + ((boundingBox.max.x - boundingBox.min.x) / 2),
    boundingBox.min.y + ((boundingBox.max.y - boundingBox.min.y) / 2),
    boundingBox.min.z + ((boundingBox.max.z - boundingBox.min.z) / 2),
  );

  // Render using the given representation (default to sphere)
  if (options.representation === REPRESENTATIONS.PARTICLE) {
    const disk = new THREE.TextureLoader().load('./src/images/sphere.png');
    const material = new THREE.PointsMaterial({
      alphaTest: 0.5,
      size: 5,
      sizeAttenuation: true,
      map: disk,
      transparent: true,
    });
    material.color.setHSL(0.9, 0.2, 0.6);

    // Set the camera's target to the midpoint of the structure
    cameraControls.target = midpoint;

    const particles = new THREE.Points(geometry, material);
    particles.sortParticles = true;
    scene.add(particles);
  } else {
    const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    geometry.vertices.forEach((vector3) => {
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.position.set(vector3.x, vector3.y, vector3.z);
      scene.add(sphere);
    });
  }

  const cameraPosition = new THREE.Vector3(0, 0, boundingSphereRadius * 1.5);
  camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);

  // TODO make light move around with camera?
  const ambientLight = new THREE.AmbientLight(0x222222);
  scene.add(ambientLight);
  const light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
  light.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
  scene.add(light);
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
  camera = new THREE.PerspectiveCamera(FOV, canvasRatio, 2, 8000);
  camera.position.set(10, 5, 15);
  // CONTROLS
  cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
  cameraControls.target.set(0, 0, 0);
  cameraControls.enablePan = false;
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
 * @param {String} dataString - the data for the molecule to display
 * @param {Object} options
 * @param {PDB|MMCIF} options.type
 */
export default function tinyMolecule(element, dataString, options) {
  try {
    init();
    fillScene(dataString, options);
    addToDOM(element);
    animate();
  } catch (e) {
    const errorReport = 'Your program encountered an unrecoverable error, can not draw on canvas. Error was:';
    element.append(`${errorReport}${e}`);
    console.error(e);
  }
}
