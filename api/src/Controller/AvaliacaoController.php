<?php
namespace Controller;

use Error\APIException;
use Http\Request;
use Http\Response;
use Service\AvaliacaoService;

class AvaliacaoController
{
    private AvaliacaoService $service;

    public function __construct()
    {
        $this->service = new AvaliacaoService();
    }

    public function processRequest(Request $request): void
    {
        $method = $request->getMethod();
        $url = $request->getRoute();

        // recebe como rota algo como 'avaliacoes/123', com o numero sendo o id
        $segmentos = explode('/', trim($url, '/'));
        $rotaBase = $segmentos[0] ?? '';
        $id = $segmentos[1] ?? null;

        if($rotaBase !== 'avaliacoes') {
            throw new APIException("Rota não encontrada!", 404);
        }

        switch ($method) {
            case "GET": // READ
                // Validações
                if($segmentos[1] === 'livro' && isset($segmentos[2])) {
                    // Rota para buscar avaliação pelo ID do livro
                    $bookId = (int) $segmentos[2];
                    $avaliacao = $this->service->buscarAvaliacaoPeloIdLivro($bookId);
                    if (!$avaliacao) {
                        throw new APIException("Avaliação para o livro com ID $bookId não encontrada.", 404);
                    }
                    Response::send($avaliacao, 200);
                    break;
                }

                if(!$id) throw new APIException("Avaliação não especificada.", 404);


                Response::send($this->service->buscarAvaliacaoPorId($id), 200);
                break;

            case "POST": // CREATE
                //Validações
                if ($id)throw new APIException("Requisição invalida para criação.", 400);

                $avaliacaoData = $this->validarCorpoRegistro($request->getBody());
                $response = $this->service->registrarAvaliacao($avaliacaoData);
                Response::send($response, 201);
                break;

            case "PUT": // UPDATE
                // Validações
                $avaliacaoExiste = $this->service->buscarAvaliacaoPorId($id);
                if(!$avaliacaoExiste) throw new APIException("Avaliação não encontrada", 404);
                if(!$id) throw new APIException("ID da avaliação é obrigatorio para alteração (PUT)", 400);

                $avaliacaoData = $this->validarCorpoAlteracaoAvaliacao($request->getBody());
                $avaliacaoAtualizada = $this->service->atualizarAvaliacao((int) $id, $avaliacaoData);
                Response::send($avaliacaoAtualizada, 201); 
                break;
                
            case "DELETE":
                // Validações
                $avaliacaoExiste = $this->service->buscarAvaliacaoPorId($id);
                if(!$avaliacaoExiste) throw new APIException("Avaliação não encontrada", 404);
                if(!$id) throw new APIException("ID da avaliação é obrigatorio para exclusão (DELETE)", 400);

                $this->service->excluirAvaliacao((int) $id);
                Response::send(null, 204);
                break;
            default:
                //para qualquer outro método, gera uma exceção
                throw new APIException("Method not allowed!", 405);
        }
        
    }

    private function validarCorpoRegistro(array $body): array
    {
        //verifica se o usuario_id foi informado
        if (!isset($body["usuario_id"]))
            throw new APIException("O ID do usuario é obrigatório!", 400);

        //verifica se o livro_id foi informado
        if (!isset($body["livro_id"]))
            throw new APIException("O ID do livro é obrigatório!", 400);

        //verifica se a nota foi informada
        if (!isset($body["nota"]))
            throw new APIException("A nota é obrigatória!", 400);

        //cria um array com os dados da avaliacao
        $data = [
            "usuario_id" => (int) $body["usuario_id"],
            "livro_id" => (int) $body["livro_id"],
            "nota" => (float) $body["nota"],
            "comentario" => isset($body["comentario"]) ? trim($body["comentario"]) : null,
            "criado_em" => Date('Y-m-d H:i:s')
        ];
        //retorna o array criado
        return $data;
    }

    private function validarCorpoAlteracaoAvaliacao(array $body): array
    {
        if (empty($body)) {
            throw new APIException("Corpo da requisição vazio.", 400);
        }

        $data = [];

        if (isset($body["nota"]))
            $data["nota"] = (float) $body["nota"];

        if (isset($body["comentario"]))
            $data["comentario"] = $body["comentario"] === null ? null : trim($body["comentario"]);

        if (empty($data))
            throw new APIException("Nenhum campo válido para atualização.", 400);

        return $data;
    }
}
