import '../style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { isinpolygon } from '../Utils/isinpolygon'


import { Sphere, sRGBEncoding, TextureLoader, Vector2, Vector3 } from 'three';

const Color = require('color');

const neighbors = {};
const { io } = require("socket.io-client");
const socket = io.connect('https://aresian.azurewebsites.net/',
    {
        reconnection: true,
        transports: ['websocket'],
        withCredentials: true,
    }
);

//const socket = io();
socket.on("connect", () => {
    const engine = socket.io.engine;
    console.log(engine.transport.name); // in most cases, prints "polling"

    engine.once("upgrade", () => {
        // called when the transport is upgraded (i.e. from HTTP long-polling to WebSocket)
        console.log(engine.transport.name); // in most cases, prints "websocket"
    });

    socket.on('set', (data) => {
        if(data.id!==socket.id && capibaraScene){
            if(!(data.id in neighbors)){
                console.log("add neighbor");
                
                neighbors[data.id] = {};
                

                gltfLoader.load(
                    '/models/capybara.glb',
                    (gltf) =>
                    { 
                        const neighbor = gltf.scene
                        const anim = gltf.animations
                        
                        neighbor.scale.set(.2, .2, .2)
                        neighbor.position.set(pos2d.x, (-2118.8256403156556 +0.2)/3, pos2d.y)
                        unitGroup.add(neighbor)
                
                        // Animation
                        let mixer2 = new THREE.AnimationMixer(neighbor)
                        let action2 = mixer2.clipAction(anim[1])
                        action2.play()

                        neighbors[data.id] = {
                            'scene':neighbor,
                            'socketid':data.id,
                            'anim':anim,
                            'mixer':mixer2,
                            'action':action2,
                        }
                    }
                )
            }

            neighbors[data.id][data.attr] = data.val;
            if('scene' in neighbors[data.id]){
                const neighbor = neighbors[data.id]['scene'];
                if(data.attr=='pos3d'){
                    neighbor.position.set(data.val.x, data.val.y, data.val.z)
                }
                else if(data.attr=='rotation'){
                    neighbor.rotation.y = data.val
                }
                else if(data.attr=='kapiOnRun'){
                    let { mixer, action , anim } = neighbors[data.id];
                    action.stop()
                    action = mixer.clipAction(anim[( data.val==2 ? 3 : 1)])
                    action.play()
                }
            }
                
        }
    });

    socket.on('removeNeighbor', (id) => {
        if(id in neighbors){
            neighbors[id]['scene'].visible = false;
            delete neighbors[id]['scene'];
            delete neighbors[id];
        }
    });

    // engine.on("packet", ({ type, data }) => {
    //     console.log(type, data);
    //     switch(type){
    //         case "set":
    //             console.log("set", data);
    //             break;
    //         case "add_user":
    //             console.log("add_user", data);
    //             break;
    //         case "disconnect":
    //             console.log("disconnect", data);
    //             break;
    //         default:
    //             console.log("unknown", type, data);
    //     }
    // });

    engine.on("packetCreate", ({ type, data }) => {
        // called for each packet sent
    });

    engine.on("drain", () => {
        // called when the write buffer is drained
    });

    engine.on("close", (reason) => {
        // called when the underlying connection is closed
    });
});



/**
 * Minimap & Menubar buttons
 */

const minimap=document.getElementById('minimap');
const minimap_ctx=minimap.getContext('2d');
const minimap_width=minimap.width;
const minimap_height=minimap.height;
let minimapOnOff = null;

const minimap_img = new Image();
minimap_img.src = "/imgs/gale_minimap.jpeg";
minimap_img.onload = function(){
    minimapOnOff=false;
    subMenuOnOff("minimapdiv");
}

function drawMiniMap(pos){
    if(minimapOnOff){
        const scale = 1/1807/100;
        const x = ((pos.x - 24338.93445296312)*scale + 0.5)*minimap_width;
        const y = ((pos.y - 32736.594012823894)*scale + 0.5)*minimap_height;
        
        minimap_ctx.clearRect(0,0,canvas.width,canvas.height);
        minimap_ctx.drawImage(minimap_img,0,0,minimap_width,minimap_height);
        minimap_ctx.beginPath();
        minimap_ctx.arc(x, y, 4, 0, 2 * Math.PI, false);
        minimap_ctx.fillStyle = 'Salmon';
        minimap_ctx.fill();
        minimap_ctx.strokewidth=8;
        minimap_ctx.strokeStyle = 'OrangeRed';
        minimap_ctx.stroke();

        //Draw direction arrow
        const dir = (new Vector2(pos.x - camera.position.x, pos.y - camera.position.z)).normalize().multiplyScalar(10);
        minimap_ctx.beginPath();
        minimap_ctx.moveTo(x + 0.7 * dir.x - 0.3 * dir.y , y + 0.7* dir.y + 0.3 * dir.x);
        minimap_ctx.lineTo(x + 1.3 * dir.x , y + 1.3 * dir.y);
        minimap_ctx.lineTo(x + 0.7 * dir.x + 0.3 * dir.y , y + 0.7 * dir.y - 0.3 * dir.x);
        minimap_ctx.lineTo(x + 0.7 * dir.x - 0.3 * dir.y , y + 0.7* dir.y + 0.3 * dir.x);
        minimap_ctx.fillStyle = 'Salmon';
        minimap_ctx.fill();
        minimap_ctx.strokeStyle = 'OrangeRed';
        minimap_ctx.stroke();

    }
}

