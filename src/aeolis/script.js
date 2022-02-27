import '../style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import * as dat from 'lil-gui'
import Stats from 'stats.js'
import { Sphere, Vector2, Vector3 } from 'three';

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
gui
    .addColor(debugObject, 'surfaceColor')
    .onChange(() =>
    {
        surfaceMaterial.color.set(debugObject.surfaceColor)
    })
    .name('surface color')

// /**
//  * Lod
//  */
// const lod = new THREE.LOD();

/** 
 * Surface GLTF loader
 */
let galecraterloaded = false
let galecrater
const scale = 2000
 gltfLoader.load(
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



/**
 * Kapi Model
 */

const pos2d = new Vector2(-4050.380443864049, -8434.64537256541);
const maxHeight = 4000;

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
         
        capibaraScene.scale.set(1, 1, 1)
        capibaraScene.position.set(pos2d.x, -2363.1899660890917 , pos2d.y)
 
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

const beaconHeight = 35;

const beaconMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
const beaconGeometry = new THREE.SphereGeometry(1, 4, 2)
const beaconMesh = new THREE.Mesh( beaconGeometry, beaconMaterial)
beaconMesh.position.set(pos2d.x, -2363.1899660890917 + beaconHeight , pos2d.y)
Sphere.castShadow = true
scene.add( beaconMesh )
 
/**
 * Lights
 */
const hemisphereLight = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.6 );
hemisphereLight.position.set( 0, 0, 0);
scene.add( hemisphereLight );
debugObject.hemisphereLightColor = 0xffffff
gui
    .addColor(debugObject, 'hemisphereLightColor')
    .onChange(()=>
    {
        hemisphereLight.color.set(debugObject.hemisphereLightColor)
    })
    .name('hemisphere light color')

gui.add(hemisphereLight, 'intensity').min(0).max(1).step(0.01).name('hemisphere light intensity')

const directionalLight = new THREE.DirectionalLight(0xBEB4A2, 0.6)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 1000
directionalLight.shadow.camera.top =1
directionalLight.shadow.camera.right = 1
directionalLight.shadow.camera.bottom = 1
directionalLight.position.set(0, 7000, 1000)
scene.add(directionalLight)
debugObject.directionalLightColor = 0xBEB4A2
gui
    .addColor(debugObject, 'directionalLightColor')
    .onChange(()=>
    {
        directionalLight.color.set(debugObject.directionalLightColor)
    })
    .name('directional light color')

gui.add(directionalLight, 'intensity').min(0).max(1).step(0.01).name('directional light intensity')

// spot light for sun
let spotLight = new THREE.SpotLight( 0xffffff, .6 );
spotLight.position.set( 0, 200, 200 );
spotLight.position.multiplyScalar( 70 );
scene.add( spotLight );

spotLight.castShadow = true;

spotLight.shadow.mapSize.width = 2048;
spotLight.shadow.mapSize.height = 2048;

spotLight.shadow.camera.near = 200;
spotLight.shadow.camera.far = 1500;

spotLight.shadow.camera.fov = 100;

spotLight.shadow.bias = - 0.005;

debugObject.spotLightColor = 0xffffff
gui
    .addColor(debugObject, 'spotLightColor')
    .onChange(()=>
    {
        spotLight.color.set(debugObject.spotLightColor)
    })
    .name('spot light color')

gui.add(spotLight, 'intensity').min(0).max(1).step(0.01).name('spot light intensity')

// spot light for target
let spotLight2 = new THREE.SpotLight( 0xffffff, 0.2 );
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
let spotLight3 = new THREE.SpotLight( 0xffffff, 6 );
spotLight3.angle = Math.PI / 8;
spotLight3.penumbra = 0.1;
spotLight3.decay = 0;

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
window.addEventListener('click', ()=>
{
    mouseOnClick = true
})


/**
 * Camera
 */
