<?php

namespace Controller;

use Error\APIException;
use Http\Request;
use Http\Response;
use Service\CategoriaService;

class CategoriaController
{
    private CategoriaService $service;

    public function __construct()
    {
        $this->service = new CategoriaService();
    }

    public function processRequest(Request $request): void
    {
        $method = $request->getMethod();
        $url = $request->getRoute();

        // Recebe como rota algo como 'categorias/123', com o numero sendo o id
        $segmentos = explode('/', trim($url, '/'));
        $rotaBase = $segmentos[0] ?? '';
        $id = $segmentos[1] ?? null;

        if ($rotaBase !== 'categorias') {
            throw new APIException("Rota não encontrada!", 404);
        }

        switch ($method) {
            case "GET": // READ
                // Se tiver ID, busca categoria específica
                if ($id) {
                    $categoria = $this->service->buscarCategoriaPorId((int) $id);
                    if (!$categoria) {
                        throw new APIException("Categoria não encontrada.", 404);
                    }
                    Response::send($categoria, 200);
                    break;
                }

                // Se não tem ID, lista por usuário ou todas
                $queryParams = $request->getQuery();
                
                if (isset($queryParams['usuario_id'])) {
                    $usuario_id = (int) $queryParams['usuario_id'];
                    $categorias = $this->service->listarCategoriasPorUsuario($usuario_id);
                } else {
                    $categorias = $this->service->listarTodasCategorias();
                }

                Response::send($categorias, 200);
                break;

            case "POST": // CREATE
                // Validações
                if ($id) {
                    throw new APIException("Requisição inválida para criação.", 400);
                }

                $categoriaData = $this->validarCorpoRegistro($request->getBody());
                $response = $this->service->registrarCategoria($categoriaData);
                Response::send($response, 201);
                break;

            case "PUT": // UPDATE
                // Validações
                if (!$id) {
                    throw new APIException("ID da categoria é obrigatório para alteração (PUT)", 400);
                }

                $categoriaExiste = $this->service->buscarCategoriaPorId((int) $id);
                if (!$categoriaExiste) {
                    throw new APIException("Categoria não encontrada", 404);
                }

                $categoriaData = $this->validarCorpoAlteracao($request->getBody());
                $categoriaAtualizada = $this->service->atualizarCategoria((int) $id, $categoriaData);
                Response::send($categoriaAtualizada, 200);
                break;

            case "DELETE": // DELETE
                // Validações
                if (!$id) {
                    throw new APIException("ID da categoria é obrigatório para exclusão (DELETE)", 400);
                }

                $categoriaExiste = $this->service->buscarCategoriaPorId((int) $id);
                if (!$categoriaExiste) {
                    throw new APIException("Categoria não encontrada", 404);
                }

                $this->service->excluirCategoria((int) $id);
                Response::send(null, 204);
                break;

            default:
                throw new APIException("Method not allowed!", 405);
        }
    }

    private function validarCorpoRegistro(array $body): array
    {
        // Verifica se o usuario_id foi informado
        if (!isset($body["usuario_id"])) {
            throw new APIException("O ID do usuário é obrigatório!", 400);
        }

        // Verifica se o nome foi informado
        if (!isset($body["nome"]) || empty(trim($body["nome"]))) {
            throw new APIException("O nome da categoria é obrigatório!", 400);
        }

        // Cria um array com os dados da categoria
        $data = [
            "usuario_id" => (int) $body["usuario_id"],
            "nome" => trim($body["nome"]),
        ];

        return $data;
    }

    private function validarCorpoAlteracao(array $body): array
    {
        if (empty($body)) {
            throw new APIException("Corpo da requisição vazio.", 400);
        }

        $data = [];

        if (isset($body["nome"])) {
            if (empty(trim($body["nome"]))) {
                throw new APIException("O nome da categoria não pode ser vazio.", 400);
            }
            $data["nome"] = trim($body["nome"]);
        }

        if (empty($data)) {
            throw new APIException("Nenhum campo válido para atualização.", 400);
        }

        return $data;
    }
}