function drawMiniMapEgoCenter(pos){
    if(minimapOnOff){
        const scale = 1/1807/100;
        const scale2 = 8.5;
        const x = (0.5-(0.5+(pos.x - 24338.93445296312 + 2000)*scale)*scale2 )*minimap_width;
        const y = (0.5-(0.5+(pos.y - 32736.594012823894)*scale)*scale2 )*minimap_height;
        
        //
        minimap_ctx.clearRect(0,0,canvas.width,canvas.height);
        minimap_ctx.drawImage(minimap_img,x,y,scale2*minimap_width,scale2*minimap_height);

        //Draw Axes
        minimap_ctx.strokeStyle = '#5224';
        minimap_ctx.beginPath();
        minimap_ctx.moveTo(0, minimap_height/2);
        minimap_ctx.lineTo(minimap_width, minimap_height/2);
        minimap_ctx.stroke();

        minimap_ctx.beginPath();
        minimap_ctx.moveTo(minimap_width/2, 0);
        minimap_ctx.lineTo(minimap_width/2, minimap_height);
        minimap_ctx.stroke();

        //Draw Ego-Center
        minimap_ctx.beginPath();
        minimap_ctx.arc(minimap_width/2, minimap_height/2, 4, 0, 2 * Math.PI, false);
        minimap_ctx.fillStyle = '#a66';
        minimap_ctx.fill();
        minimap_ctx.strokewidth=8;
        minimap_ctx.strokeStyle = '#a42';
        minimap_ctx.stroke();

        //Draw direction arrow
        const dir = (new Vector2(pos.x - camera.position.x, pos.y - camera.position.z)).normalize().multiplyScalar(10);
        minimap_ctx.beginPath();
        minimap_ctx.moveTo(minimap_width/2 + 0.7 * dir.x - 0.3 * dir.y , minimap_height/2 + 0.7* dir.y + 0.3 * dir.x);
        minimap_ctx.lineTo(minimap_width/2 + 1.3 * dir.x , minimap_height/2 + 1.3 * dir.y);
        minimap_ctx.lineTo(minimap_width/2 + 0.7 * dir.x + 0.3 * dir.y , minimap_height/2 + 0.7 * dir.y - 0.3 * dir.x);
        minimap_ctx.lineTo(minimap_width/2 + 0.7 * dir.x - 0.3 * dir.y , minimap_height/2 + 0.7* dir.y + 0.3 * dir.x);
        minimap_ctx.fillStyle = '#a66';
        minimap_ctx.fill();
        minimap_ctx.strokeStyle = '#a42';
        minimap_ctx.stroke();

        //Draw Scale bar
        minimap_ctx.beginPath();
        const barwidth = scale*scale2*minimap_width*1000*5;
        minimap_ctx.moveTo(10, minimap_height - 15);
        minimap_ctx.lineTo(10, minimap_height - 10);
        minimap_ctx.lineTo(10 + barwidth, minimap_height - 10);
        minimap_ctx.lineTo(10 + barwidth, minimap_height - 15);
        minimap_ctx.strokeStyle = '#000';
        minimap_ctx.stroke();
        minimap_ctx.font = '13px serif';
        minimap_ctx.fillStyle = 'Black';
        minimap_ctx.fillText('5km', 10 + barwidth/2 - 11, minimap_height - 15);

    }
}

function subMenuOnOff(divname){

    if(divname=='minimapdiv' && minimapOnOff==null){
        return;
    }

    const div = document.getElementById(divname);
    if(div.style.getPropertyValue('display') === 'none'){
        div.style.setProperty('display','flex');
        if(divname == "minimapdiv"){
            minimapOnOff=true;
        }
    }
    else{
        div.style.setProperty('display','none');
        if(divname == "minimapdiv"){
            minimapOnOff=false;
        }
    }
}
window.subMenuOnOff = subMenuOnOff;

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Loaders
 */
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)
const terrGroup = new THREE.Group()
scene.add(terrGroup)
const unitGroup = new THREE.Group()
scene.add(unitGroup)
const wallGroup = new THREE.Group()
scene.add(wallGroup)

/** 
 * Surface Material
 */
const surfaceMaterial = new THREE.MeshStandardMaterial({ color: "rgb(158,102,76)" })

/** 
 * Surface GLTF loader
 */
let galecraterloaded = false
let galecrater
// marsGale_small.glb info
// z = [ 4.491 , -7.20817 ]
// dz = 11.7
// lattitude = [ -4.92204864 deg , -4.56553237 deg ]
// d lat = 0.35651627
// mars equatorial radius = 3396.2 km
// d lat distance = 21.132 km
// scale =  d lat distance / dz = 21.132 * 1000 / 11.7 = 1806.8
const scale = 1807
 gltfLoader.load(
    //'/models/galecrater_whole.glb',
    '/models/marsGale_small.glb',
    (gltf) =>
    {
        gltf.scene.scale.set(scale, scale/3, scale)
        gltf.scene.children[0].material = surfaceMaterial
        galecrater = gltf.scene.children[0]
        galecrater.scale.set(scale, scale/3, scale)
        gltf.castShadow = true
        gltf.receiveShadow = true
        console.log("marsGale_small.glb")
        console.log(gltf.scene.children[0])

        terrGroup.add(gltf.scene.children[0])

        galecraterloaded = true
    }
)
// small map range
// SE end Vector3 {x:5285.414646397998, y: 4420.744278151819, z: 8126.512183287417 }
// NW end Vector3 {x: -5669.290726929358, y: -2076.9463558085786, z: -13023.937859721813}
//const smallMapCenter = new THREE.Vector2((5285.414646397998-5669.290726929358)/2, (8126.512183287417+-13023.937859721813)/2);


//let galecraterSurrounding = new THREE.Group()
let galecraterSurrounding ;
let galecraterSurroundingloaded = false

gltfLoader.load(
    '/models/galecrater_whole.glb',
    (gltf) =>
    {
        galecraterSurrounding = gltf.scene.children[0]
        gltf.scene.scale.set(scale, scale/3, scale)
        gltf.scene.children[0].material = surfaceMaterial
        gltf.scene.children[0].scale.set(scale, scale/3, scale)
        gltf.scene.children[0].position.set(10010, (-5486)/3 - 2.9, 71324)
        gltf.castShadow = true
        gltf.receiveShadow = true
        console.log("galecrater_whole")
        console.log(gltf.scene.children[0])

        terrGroup.add(gltf.scene.children[0])
        galecraterSurroundingloaded=true;
    }
)

/**
 * Kapi Model
 */
