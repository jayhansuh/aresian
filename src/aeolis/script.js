import '../style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { Sphere, TextureLoader, Vector2, Vector3 } from 'three';
const Color = require('color');

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

// /**
//  * Lod
//  */
// const lod = new THREE.LOD();

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
        gltf.scene.children[0].position.set(10010, (-5486-140)/3, 71324)
        gltf.castShadow = true
        gltf.receiveShadow = true
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
        scene.add(capibaraScene)
 
        // Animation
        mixer = new THREE.AnimationMixer(capibaraScene)
        action = mixer.clipAction(capybaraAnimation[1])
        action.play()
    }
)

/**
 * Kapi House Model
 */
let kapiHouseScene;

gltfLoader.load(
    '/architect/soilhouse1.glb',
    (gltf) =>
    {
        kapiHouseScene = gltf.scene
         
        kapiHouseScene.scale.set(.3, .3, .3)
        kapiHouseScene.position.set(pos2d.x, (-2118.8256403156556 -1)/3, pos2d.y -10)
        kapiHouseScene.rotateOnAxis(new Vector3(1, 0, 0), - 0.04)
        kapiHouseScene.rotateOnAxis(new Vector3(0, 0, 1), + 0.03)

        kapiHouseScene.castShadow = true
        kapiHouseScene.receiveShadow = true

        wallGroup.add(kapiHouseScene)
    }
)

/**
 * Egyptian Test Model
 */
