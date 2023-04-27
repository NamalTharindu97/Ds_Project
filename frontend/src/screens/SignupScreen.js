import Axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Helmet } from 'react-helmet-async';
import { useContext, useEffect, useState } from 'react';
import { Store } from '../Store';
import { toast } from 'react-toastify';
import { getError } from '../utils';

export default function SignupScreen() {
  const navigate = useNavigate();
  const { search } = useLocation();
  // get the "redirect" parameter from the URL query string, if it exists
  const redirectInUrl = new URLSearchParams(search).get('redirect');
  // set the redirect path to the "redirect" parameter value or the root path
  const redirect = redirectInUrl ? redirectInUrl : '/';

  // define state variables for the form input fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // get the user info from the global state
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;
  // handle the form submission
  const submitHandler = async (e) => {
    e.preventDefault();
    // check if the password and confirm password fields match
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      // send a POST request to the server to create a new user account
      const { data } = await Axios.post(
        'http://localhost:5002/api/users/signup',
        {
          name,
          email,
          password,
        }
      );
      // update the global state with the user info and save it to local storage
      ctxDispatch({ type: 'USER_SIGNIN', payload: data });
      localStorage.setItem('userInfo', JSON.stringify(data));
      // navigate to the redirect path
      navigate(redirect || '/');
    } catch (err) {
      // display an error message if the server returns an error
      toast.error(getError(err));
    }
  };
  // redirect to the home page if the user is already signed in
  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  return (
    <Container className="small-container">
      <Helmet>
        <title>Sign Up</title>
      </Helmet>
      <h1 className="my-3">Sign Up</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className="mb-3" controlId="name">
          <Form.Label>Name</Form.Label>
          <Form.Control onChange={(e) => setName(e.target.value)} required />
        </Form.Group>

        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          <Form.Group className="mb-3" controlId="confirmPassword">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </Form.Group>
        </Form.Group>
        <div className="mb-3">
          <Button type="submit">Sign Up</Button>
        </div>
        <div className="mb-3">
          Already have an account?{' '}
          <Link to={`/signin?redirect=${redirect}`}>Sign-In</Link>
        </div>
      </Form>
    </Container>
  );
}
