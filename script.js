import * as THREE from 'three';
import { OrbitControls } from '/OrbitControls.js';
import { GLTFLoader } from '/GLTFLoader.js';

const fullSvgEl = document.getElementById("parentSVG");
const selectedFiles = document.getElementById("filesInp");
const getBtn = document.getElementById("getBtn");
const manualCtrlsWrapperDiv = document.querySelector(".mnCtrls");
const rotationsEl = document.getElementById("rotations");
const rotateXRangeEl = document.getElementById('rotateX');
const rotateYRangeEl = document.getElementById('rotateY');
const rotateZRangeEl = document.getElementById('rotateZ');
const cameraManualCtrlsDiv = document.querySelector(".cameraCtrls");
const cameraAcc = document.getElementById("cameraAcc");
const cameraXEl = document.getElementById("cameraX");
const cameraYEl = document.getElementById("cameraY");
const cameraZEl = document.getElementById("cameraZ");


let ctrls;
let scene;
let camera;
let model;
let renderer;

getBtn.addEventListener("click", renderDom);
rotationsEl.addEventListener("click", handleRotation);
cameraAcc.addEventListener("click", handleCameras);
rotateXRangeEl.addEventListener("mousemove", rotateXHandle);
rotateYRangeEl.addEventListener("mousemove", rotateYHandle);
rotateZRangeEl.addEventListener("mousemove", rotateZHandle);
cameraXEl.addEventListener("change", ctrlCameraX);
cameraYEl.addEventListener("change", ctrlCameraY);
cameraZEl.addEventListener("change", ctrlCameraZ);


function renderDom() {

    let width = window.innerWidth * 70 / 100;
    let height = window.innerHeight;
    let g = document.createElementNS("http://www.w3.org/2000/svg", 'g');
    var newNode = document.createElementNS("http://www.w3.org/2000/svg", 'foreignObject');
    let attributesForNewNode = { width: width, height: height, x: `0`, y: "30" };
    setAttributes(newNode, attributesForNewNode);
    g.appendChild(newNode);

    var renderingDiv = document.createElement('div');
    var divIdName = `div_1`;
    setAttributes(renderingDiv, { id: divIdName, class: "renderingDiv" });
    newNode.appendChild(renderingDiv);


    renderFile(renderingDiv);

    fullSvgEl.appendChild(g);

}

function renderFile(div) {

    let hlight, directionalLight;

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000);
    camera.position.set(-5, 2, -5);

    scene = new THREE.Scene();
    const color = new THREE.Color("skyblue");
    scene.background = color;

    hlight = new THREE.AmbientLight(0x404040, 100);
    scene.add(hlight);

    directionalLight = new THREE.DirectionalLight(0xffffff, 10);
    directionalLight.position.set(0, 1, 0);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // console.log(i);
    const loader = new GLTFLoader();
    const fileSrc = URL.createObjectURL(selectedFiles.files[0]);
    loader.load(fileSrc, async function (glb) {
        model = glb.scene;

        var boundingBox = new THREE.Box3().setFromObject(model);

        var size = new THREE.Vector3();     // Three vector -> it gives 3d vector with x, y, z coordinates
        boundingBox.getSize(size);          // getting initial size of 3d-Object
        var maxSize = new THREE.Vector3(5, 5, 5);  // setting mximum size ratio for a 3-d object
        var minSize = new THREE.Vector3(1.3, 1.3, 1.3); // setting minimum size ratio for a 3-d oject

        if (size.x > maxSize.x || size.y > maxSize.y || size.z > maxSize.z) {   // reducing the size if it is more than respective view ratio according to vivible ratio
            var scaleFactor = Math.min(maxSize.x / size.x, maxSize.y / size.y, maxSize.z / size.z);
            model.scale.set(scaleFactor, scaleFactor, scaleFactor);
        }

        if (size.x < minSize || size.y < minSize.y || size.z < minSize.z) {  // inncreasing the size of 3-d object if it is less than respective ratio
            var scaleFactor = Math.max(minSize.x / size.x, minSize.y / size.y, minSize.z / size.z);
            model.scale.set(scaleFactor, scaleFactor, scaleFactor);
        }

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(devicePixelRatio);
        let width = window.innerWidth * 70 / 100;
        let height = width * 2.5 / 3;
        renderer.setSize(width, height);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.5;

        camera.lookAt(new THREE.Vector3());   // camera should look at the origin in cartecian coordinates

        await renderer.compileAsync(scene, camera);

        scene.add(model);
        renderer.render(scene, camera);
        setInitialCmraValues();

        div.appendChild(renderer.domElement);  //adding rendered 3d object to dom in respective div
        div.addEventListener("click", ctrlsHandling);
    })
}


function ctrlsHandling() {
    ctrls = new OrbitControls(camera, renderer.domElement);
    ctrls.addEventListener('change', render);
    ctrls.minDistance = 0.1;
    ctrls.maxDistance = 900;
    ctrls.target.set(0, 0, 0);
    ctrls.update();
}

