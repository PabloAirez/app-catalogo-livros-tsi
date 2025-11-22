import React, { useState } from 'react';
import '../assets/css/login.css'; 
import bookIcon from '../assets/img/livro.png'; 
import { toast } from 'react-toastify';


const Login = () => {
  const [isActive, setIsActive] = useState(false);

  // 1. Estados para armazenar os dados dos formulários
  const [loginData, setLoginData] = useState({
    email: '',
    senha: ''
  });

  const [registerData, setRegisterData] = useState({
    nome: '',
    email: '',
    senha: ''
  });

  // Alternar entre Login e Cadastro
  const toggleForm = () => {
    setIsActive(!isActive);
  };

  // 2. Função genérica para atualizar os inputs de Login
  const handleLoginChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // 2. Função genérica para atualizar os inputs de Cadastro
  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 3. Lógica de envio do Login
  const submitLogin = async (e) => {
    e.preventDefault();
    // Mostra no console o que está sendo enviado (Para teste)
    console.log('Dados de Login prontos para envio:', loginData);

    try {
      // Substitua a URL abaixo pelo seu endpoint real do backend
      const response = await fetch('http://localhost/app-catalogo-livros-tsi/api/usuarios/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData), // Converte o objeto JS para JSON
      });

      if (response.ok) {
        const data = await response.json();
        window.localStorage.setItem('usuario', JSON.stringify(data));
         toast.success('Login bem-sucedido!');
        // Redireciona para a página principal após o login bem-sucedido
        window.location.href = '/dashboard';
      } else {
        toast.error('Erro na autenticação:'+ data);
      }
    } catch (error) {
      toast.error('Erro ao conectar com o servidor:', error);

    }
  };

  // 3. Lógica de envio do Cadastro
  const submitRegister = async (e) => {
    e.preventDefault();

   

    console.log('Dados de Cadastro prontos para envio:', registerData);

    try {
      // Substitua a URL abaixo pelo seu endpoint real do backend
      const response = await fetch('http://localhost/app-catalogo-livros-tsi/api/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      if (response.ok) {
        toast.success('Conta criada com sucesso!');
        toggleForm(); // Volta para a tela de login
      }
    } catch (error) {
      toast.error('Erro ao registrar:', error);
    }
  };

  return (
    <div className="page-wrapper">
      <div className={`container ${isActive ? 'active' : ''}`} id="main-card">
        
        {/* --- Cabeçalho --- */}
        <div className="top-image">
          <div className="big-icon-wrapper">
             <img src={bookIcon} alt="Livro" className="big-icon" />
          </div>
          <div className="waves">
            <svg viewBox="0 0 500 150" preserveAspectRatio="none">
              <path 
                d="M0.00,49.98 C149.99,150.00 349.20,-49.98 500.00,49.98 L500.00,150.00 L0.00,150.00 Z" 
                style={{ stroke: 'none', fill: '#fdfdfd' }}
              ></path>
            </svg>
          </div>
        </div>

        {/* --- Área dos Formulários --- */}
        <div className="form-box">
          
          {/* === FORMULÁRIO DE LOGIN === */}
          <div className="form-content" id="login-form">
            <h2>Login</h2>
            <form onSubmit={submitLogin}>
              <div className="input-group">
                <i className="fas fa-user"></i>
                <input 
                  type="email" 
                  name="email"
                  placeholder="Email" 
                  value={loginData.email}
                  onChange={handleLoginChange}
                  required 
                />
              </div>
              <div className="input-group">
                <i className="fas fa-lock"></i>
                <input 
                  type="password" 
                  name="senha"
                  placeholder="Senha" 
                  value={loginData.senha}
                  onChange={handleLoginChange}
                  required 
                />
              </div>

             

              <button type="submit" className="btn-submit">Entrar</button>

              <div className="create-account">
                <p>Ainda não tem conta? <span onClick={toggleForm}>Criar Conta</span></p>
              </div>
            </form>
          </div>

          {/* === FORMULÁRIO DE CADASTRO === */}
          <div className="form-content" id="register-form">
            <h2>Criar Conta</h2>
            <form onSubmit={submitRegister}>
              <div className="input-group">
                <i className="fas fa-user"></i>
                <input 
                  type="text" 
                  name="nome"
                  placeholder="Nome Completo" 
                  value={registerData.nome}
                  onChange={handleRegisterChange}
                  required 
                />
              </div>
              <div className="input-group">
                <i className="fas fa-envelope"></i>
                <input 
                  type="email" 
                  name="email"
                  placeholder="Email" 
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  required 
                />
              </div>
              <div className="input-group">
                <i className="fas fa-lock"></i>
                <input 
                  type="password" 
                  name="senha"
                  placeholder="Senha" 
                  value={registerData.senha}
                  onChange={handleRegisterChange}
                  required 
                />
              </div>
              

              <button type="submit" className="btn-submit">Cadastrar</button>

              <div className="create-account">
                <p>Já tem uma conta? <span onClick={toggleForm}>Fazer Login</span></p>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;