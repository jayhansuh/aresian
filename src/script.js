import './style.css'
import * as dat from 'lil-gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { lonlat2cart } from './Utils/lonlat2cart.js'
import { fl } from './Utils/featureLocations.js'

import { gsap } from 'gsap'
import { PolyhedronGeometry, Raycaster } from 'three'
import overlayVertexShader from './shaders/overlay/vertex.glsl'
import overlayFragementShader from './shaders/overlay/fragment.glsl'

import{ PMREMGenerator } from 'three/src/extras/PMREMGenerator.js'

console.log('%cWELCOME ARESIAN', 'font-size: 50px; color: #fff; background: #000; padding: 10px;');
//console.log(process.env.NODE_ENV);

window.var={};
window.eventListners = {};

// Wait for the window to load
window.addEventListener('load', () => {
    // Entry title
    const title = document.createElement('div');
    title.className = 'entrytitle properText';
    title.innerHTML = '<div>ARESIAN</div>';
    document.body.appendChild(title);
    window.setTimeout(() => {document.querySelector('div.entrytitle').remove();},4000);
}); 

// texture files
const marsTextureFiles = {
    'TER': '/models/cropResized.jpg',//cropAsset 2-100.jpg',//5672_mars_4k_color.jpg',
    'GRE': '/models/marsgreen.jpeg',
    'ELE': '/models/c2880x2160.jpeg',
};
window.currentTexture = 'TER';

/**
 * Three.js Base 
 */
// Debug
//const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Overlay
 */
const overlayGeometry = new THREE.PlaneBufferGeometry(2, 2, 1, 1)
const overlayMaterial = new THREE.ShaderMaterial({
    transparent: true,
    uniforms:
    {
        uAlpha: { value: 1 }
    },
    vertexShader: overlayVertexShader,
    fragmentShader: overlayFragementShader
})
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial)
scene.add(overlay)

/**
 * Loaders
 */
window.sceneReady = false
const loadingManager = new THREE.LoadingManager(
    () =>
    {
        window.setTimeout(()=>
        {
            gsap.to(overlayMaterial.uniforms.uAlpha, {duration: 2, value: 0 })
            
            //grabbable hand on the screen
            
            document.body.classList.add('grabbable');

            document.body.addEventListener('mouseout',()=>{
                document.body.classList.remove('grabbable');
            })
            document.body.addEventListener('mouseover',()=>{
                document.body.classList.add('grabbable');
            })

            document.addEventListener('visibilitychange', () =>{
                if (document.visibilityState === 'hidden')
                {
                    document.body.classList.remove('grabbable');
                }
            })

        }, 1000)
        window.setTimeout(()=>
        {
            window.sceneReady = true;
        }, 1500)
        
    }
)

// Texture loader
const textureLoader = new THREE.TextureLoader(loadingManager)

const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')

const gltfLoader = new GLTFLoader(loadingManager)
gltfLoader.setDRACOLoader(dracoLoader)

/** 
 * Textures
 */
const bakedTexture = textureLoader.load(marsTextureFiles[window.currentTexture])//5672_mars_4k_color.jpg')
bakedTexture.flipY = true
bakedTexture.encoding = THREE.sRGBEncoding

const mars = new THREE.Mesh( 
    new THREE.SphereGeometry(1, 64, 32, Math.PI,Math.PI*2,0,Math.PI),
    new THREE.MeshStandardMaterial({
        map: bakedTexture,
    })
)

scene.add(mars)

/**
 * Points of Interests
 */
const Radius = 1.01

const pointContainer = document.createElement("div");
pointContainer.className="pointContainer";

// return onclick function to make navbar visible
function navOnOff(tag){

    // if navbar is visible, make it invisible
    const nav = document.querySelector('.navbar.visible');
    if(nav){
        nav.classList.remove('visible');
        document.body.classList.toggle('grabbable');
        return;
    }

    if(tag!='off'){
        if(this.id=="Aeolis Palus (Curisosity,2012)"){
            const nav = document.querySelector('.navbar.aeolis');
            nav.classList.toggle('visible');
            document.body.classList.toggle('grabbable');
        }
        else{
            const nav = document.querySelector('.navbar.unknown');
            nav.classList.toggle('visible');
            document.body.classList.toggle('grabbable');
            
            const navTitle = document.querySelector('.navbar.unknown .properText');
            navTitle.innerHTML = `<div>${this.id}</div>`;
        }
    }
    
}
window.navOnOff=navOnOff;

