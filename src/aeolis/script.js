import '../style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import * as dat from 'lil-gui'
import Stats from 'stats.js'
import { Sphere, Vector3 } from 'three';

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
 * Me Sphere
 */
const hoverHeight = 35;
const objectMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
const objectGeometry = new THREE.SphereGeometry(1, 10, 10)
const objectSphere = new THREE.Mesh( objectGeometry, objectMaterial)
//objectSphere.position.set(0.5, 30, 0.75)
objectSphere.position.set(
-4050.380443864049,
-2354.1899660890926 + hoverHeight,
-8434.64537256541)
Sphere.castShadow = true
scene.add( objectSphere )


/**
 * Models
 */
// const dracoLoader = new DRACOLoader()
// dracoLoader.setDecoderPath('/draco/')
 
 //const gltfLoader = new GLTFLoader()
 //gltfLoader.setDRACOLoader(dracoLoader)
 
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
         capibaraScene.position.set(objectSphere.position.x, objectSphere.position.y - hoverHeight, objectSphere.position.z)
 
         scene.add(capibaraScene)
 
         // Animation
         mixer = new THREE.AnimationMixer(capibaraScene)
         action = mixer.clipAction(capybaraAnimation[1])
         action.play()
     }
 )
 
 
//  let animation = debug_GUI.add(debugObject, 
//      'animation', 
//      ['idle', 'rest', 'explore', 'walk', 'run'])
//      .listen();
 
//  animation.onChange(()=>{
//      if(debugObject.animation == "idle"){
//          action.stop()
//          action = mixer.clipAction(capybaraAnimation[1])
//          action.play()
//      }
//      if(debugObject.animation == "rest"){
//          action.stop()
//          action = mixer.clipAction(capybaraAnimation[2])
//          action.play()
//      }
//      if(debugObject.animation == "explore"){
//          action.stop()
//          action = mixer.clipAction(capybaraAnimation[0])
//          action.play()
//      }
//      if(debugObject.animation == "run"){
//          action.stop()
//          action = mixer.clipAction(capybaraAnimation[3])
//          action.play()
//      }
//      if(debugObject.animation == "walk"){
//          action.stop()
//          action = mixer.clipAction(capybaraAnimation[4])
//          action.play()
//      }
 
 
//  })

/**
 * Foot Sphere
 */
//  const objectMaterial2 = new THREE.MeshBasicMaterial({ color: 0xffffff })
//  const objectGeometry2 = new THREE.SphereGeometry(1, 10, 10)
//  const objectSphere2 = new THREE.Mesh( objectGeometry2, objectMaterial2)
//  objectSphere2.position.set(objectSphere.position.x, objectSphere.position.y - 20, objectSphere.position.z)
//  scene.add( objectSphere2 )

/**
 * Lights
 */
//const ambientLight = new THREE.AmbientLight(0xffffff, 0.0)
//scene.add(ambientLight)
//debugObject.ambientLightColor = 0xffffff
// gui
//     .addColor(debugObject, 'ambientLightColor')
//     .onChange(()=>
//     {
//         ambientLight.color.set(debugObject.ambientLightColor)
//     })
//     .name('ambient light color')

// gui.add(ambientLight, 'intensity').min(0).max(1).step(0.01).name('ambient light intensity')

const hemisphereLight = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.3 );
hemisphereLight.position.set( 0, 0, 0);
scene.add( hemisphereLight );
//const hemisphereLightHelper = new THREE.HemisphereLightHelper( hemisphereLight, 10000 );
//scene.add( hemisphereLightHelper );
debugObject.hemisphereLightColor = 0xffffff
gui
    .addColor(debugObject, 'hemisphereLightColor')
    .onChange(()=>
    {
        hemisphereLight.color.set(debugObject.hemisphereLightColor)
    })
    .name('hemisphere light color')

gui.add(hemisphereLight, 'intensity').min(0).max(1).step(0.01).name('hemisphere light intensity')

const directionalLight = new THREE.DirectionalLight(0xBEB4A2, 0.5)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 1000
directionalLight.shadow.camera.top =1
directionalLight.shadow.camera.right = 1
directionalLight.shadow.camera.bottom = 1
directionalLight.position.set(0, 7000, 1000)
scene.add(directionalLight)
//const directionalLighthelper = new THREE.DirectionalLightHelper( directionalLight, 1000 );
//scene.add( directionalLighthelper );
debugObject.directionalLightColor = 0xBEB4A2
gui
    .addColor(debugObject, 'directionalLightColor')
    .onChange(()=>
    {
        directionalLight.color.set(debugObject.directionalLightColor)
    })
    .name('directional light color')

gui.add(directionalLight, 'intensity').min(0).max(1).step(0.01).name('directional light intensity')

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

let letmove = false
window.addEventListener('click', ()=>
{
    console.log(mouse)
    letmove = true
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
controls.target = objectSphere.position;

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
const far = 23000
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
let phi=0;
let vel= new Vector3(0,0,0);
let target = null;
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

        if (letmove && intersect.length != 0)
        {
            let collidingSurface = intersect[0].point
            //objectSphere.position.set(collidingSurface.x, collidingSurface.y + 150, collidingSurface.z)   
            target = collidingSurface.add(new Vector3(0,hoverHeight,0));
            vel.set(target.x-objectSphere.position.x,target.y-objectSphere.position.y,target.z-objectSphere.position.z);
            vel.normalize().multiplyScalar(20);
            
            // rotate the object to orient it to the target
            phi = Math.atan2(vel.z, vel.x);
            capibaraScene.rotation.y = Math.PI/2- phi;
            //capibaraScene.rotation.x = 0;
            //capibaraScene.rotation.z = 0;
            //capibaraScene.position.set(collidingSurface.x, collidingSurface.y + 150, collidingSurface.z)
            action.stop()
            action = mixer.clipAction(capybaraAnimation[3])
            action.play()
        }
        letmove = false
        if(target!=null){
            objectSphere.position.set(objectSphere.position.x + deltaTime * vel.x, objectSphere.position.y + deltaTime * vel.y, objectSphere.position.z + deltaTime * vel.z)      
            capibaraScene.position.set(objectSphere.position.x, objectSphere.position.y - hoverHeight, objectSphere.position.z)
            if(objectSphere.position.distanceTo(target)<10){
                //objectSphere.position.set(target.x, target.y, target.z)
                //capibaraScene.position.set(objectSphere.position.x, objectSphere.position.y - 20, objectSphere.position.z)
                console.log(objectSphere.position);
                target = null;

                action.stop()
                action = mixer.clipAction(capybaraAnimation[1])
                action.play()
            }
        }
    }
    // Update camera look at position
    //let phi = (90 - camera.rotation.y) * Math.PI / 180
    // phi= 0;
    // let newvec = new THREE.Vector3(0,10000,10000).applyAxisAngle(new THREE.Vector3(0,1,0), phi).add(objectSphere.position)
    // camera.position.set(newvec.x, newvec.y, newvec.z)
    camera.lookAt(objectSphere.position)

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