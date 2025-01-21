import React, { type ReactElement } from "react"
import { Route, Routes } from "react-router-dom"
import Home from "./pages/Home"
import Game from "./pages/Game"

function App(): ReactElement {
  return (
    <div className="App">
      {/* app directory */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/game" element={<Game />} />
      </Routes>
    </div>
  )
}

export default App
