import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Routes, Route } from "react-router"
import Login from "./pages/Login"
import Register from "./pages/Register"
import { Provider } from "react-redux"
import { store } from "./redux/store"
import Employees from "./pages/Employees"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/employees" element={<Employees />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
