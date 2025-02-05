import React from "react"
import { Route, Routes } from "react-router-dom"
import Listings from "./pages/Listings"
import Landing from "./pages/Landing"
import Register from "./pages/Register"

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  )
}

export default App
