import { extend, useThree } from "react-three-fiber";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import React from "react";

extend({ OrbitControls });

const Controls = () => {
  const { camera, gl } = useThree();

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
