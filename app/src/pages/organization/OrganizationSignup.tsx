import React, { useState } from "react"
import { Formik, Form, Field } from "formik"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { api } from "../../api"
import Navbar from "../../components/Navbar"
import MetaData from "../../components/MetaData"
import * as yup from "yup"

interface OrganizationSignupValues {
  email: string
  password: string
  confirmPassword: string
  name: string
  description: string
  website: string
  first: string
  last: string
  phone: string
  tags: string
}

const initialValues: OrganizationSignupValues = {
  email: "",
  password: "",
  confirmPassword: "",
  name: "",
  description: "",
  website: "",
  first: "",
  last: "",
  phone: "",
  tags: "",
}

const validationSchema = yup.object().shape({
  name: yup.string().required("Organization name is required"),
  description: yup.string().required("Description is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  website: yup.string().url("Invalid URL").required("Website is required"),
  first: yup.string().required("First name is required"),
  last: yup.string().required("Last name is required"),
  phone: yup
    .string()
    .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .required("Phone number is required"),
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
  if (error.message?.includes("security purposes")) {
    return "Please wait a moment before trying again"
  }
  return error.message || "Failed to sign up"
}

const OrganizationSignup = () => {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string>("")

  const handleSubmit = async (values: OrganizationSignupValues) => {
    try {
      const {
        data: { user },
        error: signUpError,
      } = await signUp(values.email, values.password)

      if (signUpError) throw signUpError
      if (!user?.id) throw new Error("Failed to create user account")

      console.log("Proceeding with organization creation for auth_id:", user.id)

      const organizationResponse = await api.post(
        "/organization/create-organization",
        {
          first_name: values.first,
          last_name: values.last,
          email: values.email,
          phone: values.phone,
          org_name: values.name, // ✅ Use `org_name`
          description: values.description,
          website: values.website,
          tags: values.tags,
          auth_id: user.id,
          role: "organization",
        }
      )

      if (organizationResponse.status !== 201) {
        throw new Error("Failed to create organization profile")
      }

      navigate("/dashboard")
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
                    <label htmlFor="first">Personal First Name</label>
                    <Field
                      type="text"
                      name="first"
                      className="Form-input-box"
                      placeholder="Enter your first name"
                    />
                    {errors.first && touched.first && (
                      <div className="Form-error">{errors.first}</div>
                    )}
                  </div>
                  <div className="Form-group">
                    <label htmlFor="last">Personal Last Name</label>
                    <Field
                      type="text"
                      name="last"
                      className="Form-input-box"
                      placeholder="Enter your last name"
                    />
                    {errors.last && touched.last && (
                      <div className="Form-error">{errors.last}</div>
                    )}
                  </div>
                  <div className="Form-group">
                    <label htmlFor="phone">Phone Number</label>
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
                    {isSubmitting
                      ? "Creating Account..."
                      : "Register Organization"}
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
