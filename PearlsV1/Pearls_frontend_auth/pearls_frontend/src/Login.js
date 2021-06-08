import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Navbar from 'react-bootstrap/Navbar';
import Modal from 'react-bootstrap/Modal';

import Register from './Register'
import Auth from './auth'

import "./Login.css";

// Component for the login page

export default function Login(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showRegister, displayModal] = useState(false);
  
  let loginSetter = props.loginSetter;
  
  function validateForm() {
    return email.length > 0 && password.length > 0;
  }

  function handleSubmit(event) {
    event.preventDefault();

    fetch("http://localhost:5000/login", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({'email':email, 'password': password}),
        })
        .then(response => response.json())
        .then(success => {
          if (success.token && success.name) {
            Auth.login(() => {
              props.history.push({
                pathname: '/PEARLS',
                state: {
                  username: success.name,
                  userEmail: email,
                  token: success.token
                }
              });
            });
          }
        }).catch(() => {
          alert("Wrong credentials, try again");
        })
  }
  
  function handleShow() {
        displayModal(true);
  }
  
  function handleClose() {
        displayModal(false);
  }

  return (
    <div className="Login">
      <Navbar bg="dark" variant="dark">
          <Navbar.Brand href="#home">PEARLS</Navbar.Brand>
        
      </Navbar>
      
      <div style={{ padding: '100px' }} />
      
      <Form onSubmit={handleSubmit}>
        <Form.Group size="lg" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            autoFocus
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>
        <Form.Group size="lg" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        <Button block size="lg" type="submit" variant="info" disabled={!validateForm()}>
          Login
        </Button>
         <hr
            style={{
                color: '#aaa',
                backgroundColor: '#aaa',
                height: 1
              }}
          />
        <Button block size="lg" variant="success" onClick = {handleShow}>
            New user? Register
        </Button>
        </Form>
        <Modal show={showRegister} onHide={handleClose} style={{width:'100vw'}}>
          <Modal.Header closeButton>
            <Modal.Title>Register</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Register />
          </Modal.Body>
        </Modal>
    </div>
  );
}
