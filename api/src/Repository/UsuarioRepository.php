<?php

namespace Repository;

use Database\Database;
use Model\Usuario;
use PDO;

class UsuarioRepository
{
    private $connection;

    public function __construct()
    {
        //obtém a conexão
        $this->connection = Database::getConnection();
    }

    public function findAll(): array
    {
        //executa a consulta no banco
        $stmt = $this->connection->prepare("SELECT * FROM USUARIOS");
        $stmt->execute();

        //para cada linha de retorno, cria um objeto Curso
        //e aramazena em um array
        $usuarios = [];
        while ($row = $stmt->fetch()) {
            $usuario = new Usuario(
                id: $row['id'],
                nome: $row['nome'],
                email: $row['email'],
                senha: $row['senha'],
            );
            $usuarios[] = $usuario;
        }

        //retorna o conjunto de usuarios encontrado
        return $usuarios;
    }

    
    public function findById(int $id): ?Usuario
    {
        //executa a consulta no banco
        $stmt = $this->connection->prepare("SELECT * FROM USUARIOS 
                                          WHERE id = :id");
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        //se não achou, retorna nulo
        $row = $stmt->fetch();
        if (!$row)
            return null;

        //se achou, cria um objeto Usuario
       $usuario = new Usuario(
                id: $row['id'],
                nome: $row['nome'],
                email: $row['email'],
                senha: $row['senha'],
            );

        //retorna o usuario encontrado
        return $usuario;
    }

    public function create(Usuario $usuario): Usuario
    {
        //executa a operação no banco    
        $stmt = $this->connection->prepare("INSERT INTO USUARIOS (nome, email, senha) 
                                          VALUES (:nome, :email, :senha);");
        $stmt->bindValue(':nome', $usuario->getNome());
        $stmt->bindValue(':email', $usuario->getEmail());
        $stmt->bindValue(':senha', $usuario->getPassword());
        $stmt->execute();

        //recupera o id gerado pelo banco
        $usuario->setId($this->connection->lastInsertId());

        //retorna o curso criado
        return $usuario;
    }

    public function update(Usuario $usuario): void
    {
      
    }

    public function delete(int $id): void
    {
      
    }

    public function findByEmailAndPassword(string $email, string $senha): ?Usuario
    {
        //executa a consulta no banco
        $stmt = $this->connection->prepare("SELECT * FROM USUARIOS 
                                          WHERE email = :email");
        $stmt->bindValue(':email', $email);
        $stmt->execute();

        //se não achou, retorna nulo
        $row = $stmt->fetch();
        if (!$row)
            return null;

        //verifica se a senha está correta
        if (!password_verify($senha, $row['senha']))
            return null;

        //se achou, cria um objeto Usuario
       $usuario = new Usuario(
                id: $row['id'],
                nome: $row['nome'],
                email: $row['email'],
                senha: $row['senha'],
            );

        //retorna o usuario encontrado
        return $usuario;
    }
}