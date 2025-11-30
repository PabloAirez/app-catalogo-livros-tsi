<?php

namespace Controller;

use Error\APIException;
use Http\Request;
use Http\Response;
use Service\ListaService;

class ListaController
{
    private ListaService $service;

    public function __construct()
    {
        $this->service = new ListaService();
    }

    public function processRequest(Request $request): void
    {
        $method = $request->getMethod();
        $url = $request->getRoute();

        // Recebe como rota algo como 'listas/123', com o numero sendo o id
        $segmentos = explode('/', trim($url, '/'));
        $rotaBase = $segmentos[0] ?? '';
        $id = $segmentos[1] ?? null;

        if ($rotaBase !== 'listas') {
            throw new APIException("Rota não encontrada!", 404);
        }

        switch ($method) {
            case "GET": // READ
                // Se tiver ID, busca lista específica
                if ($id) {
                    $lista = $this->service->buscarListaPorId((int) $id);
                    if (!$lista) {
                        throw new APIException("Lista não encontrada.", 404);
                    }
                    Response::send($lista, 200);
                    break;
                }

                // Se não tem ID, lista por usuário ou todas
                $queryParams = $request->getQuery();
                
                if (isset($queryParams['usuario_id'])) {
                    $usuario_id = (int) $queryParams['usuario_id'];
                    $listas = $this->service->listarListasPorUsuario($usuario_id);
                } else {
                    $listas = $this->service->listarTodasListas();
                }

                Response::send($listas, 200);
                break;

            case "POST": // CREATE
                // Validações
                if ($id) {
                    throw new APIException("Requisição inválida para criação.", 400);
                }

                $listaData = $this->validarCorpoRegistro($request->getBody());
                $response = $this->service->registrarLista($listaData);
                Response::send($response, 201);
                break;

            case "PUT": // UPDATE
                // Validações
                if (!$id) {
                    throw new APIException("ID da lista é obrigatório para alteração (PUT)", 400);
                }

                $listaExiste = $this->service->buscarListaPorId((int) $id);
                if (!$listaExiste) {
                    throw new APIException("Lista não encontrada", 404);
                }

                $listaData = $this->validarCorpoAlteracao($request->getBody());
                $listaAtualizada = $this->service->atualizarLista((int) $id, $listaData);
                Response::send($listaAtualizada, 200);
                break;

            case "DELETE": // DELETE
                // Validações
                if (!$id) {
                    throw new APIException("ID da lista é obrigatório para exclusão (DELETE)", 400);
                }

                $listaExiste = $this->service->buscarListaPorId((int) $id);
                if (!$listaExiste) {
                    throw new APIException("Lista não encontrada", 404);
                }

                $this->service->excluirLista((int) $id);
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
            throw new APIException("O nome da lista é obrigatório!", 400);
        }

        // Cria um array com os dados da lista
        $data = [
            "usuario_id" => (int) $body["usuario_id"],
            "nome" => trim($body["nome"]),
            "descricao" => isset($body["descricao"]) ? trim($body["descricao"]) : null,
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
                throw new APIException("O nome da lista não pode ser vazio.", 400);
            }
            $data["nome"] = trim($body["nome"]);
        }

        if (isset($body["descricao"])) {
            $data["descricao"] = trim($body["descricao"]);
        }

        if (empty($data)) {
            throw new APIException("Nenhum campo válido para atualização.", 400);
        }

        return $data;
    }
}
