import React from 'react'

import * as THREE from 'three'
import { Html } from 'drei'

// Functional component representing axes on the 3D plot

export default function Axes(props) {
        
        let min_x = props.limits[0][0];
        let max_x = props.limits[0][1];
        let min_y = props.limits[1][0];
        let max_y = props.limits[1][1];
        let min_z = props.limits[2][0];
        let max_z = props.limits[2][1];
        
        const inf = Math.pow(10, 10);
        const origin = new THREE.Vector3( 0, 0, 0 );
        const x_axis = new THREE.Vector3( 1, 0, 0 );
        const y_axis = new THREE.Vector3( 0, 1, 0 );
        const z_axis = new THREE.Vector3( 0, 0, 1 );
        const x_axis_n = new THREE.Vector3( -1, 0, 0 );
        const y_axis_n = new THREE.Vector3( 0, -1, 0 );
        const z_axis_n = new THREE.Vector3( 0, 0, -1 );
        
        var position = new THREE.Vector3(0, 0, 10);
        var scale = new THREE.Vector3(10, 50, 1);
        
        return (
        <mesh>
            {Array.from({length: max_x - min_x + 1},(v,k)=>k + min_x).map(
                (e)=>(
                    <Html scaleFactor={7} position={[e, 0, 0]}>
                        <div style={{color:'#ffffff'}}>
                            {e}
                        </div>
                    </Html>
                ))}
            
            {Array.from({length: max_y - min_y + 1},(v,k)=>k + min_y).map(
                (e)=>(
                    <Html scaleFactor={7} position={[0, e, 0]}>
                        <div style={{color:'#ffffff'}}>
                            {e}
                        </div>
                    </Html>
                ))}
            
            {Array.from({length: max_z - min_z + 1},(v,k)=>k + min_z).map(
                (e)=>(
                    <Html scaleFactor={7} position={[0, 0, e]}>
                        <div style={{color:'#ffffff'}}>
                            {e}
                        </div>
                    </Html>
                ))}
            <arrowHelper args={[x_axis, origin, inf, '#f00']}/>
            <arrowHelper args={[y_axis, origin, inf, '#0f0']}/>
            <arrowHelper args={[z_axis, origin, inf, '#00f']}/>
            <arrowHelper args={[x_axis_n, origin, inf, '#f00']}/>
            <arrowHelper args={[y_axis_n, origin, inf, '#0f0']}/>
            <arrowHelper args={[z_axis_n, origin, inf, '#00f']}/>
        </mesh>
        );
}
