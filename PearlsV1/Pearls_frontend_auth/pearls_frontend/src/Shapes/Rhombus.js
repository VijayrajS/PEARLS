import React, { useRef, useState, useMemo } from 'react'
import * as THREE from 'three'

export default function Sphere(props) {
    // This reference will give us direct access to the mesh
    const mesh = useRef()
  
    // Set up state for the hovered and active state
    const [hovered, setHover] = useState(false)
    const [active, setActive] = useState(false)
  
    // Rotate mesh every frame, this is outside of React without overhead
    // useFrame(() => (mesh.current.rotation.x = mesh.current.rotation.y += 0.01))
  
    const geom = useMemo(() => new THREE.SphereGeometry(props.radius))
    const edges = new THREE.EdgesGeometry(geom);
    
    var material = new THREE.LineBasicMaterial( {
      color: 0x000000,
      linewidth: 0.5,
    });
    
    let transperancy = (!props.selected) * 0.6 + props.selected;
    return (
      <mesh
        {...props}
        ref={mesh}>

        <octahedronGeometry attach="geometry" args={[props.radius]}/>
        <lineSegments geometry={edges} material={material}/>
        <meshBasicMaterial attach="material" color={props.color} transparent opacity={transperancy}/>
      </mesh>
    )
  }