const pos2d = new Vector2( -3909.3483087669174, -8719.643177587659);
const maxHeight = 80000;

let mixer = null
let capybaraAnimation
let action
let capibaraScene

gltfLoader.load(
    '/models/capybara.glb',
    (gltf) =>
    {
        capibaraScene = gltf.scene
        capybaraAnimation = gltf.animations
         
        capibaraScene.scale.set(.3, .3, .3)
        capibaraScene.position.set(pos2d.x, -2118.8256403156556/3 , pos2d.y)
        unitGroup.add(capibaraScene)
 
        // Animation
        mixer = new THREE.AnimationMixer(capibaraScene)
        action = mixer.clipAction(capybaraAnimation[1])
        action.play()
    }
)

function materialClone (gltfmodel){
    gltfmodel.traverse(function(child){
        if (child.isMesh) {
        child.material = child.material.clone()
    }})
}

/**
 * Egyptian Test Model
 */
let egyptianScene;
let egyptianLoaded = false

 gltfLoader.load(
     '/aeoliscity/Temple/Temple_Administrator.glb',
     (gltf) =>
     {
        egyptianScene = gltf.scene
          
        egyptianScene.scale.set(.3, .3, .3)
        egyptianScene.position.set(pos2d.x, (-2118.8256403156556 -1)/3 + 11, pos2d.y +1500)
        terrGroup.add(egyptianScene)
        egyptianLoaded = true 

        materialClone(egyptianScene)

        let egLight1 = new THREE.SpotLight( 0xffffff, 1.7 );
         egLight1.angle = Math.PI/10;
         egLight1.penumbra = 1;
         egLight1.distance = 10000;
         egLight1.decay = 2;

        egLight1.castShadow = true;
        egLight1.shadow.mapSize.width = 512;
        egLight1.shadow.mapSize.height = 512;
        egLight1.shadow.camera.near = 10;
        egLight1.shadow.camera.far = 200;
        egLight1.shadow.focus = 1;

        egLight1.position.copy(egyptianScene.position).add(new Vector3(0, 1000, 220))
        egLight1.target.position.copy(egLight1.position).add(new Vector3(0, -2000, 0))
        egLight1.target.updateMatrixWorld();

        //scene.add( egLight1 );


        let egLight2 = new THREE.SpotLight( 0xffffff, 2. );
         egLight2.angle = Math.PI;
         egLight2.penumbra = 1;
         egLight2.distance = 10000;
         egLight2.decay = 2;

        egLight2.castShadow = true;
        egLight2.shadow.mapSize.width = 512;
        egLight2.shadow.mapSize.height = 512;
        egLight2.shadow.camera.near = 10;
        egLight2.shadow.camera.far = 200;
        egLight2.shadow.focus = 1;

        egLight2.position.copy(egyptianScene.position).add(new Vector3(0, 0, 45))
        egLight2.target.position.copy(egLight1.position).add(new Vector3(0, 120, 700))
        egLight2.target.updateMatrixWorld();

        //scene.add( egLight2 );
     }
 )

 gltfLoader.load(
    '/aeoliscity/Temple/Temple_Library.glb',
    (gltf) =>
    {
        let TempleLibraryScene = gltf.scene
        TempleLibraryScene.position.set(pos2d.x - 500, (-2118.8256403156556 -1)/3 - 1, pos2d.y + 700)
        materialClone(TempleLibraryScene)
        terrGroup.add(TempleLibraryScene)
    }
)

gltfLoader.load(
    '/aeoliscity/Temple/Temple_Museum.glb',
    (gltf) =>
    {
        let TempleMuseumScene = gltf.scene
        TempleMuseumScene.position.set(pos2d.x + 1500, (-2118.8256403156556 -1)/3 - 15 , pos2d.y + 1000)
        TempleMuseumScene.rotation.y = -Math.PI/2;
        materialClone(TempleMuseumScene)
        terrGroup.add(TempleMuseumScene)
    }
)

gltfLoader.load(
    '/aeoliscity/Temple/Temple_Pyramid.glb',
    (gltf) =>
    {
        let TemplePyramidScene = gltf.scene
        console.log(TemplePyramidScene)
        TemplePyramidScene.position.set(pos2d.x + 12000, (-2118.8256403156556 -1)/3 , pos2d.y - 8000)
        TemplePyramidScene.rotation.y = - Math.PI 
        materialClone(TemplePyramidScene)
        terrGroup.add(TemplePyramidScene)
    }
)


/**
 * Shop Model
 */
let shopScene;
let shopLoaded = false

 gltfLoader.load(
     '/aeoliscity/Village/Shop_Simple.glb',
     (gltf) =>
     {
        shopScene = gltf.scene
        materialClone(shopScene)
        shopScene.scale.set(2.5, 2.5, 2.5)
        shopScene.position.set(pos2d.x+300, (-2118.8256403156556 -1)/3 - 3.5 , pos2d.y + 40)
        shopScene.rotation.y = Math.PI/2;
        terrGroup.add(shopScene)
        shopLoaded = true 

        let shopScene1 = shopScene.clone()
        materialClone(shopScene1)
        shopScene1.position.set(pos2d.x+300, (-2118.8256403156556 -1)/3 + 0.5 , pos2d.y + 160)
        terrGroup.add(shopScene1)

        

     }
 )

 let VillageRoadScene
 gltfLoader.load(
    '/aeoliscity/Village/Village_Road.glb',
    (gltf) =>
    {
       VillageRoadScene = gltf.scene
       materialClone(VillageRoadScene)
       VillageRoadScene.scale.set(1, 1, 1)
       VillageRoadScene.position.set(pos2d.x+ 200, (-2118.8256403156556 -1)/3 + 0.5 , pos2d.y + 10)
       VillageRoadScene.rotation.y = Math.PI/2;

       for(let i = 5; i < 13; i++){
            VillageRoadScene = VillageRoadScene.clone()
            VillageRoadScene.position.set(pos2d.x+ 240, (-2118.8256403156556 -1)/3 -1 +1.5*i , pos2d.y -4 + i * 40)
            terrGroup.add(VillageRoadScene)
        }
     


    //    let shopScene1 = shopScene.clone()
    //    materialClone(shopScene1)
    //    shopScene1.position.set(pos2d.x+300, (-2118.8256403156556 -1)/3 + 0.5 , pos2d.y + 160)
    //    terrGroup.add(shopScene1)

       

    }
)

