import React, { useState } from "react";
import Modal from 'react-bootstrap/Modal';
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

export default function Register() {
    
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showRegister, displayModal] = useState(false);
  

  function validateForm() {
    return email.length > 0 && password.length > 0 && name.length > 0;
  }

  function handleSubmit(event) {
      event.preventDefault();
      fetch("http://localhost:5000/register", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({'name':name, 'email':email, 'password': password}),
        })
        .then(response => response)
        .then(success => {
            // alert(success.message)
            if (success.status == 201) {
                alert("Registered successfuly");
            }
            if (success.status == 202) {
                alert("Email already in use, try again");
            }
        })
          .catch((e) => {
            console.log(e);
            // alert("Email already in use, try again");
        })
  }

  return (
      <Form onSubmit={handleSubmit}>
        <Form.Group size="lg" controlId="email">
        <Form.Label>Email</Form.Label>
          <Form.Control
            autoFocus
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>
        <Form.Group size="lg" controlId="name">
          <Form.Label>Username</Form.Label>
          <Form.Control
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
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
        <Button block size="lg" type="submit" variant="success" disabled={!validateForm()}>
              Register
        </Button>
        </Form>
  );
}
