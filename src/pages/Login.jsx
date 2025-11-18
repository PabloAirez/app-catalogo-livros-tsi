import { Link } from "react-router-dom"
import '../assets/css/login.css'
import login from '../assets/js/login.js'
import {useState,useRef} from 'react'


const Login = () => {
    const emailRef = useRef()
    const senhaRef = useRef()

    const handleSubmit = async (e) => {
        e.preventDefault()
        const email = emailRef.current.value
        const senha = senhaRef.current.value
        const response = login(email, senha)
        if(response.id != null){
            //redireciona para a página principal
            window.localStorage.setItem('usuario', JSON.stringify(response.data))
            window.location.href = '/dashboard'
        }else{
            alert('Erro ao fazer login: ' + response.mensagem)
        }
    }

  return (
    <div className='login-page'>
        <div className='form-container'>
            <h2>Fazer Login</h2>
            <form>
                <div className='form-group'>
                    <label htmlFor='email'>Email:</label>
                    <input ref={emailRef} type='email' id='email' name='email' required />
                </div>
                <div className='form-group'>
                    <label htmlFor='password'>Senha:</label>
                    <input ref={senhaRef} type='password' id='password' name='password' required />
                </div>
                <button onClick={(e)=>handleSubmit(e)} type='submit'>Entrar</button>
            </form>
            <div>
                <Link to='/cadastrar'>Cadastre-se</Link>

            </div>
        </div>
    </div>
  )
}

export default Login