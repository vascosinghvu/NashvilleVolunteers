import React, { useState } from "react"
import { Formik, Form, Field } from "formik"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { api } from "../api"
import Navbar from "../components/Navbar"
import MetaData from "../components/MetaData"
import * as yup from "yup"

// Define types for Formik
interface SignupValues {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  phone: string
  age: number
}

// Define initial values
const initialValues: SignupValues = {
  email: "",
  password: "",
  confirmPassword: "",
  firstName: "",
  lastName: "",
  phone: "",
  age: 18,
}

// Define validation schema using Yup
const validationSchema = yup.object().shape({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup
    .string()
    .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .required("Phone number is required"),
  age: yup
    .number()
    .min(18, "You must be at least 18 years old")
    .required("Age is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
})

const Signup = () => {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string>("")

  const handleSubmit = async (values: SignupValues) => {
    try {
      // First, create the auth user
      const {
        data: { user },
        error: signUpError,
      } = await signUp(values.email, values.password)
      console.log("Supabase signup response:", { user, error: signUpError })

      if (signUpError) throw signUpError

      if (!user?.id) {
        throw new Error("Failed to create user account")
      }

      // Then create the volunteer profile with auth_id
      console.log("Creating volunteer with data:", {
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email,
        phone: values.phone,
        age: values.age,
        auth_id: user.id,
      })

      const volunteerResponse = await api.post("/volunteer/create-volunteer", {
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email,
        phone: values.phone,
        age: values.age,
        auth_id: user.id,
      })

      console.log("Volunteer creation response:", volunteerResponse)

      // Redirect to login page after successful signup
      navigate("/login")
    } catch (err) {
      console.error("Signup error details:", err)
      setError(err instanceof Error ? err.message : "Failed to sign up")
    }
  }

  return (
    <>
      <Navbar />
      <MetaData
        title="Sign Up - Nashville Volunteers"
        description="Create your account"
      />
      <div className="FormWidget">
        <div className="FormWidget-body animate__animated animate__slideInDown">
          <div className="Block">
            <div className="Block-header">Create Your Account</div>

            {error && <div className="Form-error">{error}</div>}

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, isValid, dirty, isSubmitting }) => (
                <Form>
                  <div className="Form-group">
                    <label htmlFor="firstName">First Name</label>
                    <Field
                      type="text"
                      name="firstName"
                      className="Form-input-box"
                      placeholder="Enter your first name"
                    />
                    {errors.firstName && touched.firstName && (
                      <div className="Form-error">{errors.firstName}</div>
                    )}
                  </div>

                  <div className="Form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <Field
                      type="text"
                      name="lastName"
                      className="Form-input-box"
                      placeholder="Enter your last name"
                    />
                    {errors.lastName && touched.lastName && (
                      <div className="Form-error">{errors.lastName}</div>
                    )}
                  </div>

                  <div className="Form-group">
                    <label htmlFor="email">Email</label>
                    <Field
                      type="email"
                      name="email"
                      className="Form-input-box"
                      placeholder="johndoe@gmail.com"
                    />
                    {errors.email && touched.email && (
                      <div className="Form-error">{errors.email}</div>
                    )}
                  </div>

                  <div className="Form-group">
                    <label htmlFor="phone">Phone</label>
                    <Field
                      type="tel"
                      name="phone"
                      className="Form-input-box"
                      placeholder="Enter your phone number"
                    />
                    {errors.phone && touched.phone && (
                      <div className="Form-error">{errors.phone}</div>
                    )}
                  </div>

                  <div className="Form-group">
                    <label htmlFor="age">Age</label>
                    <Field
                      type="number"
                      name="age"
                      className="Form-input-box"
                      min="18"
                    />
                    {errors.age && touched.age && (
                      <div className="Form-error">{errors.age}</div>
                    )}
                  </div>

                  <div className="Form-group">
                    <label htmlFor="password">Password</label>
                    <Field
                      type="password"
                      name="password"
                      className="Form-input-box"
                      placeholder="Enter your password"
                    />
                    {errors.password && touched.password && (
                      <div className="Form-error">{errors.password}</div>
                    )}
                  </div>

                  <div className="Form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <Field
                      type="password"
                      name="confirmPassword"
                      className="Form-input-box"
                      placeholder="Confirm your password"
                    />
                    {errors.confirmPassword && touched.confirmPassword && (
                      <div className="Form-error">{errors.confirmPassword}</div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="Button Button-color--blue-1000 Width--100 Margin-top--10"
                    disabled={isSubmitting || !isValid || !dirty} // Disable button when form is incomplete
                  >
                    {isSubmitting ? "Creating Account..." : "Sign Up"}
                  </button>
                </Form>
              )}
            </Formik>

            <div className="Text--center Margin-top--10">
              Already have an account?
              <span
                className="Link Margin-left--4"
                onClick={() => {
                  navigate("/login")
                }}
              >
                Login
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Signup
