import React, { Component } from 'react'

import './App.css';

import _3DPlot from './_3DPlot'
import D3Plot, { PlotLegend } from './d3Plot'

import FileUploader from './FileUpload'
import ClusterModal from './ClusteringForm/ClusterModal'
import RCCForm from './ClusteringForm/RCCmodal'

import JSONtable from './JSON_to_table'
import ClusterPearlDetails from './ClusterCard'
import ClusterPearlDetailsModal from './ClusterCardModal'
import ScaleToggle from './ToggleButton'
import HelpModal from './HelpModal'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'

import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import Popover from 'react-bootstrap/Popover'
import Dropdown from 'react-bootstrap/Dropdown'
import DropdownButton from 'react-bootstrap/DropdownButton'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'

import 'bootstrap/dist/css/bootstrap.min.css';
import Auth from './auth'

const divStyle = {
  padding: '1vmin',
};

const plotStyle = {
    backgroundColor: '#000',
    height: "500px",
    width: "70vw",
    float:'left',
     
  };
const d3plotStyle = {
    marginTop: "10px",
    height: "400px",
    width: "50vw",
    float: 'left',
    padding:'5px'
  };

const bigCardStyle = {
    height: "500px",
    width: "27vw",
    alignItems:'center',
    float:'right',
    padding: '1vmin',
};
  
const cardStyle = {
    height: "60vh",
    width: "27vw",
    alignItems:'center',
    float:'right',
    padding: '1vmin',
};

const JSONTableStyle = {
    height: "60vh",
    width: "20vw",
    alignItems:'center',
    float:'right',
    padding: '1vmin',
  };

const uploadCardStyle = {
    backgroundColor: 'black',
    height: "60vh",
    width: "71vw",
    float:'left',
};

const clusterDetailStyle = {
    backgroundColor: 'black',
    height: "60vh",
    width: "71vw",
    float:'left',
};

const renderTooltip = (props) => (
  <Tooltip id="button-tooltip" {...props}>
    fbdfhh
  </Tooltip>
);

class PEARLS extends Component {
    constructor(props){
        super(props);
        this.state = {
            currentUser: props.history.location.state.username,
            email: props.history.location.state.userEmail,
            token: props.history.location.state.token,
            
            n_clusters : 0,
            n_pearls: 0,
            currentFile: undefined,
            currentJSONFile:undefined,
            currentAttribs: [],
            d3columns: [],
            
            currentCluster: undefined,
            currentClusterJSON: {},
            currentPearl: 0,
            colorPalette: undefined
        };
        
        this.updateCurrentCluster = this.updateCurrentCluster.bind(this);
        this.updateCurrentPearl = this.updateCurrentPearl.bind(this);
        this.setPalette = this.setPalette.bind(this);
        this.showModal = this.showModal.bind(this);
        
        this.getCurrentFile = this.getCurrentFile.bind(this);
        this.setCurrentFile = this.setCurrentFile.bind(this);
        this.updateCurrentFile = this.updateCurrentFile.bind(this);
        this.updateNClusters = this.updateNClusters.bind(this);
        this.resetApp = this.resetApp.bind(this);
        this.getEmail = this.getEmail.bind(this);
        
        this._3DplotRef = React.createRef();
        this._d3plotRef = React.createRef();
        this._pearlCardRef = React.createRef();
        this._clusterFormRef = React.createRef();
        this._clusterCardRef = React.createRef();
    }
    
    getEmail() {
        return this.state.email;
    }
    async changeScale(sc) {
        this._3DplotRef.current.changeScale(sc);
    }
    async updateCurrentFile(fieldList){
        await this.setState({
            currentAttribs: fieldList
        })
        
    }
    
    async updateNClusters(n){
        await this.setState({n_clusters: n})
    }
    
    getCurrentFile(){
        return this.state.currentFile;
    }
    
    getAttribs(){
        return this.state.currentAttribs;
    }
    
    async setCurrentFile(filename){
        await this.setState({currentFile: filename});
    }
    
