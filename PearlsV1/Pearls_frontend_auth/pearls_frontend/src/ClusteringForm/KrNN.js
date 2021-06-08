import React, { useState } from 'react'

import Form from 'react-bootstrap/Form'

// KRNN FORM

export default function KrNNForm(params){
    
    const [kClustering, setKClusters] = useState(1);
    const [kPearling, setKPearls] = useState(1);
    const re = /^[1-9]\d*$/; //rules
    
    const handleChangeInClusters = (e) => {
        // Handles change in the number of clusters text box
        if (e.target.value === "" || re.test(e.target.value)) {
            setKClusters(e.target.value);
            params.stateFunc({KrNN_k_for_clustering: parseInt(e.target.value)})
        }
    }
    
    const handleChangeInPearls = (e) => {
        // Handles change in the number of pearls text box
        if (e.target.value === "" || re.test(e.target.value)) {
            setKPearls(e.target.value);
            params.stateFunc({KrNN_k_for_pearling: parseInt(e.target.value)})
        }
    }
    
    return (
        <Form>
            {
                params.type === 'Cluster' &&
                <Form.Row>
                    K for clustering: <Form.Control onChange={handleChangeInClusters} value={kClustering}/>
                </Form.Row>
            }
            {
                params.type === 'Pearl' &&
                <Form.Row>
                    K for pearling: <Form.Control onChange={handleChangeInPearls} value={kPearling}/>
                </Form.Row>
            }
        </Form>
    );
}


