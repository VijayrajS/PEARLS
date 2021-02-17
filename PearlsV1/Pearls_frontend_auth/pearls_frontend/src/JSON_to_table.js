import React, { Component } from 'react'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'

import Modal from 'react-bootstrap/Modal'
import Table from 'react-bootstrap/Table'

class JSONtable extends Component{
    constructor(props) {
        super(props);
        this.state = {
            pearlList: undefined,
            pointIndices : undefined,
            paramList: undefined,
            show: false
        }
        this.plotRef = props.plotRef
        this.setState = this.setState.bind(this);
        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);
        
        this.email = props.email;
    }
    
    async setPearl(newPearlList, currentFile) {
        if(!newPearlList){
            await this.setState({
                pearlObject: undefined
            });
        }
        
        else{
            let jsonString = JSON.stringify({'filename': currentFile, 'email':this.email});
            let headers;
            await fetch('http://localhost:5000/rheaders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: jsonString
            })
            .then(response => response.json())
            .then(success => {
                headers = success['headers'];
            })
            
            await this.setState({
                pearlObject: newPearlList,
                pointIndices : Object.keys(newPearlList.pearl_list),
                paramList: headers
            })
        }
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
        
        let tableCard =  
            (this.state.pearlObject)
            ?(<Card style = {{width:'100%'}}>
                <Table>
                    <tr>
                        {this.state.paramList.map((element) => <th>{element}</th>)}
                    </tr>
                    {Object.keys(this.state.pearlObject.pearl_list).map((index) => (
                        <tr>
                            {this.state.paramList.map((key) => {
                                let key_new = key.replace(/\"/g, '');
                                return <td>{this.state.pearlObject.pearl_list[index][key_new]}</td>
                            }
                            )}
                        </tr>
                    ))
                    }
                </Table>
                </Card>
                )
            :(<Card></Card>);
        
        let tableModal = (
                <Button variant="danger" disabled={!this.state.pearlObject} onClick={this.handleShow}>
                    Show table
                <Modal show={this.state.show} size="lg" scrollable={true}>
                    <Modal.Header>
                        <Modal.Title></Modal.Title>
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
export default JSONtable;
