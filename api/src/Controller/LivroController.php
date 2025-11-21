<?php
namespace Controller;

use Error\APIException;
use Http\Request;
use Http\Response;
use Service\LivroService;

class LivroController
{
    private LivroService $service;

    public function __construct()
    {
        //cria o service de autenticação
        $this->service = new LivroService();
    }

    public function processRequest(Request $request): void
    {
        $method = $request->getMethod();
        $url = $request->getRoute();

        // recebe como rota algo como 'livros/123', com o numero sendo o id
        // OBS: QUEBRA COM /livros/
        // (NÃO ESQUECE DE LIDAR COM ISSO, henrique)
        $segmentos = explode('/', trim($url, '/'));
        $rotaBase = $segmentos[0] ?? '';
        $id = $segmentos[1] ?? null;

        if($rotaBase !== 'livros') {
            throw new APIException("Rota não encontrada!", 404);
        }


        switch ($method) {
            case "GET": // READ
                if($id) {
                    // se a requisicao tiver um id, ele busca somente um livro
                    $response = $this->service->buscarLivroPorId($id);
                    if(!$response) throw new APIException("livro não encontrado", 404);
                } else {
                    // se nao for especificado, quer dizer que esta buscando todos
                    $response = $this->service->buscarTodosLivros();
                }
                Response::send($response, 200);
                break;
            case "POST": // CREATE

                //Validações
                if ($id)throw new APIException("Requisição invalido para criação.", 400);

                $livroData = $this->validarCorpoRegistro($request->getBody());
                $response = $this->service->registrarLivro($livroData);
                Response::send($response, 201);
                break;
            case "PUT": // UPDATE
                // Validações
                $livroExiste = $this->service->buscarLivroPorId($id);
                if(!$livroExiste) throw new APIException("Livro não encontrado", 404);
                if(!$id) throw new APIException("ID do livro é obrigatorio para alteração (PUT)", 400);

                $livroData = $this->validarCorpoAlteracaoLivro($request->getBody());
                $this->service->atualizarLivro((int) $id, $livroData);
                Response::send(null, 204); // não devolve nada
                break;
            case "DELETE":
                // Validações
                $livroExiste = $this->service->buscarLivroPorId($id);
                if(!$livroExiste) throw new APIException("Livro não encontrado", 404);
                if(!$id) throw new APIException("ID do livro é obrigatorio para exclusão (DELETE)", 400);

                $this->service->excluirLivro((int) $id);
                Response::send(null, 204);
                break;
            default:
                //para qualquer outro método, gera uma exceção
                throw new APIException("Method not allowed!", 405);
        }
        
    }

    private function validarCorpoRegistro(array $body): array
    {
        //verifica se o nome do usuário foi informado
        if (!isset($body["titulo"]))
            throw new APIException("O titulo é obrigatório!", 400);

        //verifica se o e-mail do usuário foi informado
        if (!isset($body["autor"]))
            throw new APIException("O autor é obrigatório!", 400);

        //verifica se a senha do usuário foi informada
        if (!isset($body["isbn"]))
            throw new APIException("O ISBN é obrigatório!", 400);

        //verifica se a senha do usuário foi informada
        if (!isset($body["usuario_id"]))
            throw new APIException("O ID do usuario é obrigatório!", 400);

        //cria um array com os dados do livro
        $data = [
            "titulo" => trim($body["titulo"]),
            "autor" => trim($body["autor"]),
            "isbn" => trim($body["isbn"]),
            "usuario_id" => (int) $body["usuario_id"], // Garante que é um INT
            "editora" => isset($body["editora"]) ? trim($body["editora"]) : null,
            "data_publicacao" => isset($body["data_publicacao"]) ? trim($body["data_publicacao"]) : null,
            "url_capa" => isset($body["url_capa"]) ? trim($body["url_capa"]) : null,
            "descricao" => isset($body["descricao"]) ? trim($body["descricao"]) : null,
        ];
        //retorna o array criado
        return $data;
    }

    private function validarCorpoAlteracaoLivro(array $body): array
    {
        if (empty($body)) {
            throw new APIException("Corpo da requisição vazio.", 400);
        }

        $data = [];

        if (isset($body["titulo"]))
            $data["titulo"] = trim($body["titulo"]);

        if (isset($body["autor"]))
            $data["autor"] = trim($body["autor"]);

        if (isset($body["isbn"]))
            $data["isbn"] = trim($body["isbn"]);

        if (isset($body["usuario_id"]))
            $data["usuario_id"] = (int)$body["usuario_id"];

        if (isset($body["editora"]))
            $data["editora"] = $body["editora"] === null ? null : trim($body["editora"]);

        if (isset($body["data_publicacao"]))
            $data["data_publicacao"] = $body["data_publicacao"] === null ? null : trim($body["data_publicacao"]);

        if (isset($body["url_capa"]))
            $data["url_capa"] = $body["url_capa"] === null ? null : trim($body["url_capa"]);

        if (isset($body["descricao"]))
            $data["descricao"] = $body["descricao"] === null ? null : trim($body["descricao"]);


        if (empty($data))
            throw new APIException("Nenhum campo válido para atualização.", 400);

        return $data;
    }
}