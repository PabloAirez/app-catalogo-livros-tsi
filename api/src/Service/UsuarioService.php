<?php

namespace Service;

use Error\APIException;
use Model\Usuario;
use Repository\UsuarioRepository;

class UsuarioService
{
    private UsuarioRepository $repository;

    function __construct()
    {
        $this->repository = new UsuarioRepository();
    }


    function registrarUsuario(string $nome, string $email, string $senha): Usuario
    {
        $usuario = new Usuario(
            nome: $nome,
            email: $email,
            senha: $senha
        );
        $this->validarUsuario($usuario);
        return $this->repository->create($usuario);
    }
  

    function loginUsuario(string $email, string $senha): Usuario
    {
        $usuario = $this->repository->findByEmailAndPassword($email, $senha);
        if (!$usuario) {
            throw new APIException("Email ou senha inválidos!", 401);
        }
        return $usuario;
    }

    private function validarUsuario(Usuario $usuario)
    {
        if (strlen(trim($usuario->getNome())) < 5)
            throw new APIException("Nome inválido!", 400);
        if (strlen(trim($usuario->getSenha())) <= 0)
            throw new APIException("A senha não pode estar em branco!", 400);
    }
}