/**
 * Kapi Neighbor
 */
let mixer2 = null
let action2
let capybaraAnimation2
let capibaraScene2

 gltfLoader.load(
    '/models/capybara.glb',
    (gltf) =>
    { 
        capibaraScene2 = gltf.scene
        capybaraAnimation2 = gltf.animations
         
        capibaraScene2.scale.set(.2, .2, .2)
        capibaraScene2.position.set(pos2d.x+5, (-2118.8256403156556 +0.2)/3, pos2d.y)
        capibaraScene2.rotation.y = - Math.PI / 2
        scene.add(capibaraScene2)
 
        // Animation
        mixer2 = new THREE.AnimationMixer(capibaraScene2)
        action2 = mixer2.clipAction(capybaraAnimation2[2])
        action2.play()
    }
)

let mixer3 = null
gltfLoader.load(
    '/aeoliscity/Animals/Animals_Chicken.glb',
    (gltf) =>
    {
        let chickenScene = gltf.scene
        let chickenAnimation = gltf.animations
        chickenScene.position.set(pos2d.x - 3, -2118.8256403156556/3 - 0.3 , pos2d.y - 27)
        unitGroup.add(chickenScene)
        console.log(gltf.animations)
        mixer3 = new THREE.AnimationMixer(chickenScene)
        let action3 = mixer3.clipAction(chickenAnimation[0])
        action3.play()
    }
)

/**
 * Beacon
 */
let beaconHeight = 8;
const beaconMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
const beaconGeometry = new THREE.SphereGeometry(0.5, 4, 2)
const beaconMesh = new THREE.Mesh( beaconGeometry, beaconMaterial)
beaconMesh.position.set(pos2d.x, -2118.8256403156556 /3 + beaconHeight , pos2d.y)
Sphere.castShadow = true
beaconMesh.layers.enable(1);
scene.add( beaconMesh )

 

/**
 * Sun (Glow sphere)
 */
const sunDistance = 100 * 1000
const sunGeometry = new THREE.SphereGeometry(Math.tan(0.1765 * 2 * Math.PI / 180 ) * sunDistance, 64 , 64)
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
const sunMesh = new THREE.Mesh( sunGeometry, sunMaterial)
sunMesh.position.set(0, sunDistance, 0)
sunMesh.layers.enable(1);
scene.add( sunMesh )

const ambientlight = new THREE.AmbientLight(0xffffff, 100);
ambientlight.layers.set(1);
scene.add(ambientlight);

/**
 * Lights
 */
const hemisphereLight = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.2 );
hemisphereLight.position.set( 0, 0, 0);
scene.add( hemisphereLight );

const directionalLight = new THREE.DirectionalLight(0xBEB4A2, 0.4)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 1000
directionalLight.shadow.camera.top =1
directionalLight.shadow.camera.right = 1
directionalLight.shadow.camera.bottom = 1

let sundir = new Vector3(0, 10000, 0);
const lat = Math.PI / 180 * (-4.74);
const marstilt = Math.PI / 180 * (-25);
let season = Math.random() * 2 * Math.PI;
scene.add(directionalLight)

// spot light for target
let spotLight2 = new THREE.SpotLight( 0xffffff, 1 );
spotLight2.angle = Math.PI / 16;
spotLight2.penumbra = 0;
spotLight2.decay = 0;
spotLight2.distance = 2*beaconHeight;

spotLight2.castShadow = true;
spotLight2.shadow.mapSize.width = 512;
spotLight2.shadow.mapSize.height = 512;
spotLight2.shadow.camera.near = 10;
spotLight2.shadow.camera.far = 200;
spotLight2.shadow.focus = 1;

scene.add( spotLight2 );

// head light for kapi
// let spotLight3 = new THREE.SpotLight( 0xffffff, 1 );
// spotLight3.angle = Math.PI/9;
// spotLight3.penumbra = 0.5;
// spotLight3.distance = 20000;
// spotLight3.decay = 2;


// spotLight3.castShadow = true;
// spotLight3.shadow.mapSize.width = 512;
// spotLight3.shadow.mapSize.height = 512;
// spotLight3.shadow.camera.near = 10;
// spotLight3.shadow.camera.far = 200;
// spotLight3.shadow.focus = 1;

// spotLight3.position.set(pos2d.x, (-2118.8256403156556 -1)/3 -500, pos2d.y +1300)
// spotLight3.target.position.set(pos2d.x, (-2118.8256403156556 -1)/3 + 11, pos2d.y +1500)
// spotLight3.target.updateMatrixWorld();

// scene.add( spotLight3 );

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
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    //renderer.localClippingEnabled =true
    console.log(renderer)
})

/**
 * Mouse cursor
 */
const mouse = new THREE.Vector2()
window.addEventListener('mousemove', (_event)=>
{
    mouse.x = _event.clientX / sizes.width * 2 - 1
    mouse.y = - (_event.clientY / sizes.height ) * 2 + 1
})

let mouseOnClick = false
window.addEventListener('dblclick', (event)=>
{
    //event.preventDefault()
    mouseOnClick = true
})

window.addEventListener('touchend', (_event)=>
{
    mouse.x = _event.clientX / sizes.width * 2 - 1
    mouse.y = - (_event.clientY / sizes.height ) * 2 + 1
    mouseOnClick = true
})

/**
 * Keyboard
 *  - W: forward
 * - S: backward
 * - A: left
 * - D: right
 * - Q: up
 * - E: down
 * - R: reset
 * - F: fullscreen
 * - P: pause
 * - M: mute
 * - N: next
 * - B: beacon
 * - C: capybara
 * - T: sun
 * - G: ground
 * - L: light
 * - O: ocean
 * - K: kapi
 * - I: island
 * - J: japan
 * - H: house
 * - Z: zoom
 * - X: zoom out
 * - V: zoom in
 **/
