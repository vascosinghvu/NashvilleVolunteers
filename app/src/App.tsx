import React, { type ReactElement } from "react"
import { Route, Routes } from "react-router-dom"
import Listings from "./pages/Listings"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import { AuthProvider } from "./context/AuthContext"
import { ProtectedRoute } from "./components/ProtectedRoute"

function App(): ReactElement {
  return (
    <AuthProvider>
      <div className="App">
        {/* app directory */}
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Listings />} />
          <Route path="/listings" element={<Listings />} />
          {/* Protected routes will go here */}
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App