let egyptianScene;
let egyptianLoaded = false

 gltfLoader.load(
     '/architect/egyptian.glb',
     (gltf) =>
     {
         egyptianScene = gltf.scene
          
         egyptianScene.scale.set(.3, .3, .3)
         egyptianScene.position.set(pos2d.x, (-2118.8256403156556 -1)/3 + 11, pos2d.y +1500)
         //egyptianScene.rotateOnAxis(new Vector3(1, 0, 0), - 0.04)
         //egyptianScene.rotateOnAxis(new Vector3(0, 0, 1), + 0.03)
         terrGroup.add(egyptianScene)
         egyptianLoaded = true 
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
let spotLight3 = new THREE.SpotLight( 0xffffff, 3 );
spotLight3.angle = Math.PI / 12;
spotLight3.penumbra = 0.1;
spotLight3.distance = 20000;
spotLight3.decay = 2;


spotLight3.castShadow = true;
spotLight3.shadow.mapSize.width = 512;
spotLight3.shadow.mapSize.height = 512;
spotLight3.shadow.camera.near = 10;
spotLight3.shadow.camera.far = 200;
spotLight3.shadow.focus = 1;

scene.add( spotLight3 );

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
 * Camera
 */
// Base camera 
const camera = new THREE.PerspectiveCamera(40, sizes.width / sizes.height, 0.1, 110 * 1000)
scene.add(camera)

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
controls.minDistance = 8;
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
const raycaster = new THREE.Raycaster()
// raycaster.params.Points.threshold = 0.1
// raycaster.params.Line.threshold = 0.1
// raycaster.params.Mesh.threshold = 0.1
// ground setting
const groundObjs = [galecrater,galecraterSurrounding];
function getIntersect(){
    raycaster.setFromCamera(mouse, camera);
    let intersects = raycaster.intersectObjects(groundObjs);
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

let marsDays = 0;
const marsYearInmarsDay = 687 * 24 / ( 24 + 37 / 60);

const tick = () =>
{

    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime
    const marsDayInSec = 24*3600 + 37*60;
    marsDays += deltaTime * 100. /marsDayInSec
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
        const beaconCamDiff = beaconMesh.position.distanceTo(camera.position) - beaconCamDistance;
        beaconMesh.position.y += beaconCamDiff*0.13;
        camera.position.y += beaconCamDiff * 0.13;
        beaconHeight += beaconCamDiff*0.13;
        beaconCamDistance += beaconCamDiff;
        controls.minPolarAngle = Math.PI/2 + 2.2 * (1 / beaconHeight - 0.2 );
        controls.maxPolarAngle = Math.PI/2 + 2.2 * (1 / beaconHeight - 0.2 );
        
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
            raycaster.set(new THREE.Vector3(pos2d.x, maxHeight ,pos2d.y), new THREE.Vector3(0,-1,0))
            const intersect = raycaster.intersectObject(galecrater)
            if( intersect && intersect.length != 0){
                const pos3d = intersect[0].point;
                capibaraScene.position.copy(pos3d);
                beaconMesh.position.copy(pos3d).add(new THREE.Vector3(0,beaconHeight,0));
                kapiOnRun = 0;
                controls.target = beaconMesh.position;
                camera.updateProjectionMatrix()
            }
        }

        raycaster.setFromCamera(mouse, camera);
        let intersect = raycaster.intersectObjects(terrGroup.children , true );

        if (mouseOnClick && intersect.length != 0)
        {
            const collidingSurface = intersect[0].point
            target2d = new THREE.Vector2(collidingSurface.x, collidingSurface.z );
            vel.subVectors(target2d, pos2d).normalize().multiplyScalar(40);//144 km/h
            
            // rotate the object to orient it to the target2d
            const phi = Math.atan2(vel.y, vel.x);
            if(phi){
                capibaraScene.rotation.y = Math.PI/2- phi;
            }
            
            raycaster.set(new THREE.Vector3(target2d.x, maxHeight , target2d.y), new THREE.Vector3(0,-1,0))
            let intersect_vertical = raycaster.intersectObjects(terrGroup.children , true );
            if( intersect_vertical && intersect_vertical.length != 0){
                console.log(intersect_vertical[0].point)
                spotLight2.position.set(intersect_vertical[0].point.x, intersect_vertical[0].point.y+beaconHeight, intersect_vertical[0].point.z)
                spotLight2.target.position.copy(intersect_vertical[0].point)
                spotLight2.intensity = 2.;
                spotLight2.target.updateMatrixWorld();
                
                // kapi running animation
                action.stop()
                action = mixer.clipAction(capybaraAnimation[3])
                action.play()
                kapiOnRun = 2;
            }
        }
        mouseOnClick = false;

        if(kapiOnRun>0){

            pos2d.addScaledVector(vel, deltaTime);
            
            // check if kapi arrived
            const jmpthr = 3.;
            raycaster.set(new THREE.Vector3(pos2d.x, capibaraScene.position.y+ jmpthr , pos2d.y), new THREE.Vector3(0,-1,0))
            let intersect_vertical = raycaster.intersectObjects(terrGroup.children , true );
            if( pos2d.dot(vel) > target2d.dot(vel) || !intersect_vertical || intersect_vertical.length == 0){
                kapiOnRun = 0;
            }
            let pos3d = intersect_vertical[0].point;

            // check slope
            if(kapiOnRun>0){
                const normal = intersect_vertical[0].face.normal.normalize();
                const slope = Math.abs(normal.dot(new THREE.Vector3(0,1,0)));
                //console.log(Math.acos(slope)*180/Math.PI)
                if( slope < 0.8 || Math.abs(pos3d.y - capibaraScene.position.y) > jmpthr){
                    console.log("slope too steep")
                    //console.log(slope)
                    kapiOnRun = 0;
                }
            }

            // check the collision with the wallGroup
            // if(kapiOnRun>0){
            //     raycaster.set(capibaraScene.position, new Vector3(vel.x, 0, vel.y));
            //     const intersect_view = raycaster.intersectObjects(terrGroup, true );
            //     console.log(intersect_view)
            //     if( intersect_view && intersect_view.length != 0 && intersect_view[0].distance < 1000){
            //         console.log("collision with wall")
            //         kapiOnRun = 0;
            //     }
            // }

            // kapi walking animation
            if( kapiOnRun == 2 && pos2d.distanceTo(target2d) < 12){
                vel.multiplyScalar(0.07);
                kapiOnRun = 1;
                spotLight2.intensity = .3;
                action.stop()
                action = mixer.clipAction(capybaraAnimation[4])
                action.play()

                spotLight3.position.copy(beaconMesh.position)
                spotLight3.target.position.copy(beaconMesh.position).add(new Vector3(vel.x,0,vel.y))
                spotLight3.target.updateMatrixWorld();
            }

            if( kapiOnRun > 0){
                camera.position.add(new Vector3().subVectors(pos3d, capibaraScene.position));
                capibaraScene.position.copy(pos3d);
                beaconMesh.position.copy(pos3d).add(new THREE.Vector3(0,beaconHeight,0));
            }
            else {
                action.stop()
                action = mixer.clipAction(capybaraAnimation[1])
                action.play()
                kapiOnRun = 0;
                spotLight2.intensity = 0;
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

    // Render
    drawMiniMap(pos2d);
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)

}

tick()