let keyboardMoveInput = 0;
let pressedKeys = {
    W: false,
    S: false,
    A: false,
    D: false,
}

window.addEventListener('keydown', (event)=>{
    if (event.key === 'w' && !pressedKeys.W){
        pressedKeys.W = true;
        keyboardMoveInput += 1;
    }
    else if (event.key === 's' && !pressedKeys.S){
        pressedKeys.S = true;
        keyboardMoveInput += 1;
    }
    else if (event.key === 'a' && !pressedKeys.A){
        pressedKeys.A = true;
        keyboardMoveInput += 1;
    }
    else if (event.key === 'd' && !pressedKeys.D){
        pressedKeys.D = true;
        keyboardMoveInput += 1;
    }

    // if (event.key === 'e'){
    //     camera.position.y -= 50
    // }
    // if (event.key === 'r'){
    //     camera.position.set(0, 0, 0)
    //     camera.rotation.set(0, 0, 0)
    // }
    // if (event.key === 'f'){
    //     if (document.fullscreenElement)
    //         document.exitFullscreen()
    //     else
    //         document.documentElement.requestFullscreen()
    // }
    // if (event.key === 'p'){
    //     paused = !paused
    // }
    // if (event.key === 'm'){
    //     muted = !muted
    // }
    // if (event.key === 'n'){
    //     season += Math.PI / 2
    //     season = season % (2 * Math.PI)
    // }
    // if (event.key === 'b'){
    //     beaconHeight += 50
    // }
    // if (event.key === 'c'){
    //     capybaraHeight += 50
    // }
    // if (event.key === 't'){
    //     sunHeight += 50
    // }
    // if (event.key === 'g'){
    //     groundHeight += 50
    // }
    // if (event.key === 'l'){
    //     lightHeight += 50
    // }
    // if (event.key === 'o'){
    //     oceanHeight += 50
    // }
    // if (event.key === 'k'){
    //     kapiHeight += 50
    // }
})

window.addEventListener('keyup', (event)=>{
    if (event.key === 'w' && pressedKeys.W){
        pressedKeys.W = false;
        keyboardMoveInput -= 1;
    }
    else if (event.key === 's' && pressedKeys.S){
        pressedKeys.S = false;
        keyboardMoveInput -= 1;
    }
    else if (event.key === 'a' && pressedKeys.A){
        pressedKeys.A = false;
        keyboardMoveInput -= 1;
    }
    else if (event.key === 'd' && pressedKeys.D){
        pressedKeys.D = false;
        keyboardMoveInput -= 1;
    }
})

/**
 * Camera
 */
// Base camera 
const camera = new THREE.PerspectiveCamera(40, sizes.width / sizes.height, 1, 110 * 1000)
scene.add(camera)


/**
 * Kapi House Model High Resolution
 */
let kapiHouseSceneHRLoaded = false
let kapiHouseSceneLRLoaded = false
let kapiHouseSceneHR
let kapiHouseSceneLR
let ROI_coordinate = []
let secondFloorMaterials = []
let distanceToHouse
let kapiHouseClonePosition = new Vector3(0, 0, 0)
let kapiMyHouse 


gltfLoader.load(
    '/aeoliscity/Village/house_simple.glb',
    (gltf) =>
    {
        kapiHouseSceneHR = gltf.scene
        kapiHouseSceneHR.position.set(pos2d.x - 30, (-2118.8256403156556 -1)/3 - 5 , pos2d.y + 10)
        kapiHouseSceneHR.rotateOnAxis(new Vector3(1, 0, 0), - 0.04)
        kapiHouseSceneHR.rotateOnAxis(new Vector3(0, 1, 0), Math.PI)
        kapiHouseSceneHR.castShadow = true
        kapiHouseSceneHR.receiveShadow = true
        kapiHouseSceneHRLoaded = true
        
        for(let i = -20; i < 20; i++){
            for (let j = 0; j < 20; j++){
                kapiHouseClonePosition.set(pos2d.x + i * 55, (-2118.8256403156556 -1)/3 - 8, pos2d.y - 50 - j * 55)
                distanceToHouse = camera.position.clone().distanceTo(kapiHouseClonePosition) 
                if (distanceToHouse < 300){
                    let kapiHouseHRClone = kapiHouseSceneHR.clone()
                    materialClone(kapiHouseHRClone)
                    kapiHouseHRClone.position.set(pos2d.x + i * 55, (-2118.8256403156556 -1)/3 - 8, pos2d.y - 50 - j * 55)
                    terrGroup.add(kapiHouseHRClone)
                }
            }
        }  

        //kapiMyHouse = kapiHouseSceneHR.getObjectByName('MyHouse')
        kapiMyHouse = kapiHouseSceneHR.clone();
        kapiMyHouse.rotateOnAxis(new Vector3(0, 1, 0), Math.PI)
        kapiMyHouse.position.set(pos2d.x, (-2118.8256403156556 -1)/3 - 8 + 10, pos2d.y + 50)
        //make the house transparent
        kapiMyHouse.traverse(function(child) {
            if (child.isMesh) {
                child.material = child.material.clone();
                child.material.transparent = true;
                child.material.opacity = 0.3;
            }
        });
        unitGroup.add(kapiMyHouse);

        //make it visible when hold the shift key
        kapiMyHouse.visible = false;
        window.addEventListener('keydown', (event)=>{
            if (event.key === 'q'){
                kapiMyHouse.visible = !kapiMyHouse.visible;
            }
        })
        // window.addEventListener('keyup', (event)=>{
        //     if (event.key === 'q'){
        //         kapiMyHouse.visible = false;
        //     }
        // }
        // )
    } 
)

/** 
 * Kapi House Model Low Resolution
 */

