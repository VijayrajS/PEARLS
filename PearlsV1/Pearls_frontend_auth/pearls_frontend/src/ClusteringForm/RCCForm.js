import React from 'react'

import Form from 'react-bootstrap/Form'
import Dropdown from 'react-bootstrap/esm/Dropdown'
import DropdownButton from 'react-bootstrap/DropdownButton'

// Form components for each clustering algorithm
import KMeansForm from './KMeans'
import KrNNForm from './KrNN'
// ---------------------------------------------


class ClusterSettings extends React.Component{
    constructor(props){
        super(props);
        
        this.clustering_algo_list = ['KMeans', 'KrNN'];
        this.bin_crit = ['None'].concat(props.fieldList);
        this.currCluster = props.currCluster;
        this.totalPearls = props.nPearls;
        this.fieldList = props.fieldList;
        
        this.state = {
            pearl_clustering_algo: 'Select',
            
            // KMeans/any other algorithm that uses
            // number of clusters as input
            number_of_pearls: 1,
            
            // KrNN
            KrNN_k_for_pearling:1,
            
            // Binning
            binning_criterion: "None",
            binning_dimension: "None",
            bins_per_cluster: 0,
            
            filtered_attributes: Array.from({length: this.fieldList.length}, (x, i) => true),
            selected_pearls:[]
        }
        
        this.setState = this.setState.bind(this);
        this.selectAttr = this.selectAttr.bind(this);
        this.handleChangeInBins = this.handleChangeInBins.bind(this);
        
        this.re = /^[1-9]\d*$/;
    }
    
    getState(){
        return this.state;
    }
    
    selectAttr(attrIndex, e){
        console.log(attrIndex);
        this.state.filtered_attributes[attrIndex] = e.target.checked;
        console.log(this.state.filtered_attributes)
    }
    
    changePearlselect(pearlNo, e){
        if (this.state.selected_pearls.includes(pearlNo)) {
            let ind = this.state.selected_pearls.indexOf(pearlNo)
            this.state.selected_pearls.splice(ind, 1);
        }
        else {
            this.state.selected_pearls.push(pearlNo);
        }
    }
    
    handleChangeInBins = (e) => {
        
        if (e.target.value === "" || this.re.test(e.target.value)) {
            let val = (e.target.value == "")?"":parseInt(e.target.value);
            this.setState({bins_per_cluster: val})
        }
    }
    
    render() {
        return (
            <Form>
                {/* Pearling algorithm */}
                <div>
                    Pearl clustering algorithm: <DropdownButton id="dropdown-basic-button" title={this.state.pearl_clustering_algo}>
                        {this.clustering_algo_list.map((element)=>(
                            <Dropdown.Item key={element} onSelect={
                                ()=>this.setState({pearl_clustering_algo:element})}>
                                {element}</Dropdown.Item>
                        ))}
                    </DropdownButton>
                </div>
                
                {/**** Add clustering form for new algorithm here ****/}
                
                {/* Form specific to KMeans */}
                {this.state.pearl_clustering_algo == 'KMeans' &&
                    <KMeansForm stateFunc = {this.setState}
                        type = "Pearl"/>
                }
                
                {/* Form specific to KrNN */}
                {this.state.pearl_clustering_algo == 'KrNN' &&
                    <KrNNForm stateFunc = {this.setState}
                        type = "Pearl"/>
                }
                {/****************************************************/}
                
                {/* Binning form */}
                <div>
                    Binning dimension: <DropdownButton id="dropdown-basic-button" title={this.state.binning_dimension}>
                        {this.bin_crit.map((element)=>(
                            <Dropdown.Item key={element} onSelect={
                                ()=>this.setState({binning_dimension:element.replace(/\"/g, '')})}>
                                {element}</Dropdown.Item>
                        ))}
                    </DropdownButton>
                    
                    Binning criterion: <DropdownButton id="dropdown-basic-button" title={this.state.binning_criterion}>
                        {['none', 'binsize', 'range'].map((element)=>(
                            <Dropdown.Item key={element} onSelect={
                                ()=>this.setState({binning_criterion:element})}>
                                {element}</Dropdown.Item>
                        ))}
                    </DropdownButton>
                    
                    {this.state.binning_criterion !== 'None' &&
                        <div>Number of bins: <Form.Control placeholder="Number of Bins"
                            onChange={this.handleChangeInBins} value={this.state.bins_per_cluster}/></div>
                    }
                    
                    {this.state.binning_criterion == 'range' &&
                        <div>
                        Binning dimension <DropdownButton id="dropdown-basic-button" title={this.state.binning_dimension}>
                            {this.fieldList.map((element)=>(
                                <Dropdown.Item key={element} onSelect={
                                    ()=>this.setState({binning_dimension:element})}>
                                    {element}</Dropdown.Item>
                            ))}
                        </DropdownButton>
                        </div>
                    }
                    
                    Attribute filtering:
                    <Form.Group controlId="formBasicCheckbox">
                    {
                        Array.from({length: this.fieldList.length}, (x, i) => i).map((element)=>(
                                <Form.Check type="checkbox" 
                                    defaultChecked={this.state.filtered_attributes[element]}
                                    onChange={(e)=>this.selectAttr(element, e)}
                                    label={this.fieldList[element]} />
                                    ))
                    }
                    </Form.Group>
                    Select Pearls:
                    <Form.Group controlId="formBasicCheckbox2">
                    {
                        
                        Array.from(Array(this.totalPearls).keys()).map((element)=>(
                                <Form.Check type="checkbox" 
                                    defaultChecked={element}
                                    onChange={(e)=>this.changePearlselect(element, e)}
                                    label={element} />
                                    ))
                    }
                    </Form.Group>
                </div>
            </Form>
        );
    }
}

export default ClusterSettings;
