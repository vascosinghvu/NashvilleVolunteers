import React, { useState } from "react"
import { Formik, Form, Field } from "formik"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { api } from "../api"
import Navbar from "../components/Navbar"
import MetaData from "../components/MetaData"
import * as yup from "yup"

interface OrganizationSignupValues {
  email: string
  password: string
  confirmPassword: string
  name: string
  description: string
  website: string
}

const initialValues: OrganizationSignupValues = {
  email: "",
  password: "",
  confirmPassword: "",
  name: "",
  description: "",
  website: "",
}

const validationSchema = yup.object().shape({
  name: yup.string().required("Organization name is required"),
  description: yup.string().required("Description is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  website: yup.string().url("Invalid URL").required("Website is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
})

const handleSignupError = (error: any) => {
  if (error.message?.includes('security purposes')) {
    return 'Please wait a moment before trying again'
  }
  return error.message || 'Failed to sign up'
}

const OrganizationSignup = () => {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string>("")

  const handleSubmit = async (values: OrganizationSignupValues) => {
    try {
      // First, create the auth user
      const {
        data: { user },
        error: signUpError,
      } = await signUp(values.email, values.password)

      console.log("Auth user creation response:", { user, error: signUpError })

      if (signUpError) throw signUpError

      if (!user?.id) {
        throw new Error("Failed to create user account")
      }

      // Add a longer delay to ensure auth user is fully created in Supabase
      console.log("Waiting for auth user creation...")
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log("Proceeding with organization creation for auth_id:", user.id)

      // Then create the organization profile
      const organizationResponse = await api.post("/organization/create-organization", {
        name: values.name,
        description: values.description,
        email: values.email,
        website: values.website,
        auth_id: user.id,
      })

      console.log("Organization creation attempt:", {
        request: {
          name: values.name,
          email: values.email,
          auth_id: user.id
        },
        response: organizationResponse
      })

      if (organizationResponse.status !== 201) {
        throw new Error('Failed to create organization profile')
      }

      navigate("/login")
    } catch (err) {
      console.error("Signup error details:", err)
      setError(handleSignupError(err))
    }
  }

  return (
    <>
      <Navbar />
      <MetaData
        title="Organization Sign Up - Nashville Volunteers"
        description="Create your organization account"
      />
      <div className="FormWidget">
        <div className="FormWidget-body animate__animated animate__slideInDown">
          <div className="Block">
            <div className="Block-header">Register Your Organization</div>

            {error && <div className="Form-error">{error}</div>}

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, isValid, dirty, isSubmitting }) => (
                <Form>
                  <div className="Form-group">
                    <label htmlFor="name">Organization Name</label>
                    <Field
                      type="text"
                      name="name"
                      className="Form-input-box"
                      placeholder="Enter your organization name"
                    />
                    {errors.name && touched.name && (
                      <div className="Form-error">{errors.name}</div>
                    )}
                  </div>

                  <div className="Form-group">
                    <label htmlFor="description">Description</label>
                    <Field
                      as="textarea"
                      name="description"
                      className="Form-input-box"
                      placeholder="Describe your organization"
                    />
                    {errors.description && touched.description && (
                      <div className="Form-error">{errors.description}</div>
                    )}
                  </div>

                  <div className="Form-group">
                    <label htmlFor="email">Email</label>
                    <Field
                      type="email"
                      name="email"
                      className="Form-input-box"
                      placeholder="organization@example.com"
                    />
                    {errors.email && touched.email && (
                      <div className="Form-error">{errors.email}</div>
                    )}
                  </div>

                  <div className="Form-group">
                    <label htmlFor="website">Website</label>
                    <Field
                      type="url"
                      name="website"
                      className="Form-input-box"
                      placeholder="https://www.example.com"
                    />
                    {errors.website && touched.website && (
                      <div className="Form-error">{errors.website}</div>
                    )}
                  </div>

                  <div className="Form-group">
                    <label htmlFor="password">Password</label>
                    <Field
                      type="password"
                      name="password"
                      className="Form-input-box"
                      placeholder="Enter password"
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
                      placeholder="Confirm password"
                    />
                    {errors.confirmPassword && touched.confirmPassword && (
                      <div className="Form-error">{errors.confirmPassword}</div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="Button Button-color--blue-1000 Width--100 Margin-top--10"
                    disabled={isSubmitting || !isValid || !dirty}
                  >
                    {isSubmitting ? "Creating Account..." : "Register Organization"}
                  </button>
                </Form>
              )}
            </Formik>

            <div className="Text--center Margin-top--10">
              Already have an account?
              <span
                className="Link Margin-left--4"
                onClick={() => navigate("/login")}
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

export default OrganizationSignup 