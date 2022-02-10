import * as THREE from 'three'
export function lonlat2cart(R, lat, lon)
{
    let plat = lat * Math.PI/ 180
    let plon = lon * Math.PI/ 180
    let px = - R * Math.cos(plat) * Math.cos(plon)
    let py = R * Math.cos(plat) * Math.sin(plon)
    let pz = R * Math.sin(plat) 

    let ans = new THREE.Vector3(px, pz, py)
    return ans
}