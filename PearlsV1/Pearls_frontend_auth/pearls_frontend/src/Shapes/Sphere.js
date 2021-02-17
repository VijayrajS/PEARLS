import React, { useRef, useState } from 'react'

export default function Sphere(props) {
    // This reference will give us direct access to the mesh
    const mesh = useRef()
  
    // Set up state for the hovered and active state
    const [hovered, setHover] = useState(false)
    const [active, setActive] = useState(false)
    let transperancy = (!props.selected) * 0.6 + props.selected
    return (
      <mesh
        {...props}
        ref={mesh}>
        
        <sphereGeometry attach="geometry" args={[props.radius, 32, 32]}/>
        <lineDashedMaterial attach="material" color={props.color} transparent opacity={transperancy} />
      </mesh>
    )
  }