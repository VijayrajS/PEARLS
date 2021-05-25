import React, { Component } from 'react'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'

import Modal from 'react-bootstrap/Modal'
import Table from 'react-bootstrap/Table'

class ClusterPearlDetailsModal extends Component{
    constructor(props) {
        super(props);
        this.state = {
            currentCluster: props.cluster_number,
            centroid: props.centroid,
            numberOfPearls: props.nPearls,
            tableStyle: props.tableStyle,
            show: false
        }
        
        this.plotRef = props.plotRef
        
        this.setState = this.setState.bind(this);
        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);
    }
    
    async changeCluster(newCluster) {
        await this.setState({
            currentCluster: newCluster.currentCluster,
            clusterCentroid: newCluster.clusterCentroid,
            numberOfPearls: newCluster.numberOfPearls
        });
    }
    
    async changePearl(pearlJSON) {
        console.log(pearlJSON)
        await this.setState({
            currentPearl: pearlJSON.currentPearl,
            pearlCentroid: pearlJSON.pearlCentroid,
            numberOfDataPoints: pearlJSON.numberOfDataPoints,
            pearlP: pearlJSON.pearlP,
            pearlRadius: pearlJSON.pearlRadius,
            coords3D: pearlJSON.coords3D,
        });
        
    }
    
    handleClose(e) {
        e.stopPropagation();
        this.setState({ show: false });
        this.plotRef.current.showAxes();
    }
    
    handleShow() {
        this.setState({ show: true });
        this.plotRef.current.hideAxes();
    }
    
    render() {
        
        let tableCard = (<div>
            <Table bordered responsive hover>
                <thead>
                    <tr>
                        <th colSpan="2">Cluster Details</th>
                    </tr>
                </thead>
                <tbody>
                <tr>
                    <td><b>Current cluster number:</b></td> <td>{this.state.currentCluster != undefined ? this.state.currentCluster : "None"}</td>
                </tr>
                <tr>
                    <td colSpan="2"><b>Current cluster's centroid:</b></td> 
                </tr>
                <tr>
                    <td colSpan="2">{this.state.currentCluster != undefined ? JSON.stringify(this.state.clusterCentroid) : "None"}</td>
                </tr>
                
                <tr>
                    <td><b>Number of pearls in current cluster:</b></td> <td>{this.state.currentCluster != undefined ? this.state.numberOfPearls : "NA"}</td>
                </tr>
                </tbody>
                </Table>
            
                <hr
                        style={{
                            color: '#000',
                            backgroundColor: '#000',
                            height: 5
                        }}
            />
            
            <Table bordered responsive hover>
                <thead>
                    <tr>
                        <th colSpan="2">Pearl Details</th>
                    </tr>
                </thead>
                <tbody>
                <tr>
                    <td><b>Current pearl number:</b></td> <td>{this.state.currentPearl != undefined ? this.state.currentPearl : "None"}</td>
                </tr>
                <tr>
                    <td colSpan="2"><b>Current pearl's centroid:</b></td> 
                </tr>
                <tr>
                    <td colSpan="2">{this.state.currentPearl != undefined ? JSON.stringify(this.state.pearlCentroid) : "None"}</td>
                </tr>
                
                <tr>
                    <td><b>Number of data points in current pearl:</b></td> <td>{this.state.currentPearl != undefined ? this.state.numberOfDataPoints : "NA"}</td>
                </tr>
                <tr>
                    <td><b>P of Pearl</b></td> <td>{this.state.currentPearl != undefined ? this.state.pearlP : "NA"}</td>
                </tr>
                <tr>
                    <td><b>Radius of pearl:</b></td> <td>{this.state.currentPearl != undefined ? this.state.pearlRadius : "NA"}</td>
                </tr>
                <tr>
                    <td colSpan="2"><b>Coordinates of current pearl projected in 3D:</b></td> 
                </tr>
                <tr>
                    <td colSpan="2">{this.state.currentPearl != undefined ? this.state.coords3D.join(', ') : "NA"}</td>
                </tr>
                </tbody>
                </Table>
            </div>);
        
        let tableModal = (
                <Button variant="danger" onClick={this.handleShow} width='10px'>
                    Show cluster and pearl details
                <Modal show={this.state.show} size="lg" scrollable={true}>
                    <Modal.Header>
                        <Modal.Title>Cluster and Pearl details</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {tableCard}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="danger" onClick={this.handleClose}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>
                </Button>);
        
            return tableModal;
        }
}
export default ClusterPearlDetailsModal;
