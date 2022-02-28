import '../style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import * as dat from 'lil-gui'
import Stats from 'stats.js'
import { Sphere, TextureLoader, Vector2, Vector3 } from 'three';
const Color = require('color');

//https://threejs.org/examples/webgl_postprocessing_unreal_bloom_selective
//import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
//import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
//import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

/**
 * Stats
 */
const stats = new Stats()
stats.showPanel(0)
document.body.appendChild(stats.dom)

/**
 * Base
 */
// Debug
const debugObject = {}
const gui = new dat.GUI({
    width: 300
})

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

/** 
 * Surface Material
 */
debugObject.surfaceColor = "rgb(158,102,76)"//"#C9C9B6"
const surfaceMaterial = new THREE.MeshStandardMaterial({ color: debugObject.surfaceColor })
// gui
//     .addColor(debugObject, 'surfaceColor')
//     .onChange(() =>
//     {
//         surfaceMaterial.color.set(debugObject.surfaceColor)
//     })
//     .name('surface color')

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
        gltf.scene.scale.set(scale, scale, scale)
        gltf.scene.children[0].material = surfaceMaterial
        galecraterloaded = true
        galecrater = gltf.scene.children[0]
        galecrater.scale.set(scale, scale, scale)
        gltf.castShadow = true
        gltf.receiveShadow = true
        console.log(gltf.scene.children[0])

        scene.add(gltf.scene.children[0])
    }
)

//let galecraterSurrounding = new THREE.Group()
gltfLoader.load(
    '/models/galecrater_whole.glb',
    //'/models/marsGale_small.glb',
    (gltf) =>
    {
        gltf.scene.scale.set(scale, scale, scale)
        gltf.scene.children[0].material = surfaceMaterial
        galecraterloaded = true
        gltf.scene.children[0].scale.set(scale, scale, scale)
        gltf.scene.children[0].position.set(10010, -5490-200, 71325)
        gltf.castShadow = true
        gltf.receiveShadow = true
        console.log(gltf.scene.children[0])

        scene.add(gltf.scene.children[0])
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
        capibaraScene.position.set(pos2d.x, -2118.8256403156556 , pos2d.y)
        scene.add(capibaraScene)
 
        // Animation
        mixer = new THREE.AnimationMixer(capibaraScene)
        action = mixer.clipAction(capybaraAnimation[1])
        action.play()
    }
)

/**
 * Beacon
 */

const beaconHeight = 12;

const beaconMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
const beaconGeometry = new THREE.SphereGeometry(0.5, 4, 2)
//const beaconGeometry = new THREE.IcosahedronGeometry(0.5, 0)
const beaconMesh = new THREE.Mesh( beaconGeometry, beaconMaterial)
beaconMesh.position.set(pos2d.x, -2118.8256403156556 + beaconHeight , pos2d.y)
Sphere.castShadow = true
beaconMesh.layers.enable(1);
scene.add( beaconMesh )

const ambientlight = new THREE.AmbientLight(0xffffff, 100);

 

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

ambientlight.layers.set(1);
scene.add(ambientlight);


debugObject.sunAngularRadius = 0.1765 * 2;
gui
    .add(debugObject, 'sunAngularRadius')
    .min(0)
    .max(30)
    .step(0.01)
    .onChange(()=>
    {
        const multiplier = Math.tan(debugObject.sunAngularRadius * Math.PI / 180 )/ Math.tan(0.1765 * 2 * Math.PI / 180 );
        sunMesh.scale.set(multiplier,multiplier,multiplier);
    })
    .name("sun angular radius(deg)");

/**
 * Lights
 */
const hemisphereLight = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.2 );
hemisphereLight.position.set( 0, 0, 0);
scene.add( hemisphereLight );
// debugObject.hemisphereLightColor = 0xffffff
// gui
//     .addColor(debugObject, 'hemisphereLightColor')
//     .onChange(()=>
//     {
//         hemisphereLight.color.set(debugObject.hemisphereLightColor)
//     })
//     .name('hemisphere light color')

// gui.add(hemisphereLight, 'intensity').min(0).max(1).step(0.01).name('hemisphere light intensity')

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
const season = Math.random() * 2 * Math.PI;
scene.add(directionalLight)
// debugObject.directionalLightColor = 0xBEB4A2
// gui
//     .addColor(debugObject, 'directionalLightColor')
//     .onChange(()=>
//     {
//         directionalLight.color.set(debugObject.directionalLightColor)
//     })
//     .name('directional light color')

