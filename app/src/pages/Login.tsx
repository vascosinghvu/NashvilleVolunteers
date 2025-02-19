import React, { useState } from "react"
import { Formik, Form, Field } from "formik"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Navbar from "../components/Navbar"
import MetaData from "../components/MetaData"
import * as yup from "yup"

// Define types for Formik
interface LoginValues {
  email: string
  password: string
}

// Define initial values
const initialValues: LoginValues = {
  email: "",
  password: "",
}

// Define validation schema using Yup
const validationSchema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
})

const Login = () => {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string>("")

  const handleSubmit = async (values: LoginValues) => {
    try {
      await signIn(values.email, values.password)

      // Get role from localStorage
      const role = localStorage.getItem("user_role")
      console.log("Role:", role)

      if (role === "volunteer") {
        navigate("/volunteer/dashboard")
      } else if (role === "organization") {
        navigate("/organization/dashboard")
      } else {
        navigate("/listings") // Fallback
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in")
    }
  }

  return (
    <>
      <Navbar />
      <MetaData
        title="Login | Nashville Volunteers"
        description="Login to your account"
      />

      <div className="FormWidget">
        <div className="FormWidget-body animate__animated animate__slideInDown">
          <div className="Block">
            <div className="Block-header">Login to Nashville Volunteers</div>

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, isValid, dirty, isSubmitting }) => (
                <Form>
                  <div className="Form-group">
                    <label htmlFor="email">Email</label>
                    <Field
                      className="Form-input-box"
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Enter your email"
                    />
                    {errors.email && touched.email && (
                      <div className="Form-error">{errors.email}</div>
                    )}
                  </div>

                  <div className="Form-group">
                    <label htmlFor="password">Password</label>
                    <Field
                      className="Form-input-box"
                      type="password"
                      id="password"
                      name="password"
                      placeholder="Enter your password"
                    />
                    {errors.password && touched.password && (
                      <div className="Form-error">{errors.password}</div>
                    )}
                  </div>

                  {error && <div className="Form-error">{error}</div>}

                  <button
                    type="submit"
                    className="Button Button-color--blue-1000 Width--100 Margin-top--10"
                    // make the button disabled if the required fields are empty
                    disabled={isSubmitting || !isValid || !dirty} // Button is disabled if fields are empty
                  >
                    {isSubmitting ? "Logging in..." : "Login"}
                  </button>
                </Form>
              )}
            </Formik>

            <div className="Text--center Margin-top--10">
              Don't have an account?{" "}
              <span
                className="Link"
                onClick={() => {
                  navigate("/signup")
                }}
              >
                Sign up
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login
