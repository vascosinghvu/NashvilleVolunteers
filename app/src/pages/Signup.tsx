import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import Navbar from '../components/Navbar';
import MetaData from '../components/MetaData';

interface SignupValues {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  age: number;
}

const Signup = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');

  const handleSubmit = async (values: SignupValues) => {
    try {
      // Validate passwords match
      if (values.password !== values.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      console.log('Starting signup process...');

      // First, create the auth user
      const { data: { user }, error: signUpError } = await signUp(values.email, values.password);
      console.log('Supabase signup response:', { user, error: signUpError });
      
      if (signUpError) throw signUpError;
      
      if (!user?.id) {
        throw new Error('Failed to create user account');
      }

      // Then create the volunteer profile with auth_id
      console.log('Creating volunteer with data:', {
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email,
        phone: values.phone,
        age: values.age,
        auth_id: user.id
      });

      const volunteerResponse = await api.post('/volunteer/create-volunteer', {
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email,
        phone: values.phone,
        age: values.age,
        auth_id: user.id
      });

      console.log('Volunteer creation response:', volunteerResponse);

      // Redirect to login page after successful signup
      navigate('/login');
    } catch (err) {
      console.error('Signup error details:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign up');
    }
  };

  return (
    <>
      <Navbar />
      <MetaData title="Sign Up - Nashville Volunteers" description="Create your account" />
      
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <h2 className="text-center mb-4">Sign Up</h2>
            
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <Formik
              initialValues={{
                email: '',
                password: '',
                confirmPassword: '',
                firstName: '',
                lastName: '',
                phone: '',
                age: 18
              }}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form>
                  <div className="mb-3">
                    <label htmlFor="firstName" className="form-label">First Name</label>
                    <Field
                      type="text"
                      name="firstName"
                      className="form-control"
                      placeholder="Enter your first name"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="lastName" className="form-label">Last Name</label>
                    <Field
                      type="text"
                      name="lastName"
                      className="form-control"
                      placeholder="Enter your last name"
                      required
                    />
                  </div>

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
                    <label htmlFor="phone" className="form-label">Phone</label>
                    <Field
                      type="tel"
                      name="phone"
                      className="form-control"
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="age" className="form-label">Age</label>
                    <Field
                      type="number"
                      name="age"
                      className="form-control"
                      min="18"
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

                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                    <Field
                      type="password"
                      name="confirmPassword"
                      className="form-control"
                      placeholder="Confirm your password"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="Button Button-color--blue-1000 Width--100"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating Account...' : 'Sign Up'}
                  </button>
                </Form>
              )}
            </Formik>

            <div className="text-center mt-3">
              <p>Already have an account? <Link to="/login">Login</Link></p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup; 