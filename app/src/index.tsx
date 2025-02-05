import ReactDOM from "react-dom"
import { BrowserRouter } from "react-router-dom"
import "./styles/main.scss"
import App from "./App"
import { AuthProvider } from "./context/AuthContext"
import reportWebVitals from "./reportWebVitals"

// get the root element
ReactDOM.render(
  <AuthProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </AuthProvider>,
  document.getElementById("root")
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
