import '../style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import * as dat from 'lil-gui'
import Stats from 'stats.js'

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
debugObject.surfaceColor = "#C9C9B6"
const surfaceMaterial = new THREE.MeshStandardMaterial({ color: debugObject.surfaceColor })
gui
    .addColor(debugObject, 'surfaceColor')
    .onChange(() =>
    {
        surfaceMaterial.color.set(debugObject.surfaceColor)
    })
    .name('surface color')


/** 
 * Surface GLTF loader
 */
let galecrater
let isGalecraterLoaded = false

const scale = 200
 gltfLoader.load(
    '/models/galecrater.glb',
    (gltf) =>
    {
        galecrater = gltf.scene
        gltf.scene.scale.set(scale, scale, scale)
        gltf.scene.children[0].material = surfaceMaterial
        isGalecraterLoaded = true
        scene.add(gltf.scene)
    }
)


/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

const light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.01 );
light.position.set( 0.5, 1, 0.75 );
scene.add( light );
const helper = new THREE.HemisphereLightHelper( light, 5 );
scene.add( helper );

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.1)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 1000
directionalLight.shadow.camera.top = 1
directionalLight.shadow.camera.right = 1
directionalLight.shadow.camera.bottom = 1
directionalLight.position.set(100, 1000,100)
// scene.add(directionalLight)
// const helper = new THREE.DirectionalLightHelper( directionalLight, 5 );
// //scene.add( helper );

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
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 1, 1000)
//camera.position.set(711, 1000, 431)
camera.position.set(0, 1000, 30)
scene.add(camera)


/**
 * Controls
 */
const controls = new PointerLockControls( camera, document.body );

// doing some stuffs
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

const onKeyDown = function ( event ) {

    switch ( event.code ) {

        case 'ArrowUp':
        case 'KeyW':
            moveForward = true;
            break;

        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = true;
            break;

        case 'ArrowDown':
        case 'KeyS':
            moveBackward = true;
            break;

        case 'ArrowRight':
        case 'KeyD':
            moveRight = true;
            break;

        case 'Space':
            if ( canJump === true ) velocity.y += 350;
            canJump = false;
            break;

    }

};

const onKeyUp = function ( event ) {

    switch ( event.code ) {

        case 'ArrowUp':
        case 'KeyW':
            moveForward = false;
            break;

        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = false;
            break;

        case 'ArrowDown':
        case 'KeyS':
            moveBackward = false;
            break;

        case 'ArrowRight':
        case 'KeyD':
            moveRight = false;
            break;

    }

};

document.addEventListener( 'keydown', onKeyDown );
document.addEventListener( 'keyup', onKeyUp );

let raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );


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
 * Background & Fog Colors debug GUI
 */

// Background 
debugObject.backgroundColor = "#B89B95"
renderer.setClearColor(debugObject.backgroundColor)
gui
    .addColor(debugObject, 'backgroundColor')
    .onChange(() =>
    {
        renderer.setClearColor(debugObject.backgroundColor)
    })
    .name('background color')

//Fog
const near = 5
const far = 2000
scene.fog = new THREE.Fog("#D3BCB6" , near , far );
debugObject.fogColor = "#D3BCB6"

gui
    .addColor(debugObject, 'fogColor')
    .onChange(()=>
    {
        scene.fog.color.set(debugObject.fogColor)
    })
    .name('fog color')
gui.add(scene.fog, 'near', near, far).listen().min(0).max(2000).step(0.01).name('fog near')
gui.add(scene.fog, 'far', near, far).listen().min(0).max(2000).step(0.01).name('fog far')

/**
 * Physics
 */
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();


/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    stats.begin()

    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Update controls
    //controls_.update()

    if (isGalecraterLoaded)
    {
        const screenPosition = controls.getObject().position
        //console.log(galecrater.children[0])
        //const screenPosition = galecrater.children.position.clone()
        //raycaster.setFromCamera( ,)
        const intersects = raycaster.intersectObjects( galecrater.children[0] )
        if (intersects)
        {
            //console.log('intersected')
        }

        // const intersects = raycaster.intersectObject(scene.children, true)
    }

    // raycaster.ray.origin.copy( controls.getObject().position );
	// raycaster.ray.origin.y -= 10;

    const intersections = raycaster.intersectObjects( camera, false );

	const onObject = intersections.length > 0;
    if ( onObject === true ) {

        velocity.y = Math.max( 0, velocity.y );
        canJump = true;

    }

	velocity.x -= velocity.x * 10.0 * deltaTime;
	velocity.z -= velocity.z * 10.0 * deltaTime;
    direction.z = Number( moveForward ) - Number( moveBackward )
    direction.x = Number( moveRight ) - Number( moveLeft )
    direction.normalize()
    if ( moveForward || moveBackward ) velocity.z -= direction.z * 800.0 * deltaTime
	if ( moveLeft || moveRight ) velocity.x -= direction.x * 800.0 * deltaTime

    controls.moveRight( - velocity.x * deltaTime )
	controls.moveForward( - velocity.z * deltaTime )
    controls.getObject().position.y += ( velocity.y * deltaTime ) 


    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)

    stats.end()
}

tick()