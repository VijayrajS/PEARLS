import React, { useState, useRef } from 'react'

import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'

import ClusterSettings from './ClusterForm'

export default function ClusterModal(props) {
    const [show, setShow] = useState(false);
    const [fields, setFields] = useState(undefined);
    const appRef = props.appRef;
    
  const handleClose = () => {
    setShow(false);
    props.plotRef.showAxes();
  }
  const handleShow = () => {
    console.log(props.axesControl)
      if(appRef.getCurrentFile()){
        setShow(true);
        setFields(props.fields);
        props.plotRef.hideAxes();
      }
    }
    
    const clusterForm = useRef(null);
    
    const handleSubmit = () => {
        console.log(clusterForm.current.getState());
        let metadata = clusterForm.current.getState();
        metadata['filename'] = appRef.getCurrentFile();
        metadata['email'] = props.email;       
        fetch("http://localhost:5000/cluster", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(metadata),
        })
        .then(response => response.json())
        .then(success => {
          console.log(success);
          props.setNclusters(success['n_clusters']);
        })
    }

    return (
      <div>
        <Button variant ="outline-info" onClick={handleShow}>
          Cluster/Recluster current file
        </Button>
        <Modal show={show} onHide={handleClose} style={{width:'90vw'}}>
          <Modal.Header closeButton>
            <Modal.Title>Cluster current file</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Current file: {appRef.getCurrentFile()}
            
          <ClusterSettings fieldList = {fields} ref={clusterForm}/>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              Cluster
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