gltfLoader.load(
    '/aeoliscity/Village/House_Simple_LR.glb',
    (gltf) =>
    {
        kapiHouseSceneLR = gltf.scene
        kapiHouseSceneLR.position.set(pos2d.x, (-2118.8256403156556 -1)/3 - 8, pos2d.y - 50)
        kapiHouseSceneLR.rotateOnAxis(new Vector3(1, 0, 0), - 0.04)
        kapiHouseSceneLR.rotateOnAxis(new Vector3(0, 1, 0), Math.PI)
        kapiHouseSceneLR.castShadow = true 
        kapiHouseSceneLR.receiveShadow = true

        for(let i = -20; i < 20; i++){
            for (let j = 0; j < 20; j++){
                kapiHouseClonePosition.set(pos2d.x + i * 55, (-2118.8256403156556 -1)/3 - 8, pos2d.y - 50 - j * 55)
                distanceToHouse = camera.position.clone().distanceTo(kapiHouseClonePosition) 
                if (distanceToHouse > 300){
                    let kapiHouseHRClone = kapiHouseSceneLR.clone()
                    kapiHouseHRClone.position.set(pos2d.x + i * 55, (-2118.8256403156556 -1)/3 - 8, pos2d.y - 50 - j * 55)
                    terrGroup.add(kapiHouseHRClone)
                }
            }
        } 
    }
)


// In the tick function
// if (kapiHouseSceneHRLoaded && kapiHouseSceneLRLoaded){
//     change the object HR to LR or LR to HR based on the distance from the camera to each object
// }

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
//renderer.outputEncoding = sRGBEncoding

/**
 * Controls
 */
const controls = new OrbitControls( camera, renderer.domElement)
// controls.mouseButtons = {
// 	LEFT: THREE.MOUSE.ROTATE,
// 	MIDDLE: THREE.MOUSE.DOLLY,
// 	RIGHT: THREE.MOUSE.PAN,
// }
// controls.target = beaconMesh.position;
controls.minDistance = 12;
controls.maxDistance = 50;
let beaconCamDistance = 50;
controls.maxPolarAngle = Math.PI/2///1.7 // / 2.5;
controls.mouseButtons = {
	LEFT: THREE.MOUSE.ROTATE,
	MIDDLE: THREE.MOUSE.DOLLY,
	RIGHT: THREE.MOUSE.DOLLY_PAN,
}
controls.touches = {
	ONE: THREE.MOUSE.ROTATE,
	TWO: THREE.TOUCH.DOLLY,//THREE.TOUCH.DOLLY_PAN
}
controls.target.copy( beaconMesh.position );
controls.update();
controls.maxDistance = 120;

/**
 * Background & Fog Colors debug GUI
 */
// Background 
let backgroundColor = Color.hsl(216, 6, 15)
//debugObject.backgroundColor = backgroundColor.hex()//"#B89B95"
renderer.setClearColor(backgroundColor.hex())

//Fog
const near = 100
const far = 160000
scene.fog = new THREE.Fog(backgroundColor.hex() , near , far );

/**
 * Raycaster
 */
const raycaster_far = new THREE.Raycaster()
const raycaster = new THREE.Raycaster()
raycaster.far = 10
const jmpthr = 3.;

// raycaster.params.Points.threshold = 0.1
// raycaster.params.Line.threshold = 0.1
// raycaster.params.Mesh.threshold = 0.1
// ground setting
const groundObjs = [galecrater,galecraterSurrounding];
function getIntersect(){
    raycaster_far.setFromCamera(mouse, camera);
    let intersects = raycaster_far.intersectObjects(groundObjs);
    if (intersects.length > 0) {
        return intersects[0]
    }
    return null
}

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0
let vel= new Vector2(0,0);
let target2d = new Vector2(0,0);
let kapiOnRun = -1;
const marsdayDOM = document.getElementById('marsday');

let marsDays = 0 * Date.now()/1000;
let timespeed = 150.;
const marsYearInmarsDay = 687 * 24 / ( 24 + 37 / 60);

let reportTime = 0;

/**
 * Outline and Post Processing
 */
// let effectFXAA
//let selectedObjects = [];
// let composer = new EffectComposer( renderer );
// let renderPass = new RenderPass( scene, camera );
// composer.addPass( renderPass );
// let outlinePass = new OutlinePass( new THREE.Vector2( window.innerWidth, window.innerHeight ), scene, camera );
// outlinePass.edgeStrength = 8.0
// outlinePass.edgeThickness = 10.0
// renderPass.renderToScreen = true
// outlinePass.renderToScreen = true

// outlinePass.visibleEdgeColor.set('#ffffff');
// outlinePass.hiddenEdgeColor.set('#190a05');
// composer.addPass( outlinePass );

// effectFXAA = new ShaderPass( FXAAShader );
// effectFXAA.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight );
// composer.addPass( effectFXAA );

// function addSelectedObject( object ) {

//     selectedObjects = [];
//     selectedObjects.push( object );

// }

