import * as THREE from 'three';
import parsePdb from 'parse-pdb';

window.THREE = THREE;

import OrbitControls from 'three/examples/js/controls/OrbitControls';

THREE.OrbitControls = OrbitControls;

const FOV = 55;

let camera;
let scene;
let renderer;
let cameraControls;

const clock = new THREE.Clock();

/**
 * @param {String} dataString the pdb data to display
 * @param {Object} options
 */
function fillScene(dataString) {
  scene = new THREE.Scene();
  const geometry = new THREE.Geometry();

  const { atoms } = parsePdb(dataString);

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

  // Draw bounding box
  const boundingBoxHelper = new THREE.Box3Helper(geometry.boundingBox, 0xffff00);
  scene.add(boundingBoxHelper);

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

  // TODO remove me, center sphere
  const bodyMaterial = new THREE.MeshPhongMaterial();
  bodyMaterial.color.setRGB(31 / 255, 86 / 255, 169 / 255);
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(2, 32, 16), bodyMaterial,
  );
  sphere.position.x = midpoint.x;
  sphere.position.y = midpoint.y;
  sphere.position.z = midpoint.z;
  scene.add(sphere);

  const particles = new THREE.Points(geometry, material);
  particles.sortParticles = true;
  scene.add(particles);

  /*
  // TODO Calculate camera position in order to frame molecule in view
  // TODO verify by using the calculated dist and comparing to cameraDistanceFromMidpoint
  const boundingBoxSizeY = boundingBox.max.y - boundingBox.min.y;
  // height = 2 * tan(FOV/2) * distance
  // tan(fov/2) = (boundingBoxSizeY / 2) / a
  const newCameraDistanceFromMidpoint = Math.abs((boundingBoxSizeY / 2) / Math.tan(FOV / 2));
  console.log('zomg camera should be this far away', newCameraDistanceFromMidpoint);
  const vectorMidpointToCamera = camera.position.clone().sub(midpoint);
  const cameraDistanceFromMidpoint = vectorMidpointToCamera.length();
  const distanceOldToNewCameraPosition = newCameraDistanceFromMidpoint - cameraDistanceFromMidpoint;
  const newCameraPosition = camera.position.clone().add(
    vectorMidpointToCamera.normalize().multiplyScalar(distanceOldToNewCameraPosition),
  );
  camera.position.set(newCameraPosition.x, newCameraPosition.y, newCameraPosition.z);
  const dist = newCameraPosition.clone().sub(midpoint).length();
  console.log('zomg camerapos', newCameraPosition, midpoint, dist);
  */

  camera.position.set(0, 0, boundingSphereRadius * 1.5);
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
 */
export default function tinyMolecule(element, dataString) {
  try {
    init();
    fillScene(dataString);
    addToDOM(element);
    animate();
  } catch (e) {
    const errorReport = 'Your program encountered an unrecoverable error, can not draw on canvas. Error was:';
    element.append(`${errorReport}${e}`);
    console.error(e);
  }
}
