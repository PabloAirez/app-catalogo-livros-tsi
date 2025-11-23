<?php

// executa as configurações iniciais (autoload, tratamento de erros etc)
require_once 'src/config.php';
use Http\Request;
use Http\Response;
use Error\APIException;
use Controller\UsuarioController;
use Controller\LivroController;
use Controller\AvaliacaoController;

header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}


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
    case 'livros':
        $livroController = new LivroController();
        $livroController->processRequest($request);
        break;
    case 'avaliacoes':
        $avaliacaoController = new AvaliacaoController();
        $avaliacaoController->processRequest($request);
        break;
    case null:
        //para a raiz (rota /)
        $endpoints = [
            "GET    /livros",
            "GET    /livros/{id}",
            "POST   /livros",
            "PUT    /livros/{id}",
            "DELETE /livros/{id}",
            "POST   /usuarios",
            "POST   /usuarios/login",
            "GET    /avaliacoes/{id}",
            "POST   /avaliacoes",
            "PUT    /avaliacoes/{id}",
            "DELETE /avaliacoes/{id}"
        ];
        Response::send(["endpoints" => $endpoints]);
        break;
    default:
        //para todos os demais casos, recurso não encontrado
        throw new APIException("Rota não encontrada!", 404);
}
