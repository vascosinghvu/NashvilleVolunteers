import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import MetaData from '../components/MetaData';

interface LoginValues {
  email: string;
  password: string;
}

const Login = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');

  const handleSubmit = async (values: LoginValues) => {
    try {
      await signIn(values.email, values.password);
      navigate('/listings'); // Redirect to listings page after successful login
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    }
  };

  return (
    <>
      <Navbar />
      <MetaData title="Login - Nashville Volunteers" description="Login to your account" />
      
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <h2 className="text-center mb-4">Login</h2>
            
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <Formik
              initialValues={{ email: '', password: '' }}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <Field
                      type="email"
                      name="email"
                      className="form-control"
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <Field
                      type="password"
                      name="password"
                      className="form-control"
                      placeholder="Enter your password"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="Button Button-color--blue-1000 Width--100"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Logging in...' : 'Login'}
                  </button>
                </Form>
              )}
            </Formik>

            <div className="text-center mt-3">
              <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login; 