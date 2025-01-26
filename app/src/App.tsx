import React, { type ReactElement } from "react"
import { Route, Routes } from "react-router-dom"
import Listings from "./pages/Listings"

function App(): ReactElement {
  return (
    <div className="App">
      {/* app directory */}
      <Routes>
        <Route path="/" element={<Listings />} />
        <Route path="/listings" element={<Listings />} />
      </Routes>
    </div>
  )
}

export default App
