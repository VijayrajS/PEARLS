import React, { Component } from 'react'
import chroma from "chroma-js";

import { ParallelCoordinates } from 'react-vis'
import '../node_modules/react-vis/dist/style.css';

// import { XYPlot, XAxis, YAxis, HorizontalGridLines, LineSeries } from 'react-vis';

const MARGIN = {
    left: 10,
    right: 10,
    top: 10,
    bottom: 10
  };

  
const d3PlotStyle = {
    height: "30vh",
    width: "27vw",
    alignItems: 'center',
    float: 'left',
    padding: '1vmin',
};

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];
  }

export function Legend(props){
     return (
            <div style={{}}>
            {props.palette.map((element, index) => {
            // let [r,g,b] = hexToRgb(element);
            return(
                <div style = {{ height:'30%', backgroundColor:element, color:'black', float:'left', margin:'10px', padding:'10px'}}>
                    <b>Pearl {index}</b>
                </div>)})}
            </div>
    )
}

class D3Plot extends Component {

    constructor(props) {
        super(props);
        this.state = {
            props: 0,
            current_pearl : -1,
            colorSetter : props.colorSetter,
            pearlsJSON : undefined,
            currentFile : undefined
        }
        this.email = props.email;
        this.fetchDomains = this.fetchDomains.bind(this);
    }
    
    async setCurrentFile(filename){
        await this.setState({
            currentFile : filename
        });
    }
    
    dataJSONtoPlotJson(dataJSON){ 
        console.log(this.state.current_pearl);
        let dataList;
        
        if(dataJSON){
            dataList = dataJSON.pearl_list.map((element)=> Object.values(element["pearl_list"]));
            this.setState({
                pearlsJSON: dataList
            })
        }
        else{
            dataList = this.state.pearlsJSON;
        }
        
        let colors =  chroma.scale('Spectral').colors(dataList.length);
        this.state.colorSetter(colors);
        
        let factor = (dataList.length > 1) ? 1/(dataList.length-1) : 0;
    
        for(let i = 0; i < dataList.length; i++){
            let color = undefined;
            let opacity = undefined;
            
            if(this.state.current_pearl === -1){
                color = colors[i];
                opacity = 0.9;
            }
            else{
                if(this.state.current_pearl === i){
                    color = colors[i];
                    opacity = 0.8;
                }
                else{
                    color = "#000";
                    opacity = 0.2;
                }
            }
             
            let styleObj = {
                    strokeWidth: 1,
                    stroke: color,
                    strokeOpacity: opacity
            }
            for(let j = 0; j < dataList[i].length; j++){
                dataList[i][j].style = styleObj;
            }
        }
        
        return dataList.flat(1);
    }
    
    async fetchDomains(fileName){
        let jsonString = JSON.stringify({'filename': fileName, 'email': this.email});
        let domainMap;
        
        await fetch('http://localhost:5000/rdomains', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: jsonString
        })
        .then(response => response.json())
        .then(success => {
            domainMap = success.domains.map((element)=>{
                return {name: element[0], domain: element[1]};
             })
        })
        console.log(domainMap);
        return domainMap;
    }
    
    async buildProps(currentFile, newJSON) {
        let domainMap = await this.fetchDomains(currentFile);
        console.log("AT BUILDPROPS")
        console.log()
        if(!newJSON){
            console.log(domainMap)
            
            return {
                data: this.dataJSONtoPlotJson(),
                domains: domainMap
            };
        }
        else{
            return {
                data: this.dataJSONtoPlotJson(newJSON),
                domains: domainMap
            };
        }
    }
    
    async changePearl(pearlNumber, currentFile) {
        await this.setState({
            current_pearl : pearlNumber
        })
        
        await this.buildProps(currentFile);
        this.forceUpdate();
    }
    
    async changeCluster(newJSON, currentFile) {
            
            let newProps = await this.buildProps(currentFile, newJSON);
            
            console.log(newProps);
            await this.setState({
                props: newProps
            });
    }

    render() {
        return (
            <>
            &nbsp;
            {this.state.props.domains &&
                <ParallelCoordinates {...this.state.props} width={500} height={300}/>}
              &nbsp;
            </>
        );
    }
}

export { Legend as PlotLegend }
export default D3Plot;