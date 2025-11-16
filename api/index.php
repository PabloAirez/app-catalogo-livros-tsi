<?php

// executa as configurações iniciais (autoload, tratamento de erros etc)
require_once 'src/config.php';
use Http\Request;
use Http\Response;
use Error\APIException;
use Controller\UsuarioController;


//cria um objeto para armazenar os principais dados da requisição
$uri = $_SERVER['REQUEST_URI'];
$method = $_SERVER["REQUEST_METHOD"];
$body = file_get_contents("php://input");
$request = new Request($uri, $method, $body);

switch ($request->getResource()) { 
    case 'usuarios':
        //para todas as rotas iniciadas por /auth
        $usuariosController = new UsuarioController();
        $usuariosController->processRequest($request);
        break;
    case null:
        //para a raiz (rota /)
        $endpoints = [
            "POST /api/usuario",
            "POST /api/usuario/login"
        ];
        Response::send(["endpoints" => $endpoints]);
        break;
    default:
        //para todos os demais casos, recurso não encontrado
        throw new APIException("Rota não encontrada!", 404);
}