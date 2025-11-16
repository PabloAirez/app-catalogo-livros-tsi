<?php
namespace Controller;

use Error\APIException;
use Http\Request;
use Http\Response;
use Service\UsuarioService;

class UsuarioController
{
    private UsuarioService $service;

    public function __construct()
    {
        //cria o service de autenticação
        $this->service = new UsuarioService();
    }

    public function processRequest(Request $request): void
    {
        $method = $request->getMethod();
        $url = $request->getRoute();
        switch ($method) {
            case "POST":
                if($url === "usuarios"){
                    //verifica se o corpo da requisição está correto
                    $usuario = $this->validarCorpoRegistro($request->getBody());
                    $response = $this->service->registrarUsuario(...$usuario);
                    //retorna o curso criado no formato JSON
                    Response::send($response, 201);
                    break;
                } elseif($url === "usuarios/login"){
                    //verifica se o corpo da requisição está correto
                    $usuario = $this->validarCorpoLogin($request->getBody());
                    $response = $this->service->loginUsuario(...$usuario);
                    //retorna o curso criado no formato JSON
                    Response::send($response, 200);
                    break;

                }
            default:
                //para qualquer outro método, gera uma exceção
                throw new APIException("Method not allowed!", 405);
        }
        
    }

    private function validarCorpoRegistro(array $body): array
    {
        //verifica se o nome do usuário foi informado
        if (!isset($body["nome"]))
            throw new APIException("O nome é obrigatório!", 400);

        //verifica se o e-mail do usuário foi informado
        if (!isset($body["email"]))
            throw new APIException("O email é obrigatório!", 400);

        //verifica se a senha do usuário foi informada
        if (!isset($body["senha"]))
            throw new APIException("A senha é obrigatória!", 400);


        //cria um array com os dados do curso
        $registro = [];
        $registro["nome"] = trim($body["nome"]);
        $registro["email"] = trim($body["email"]);
        $registro["senha"] = trim($body["senha"]);
        //retorna o array criado
        return $registro;
    }

    private function validarCorpoLogin(array $body): array
    {
        //verifica se o e-mail do usuário foi informado
        if (!isset($body["email"]))
            throw new APIException("O email é obrigatório!", 400);

        //verifica se a senha do usuário foi informada
        if (!isset($body["senha"]))
            throw new APIException("A senha é obrigatória!", 400);


        //cria um array com os dados do curso
        $registro = [];
        $registro["email"] = trim($body["email"]);
        $registro["senha"] = trim($body["senha"]);
        //retorna o array criado
        return $registro;
    }
}