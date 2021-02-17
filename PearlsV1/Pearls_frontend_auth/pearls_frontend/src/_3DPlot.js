import React, { Component, Fragment}  from 'react'
import { Canvas, Line } from 'react-three-fiber'

import Box from './Shapes/Box'
import Plus from './Shapes/Plus'
import Sphere from './Shapes/Sphere'
import Rhombus from './Shapes/Rhombus'
import Axes from './Axes'
import { Controls } from './CameraControl'

import Legend from './d3Plot'

const shapeFactory = (pearl, index, hFunc, pColor, isCurrPearl) => {
    if (pearl["pearl_P"] == 0.5) {
        
        return (<Plus radius={pearl["pearl_radius"]}
                    color={pColor}
                    selected = {isCurrPearl}
                    position={pearl["pearl_centroid_3D"]}/>); //astroid;
    }
    
    if (pearl["pearl_P"] == 1) {
        return (<Rhombus radius={pearl["pearl_radius"]}
                    color = {pColor}
                    selected = {isCurrPearl}
                    position={pearl["pearl_centroid_3D"]}/>);
    }
    
    if (pearl["pearl_P"] == 2) {
        return (<Sphere radius={pearl["pearl_radius"]}
                    color = {pColor}
                    selected = {isCurrPearl}
                    position={pearl["pearl_centroid_3D"]}/>);
    }
    
    return (<Box radius={pearl["pearl_radius"]}
                color = {pColor}
                selected = {isCurrPearl}
                position={pearl["pearl_centroid_3D"]}/>); 
}

function Shapes(props){
    let Colors =['blue', 'orange'];
    
    return (
        <Fragment>
            {props.jsonObj && props.jsonObj["pearl_list"].map((element, index) => 
                shapeFactory(element, index, undefined, Colors[+(index == props.currentPearl)], (index == props.currentPearl)))}
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
            showAxes: false
        };
        
        this.sceneRef = React.createRef();
        
        this.showAxes = this.showAxes.bind(this);
        this.hideAxes = this.hideAxes.bind(this);
    }

    async changeCluster(new_json){
        await this.setState({
            pearl_json : new_json
        })
    }
    
    async changePearl(pearlNumber){
        await this.setState({
            currentPearl : pearlNumber
        })
    }
    
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
    
    render(){
        return (
            <Canvas ref = {this.sceneRef} orthographic={false} onCreated={({ camera }) => camera.lookAt(0,0,0)}>
                <ambientLight />
                <pointLight position={[0, 10, 10]} />
                {this.state.showAxes && <Axes limits={[[-10, 10], [-10, 10], [-10, 10]]} />}
                <Shapes jsonObj = {this.state.pearl_json} currentPearl = {this.state.currentPearl}/>
                <Controls />
            </Canvas>
            );
    }

}

export default _3DPlot;
