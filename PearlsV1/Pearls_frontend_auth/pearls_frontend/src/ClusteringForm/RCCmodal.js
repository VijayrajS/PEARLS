import React, { useState, useRef } from 'react'

import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'

import RCCForm from './RCCForm'

export default function RCCModal(props) {
    const [show, setShow] = useState(false);
    const [fields, setFields] = useState(undefined);
    const appRef = props.appRef;
    
  const handleClose = () => {
    setShow(false);
    props.plotRef.showAxes();
  }
  const handleShow = () => {
      let x = appRef.state.currentCluster;
      if(appRef.getCurrentFile() && Number.isInteger(x)){
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
        metadata['cluster_no'] = appRef.state.currentCluster;
        metadata['JSONfile'] = appRef.state.currentJSONFile;
        
        if (!metadata['JSONfile']) {
          delete metadata.JSONfile;
        }
      
        fetch("http://localhost:5000/rcc", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(metadata),
        })
        .then(response => response.json())
        .then(success => {
          console.log(success);
          
          appRef.setState(() => ({
            currentClusterJSON: success,
            n_pearls: success.pearl_list.length
          }), ()=>{
            appRef._clusterCardRef.current.changeCluster({
              clusterCentroid: appRef.state.currentClusterJSON["centroid"],
              numberOfPearls: appRef.state.n_pearls
            })
            appRef._3DplotRef.current.changeCluster(appRef.state.currentClusterJSON)
          })
        })
    }

    return (
      <div>
        <Button variant ="outline-info" onClick={handleShow} style={{marginLeft:'1vmin'}}>
            Recluster current cluster
        </Button>
        <Modal show={show} onHide={handleClose} style={{width:'90vw'}}>
          <Modal.Header closeButton>
            <Modal.Title>Cluster current file</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Current file: {appRef.getCurrentFile()}
            <RCCForm fieldList={fields} ref={clusterForm} nPearls={appRef.state.currentClusterJSON['pearl_list'] && appRef.state.currentClusterJSON['pearl_list'].length}/>
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
