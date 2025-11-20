import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from './pages/Login.jsx'
import 'react-toastify/dist/ReactToastify.css'; // Importe o CSS primeiro
import { ToastContainer } from 'react-toastify';


const App = () => {
  return (
    <div>
      <BrowserRouter>
       <ToastContainer />
        <Routes>
          <Route path="/" element={<Login/>} />
          <Route path="/cadastrar" element={<Login/>}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App