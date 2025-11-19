import React, { useState } from 'react';
import '../assets/css/login.css'; 
import bookIcon from '../assets/img/livro.png'; 

const Login = () => {
  const [isActive, setIsActive] = useState(false);

  // 1. Estados para armazenar os dados dos formulários
  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
    remember: false
  });

  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
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
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData), // Converte o objeto JS para JSON
      });

      if (response.ok) {
        console.log('Login enviado com sucesso!');
        // Aqui você redirecionaria o usuário ou salvaria o token
      } else {
        console.error('Erro na autenticação');
      }
    } catch (error) {
      console.error('Erro ao conectar com o servidor:', error);
    }
  };

  // 3. Lógica de envio do Cadastro
  const submitRegister = async (e) => {
    e.preventDefault();

    // Validação simples de senha
    if (registerData.password !== registerData.confirmPassword) {
      alert("As senhas não conferem!");
      return;
    }

    console.log('Dados de Cadastro prontos para envio:', registerData);

    try {
      // Substitua a URL abaixo pelo seu endpoint real do backend
      const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      if (response.ok) {
        alert('Conta criada com sucesso!');
        toggleForm(); // Volta para a tela de login
      }
    } catch (error) {
      console.error('Erro ao registrar:', error);
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
                  type="text" 
                  name="username"
                  placeholder="Username" 
                  value={loginData.username}
                  onChange={handleLoginChange}
                  required 
                />
              </div>
              <div className="input-group">
                <i className="fas fa-lock"></i>
                <input 
                  type="password" 
                  name="password"
                  placeholder="Password" 
                  value={loginData.password}
                  onChange={handleLoginChange}
                  required 
                />
              </div>

              <div className="options">
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    name="remember"
                    checked={loginData.remember}
                    onChange={handleLoginChange}
                  />
                  <span className="slider"></span>
                  Lembrar de mim
                </label>
                <a href="#forgot">Esqueceu a senha?</a>
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
                  name="fullName"
                  placeholder="Nome Completo" 
                  value={registerData.fullName}
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
                  name="password"
                  placeholder="Senha" 
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  required 
                />
              </div>
              <div className="input-group">
                <i className="fas fa-check-circle"></i>
                <input 
                  type="password" 
                  name="confirmPassword"
                  placeholder="Confirmar Senha" 
                  value={registerData.confirmPassword}
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