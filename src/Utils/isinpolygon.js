import * as THREE from 'three'
export function isinpolygon(point, ROI_coordinate){
    let x = point[0], y = point[1];
    
    let inside = false;
    for (let i = 0, j = ROI_coordinate.length - 1; i < ROI_coordinate.length; j = i++) {
        let xi = ROI_coordinate[i][0], yi = ROI_coordinate[i][1];
        let xj = ROI_coordinate[j][0], yj = ROI_coordinate[j][1];
        
        let intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    
    return inside;
}
