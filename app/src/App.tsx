import React from "react"
import { Route, Routes } from "react-router-dom"
import Listings from "./pages/Listings"
import Landing from "./pages/Landing"

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/listings" element={<Listings />} />
      </Routes>
    </div>
  )
}

export default App
