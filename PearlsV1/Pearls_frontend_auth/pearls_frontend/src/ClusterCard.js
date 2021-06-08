import React from 'react'
import Button from 'react-bootstrap/Button'

import Table from 'react-bootstrap/Table'
import Card from 'react-bootstrap/esm/Card'

// Tables in the ClusterCardModal to display currenty selected cluster and pearl details

class ClusterPearlDetails extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentCluster: props.cluster_number,
            centroid: props.centroid,
            numberOfPearls: props.nPearls,
            tableStyle: props.tableStyle
        }
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
            coords3D: pearlJSON.coords3D
        });
    }
    
    render() {
        return (
            <div>
            <Table variant="dark" size = "sm" responsive>
                <tr>
                    <td><b>Current cluster number:</b></td> <td>{this.state.currentCluster != undefined ? this.state.currentCluster : "None"}</td>
                </tr>
                <tr>
                    <td colSpan="2"><b>Current cluster's centroid:</b></td> 
                </tr>
                <tr>
                    <td colSpan="2">{this.state.currentCluster != undefined ? JSON.stringify(this.state.clusterCentroid) : ""}</td>
                </tr>
                
                <tr>
                    <td><b>Number of pearls in current cluster:</b></td> <td>{this.state.currentCluster != undefined ? this.state.numberOfPearls : "NA"}</td>
                </tr>
                </Table>
                <hr
                        style={{
                            color: '#fff',
                            backgroundColor: '#fff',
                            height: 5
                        }}
                    />
                <Table variant="dark" size = "sm" responsive>
                <tr>
                    <td><b>Current pearl number:</b></td> <td>{this.state.currentPearl != undefined ? this.state.currentPearl : "None"}</td>
                </tr>
                <tr>
                    <td colSpan="2"><b>Current pearl's centroid:</b></td> 
                </tr>
                <tr>
                    <td colSpan="2">{this.state.currentPearl != undefined ? JSON.stringify(this.state.pearlCentroid) : ""}</td>
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
                    <td colSpan="2">{this.state.currentPearl != undefined ? this.state.coords3D : "NA"}</td>
                    </tr>
                </Table>
            </div>
        );
    }
}
export default ClusterPearlDetails;