function render() {
    renderer.render(scene, camera);
    cameraXEl.value = camera.position.x;
    cameraYEl.value = camera.position.y;
    cameraZEl.value = camera.position.z;
}


function setAttributes(element, allAttributes) {
    let attriButes = Object.keys(allAttributes);
    let attributeValues = Object.values(allAttributes);
    for (let i = 0; i < attriButes.length; i++) {
        element.setAttribute(attriButes[i], attributeValues[i]);
    }
}

let rotationIsOpened = false;

function handleRotation() {
    if (rotationIsOpened) {
        manualCtrlsWrapperDiv.style.height = "100px";
        document.getElementById("upDownArrowAcc").classList.remove("fa-chevron-up");
        document.getElementById("upDownArrowAcc").classList.add("fa-chevron-down");
        rotationIsOpened = false;
    }
    else {
        manualCtrlsWrapperDiv.style.height = "300px";
        document.getElementById("upDownArrowAcc").classList.remove("fa-chevron-down");
        document.getElementById("upDownArrowAcc").classList.add("fa-chevron-up");
        rotationIsOpened = true;
    }
}

let initialXValue = rotateXRangeEl.value;
function rotateXHandle() {
    let crrRotationValue = rotateXRangeEl.value;
    let CrrDeg = (crrRotationValue / 100) * Math.PI * 2;
    let prevDeg = (initialXValue / 100) * Math.PI * 2;
    let degToRotate = CrrDeg - prevDeg;
    if (model) {
        model.rotateY(degToRotate);
        initialXValue = crrRotationValue;
        render();
    }
}


let initialYValue = rotateYRangeEl.value;
function rotateYHandle() {
    // console.log(initialYValue);
    let crrRotationValue = rotateYRangeEl.value;
    let CrrDeg = (crrRotationValue / 100) * Math.PI * 2;
    let prevDeg = (initialYValue / 100) * Math.PI * 2;
    let degToRotate = CrrDeg - prevDeg;
    if (model) {
        model.rotateX(degToRotate);
        initialYValue = crrRotationValue;
        render();
    }
}

let initialZValue = rotateZRangeEl.value;
function rotateZHandle() {
    // console.log(initialZValue);
    let crrRotationValue = rotateZRangeEl.value;
    let CrrDeg = (crrRotationValue / 100) * Math.PI * 2;
    let prevDeg = (initialZValue / 100) * Math.PI * 2;
    let degToRotate = CrrDeg - prevDeg;
    if (model) {
        model.rotateZ(degToRotate);
        initialZValue = crrRotationValue;
        render();
    }
}




let cameraAccIsOpened = false;
function handleCameras() {
    if (cameraAccIsOpened) {
        cameraManualCtrlsDiv.style.height = "100px";
        document.getElementById("upDownArrowCameraAcc").classList.remove("fa-chevron-up");
        document.getElementById("upDownArrowCameraAcc").classList.add("fa-chevron-down");
        cameraAccIsOpened = false;
    }
    else {
        cameraManualCtrlsDiv.style.height = "300px";
        document.getElementById("upDownArrowCameraAcc").classList.remove("fa-chevron-down");
        document.getElementById("upDownArrowCameraAcc").classList.add("fa-chevron-up");
        cameraAccIsOpened = true;
    }
}

function setInitialCmraValues(){
    if(camera){
        cameraXEl.value = camera.position.x;
        cameraYEl.value = camera.position.y;
        cameraZEl.value = camera.position.z;
    }
};




function ctrlCameraX() {
    console.log("running camera function ......");
    if(camera){
            let cameraPositionX = cameraXEl.value;
            let cameraPositionY = cameraYEl.value;
            let cameraPositionZ = cameraZEl.value;
            camera.position.set(+cameraPositionX, +cameraPositionY, +cameraPositionZ);
            camera.lookAt(new THREE.Vector3());
            render();
    }
}

function ctrlCameraY() {
    if(camera){
        if(cameraYEl.value<900 && cameraYEl.value>0.1){
            let cameraPositionX = cameraXEl.value;
            let cameraPositionY = cameraYEl.value;
            let cameraPositionZ = cameraZEl.value;
            camera.position.set(cameraPositionX, cameraPositionY, cameraPositionZ);
            camera.lookAt(new THREE.Vector3());
            render();
        }
    }
}

function ctrlCameraZ() {
    if(camera){
        if(cameraZEl.value<900 && cameraZEl.value>0.1){
            let cameraPositionX = cameraXEl.value;
            let cameraPositionY = cameraYEl.value;
            let cameraPositionZ = cameraZEl.value;
            camera.position.set(cameraPositionX, cameraPositionY, cameraPositionZ);
            camera.lookAt(new THREE.Vector3());
            render();
        }
    }
}