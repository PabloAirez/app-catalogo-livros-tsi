import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Importante!

// Importe seus componentes
import Login from './pages/Login.jsx';
import Dashboard from './pages/dashboard.jsx';

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <ToastContainer position="top-right" autoClose={3000} />
        
        <Routes>
          <Route path="/" element={<Login/>} />
          <Route path="/cadastrar" element={<Login/>} />
          
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App;