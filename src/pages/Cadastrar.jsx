import {useState,useRef} from 'react'
import '../assets/css/cadastrar.css'
import cadastrar from '../assets/js/cadastrar.js'

const Cadastrar = () => {
    const nomeRef = useRef()
    const emailRef = useRef()
    const senhaRef = useRef()

    const handleSubmit = async (e) => {
        e.preventDefault()
        const nome = nomeRef.current.value
        const email = emailRef.current.value
        const senha = senhaRef.current.value
        const response = cadastrar(nome, email, senha)
        if(response.id != null){
            //redireciona para a página de login
            window.location.href = '/'
        }else{
            alert('Erro ao cadastrar: ' + response.mensagem)
        }
    }

  return (
    <div className='cadastrar-page'>
        <div className='form-container'>
            <h2>Cadastrar Novo Usuário</h2>
            <form>
                <div className='form-group'>
                    <label htmlFor='nome'>Nome:</label>
                    <input ref={nomeRef} type='text' id='nome' name='nome' required />
                </div>
                <div className='form-group'>
                    <label htmlFor='email'>Email:</label>
                    <input ref={emailRef} type='email' id='email' name='email' required />
                </div>
                <div className='form-group'>
                    <label htmlFor='password'>Senha:</label>
                    <input ref={senhaRef} type='password' id='password' name='password' required />
                </div>
                <button onClick={(e)=>handleSubmit(e)} type='submit'>Cadastrar</button>
            </form>
        </div>
    </div>
  )
}

export default Cadastrar