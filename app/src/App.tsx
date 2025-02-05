import { AuthProvider } from "./context/AuthContext"
import { BrowserRouter } from "react-router-dom"
import { Routes, Route } from "react-router-dom"
import Landing from "./pages/Landing"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Listings from "./pages/Listings"

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/listings" element={<Listings />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
