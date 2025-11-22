<?php

namespace Model;

use JsonSerializable;

class Usuario implements JsonSerializable
{
    //implementando essa interface, a função json_enconde() terá acesso
    //aos membros privados do objeto através do método jsonSerialize().

    //atributos do usuario

    //o id é obrigatório e não pode ser nulo no banco de dados
    //contudo, durante o processo de criação, não temos um id, por é gerado no banco
    //assim, admite-se, nesse período, que o id seja nulo (nulo != opcional), indicando-se com ? 
    private ?int $id;
    private string $nome;
    private string $email;
    private string $senha;

    //construtor
    public function __construct(string $nome, string $email, string $senha,?int $id = null)
    {
        //o parâmetro id do construtor é opcional, mas se não informado
        //recebe o valor nulo (pois o atributo não é opcional)
        $this->id = $id;
        $this->nome = trim($nome);
        $this->email = trim($email);
        $this->senha = trim($senha);
    }

    //métodos GET
    public function getId(): int
    {
        return $this->id;
    }

    public function getNome(): string
    {
        return $this->nome;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

     public function getPassword(): string
    {
        return $this->senha;
    }

    //métodos SET
    public function setId(int $id)
    { //repare que id só admite nulo no processo de criação, aqui não!
        $this->id = $id;
    }

    public function setNome(string $nome)
    {
        $this->nome = trim($nome);
    }

    public function setEmail(string $email)
    {
        $this->email = trim($email);
    }
    public function setSenha(string $senha)
    {
        $this->senha = trim($senha);
    }

    

    //a interface JsonSerializable exige a implementação desse método
    //basicamene ele retorna todas (mas poderáimos customizar) os atributos do curso,
    //agora com acesso público, de forma que a função json_encode() possa acessá-los
    public function jsonSerialize(): array
    {
        // Nao devolve a senha hash
        $vars = [
            'id' => $this->id,
            'nome' => $this->getNome(),
            'email' => $this->getEmail(),
            // $this->senha // Não deve devolver a senha
        ];
        return $vars;
    }
}