import { Route, Routes, useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { useAuth } from "./context/AuthContext"
import Listings from "./pages/Listings"
import Landing from "./pages/Landing"
import Register from "./pages/Register"
import Login from "./pages/Login"
import Logout from "./pages/Logout"
import Signup from "./pages/Signup"
import Profile from "./pages/Profile"

function App() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (window.location.pathname === "/") {
      navigate(user ? "/listings" : "/home")
    }
  }, [user, navigate])

  return (
    <div className="App">
      <Routes>
        <Route path="/home" element={<Landing />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </div>
  )
}

export default App
