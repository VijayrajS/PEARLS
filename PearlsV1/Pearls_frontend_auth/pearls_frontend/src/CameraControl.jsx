import { extend, useThree } from "react-three-fiber";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import React from "react";
import * as THREE from 'three'

extend({ OrbitControls });
// A functional component for the camera

const Controls = () => {
  const { camera, gl } = useThree();
  camera.up = new THREE.Vector3(0, 0, 1);
  
  return (
    <orbitControls
      enableZoom={true}
      rotateSpeed={0.5}
      maxPolarAngle={Math.PI}
      minPolarAngle={-Math.PI}
      args={[camera, gl.domElement]}
    />
  );
};

export { Controls };
