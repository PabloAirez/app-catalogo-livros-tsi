<?php

// executa as configurações iniciais (autoload, tratamento de erros etc)
require_once 'src/config.php';
use Http\Request;
use Http\Response;
use Error\APIException;
use Controllers\AuthController;


//cria um objeto para armazenar os principais dados da requisição
$uri = $_SERVER['REQUEST_URI'];
$method = $_SERVER["REQUEST_METHOD"];
$body = file_get_contents("php://input");
$request = new Request($uri, $method, $body);

switch ($request->getResource()) { 
    case 'auth':
        //para todas as rotas iniciadas por /auth
        $authController = new AuthController();
        $authController->processRequest($request);
        break;
    case null:
        //para a raiz (rota /)
        $endpoints = [
            "POST /api/auth/registro",
            "POST /api/auth/login"
        ];
        Response::send(["endpoints" => $endpoints]);
        break;
    default:
        //para todos os demais casos, recurso não encontrado
        throw new APIException("Resource not found!", 404);
}