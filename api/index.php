<?php

// executa as configurações iniciais (autoload, tratamento de erros etc)
require_once 'src/config.php';
use Http\Request;
use Http\Response;
use Error\APIException;
use Controller\UsuarioController;
use Controller\LivroController;
use Controller\AvaliacaoController;
use Controller\CategoriaController;

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
    case 'categorias':
        $categoriaController = new CategoriaController();
        $categoriaController->processRequest($request);
        break;
    case null:
        //para a raiz (rota /)
        // TODO: implementar o GET da associação de livros com categorias ou listas por id
        // (Vai lá no LivroController que tu vai entender melhor)
        $endpoints = [
            "GET    /livros",
            "GET    /livros/{id}",
            "POST   /livros",
            "PUT    /livros/{id}",
            "DELETE /livros/{id}",
            "GET    /livros/{id}/categorias",
            # "GET    /livros/{id}/categorias/{idCategoria}",
            "POST   /livros/{id}/categorias/{idCategoria}",
            "DELETE /livros/{id}/categorias/{idCategoria}",
            "GET    /livros/{id}/listas",
            # "GET    /livros/{id}/listas/{idLista}",
            "POST   /livros/{id}/listas/{idLista}",
            "DELETE /livros/{id}/listas/{idLista}",
            "POST   /usuarios",
            "POST   /usuarios/login",
            "GET    /avaliacoes/{id}",
            "POST   /avaliacoes",
            "PUT    /avaliacoes/{id}",
            "DELETE /avaliacoes/{id}",
            "GET    /categorias",
            "GET    /categorias/{id}",
            "POST   /categorias",
            "PUT    /categorias/{id}",
            "DELETE /categorias/{id}"
        ];
        Response::send(["endpoints" => $endpoints]);
        break;
    default:
        //para todos os demais casos, recurso não encontrado
        throw new APIException("Rota não encontrada!", 404);
}