// gui.add(directionalLight, 'intensity').min(0).max(1).step(0.01).name('directional light intensity')

// spot light for night

let spotLight = new THREE.SpotLight( 0xffffff, 4 );

spotLight.position.set( -4113.061301220854,  -2146.0129895888986 + 160, -9298.842704613437);
spotLight.angle = Math.PI / 12 * 0;
spotLight.penumbra = 0.1;
spotLight.decay = 1.;

spotLight.target.position.set( pos2d.x , -2140.45183981286 +120 , pos2d.y)
spotLight.target.updateMatrixWorld();

spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 2048;
spotLight.shadow.mapSize.height = 2048;
spotLight.shadow.camera.near = 200;
spotLight.shadow.camera.far = 1500;
spotLight.shadow.focus = 1;

scene.add( spotLight );

debugObject.spotLightOnOff = false;
gui
    .add(debugObject, 'spotLightOnOff')
    .onChange(()=>
    {
        spotLight.angle = Math.PI / 12 * debugObject.spotLightOnOff;
    })
    .name("spot light switch");
debugObject.spotLightColor = 0xffffff
gui
    .addColor(debugObject, 'spotLightColor')
    .onChange(()=>
    {
        spotLight.color.set(debugObject.spotLightColor)
    })
    .name('spot light color')

gui.add(spotLight, 'intensity').min(0).max(8).step(0.01).name('spot light intensity')


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
// let spotLight3 = new THREE.SpotLight( 0xffffff, 6 );
// spotLight3.angle = Math.PI / 12;
// spotLight3.penumbra = 0.1;
// spotLight3.decay = 0.1;

// spotLight3.castShadow = true;
// spotLight3.shadow.mapSize.width = 512;
// spotLight3.shadow.mapSize.height = 512;
// spotLight3.shadow.camera.near = 10;
// spotLight3.shadow.camera.far = 200;
// spotLight3.shadow.focus = 1;

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
window.addEventListener('click', ()=>
{
    mouseOnClick = true
})


/**
 * Camera
 */
// Base camera 
const camera = new THREE.PerspectiveCamera(40, sizes.width / sizes.height, 0.1, 110 * 1000)
//camera.position.set(-10000, 6000, 10000)
//let newvec = new THREE.Vector3(0,100,100).applyAxisAngle(new THREE.Vector3(0,1,0), 20).add(objectSphere.position)
//camera.position.set(newvec.x, newvec.y, newvec.z)
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


// const renderScene = new RenderPass( scene, camera );

// const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
// bloomPass.threshold = 0;
// bloomPass.strength = 0;
// bloomPass.radius = 0;
// bloomPass.renderToScreen = true

// const composer = new EffectComposer( renderer );
// composer.setSize( window.innerWidth, window.innerHeight );

// composer.addPass( renderScene );
// composer.addPass( bloomPass );

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
controls.minDistance = 30;
controls.maxDistance = 60;
controls.maxPolarAngle = Math.PI///1.7 // / 2.5;
controls.mouseButtons = {
	LEFT: null,
	MIDDLE: THREE.MOUSE.DOLLY,
	RIGHT: THREE.MOUSE.ROTATE,
}
controls.touches = {
	ONE: null,
	TWO: THREE.TOUCH.ROTATE,//THREE.TOUCH.DOLLY_PAN
}
controls.target.copy( beaconMesh.position );

/**
 * Background & Fog Colors debug GUI
 */

// Background 
let backgroundColor = Color.hsl(216, 6, 15)
//debugObject.backgroundColor = backgroundColor.hex()//"#B89B95"
renderer.setClearColor(debugObject.backgroundColor)
// gui
//     .addColor(debugObject, 'backgroundColor')
//     .onChange(() =>
//     {
//         renderer.setClearColor(debugObject.backgroundColor)
//     })
//     .name('background color')

//Fog
const near = 100
const far = 160000
scene.fog = new THREE.Fog(backgroundColor.hex() , near , far );
// debugObject.fogColor = "#242629"
// gui
//     .addColor(debugObject, 'fogColor')
//     .onChange(()=>
//     {
//         scene.fog.color.set(debugObject.fogColor)
//     })
//     .name('fog color')
// gui.add(scene.fog, 'near', near, far).listen().min(0).max(100).step(0.01).name('fog near')
// gui.add(scene.fog, 'far', near, far).listen().min(0).max(1000 * 1000).step(0.01).name('fog far')


