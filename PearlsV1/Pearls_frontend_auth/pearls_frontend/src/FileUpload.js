import React from 'react';
import Button from 'react-bootstrap/Button'

import Form from 'react-bootstrap/Form'

import Spinner from 'react-bootstrap/Spinner'

// React component for File upload

class FileUploader extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      fileOnLoad: "Upload file"
    };
    
    this.resetApp = props.reset;
    this.getMeta = props.getMeta;
    this.setCurrFile = props.setCurrFile;
    
    this.handleUpload = this.handleUpload.bind(this);
    this.handleFileSelected = this.handleFileSelected.bind(this);
    
    this.email = props.email;
  }

  handleUpload(ev) {
  // Function to handle file upload
    ev.preventDefault();
    
    this.setState({loading : true});
    
    const data = new FormData();
    if(!this.uploadInput.files[0]){
        this.setState({loading : false});
        return;
    }
    let fName = this.uploadInput.files[0].name;
    data.append('file', this.uploadInput.files[0]);
    data.append('filename', fName);
    
    data.append('email', this.email); 

    fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: data,
    })
    .then(response => response.json())
    .then(success => {
        this.setState({loading : false});
        this.setCurrFile(fName);
        this.getMeta(success['fieldList']);
        this.resetApp();
    })
    .catch((error)=>{
        alert("Fileupload:" + error)
        this.resetApp();
    });
}
  handleFileSelected(e: React.ChangeEvent<HTMLInputElement>): void {
    const files = Array.from(e.target.files)
    this.setState({fileOnLoad:files[0].name});
  }


  render() {
    return (
      <form onSubmit={this.handleUpload}>
          <Form.File ref={(ref) => { this.uploadInput = ref; }} 
          data-browse="Browse"
            id="custom-file" label={this.state.fileOnLoad} 
            onChange={this.handleFileSelected}
            custom/>
        <div style={{ align: 'center', paddingTop: '10px' }}>
          {this.state.loading && <Spinner animation="border" variant="info" />}
        
        <Button onClick={this.handleUpload} variant="success">Upload</Button></div>
      </form>
    );
  }
}

export default FileUploader;