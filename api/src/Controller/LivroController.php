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
        $segmentos = explode('/', trim($url, '/'));
        $rotaBase = $segmentos[0] ?? '';
        $idLivro = $segmentos[1] ?? null;
        $subRecurso = $segmentos[2] ?? null; // 'categorias' ou 'listas'
        $idAssociacao = $segmentos[3] ?? null; // ID da categoria/lista (ex: '456')

        if($rotaBase !== 'livros') {
            throw new APIException("Rota não encontrada!", 404);
        }

        if($idLivro && in_array($subRecurso, ['categorias', 'listas'])) {
            $livroExiste = $this->service->buscarLivroPorId($idLivro);
            if(!$livroExiste) throw new APIException("Livro não encontrado para associação", 404);

            $this->processarAssociacao($method, $idLivro, $subRecurso, $idAssociacao, $request); 
            return;
        }


        switch ($method) {
            case "GET": // READ
                if($idLivro) {
                    // se a requisicao tiver um id, ele busca somente um livro
                    $response = $this->service->buscarLivroPorId($idLivro);
                    if(!$response) throw new APIException("livro não encontrado", 404);
                } elseif (!empty($_GET)) {
                    // se veio qualquer query param, monta filtros

                    // 1) Define quais filtros a API aceita
                    $filtrosPermitidos = ['usuario_id'];

                    $filtros = [];

                    foreach ($filtrosPermitidos as $campo) {
                        if (isset($_GET[$campo]) && $_GET[$campo] !== '') {
                            $filtros[$campo] = $_GET[$campo];
                        }
                    }

                    // 2) Se nenhum filtro válido foi enviado, você pode
                    //    cair para buscarTodosLivros, ou retornar erro, ou manter como está.
                    if (empty($filtros)) {
                        $response = $this->service->buscarTodosLivros();
                    } else {
                        // 3) Chama o service com os filtros montados
                        $response = $this->service->buscarLivrosFiltrados($filtros);
                    }
                }else {
                    // se nao for especificado, quer dizer que esta buscando todos
                    $response = $this->service->buscarTodosLivros();
                }

                if(empty($response)) {
                    Response::send([], 204);
                    return;
                }
                Response::send($response, 200);
                break;
            case "POST": // CREATE

                //Validações
                if ($idLivro)throw new APIException("Requisição invalido para criação.", 400);

                $livroData = $this->validarCorpoRegistro($request->getBody());
                $response = $this->service->registrarLivro($livroData);
                Response::send($response, 201);
                break;
            case "PUT": // UPDATE
                // Validações
                $livroExiste = $this->service->buscarLivroPorId($idLivro);
                if(!$livroExiste) throw new APIException("Livro não encontrado", 404);
                if(!$idLivro) throw new APIException("ID do livro é obrigatorio para alteração (PUT)", 400);

                $livroData = $this->validarCorpoAlteracaoLivro($request->getBody());
                $livroAtualizado = $this->service->atualizarLivro((int) $idLivro, $livroData);
                Response::send($livroAtualizado, 201); 
                break;
            case "DELETE":
                // Validações
                $livroExiste = $this->service->buscarLivroPorId($idLivro);
                if(!$livroExiste) throw new APIException("Livro não encontrado", 404);
                if(!$idLivro) throw new APIException("ID do livro é obrigatorio para exclusão (DELETE)", 400);

                $this->service->excluirLivro((int) $idLivro);
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
            "categorias" => isset($body["categorias"]) && is_array($body["categorias"]) ? $body["categorias"] : [],
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

        if (isset($body["categorias"]) && is_array($body["categorias"]))
            $data["categorias"] = $body["categorias"];


        if (empty($data))
            throw new APIException("Nenhum campo válido para atualização.", 400);

        return $data;
    }

    // nesses casos, o ID da associacao é o ID da categoria ou lista
    private function processarAssociacao(string $method, int $idLivro, string $subRecurso, ?int $idAssociacao, Request $request): void
    {
        switch ($method) {
            case "GET":
                // VER ISSO AQUI DEPOIS, É INTERESSANTE QUE SUPORTE GET COM ID DE ASSOCIACAO
                if($idAssociacao) throw new APIException("Não suporta GET com ID de associacao", 400);

                if($subRecurso === "categorias") {
                    $response = $this->service->listarCategoriasDoLivro($idLivro);
                } else if ($subRecurso === "listas") {
                    $response = $this->service->listarListasDoLivro($idLivro);
                }
                Response::send($response, 200);
                break;

            case "POST":
                $idAssociacao = $this->validarCorpoAssociacao($request->getBody(), $subRecurso);

                if($subRecurso === "categorias") {
                   $this->service->associarCategoriaAoLivro($idLivro, $idAssociacao); 
                } else if ($subRecurso === "listas") {
                    $this->service->associarListaAoLivro($idLivro, $idAssociacao);
                }
                Response::send(null, 204);
                break;
            case "DELETE":
                if(!$idAssociacao) throw new APIException("ID de associacao é obrigatorio para exclusao (DELETE)", 400);
                
                if($subRecurso === "categorias") {
                    $this->service->removerCategoriaDoLivro($idLivro, $idAssociacao); 
                } else if ($subRecurso === "listas") {
                    $this->service->removerListaDoLivro($idLivro, $idAssociacao);
                }
                Response::send(null, 204);
                break;
            default:
                throw new APIException("Method not allowed!", 405);
        }
    }

    private function validarCorpoAssociacao(array $body, string $subRecurso): int
    {
        if (empty($body)) {
            throw new APIException("Corpo da requisição vazio.", 400);
        }

        $idAssociacao = null;

        if ($subRecurso === "categorias") {
            if (!isset($body["associacao_id"])) {
                throw new APIException("O ID da categoria é obrigatório!", 400);
            }
            $idAssociacao = (int)$body["associacao_id"];
        } else if ($subRecurso === "listas") {
            if (!isset($body["associacao_id"])) {
                throw new APIException("O ID da lista é obrigatório!", 400);
            }
            $idAssociacao = (int)$body["associacao_id"];
        }

        return $idAssociacao;
    }
}