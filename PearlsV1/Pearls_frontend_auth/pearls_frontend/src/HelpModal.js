import React, { Component } from 'react'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'

import Modal from 'react-bootstrap/Modal'
import Table from 'react-bootstrap/Table'

class HelpModal extends Component{
    constructor(props) {
        super(props);
        this.state = {
            show: false
        }
        this.plotRef = props.plotRef
        this.setState = this.setState.bind(this);
        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);
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
        let hModal = (
                <div style={{paddingRight:"10px"}}>
                    <Button variant="dark" onClick={this.handleShow}>
                        <img src={require('./Images/question-square-fill.svg')} /> Help
                        <Modal show={this.state.show} size="lg" scrollable={true}>
                        <Modal.Header>
                            <Modal.Title>PEARLS visualisation</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <par>
                                PEARLS is a tool that uses basic three-dimensional shapes to visualize high dimensional data clusters. These shapes, called pearls are groups of points which represent a level of abstraction in between data point level and cluster level. A Parallel coordinates plot has been embedded for a detailed analysis of individual pearls.
                            </par>
                            <par>
                                <h5>Workflow</h5>
                                The toolkit works as follows: First it takes the dataset, and creates clusters out of these. After this, every cluster is clustered to output a set of pearls. A subset of pearls from a particular cluster can be selected, and pearls can be formed with this subset of data points, where one can also use data dimensioning techniques (discussed below).
                                <h5>First Round of Clustering</h5>
                                After uploading the file, one can click to the "Cluster/Recluster current file", and enter the algorithms for cluster and pearl formation. You can also choose the attributes that need to be used during the clustering. (Non-numerical fields are automatically discarded by the system).
                                <h5>Further Reclustering</h5>
                                After the clusters are formed, you can choose a particular cluster, choose a subset of pearls and do the same. Here you can also use <b>binning techniques</b>, where data is put in bins. The <i>range</i> option in binning divides the entire range of values into equal bin sizes, and the <i>binsize</i> option divides the entire set of points into equal-sized bins. Pearls are formed out of each bin of data.
                            </par>
                        </Modal.Body>
                            
                            <Modal.Footer>
                            <Button variant="danger" onClick={this.handleClose}>
                                Close
                            </Button>
                            </Modal.Footer>

                        </Modal>
                    </Button>
                </div>);
        
            return hModal;
        }
}

export default HelpModal;
