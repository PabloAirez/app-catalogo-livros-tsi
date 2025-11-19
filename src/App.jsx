import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from './pages/Login.jsx'

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login/>} />
          <Route path="/cadastrar" element={<Login/>}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App