const points = fl.map((d,i)=>{

    // Create point
    const pointDiv = document.createElement("div");
    pointDiv.className = `point point-${i}`;
    //Set pointDiv id to the name of the point
    pointDiv.id = d.name;
    pointDiv.onclick = navOnOff;

    // Create circled number
    const labelDiv = document.createElement("div");
    labelDiv.className = "label"
    labelDiv.textContent = String(i + 1);
    pointDiv.appendChild(labelDiv);

    // Create text description
    const textDiv = document.createElement("div");
    textDiv.className = "text"
    textDiv.innerHTML = `<div>${d.name}</div>`;
    pointDiv.appendChild(textDiv);

    pointContainer.appendChild(pointDiv);
    
    return {  
        //lonlat2cart(radius, latitude (N=+, S=-) , longitude (E=+, W=-))
        position: lonlat2cart(Radius, d.lat, d.lon),
        element: pointDiv,
    };

});

document.body.appendChild(pointContainer);

const raycaster = new Raycaster()

/**
 * Lights
 */
//const ambientLight = new THREE.AmbientLight(0xffffff, 0.1)
const ambientLight = new THREE.AmbientLight(0xffffff, 1)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.1)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.position.set(1, 1, 1)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camdist=( sizes.width>sizes.height ? 2.5 : 2.5 * sizes.height/sizes.width);
    const camdir = camera.position.normalize();
    camera.position.set(camdist*camdir.x, camdist*camdir.y, camdist*camdir.z);
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
    
    // Update controls
    controls.maxDistance = 1.1 * camdist;
    controls.minDistance = Math.max(2, 0.5 * camdist);
    controls.update();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
let camdist=( sizes.width>sizes.height ? 2.5 : 2.5 * sizes.height/sizes.width);
const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.1, 10)
camera.position.set(camdist, 0, 0)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0, 0)
controls.enableDamping = true
controls.enablePan = false;
controls.maxDistance = 1.1 * camdist;
controls.minDistance = Math.max(2, 0.5 * camdist);
controls.maxPolarAngle = Math.PI * 3/4;
controls.minPolarAngle = Math.PI /4;


/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime


    if(window.sceneReady)
    {
        // Go through each point
        for(const point of points)
        {
            const screenPosition = point.position.clone()
            screenPosition.project(camera)

            raycaster.setFromCamera(screenPosition, camera)
            const intersects = raycaster.intersectObjects(scene.children, true)

            if(intersects.length === 0)
            {
                point.element.classList.add('visible')
            }
            else{

                const intersectionDistance = intersects[0].distance
                const pointDistance = point.position.distanceTo(camera.position)

                if(intersectionDistance < pointDistance)
                {
                    point.element.classList.remove('visible')
                }
                else
                { 
                    point.element.classList.add('visible')
                }
            
            }

            const translateX = screenPosition.x * sizes.width * 0.5
            const translateY = - screenPosition.y * sizes.height * 0.5
            point.element.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`
        }
    }
    

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.animationId = window.requestAnimationFrame(tick);
}

tick()

/**
 * Keyboard Controls
 */

// escape key to navbar not visible
document.addEventListener('keydown', (event) => {
    if(event.key === 'Escape') {
        navOnOff('off');
    }
});

document.getElementById('bgmusic').volume = 0.1;
document.addEventListener('mouseover', function() { document.getElementById('bgmusic').play();}, { once: true });

// on off setting page
function settingOnOff(){
    const setting=document.querySelector('.setting');
    setting.classList.toggle('visible');
}
window.settingOnOff=settingOnOff;

// on off volume

function volumeOnOff(){
    const volume= document.getElementById('bgmusic');
    const volumeButton = document.getElementById('volume_button');
    if(volume.volume==0){
        volume.volume=0.1;
        volumeButton.innerText="volume_up";
    }
    else{
        volume.volume=0;
        volumeButton.innerText="volume_off";
    }
}
window.volumeOnOff=volumeOnOff;


// change mars texture map
function marsTexture(newTexture){
    if(newTexture!=window.currentTexture){
        window.currentTexture=newTexture;
        const bakedTexture = textureLoader.load(marsTextureFiles[newTexture]);
        bakedTexture.flipY = true
        bakedTexture.encoding = THREE.sRGBEncoding
        mars.material.map = bakedTexture;
        mars.material.needsUpdate = true;
    }
}
window.marsTexture=marsTexture; 