/**
 * Raycaster
 */
const raycaster = new THREE.Raycaster()


/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0
let vel= new Vector2(0,0);
let target2d = new Vector2(0,0);
let kapiOnRun = -1;

const tick = () =>
{
    stats.begin()

    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Update controls
    controls.update()

    // Cast a ray
    if (galecraterloaded){

        // Simulate sun movement and light color
        sundir = new THREE.Vector3(0,1,0);
        sundir.applyAxisAngle( new Vector3(0,0,1), season );
        sundir.applyAxisAngle( new Vector3(1,0,0), - marstilt );
        sundir.applyAxisAngle( new Vector3(0,0,1), (elapsedTime)/24*Math.PI );
        sundir.applyAxisAngle( new Vector3(1,0,0), - lat );
        directionalLight.position.copy(sundir);
        const sunind = sundir.dot(new Vector3(0,1,0));
        sunMesh.position.copy(sundir.multiplyScalar(sunDistance));
        directionalLight.intensity = 0.5 / (1 + Math.exp( -2 * sunind));
        hemisphereLight.intensity = 0.15 * Math.max(sunind , 0) + 0.12;
        renderer.setClearColor(Color.hsl(216, 12, 6 + 65 * Math.max( sunind , 0)**2 ).hex())
        scene.fog.color.set(Color.hsl(216, 12, 6 + 65 * Math.max( sunind , 0)**2 ).hex())        

        if(kapiOnRun<0){
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

        raycaster.setFromCamera(mouse, camera)
        const intersect = raycaster.intersectObject(galecrater)

        if (mouseOnClick && intersect.length != 0)
        {
            const collidingSurface = intersect[0].point
            target2d = new THREE.Vector2(collidingSurface.x, collidingSurface.z );
            vel.subVectors(target2d, pos2d).normalize().multiplyScalar(60);//216 km/h
            
            // rotate the object to orient it to the target2d
            const phi = Math.atan2(vel.y, vel.x);
            if(phi){
                capibaraScene.rotation.y = Math.PI/2- phi;
            }
            
            raycaster.set(new THREE.Vector3(target2d.x, maxHeight , target2d.y), new THREE.Vector3(0,-1,0))
            const intersect_vertical = raycaster.intersectObject(galecrater)
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
            raycaster.set(new THREE.Vector3(pos2d.x, maxHeight , pos2d.y), new THREE.Vector3(0,-1,0))
            const intersect_vertical = raycaster.intersectObject(galecrater)
            
            if( pos2d.dot(vel) < target2d.dot(vel) && intersect_vertical && intersect_vertical.length != 0){
                
                const pos3d = intersect_vertical[0].point;
                
                camera.position.add(new Vector3().subVectors(pos3d, capibaraScene.position));
                capibaraScene.position.copy(pos3d);
                beaconMesh.position.copy(pos3d).add(new THREE.Vector3(0,beaconHeight,0));
                
                // kapi walking animation
                if( kapiOnRun == 2 && pos2d.distanceTo(target2d) < 15){
                    vel.multiplyScalar(0.2);
                    kapiOnRun = 1;
                    spotLight2.intensity = .3;
                    action.stop()
                    action = mixer.clipAction(capybaraAnimation[4])
                    action.play()
                }
            }
            else {
                action.stop()
                action = mixer.clipAction(capybaraAnimation[1])
                action.play()
                kapiOnRun = 0;
                spotLight2.intensity = 0;

                //spotLight3.position.copy(beaconMesh.position)
                //spotLight3.target.position.copy(beaconMesh.position).add(new Vector3(vel.x,0,vel.y))
                //spotLight3.target.updateMatrixWorld();
            }
        }
    }
    // Update camera look at position
    //let phi = (90 - camera.rotation.y) * Math.PI / 180
    // phi= 0;
    // let newvec = new THREE.Vector3(0,10000,10000).applyAxisAngle(new THREE.Vector3(0,1,0), phi).add(objectSphere.position)
    // camera.position.set(newvec.x, newvec.y, newvec.z)
    //camera.lookAt(beaconMesh.position)

    // Model animation
    if(mixer)
    {
        mixer.update(deltaTime)
    }

    // Render
    renderer.render(scene, camera)
    // composer.render();


    // renderer.clear();
  
    // camera.layers.set(1);
    // composer.render();

    // renderer.clearDepth();
    // camera.layers.set(0);
    // renderer.render(scene, camera);
    

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)

    stats.end()
}

tick()