import React, { useState } from 'react'

import Form from 'react-bootstrap/Form'

export default function KMeansForm(params){
    
    const [nClusters, setNClusters] = useState(1);
    const [nPearls, setNPearls] = useState(1);
    const re = /^[1-9]\d*$/; //rules
    
    const handleChangeInClusters = (e) => {
        if (e.target.value === "" || re.test(e.target.value)) {
            setNClusters(e.target.value);
            params.stateFunc({number_of_clusters: parseInt(e.target.value)})
        }
    }
    
    const handleChangeInPearls = (e) => {
        if (e.target.value === "" || re.test(e.target.value)) {
            setNPearls(e.target.value);
            params.stateFunc({number_of_pearls: parseInt(e.target.value)})
        }
    }
    
    return (
        <Form>
            {
                params.type === 'Cluster' &&
                <Form.Row>
                    Number of clusters: <Form.Control onChange={handleChangeInClusters} value={nClusters}/>
                </Form.Row>
            }
            {
                params.type === 'Pearl' &&
                <Form.Row>
                    Number of Pearls: <Form.Control onChange={handleChangeInPearls} value={nPearls}/>
                </Form.Row>
            }
        </Form>
    );
}


