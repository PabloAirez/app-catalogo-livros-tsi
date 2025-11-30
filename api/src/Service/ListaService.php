<?php

namespace Service;

use Error\APIException;
use Model\Lista;
use Repository\ListaRepository;

class ListaService
{
    private ListaRepository $repository;

    public function __construct()
    {
        $this->repository = new ListaRepository();
    }

    /**
     * Registra uma nova lista
     */
    public function registrarLista(array $listaData): Lista
    {
        // Valida se o nome já existe para este usuário
        if ($this->repository->existsByNomeAndUsuarioId(
            $listaData['nome'],
            $listaData['usuario_id']
        )) {
            throw new APIException("Já existe uma lista com este nome.", 409);
        }

        $lista = new Lista(
            nome: $listaData['nome'],
            usuario_id: $listaData['usuario_id'],
            descricao: $listaData['descricao'] ?? null
        );

        return $this->repository->create($lista);
    }

    /**
     * Busca lista por ID
     */
    public function buscarListaPorId(int $id): ?Lista
    {
        return $this->repository->findById($id);
    }

    /**
     * Lista todas as listas
     */
    public function listarTodasListas(): array
    {
        return $this->repository->findAll();
    }

    /**
     * Lista listas de um usuário específico
     */
    public function listarListasPorUsuario(int $usuario_id): array
    {
        return $this->repository->findByUsuarioId($usuario_id);
    }

    /**
     * Atualiza uma lista existente
     */
    public function atualizarLista(int $id, array $listaData): Lista
    {
        // Verifica se a lista existe
        $listaExistente = $this->repository->findById($id);
        if (!$listaExistente) {
            throw new APIException("Lista não encontrada.", 404);
        }

        // Valida se o novo nome já existe para este usuário (exceto a própria lista)
        if (isset($listaData['nome'])) {
            if ($this->repository->existsByNomeAndUsuarioId(
                $listaData['nome'],
                $listaExistente->getUsuarioId(),
                $id // Exclui a própria lista da verificação
            )) {
                throw new APIException("Já existe outra lista com este nome.", 409);
            }
        }

        return $this->repository->update($id, $listaData);
    }

    /**
     * Exclui uma lista
     */
    public function excluirLista(int $id): void
    {
        // Verifica se a lista existe
        $lista = $this->repository->findById($id);
        if (!$lista) {
            throw new APIException("Lista não encontrada.", 404);
        }

        // Verifica se há livros associados
        $livrosAssociados = $this->repository->contarLivrosAssociados($id);
        if ($livrosAssociados > 0) {
            throw new APIException(
                "Não é possível excluir esta lista pois existem $livrosAssociados livro(s) associado(s).",
                409
            );
        }

        $this->repository->delete($id);
    }
}