    async updateCurrentCluster(clusterNumber){
        await this.setState({
            currentCluster: clusterNumber,
        });
        
        let jsonString = JSON.stringify({
            currentCluster: clusterNumber,
            filename: this.state.currentFile,
            email: this.state.email
        });
        
        console.log(jsonString);
        
        await fetch('http://localhost:5000/rcluster', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: jsonString
        })
        .then(response => response.json())
        .then(success => {
          console.log(success);
          this.setState(() => ({
              currentClusterJSON: success,
              n_pearls: success.pearl_list.length
            }), ()=>{
            this._3DplotRef.current.changeCluster(this.state.currentClusterJSON)
            this._d3plotRef.current.changeCluster(this.state.currentClusterJSON, this.state.currentFile)
            console.log(this.state.currentClusterJSON)
                  
            this._clusterCardRef.current.changeCluster({
                currentCluster: clusterNumber,
                clusterCentroid: this.state.currentClusterJSON["centroid"],
                numberOfPearls: this.state.n_pearls
            })
          })
        })
        
        let d3Columns = await this._d3plotRef.current.fetchDomains(this.state.currentFile);
        
        this.setState({
            d3columns: d3Columns.map((e)=>e['name'])
        })
        console.log(this.state.n_pearls)
    }
    
    async updateCurrentPearl(pearlNumber){
        
        await this.setState({
            currentPearl: pearlNumber,
        });
        
        console.log(this.state.currentPearl)
        
        await this._d3plotRef.current.changePearl(pearlNumber, this.state.currentFile);
        await this._3DplotRef.current.changePearl(pearlNumber, this.state.currentFile);
        
        if (pearlNumber === -1) {
            this._clusterCardRef.current.changePearl({
                currentPearl: undefined
            });
        }
        else {
            this._clusterCardRef.current.changePearl({
                currentPearl: pearlNumber,
                pearlCentroid: this.state.currentClusterJSON.pearl_list[this.state.currentPearl].centroid,
                pearlP: this.state.currentClusterJSON.pearl_list[this.state.currentPearl].pearl_P,
                pearlRadius: this.state.currentClusterJSON.pearl_list[this.state.currentPearl].pearl_radius,
                numberOfDataPoints: Object.keys(this.state.currentClusterJSON.pearl_list[this.state.currentPearl].pearl_list).length,
                coords3D: this.state.currentClusterJSON.pearl_list[this.state.currentPearl].pearl_centroid_3D
            });
        }
        
        await this._pearlCardRef.current.setPearl(this.state.currentClusterJSON.pearl_list[this.state.currentPearl], this.state.currentFile)
    }
    
    async resetApp() {
        this.setState({
            n_clusters : 0,
            n_pearls: 0,
            
            currentCluster: undefined,
            currentClusterJSON: {},
            currentPearl: 0,
            colorPalette: undefined
        });
    }
    
    async setPalette(palette){
        await this.setState({
            colorPalette: palette
        });
    }
    
    showModal(){
        this._clusterFormRef.current.handleShow();
    }
    
    render(){
        return (
        <div>
            <Navbar bg="dark" variant="dark">
                    <Navbar.Brand href="#home">PEARLS</Navbar.Brand>
                    <HelpModal plotRef={this._3DplotRef}/>
                    <OverlayTrigger overlay={(<Tooltip id="hi">After uploading a file, select the options to cluster/recluster the file</Tooltip>)} placement="bottom">
                    <div>
                        <ClusterModal ref = {this._clusterFormRef}
                        appRef = {this}
                        fields = {this.state.currentAttribs}
                        setNclusters={this.updateNClusters}
                        plotRef={this._3DplotRef.current}
                        email={this.state.email}
                        />
                    </div>
                    </OverlayTrigger>
                    <OverlayTrigger overlay={(<Tooltip id="hi">Use this to recluster data points in a particular cluster, with options for binning</Tooltip>)} placement="bottom">
                        <div>
                        <RCCForm ref={this._clusterFormRef}
                            appRef = {this}
                            fields = {this.state.currentAttribs}
                            setNclusters={this.updateNClusters}
                            plotRef={this._3DplotRef.current}
                            email={this.state.email}
                            />
                        </div>
                    </OverlayTrigger>
                    <Nav className="ml-auto">
                        <Nav.Link>
                            Welcome, {this.state.currentUser}
                        </Nav.Link>
                        
                        <Navbar.Brand>| Scale: </Navbar.Brand>
                        
                        <ScaleToggle appRef={this}/>
                        <Button bg="dark" variant="dark"
                            style={{ float: 'right' }}
                            onClick={() => Auth.logout(() => {
                                this.props.history.push("/login")
                            })}> Logout </Button>
                    </Nav>
            </Navbar>
            
            <div style = {divStyle}>
                <Card style={plotStyle}>
                    <_3DPlot ref = {this._3DplotRef} onHoverFunc = {this.updateCurrentPearl}/>
                </Card>
                
                <Card bg = 'dark' style = {bigCardStyle}>
                        <FileUploader
                            getMeta={this.updateCurrentFile}
                            setCurrFile={this.setCurrentFile}
                            reset={this.resetApp}
                            email={this.state.email} />
                    
                        <div style={{ padding: '20px' }}></div>
                        <div style={{ color: '#fff' }}>
                            <b>Note:</b> X-axis is in red, Y-axis in green and Z-axis in blue
                        </div>
                    <div style={{ padding: '20px' }}></div>     
                    
                    <DropdownButton id="dropdown-basic-button" title="Select cluster" disabled={this.state.n_clusters == 0}>
                        {
                            Array.from({length: this.state.n_clusters}, (x, i)=> i).map((element)=>(
                                <Dropdown.Item onClick = {()=>this.updateCurrentCluster(element)}>
                                Cluster {element}
                                </Dropdown.Item>))
                        }
                    </DropdownButton>

                    <div style={{ padding: '10px' }}/>
                    
                    <DropdownButton id="dropdown-basic-button" title= "Select pearl" disabled={(this.state.n_pearls <= 0)}>
                        <Dropdown.Item onClick = {()=>this.updateCurrentPearl(-1)}>Deselect pearl</Dropdown.Item>
                            {
                                Array.from({length: this.state.n_pearls}, (x, i)=> i).map((element)=>(
                                <Dropdown.Item onClick = {()=>this.updateCurrentPearl(element)}>
                                Pearl {element}
                                </Dropdown.Item>))
                            }
                    </DropdownButton>
                    
                    <div style={{ padding: '10px' }} /> 
                    <OverlayTrigger overlay={(<Tooltip id="hi">Details of currently selected cluster and (if selected) pearl</Tooltip>)} placement="bottom">
                        <div>
                            <ClusterPearlDetailsModal ref={this._clusterCardRef} plotRef={this._3DplotRef}/>
                        </div>
                    </OverlayTrigger>
                    <OverlayTrigger overlay={(<Tooltip id="hi">Data points in selected pearl in CSV form</Tooltip>)} placement="bottom">
                        <div>
                        <Card bg = 'dark' style = {{float: 'right', width:'20vh', marginTop:'10px'}}>
                            <JSONtable ref={this._pearlCardRef} plotRef={this._3DplotRef} email={this.state.email} />
                        </Card>
                        </div>
                    </OverlayTrigger>
                </Card>
                
                    <Card bg='light' style={{ ...d3plotStyle, height:'150px' }}>
                    <b>Columns</b> {this.state.d3columns.length > 0 ? this.state.d3columns.join(', ') : "None"}
                        <div style={{ padding: '10px' }} />
                        <i>Note:</i> The columns are in the order as displayed by the parallel coordinates plot shown below.
                        <div style={{ padding: '10px' }} />
                </Card>
                <Card bg = 'light' style={d3plotStyle}>
                    <div style={{ padding: '10px' }}/>
                        <D3Plot clusterData={this.state.currentClusterJSON} ref={this._d3plotRef} colorSetter={this.setPalette} email={ this.state.email }/>
                </Card>
                <Card style = {{float: 'left', margin:'1vmin', width:'20vmin'}}>
                    {this.state.colorPalette &&
                            <PlotLegend palette={this.state.colorPalette} />}
                </Card>
            </div>
        </div>
        );
    }
}

export default PEARLS;
