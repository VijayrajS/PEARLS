import React, { Component, Fragment}  from 'react'
import { Canvas, Line } from 'react-three-fiber'

import Box from './Shapes/Box'
import Plus from './Shapes/Plus'
import Sphere from './Shapes/Sphere'
import Rhombus from './Shapes/Rhombus'
import Axes from './Axes'
import { Controls } from './CameraControl'

import Legend from './d3Plot'

/**
 * Class that represents the 3D plot component of the app
 */

const shapeFactory = (pearl, index, axesScale, pColor, isCurrPearl) => {
    // Function that generates a shape object based on the pearl details
    
    let coords = undefined;
    let radius = 0;
    if (axesScale == 1) {
        coords = pearl['scaled_coords'];
        radius = pearl["pearl_radius_scaled"];
    }
    
    else {
        coords = pearl['pearl_centroid_3D'];
        console.log(coords)
        coords[0] = Math.sign(coords[0]) * Math.log(1 + Math.abs(coords[0])) / Math.log(10);
        coords[1] = Math.sign(coords[1]) * Math.log(1 + Math.abs(coords[1])) / Math.log(10);
        coords[2] = Math.sign(coords[2]) * Math.log(1 + Math.abs(coords[2])) / Math.log(10);
        console.log(coords)
        radius = Math.log(1 + pearl["pearl_radius"]);
    }
    
    if (pearl["pearl_P"] == 0.5) {
        return (<Plus radius={radius}
                    color={pColor}
                    selected = {isCurrPearl}
                    position={coords}/>); //astroid;
    }
    
    if (pearl["pearl_P"] == 1) {
        return (<Rhombus radius={radius}
                    color = {pColor}
                    selected = {isCurrPearl}
                    position={coords}/>);
    }
    
    if (pearl["pearl_P"] == 2) {

        return (<Sphere radius={radius}
                    color = {pColor}
                    selected = {isCurrPearl}
                    position={coords}/>);
    }
    
    return (<Box radius={radius}
                color = {pColor}
                selected = {isCurrPearl}
                position={coords}/>); 
}

function Shapes(props) {
    // Function that encloses all pearl shapes in the 3D plot
    let Colors =['blue', 'orange'];
    
    return (
        <Fragment>
            {props.jsonObj && props.jsonObj["pearl_list"].map((element, index) => 
                shapeFactory(element, index, props.axesScale, Colors[+(index == props.currentPearl)], (index == props.currentPearl)))}
        </Fragment>
    )
}

class _3DPlot extends Component{
    constructor(props) {
        super(props);

        this.state = {
            pearl_json : undefined,
            camera_pos : [4, 4, 4],
            onHoverFunc: props.onHoverFunc,
            currentPearl: -1,
            colorArray: [],
            showAxes: false,
            
            axesScale:1,
            scale: 1,
            mode: 0
        };
        
        this.sceneRef = React.createRef();
        
        this.showAxes = this.showAxes.bind(this);
        this.hideAxes = this.hideAxes.bind(this);
        this.changeScale = this.changeScale.bind(this);
    }

    async changeCluster(new_json) {
        // Function to assign the new cluster json and trigger the plotting process
        await this.setState({
            pearl_json : new_json
        })
        
    }
    
    async changePearl(pearlNumber) {
        // Function to assign the new pearl number
        await this.setState({
            currentPearl : pearlNumber
        })
    }
    
    // Functions to show and hide axes
    // {These are written since the axis lines and labels otherwise draw over the forms}
    async showAxes(){
        await this.setState({
            showAxes: true
        })
    }
    
    async hideAxes(){
        await this.setState({
            showAxes: false
        })
    }
    
    async changeScale(scale) {
        // Switching between linear and log scale
        console.log("ChangeScale");
        console.log(scale);
        await this.setState({
            axesScale: scale
        })
    }
    
    async changeMode(mode) {
        await this.setState({
            // 0 for dark, 1 for light
            mode: mode
        })
    }
    
    render(){
        return (
            <Canvas ref = {this.sceneRef} orthographic={false} onCreated={({ camera }) => camera.lookAt(0,0,0)}>
                <color attach="background" args={[["black", "white"][this.state.mode]]} />
                <ambientLight />
                <pointLight position={[0, 10, 10]} />
                {this.state.showAxes && <Axes limits={[[-10, 10], [-10, 10], [-10, 10]]} labelColor={[["white", "black"][this.state.mode]]}/>}
                <Shapes jsonObj={this.state.pearl_json} axesScale={this.state.axesScale} currentPearl = {this.state.currentPearl}/>
                <Controls />
            </Canvas>
            );
    }

}

export default _3DPlot;