const tick = () =>
{

    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    reportTime += deltaTime;
    if(reportTime > 0.03 && capibaraScene){
        reportTime = 0;
        socket.emit('set',{'attr':'pos3d', 'val':{x:capibaraScene.position.x , y:capibaraScene.position.y , z:capibaraScene.position.z}});
    }           

    const marsDayInSec = 24*3600 + 37*60;
    marsDays += deltaTime * timespeed /marsDayInSec
    const days = Math.floor(marsDays + 0.5);
    const hours = Math.floor( (marsDays + 0.5 - days) * marsDayInSec / 3600 );
    const minutes = Math.floor((marsDays + 0.5 - days) * marsDayInSec / 60 - hours * 60);
    const seconds = Math.floor((marsDays + 0.5 - days) * marsDayInSec % 60);
    if(marsdayDOM){
        marsdayDOM.innerText = `${days} days ${hours} hours ${minutes} minutes ${seconds} seconds`;
    }

    // Update controls
    controls.update()

    // Cast a ray 
    if (galecraterloaded){

        // update beacon
        let beaconCamDiff = beaconMesh.position.distanceTo(camera.position) - beaconCamDistance;
        beaconCamDistance += beaconCamDiff;
        
        beaconCamDiff = beaconCamDiff * 0.102;
        beaconMesh.position.y += beaconCamDiff;
        camera.position.y += beaconCamDiff;
        beaconHeight += beaconCamDiff;
        controls.minPolarAngle = Math.PI/2 + 2.4 * (1 / ((beaconHeight-8)*1.3+8) - 0.2 );
        controls.maxPolarAngle = Math.PI/2 + 2.4 * (1 / ((beaconHeight-8)*1.3+8)  - 0.2 );
        //console.log(capibaraScene.position.y - camera.position.y)

        // Debug mode
        // controls.minPolarAngle = 0;
        // controls.maxPolarAngle = Math.PI;
        // controls.maxDistance = 100000;
        
        // Simulate sun movement and light color
        sundir = new THREE.Vector3(0,1,0);
        sundir.applyAxisAngle( new Vector3(0,0,1), marsDays/marsYearInmarsDay * Math.PI * 2);
        sundir.applyAxisAngle( new Vector3(1,0,0), - marstilt );
        sundir.applyAxisAngle( new Vector3(0,0,1), (marsDays)*2*Math.PI );
        sundir.applyAxisAngle( new Vector3(1,0,0), - lat );
        directionalLight.position.copy(sundir);
        const sunind = sundir.dot(new Vector3(0,1,0));
        timespeed = 0
        //timespeed = sunind > 0 ? 300 : 900;
        sunMesh.position.copy(sundir.multiplyScalar(sunDistance));
        directionalLight.intensity = ( sunind > 0.2 ? 0.6 : (sunind < -0.2 ? 0 : 0.3+ 0.6/0.4 * sunind));
        const suhem = [ 0.82 , 0.3, 0.];
        const suran = [ 0.08 * 2 , -0.152 ];
        
        let sunint = ( sunind > suran[0] ? suhem[0] :
            ( sunind < suran[1] ? suhem[2] :
                ( sunind > 0 ? suhem[1] - (suhem[1]-suhem[0])*sunind/suran[0] :
                suhem[1] - (suhem[1]-suhem[2])*sunind/suran[1] ) ));
        hemisphereLight.intensity = sunint;
        sunint = (sunint - suhem[2])/(suhem[0]-suhem[2]) * 78 + 5;
        
        const hemicolor = Color.hsl(216, ( sunind > suran[0]*2 ? 12 : 
            ( sunind < suran[1]*2 ? 48 : 
                (12-48)*(0.5*sunind-suran[1])/(suran[0]-suran[1]) + 48 ) ) ,sunint).hex()
        renderer.setClearColor(hemicolor)
        scene.fog.color.set(hemicolor)
        hemisphereLight.color.set(hemicolor);        

        if(kapiOnRun<0){//This is for the initial loading
            raycaster_far.set(new THREE.Vector3(pos2d.x, maxHeight ,pos2d.y), new THREE.Vector3(0,-1,0))
            const intersect = raycaster_far.intersectObject(galecrater)
            if( intersect && intersect.length != 0){
                const pos3d = intersect[0].point;
                capibaraScene.position.copy(pos3d);
                beaconMesh.position.copy(pos3d).add(new THREE.Vector3(0,beaconHeight,0));
                kapiOnRun = 0;
                controls.target = beaconMesh.position;
                camera.updateProjectionMatrix()
            }
            
        }


        //raycaster_far.setFromCamera(new Vector2(0,0), camera)
        raycaster_far.set(camera.position, new THREE.Vector3().copy(capibaraScene.position).sub(camera.position).normalize())
        let intersect = raycaster_far.intersectObjects(terrGroup.children, true )
        //console.log(capibaraScene.position.distanceTo(camera.position))
        if(intersect && intersect.length > 0){
            intersect.forEach( (intersectEl) => {
                //if(intersectEl.distance < 0.99 *capibaraScene.position.distanceTo(camera.position)){
                if(intersectEl.distance <  beaconCamDistance ){
                        intersectEl.object.material.transparent = true;
                    if(intersectEl.object.material.opacity > 0.5){
                        //console.log(intersectEl.object.name)
                        intersectEl.object.material.opacity = 0.15;
                        intersectEl.object.material.needsUpdate = true;
                        window.setTimeout(()=>{
                            intersectEl.object.material.opacity = 1;
                            intersectEl.object.material.needsUpdate = true;
                        },100)
                    }
                }
            })
        }
        


        let newTarget2D = false;
        if (mouseOnClick)
        {
            raycaster_far.setFromCamera(mouse, camera);
            let intersect = raycaster_far.intersectObjects(terrGroup.children , true );
            if(intersect && intersect.length > 0){
                const collidingSurface = intersect[0].point
                target2d = new THREE.Vector2(collidingSurface.x, collidingSurface.z );
                socket.emit('set',{attr:'target2d', val:{x: collidingSurface.x, y: collidingSurface.z}});
                newTarget2D = true;
            }
        }
        mouseOnClick = false;

        if (keyboardMoveInput>0)
        {   
            const dirvec = new THREE.Vector2(camera.position.x, camera.position.z).sub(pos2d).normalize().multiplyScalar(3);
            target2d = new THREE.Vector2().copy(pos2d).sub(
                dirvec.rotateAround(new THREE.Vector2(0,0),
                (
                    (pressedKeys.A ? -1 : 0) +
                    (pressedKeys.D ? 1 : 0) + 
                    (pressedKeys.S ? (pressedKeys.D ? 2 : -2) : 0)
                )*Math.PI/keyboardMoveInput/2));
            
            //socket.emit('set',{attr:'target2d', val:{x: target2d.x, y: target2d.z}});
            newTarget2D = true;
        }

        if(newTarget2D){

            vel.subVectors(target2d, pos2d).normalize().multiplyScalar(40/2);//144/2 km/h
                
            // rotate the object to orient it to the target2d
            const phi = Math.atan2(vel.y, vel.x);
            if(phi){
                const diff = (Math.PI/2- phi) - capibaraScene.rotation.y;
                if(Math.abs(diff)>0.1){
                    capibaraScene.rotation.y = Math.PI/2- phi;
                    kapiMyHouse.rotateOnAxis(new Vector3(0, 1, 0), diff);
                    socket.emit('set',{attr:'rotation', val:capibaraScene.rotation.y});
                }
            }

            //raycaster_far.set(new THREE.Vector3(target2d.x, maxHeight , target2d.y), new THREE.Vector3(0,-1,0))
            //let intersect_vertical = raycaster_far.intersectObjects(terrGroup.children , true );
            //if( intersect_vertical && intersect_vertical.length != 0){
                //console.log("target position:")
                //console.log(intersect_vertical[0].point)
                // spotLight2.position.set(intersect_vertical[0].point.x, intersect_vertical[0].point.y+beaconHeight, intersect_vertical[0].point.z)
                // spotLight2.target.position.copy(intersect_vertical[0].point)
                // spotLight2.intensity = 2.;
                // spotLight2.target.updateMatrixWorld();
                
                // kapi running animation
                if(kapiOnRun!=2){
                    //console.log('kapiOnRun', kapiOnRun)
                    action.stop()
                    action = mixer.clipAction(capybaraAnimation[3])
                    action.play()
                    kapiOnRun = 2;
                    socket.emit('set',{attr:'kapiOnRun', val:kapiOnRun});
                }
            //}
        }

        if(kapiOnRun>0){

            // kapiOnRun
            // -1: abort running
            // 0: standing
            // 1: walking to target
            // 2: running to target

            pos2d.addScaledVector(vel, deltaTime);
            
            // check if kapi arrived
            raycaster.set(new THREE.Vector3(pos2d.x, capibaraScene.position.y+ jmpthr , pos2d.y), new THREE.Vector3(0,-1,0))
            let intersect_vertical = raycaster.intersectObjects(terrGroup.children , true );
            if( pos2d.dot(vel) > target2d.dot(vel)){
                //console.log('kapi arrived')
                kapiOnRun = 0;
            }
            else if(!intersect_vertical || intersect_vertical.length == 0){
                kapiOnRun = -1;
                //console.log('kapi can not reach target')
            }
            
            // check slope
            let pos3d;
            let isStairs;
            if(kapiOnRun>0){
                pos3d = intersect_vertical[0].point;
                isStairs = (intersect_vertical[0].object.name.slice(0,5)=="stair");
                //const normal = intersect_vertical[0].face.normal.normalize();
                //const slope = Math.abs(normal.dot(new THREE.Vector3(0,1,0)));
                //console.log(Math.acos(slope)*180/Math.PI)
                //if( slope < 0.8 || Math.abs(pos3d.y - capibaraScene.position.y) > jmpthr){
                if( !isStairs && Math.abs((pos3d.y - capibaraScene.position.y)/(vel.length()*deltaTime)) > jmpthr){
                    console.log("slope too steep")
                    //console.log(slope)
                    kapiOnRun = -1;
                }
            }

            // check the collision with the wallGroup
            if( !isStairs && kapiOnRun>0){
                const normvel = (new Vector3(vel.x,0,vel.y)).normalize().multiplyScalar(jmpthr/10);
                const feetpos = (new Vector3(0,jmpthr/2,0)).add(capibaraScene.position);
                raycaster.set(feetpos,normvel);
                const travelDist = capibaraScene.position.distanceTo(pos3d);
                let intersect_view = raycaster.intersectObjects( terrGroup.children, true );
                if( intersect_view && intersect_view.length != 0 && intersect_view[0].distance < travelDist + jmpthr/2){
                    //console.log("collision with wall")
                    kapiOnRun = -1;
                }
            }

            // kapi walking animation
            // if( kapiOnRun == 2 && pos2d.distanceTo(target2d) < 12){
            //     vel.multiplyScalar(0.07);
            //     kapiOnRun = 1;
            //     spotLight2.intensity = .3;
            //     action.stop()
            //     action = mixer.clipAction(capybaraAnimation[4])
            //     action.play()

            //     // spotLight3.position.copy(beaconMesh.position)
            //     // spotLight3.target.position.copy(beaconMesh.position).add(new Vector3(vel.x,0,vel.y))
            //     // spotLight3.target.updateMatrixWorld();
            // }

            if( kapiOnRun > 0){
                camera.position.add(new Vector3().subVectors(pos3d, capibaraScene.position));
                capibaraScene.position.copy(pos3d);
                kapiMyHouse.position.copy(pos3d).add(new Vector3(1.3*vel.x,10,1.3*vel.y));
                beaconMesh.position.copy(pos3d).add(new THREE.Vector3(0,beaconHeight,0));
            }
            else{
                if(kapiOnRun == -1){
                    pos2d.addScaledVector(vel, -1*deltaTime);
                    raycaster.set(new THREE.Vector3(pos2d.x, capibaraScene.position.y+ jmpthr , pos2d.y), new THREE.Vector3(0,-1,0))
                    let intersect_vertical2 = raycaster.intersectObjects(terrGroup.children , true );
                    if( intersect_vertical2 && intersect_vertical2.length != 0){
                        pos3d = intersect_vertical2[0].point;
                        camera.position.add(new Vector3().subVectors(pos3d, capibaraScene.position));
                        capibaraScene.position.copy(pos3d);
                        beaconMesh.position.copy(pos3d).add(new THREE.Vector3(0,beaconHeight,0));
                    }
                }
                action.stop()
                action = mixer.clipAction(capybaraAnimation[1])
                action.play()
                kapiOnRun = 0;
                socket.emit('set',{attr:'kapiOnRun', val:kapiOnRun});
                //spotLight2.intensity = 0;
            }
        }
    }
   
    // Model animation
    if(mixer)
    {
        mixer.update(deltaTime)
    }
    if(mixer2)
    {
        mixer2.update(deltaTime)
    }
    if(mixer3)
    {
        mixer3.update(deltaTime)
    }

    // Render
    drawMiniMapEgoCenter(pos2d);
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)

}

tick()