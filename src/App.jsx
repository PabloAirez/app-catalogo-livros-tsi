import { BrowserRouter, Routes, Route } from "react-router-dom"
import Cadastrar from "./pages/Cadastrar.jsx"
import Login from "./pages/Login.jsx"

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login/>} />
          <Route path="/cadastrar" element={<Cadastrar/>}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App