// Base camera 
const camera = new THREE.PerspectiveCamera(40, sizes.width / sizes.height, 0.1, 2000000)
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


/**
 * Controls
 */
const controls = new OrbitControls( camera, renderer.domElement)
controls.minDistance = 2;
controls.maxDistance = 150;
controls.maxPolarAngle = Math.PI/1.8 // / 2.5;
controls.mouseButtons = {
	LEFT: null,
	MIDDLE: THREE.MOUSE.DOLLY,
	RIGHT: THREE.MOUSE.ROTATE,
}
controls.touches = {
	ONE: null,
	TWO: THREE.TOUCH.ROTATE,//THREE.TOUCH.DOLLY_PAN
}
controls.target = beaconMesh.position;

/**
 * Background & Fog Colors debug GUI
 */

// Background 
debugObject.backgroundColor = "#a3a8ae"//"#B89B95"
renderer.setClearColor(debugObject.backgroundColor)
gui
    .addColor(debugObject, 'backgroundColor')
    .onChange(() =>
    {
        renderer.setClearColor(debugObject.backgroundColor)
    })
    .name('background color')

//Fog
const near = 100
const far = 31000
scene.fog = new THREE.Fog("#a3a8ae" , near , far );
debugObject.fogColor = "#a3a8ae"
gui
    .addColor(debugObject, 'fogColor')
    .onChange(()=>
    {
        scene.fog.color.set(debugObject.fogColor)
    })
    .name('fog color')
gui.add(scene.fog, 'near', near, far).listen().min(0).max(100).step(0.01).name('fog near')
gui.add(scene.fog, 'far', near, far).listen().min(0).max(100000).step(0.01).name('fog far')


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
let kapiOnRun = 0;

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

        raycaster.setFromCamera(mouse, camera)
        const intersect = raycaster.intersectObject(galecrater)

        if (mouseOnClick && intersect.length != 0)
        {
            const collidingSurface = intersect[0].point
            target2d = new THREE.Vector2(collidingSurface.x, collidingSurface.z );
            vel.subVectors(target2d, pos2d).normalize().multiplyScalar(200);
            
            // rotate the object to orient it to the target2d
            const phi = Math.atan2(vel.y, vel.x);
            if(phi){
                capibaraScene.rotation.y = Math.PI/2- phi;
            }
            
            pos2d.addScaledVector(vel, deltaTime);
            raycaster.set(new THREE.Vector3(target2d.x, maxHeight , target2d.y), new THREE.Vector3(0,-1,0))
            const intersect_vertical = raycaster.intersectObject(galecrater)
            if( intersect_vertical && intersect_vertical.length != 0){
                
                spotLight2.position.set(intersect_vertical[0].point.x, intersect_vertical[0].point.y+beaconHeight, intersect_vertical[0].point.z)
                spotLight2.target.position.copy(intersect_vertical[0].point)
                spotLight2.target.updateMatrixWorld();
                spotLight2.intensity = 10;
                
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
                
                capibaraScene.position.copy(pos3d);
                beaconMesh.position.copy(pos3d).add(new THREE.Vector3(0,beaconHeight,0));
                
                // kapi walking animation
                if( kapiOnRun == 2 && pos2d.distanceTo(target2d) < 100){
                    vel.multiplyScalar(0.2);
                    action.stop()
                    action = mixer.clipAction(capybaraAnimation[4])
                    action.play()
                    kapiOnRun = 1;
                    spotLight2.intensity = .3;
                }
            }
            else {
                action.stop()
                action = mixer.clipAction(capybaraAnimation[1])
                action.play()
                kapiOnRun = 0;
                spotLight2.intensity = 0;

                spotLight3.position.copy(beaconMesh.position)
                spotLight3.target.position.copy(beaconMesh.position).add(new Vector3(vel.x,0,vel.y))
                spotLight3.target.updateMatrixWorld();
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

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)

    stats.end()
}

tick()