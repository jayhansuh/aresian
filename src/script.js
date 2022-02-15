import marsglobe from './marsglobe.js'
import * as THREE from 'three'

console.log('%cWELCOME ARESIAN', 'font-size: 50px; color: #fff; background: #000; padding: 10px;');
//console.log(process.env.NODE_ENV);

// Entry title
const title = document.createElement('div');
title.className = 'entrytitle properText';
title.innerHTML = '<div>ARESIAN</div>';
document.body.appendChild(title);
window.setTimeout(() => {document.querySelector('div.entrytitle').remove();},4000);

window.var={};
window.eventListners = {};

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


// Clear scene

marsglobe(canvas,scene,renderer);

