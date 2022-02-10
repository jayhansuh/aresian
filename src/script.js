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

/**
 * Base
 */
// Debug
//const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

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
let sceneReady = false
const loadingManager = new THREE.LoadingManager(
    () =>
    {
        window.setTimeout(()=>
        {
            gsap.to(overlayMaterial.uniforms.uAlpha, {duration: 3, value: 0 })
        }, 500)
        window.setTimeout(()=>
        {
            sceneReady = true
        }, 500)
        
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
const bakedTexture = textureLoader.load('/models/5672_mars_4k_color.jpg')
bakedTexture.flipY = false
bakedTexture.encoding = THREE.sRGBEncoding

/**
 * Materials
 */
// Baked material
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture })

gltfLoader.load(
    '/models/moonrender.glb',
    (gltf) =>
    {
        gltf.scene.traverse((child)=>
        {
            child.material = bakedMaterial
        })
        scene.add(gltf.scene)
    }
)



/**
 * Points of Interests
 */
const Radius = 1.01

function addPoint (n) {
    const pointDiv = document.createElement("div");
    pointDiv.className = "point point-" + String(n);

    const labelDiv = document.createElement("div");
    labelDiv.className = "label"
    labelDiv.textContent = String(n + 1);
    pointDiv.appendChild(labelDiv);

    const textDiv = document.createElement("div");
    textDiv.className = "text"
    textDiv.textContent = fl[n].name;
    pointDiv.appendChild(textDiv);

    const currentDiv = document.getElementById("point point-" + String(n-1));
    document.body.insertBefore(pointDiv, currentDiv);
  }

for (let i = 1; i < fl.length; i++) {
    addPoint(i)
    
}

const raycaster = new Raycaster()
//converToCartesian(radius, latitude (N=+, S=-) , longitude (E=+, W=-))
const points = [
    {   // 폭풍의 대양
        position: lonlat2cart(Radius, fl[0].lat, fl[0].lon),
        element: document.querySelector('.point-0')
    }
]
for (let i = 1; i < fl.length; i++) {
    points.push(
        {  
            position: lonlat2cart(Radius, fl[i].lat, fl[i].lon),
            element: document.querySelector('.point-' + String(i))
        }
    )
    
}

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1)
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
const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.1, 10)
camera.position.set(2, 0, 2)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0, 0)
controls.enableDamping = true
controls.maxDistance = 10
controls.minDistance = 1.5

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

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


    if(sceneReady)
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
    window.requestAnimationFrame(tick)
}

tick()