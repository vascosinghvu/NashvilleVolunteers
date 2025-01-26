import React, { type ReactElement } from "react"
import { Formik, Form, Field } from "formik" // ✅ Import Formik components
import Navbar from "../components/Navbar"
import Icon from "../components/Icon"

const Game = (): ReactElement => {
  // Handle form submission
  const handleSubmit = async (values: { search: string }) => {
    console.log(values)
  }

  return (
    <>
      <Navbar />
      <div className="Listings">
        <h1 className="Flex--center Margin-top--40">Nashville Volunteers</h1>
        <div className="Flex--center">
          Discover meaningful volunteering opportunities in and around
          Nashville. Make a difference in your community today.
        </div>

        <div className="Flex--center Margin-top--20 Align-items--center">
          <Formik initialValues={{ search: "" }} onSubmit={handleSubmit}>
            {({ errors, touched }) => (
              <Form className="Form-row">
                <Field
                  className="Form-input-box"
                  type="text"
                  id="keyword"
                  name="search"
                  placeholder="Soup Kitchen, Animal Shelter, etc."
                />
                <button
                  type="submit"
                  className="Button Button--small Button-color--pink-1000 Margin-left--10"
                >
                  Search
                </button>
                {errors.search && touched.search && (
                  <div className="Form-error">{errors.search}</div>
                )}
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </>
  )
}

export default Game
