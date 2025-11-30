<?php

namespace Service;

use Error\APIException;
use Model\Categoria;
use Repository\CategoriaRepository;

class CategoriaService
{
    private CategoriaRepository $repository;

    public function __construct()
    {
        $this->repository = new CategoriaRepository();
    }

    /**
     * Registra uma nova categoria
     */
    public function registrarCategoria(array $categoriaData): Categoria
    {
        // Valida se o nome já existe para este usuário
        if ($this->repository->existsByNomeAndUsuarioId(
            $categoriaData['nome'],
            $categoriaData['usuario_id']
        )) {
            throw new APIException("Já existe uma categoria com este nome.", 409);
        }

        $categoria = new Categoria(
            nome: $categoriaData['nome'],
            usuario_id: $categoriaData['usuario_id']
        );

        return $this->repository->create($categoria);
    }

    /**
     * Busca categoria por ID
     */
    public function buscarCategoriaPorId(int $id): ?Categoria
    {
        return $this->repository->findById($id);
    }

    /**
     * Lista todas as categorias
     */
    public function listarTodasCategorias(): array
    {
        return $this->repository->findAll();
    }

    /**
     * Lista categorias de um usuário específico
     */
    public function listarCategoriasPorUsuario(int $usuario_id): array
    {
        return $this->repository->findByUsuarioId($usuario_id);
    }

    /**
     * Atualiza uma categoria existente
     */
    public function atualizarCategoria(int $id, array $categoriaData): Categoria
    {
        // Verifica se a categoria existe
        $categoriaExistente = $this->repository->findById($id);
        if (!$categoriaExistente) {
            throw new APIException("Categoria não encontrada.", 404);
        }

        // Valida se o novo nome já existe para este usuário (exceto a própria categoria)
        if (isset($categoriaData['nome'])) {
            if ($this->repository->existsByNomeAndUsuarioId(
                $categoriaData['nome'],
                $categoriaExistente->getUsuarioId(),
                $id // Exclui a própria categoria da verificação
            )) {
                throw new APIException("Já existe outra categoria com este nome.", 409);
            }
        }

        return $this->repository->update($id, $categoriaData);
    }

    /**
     * Exclui uma categoria
     */
    public function excluirCategoria(int $id): void
    {
        // Verifica se a categoria existe
        $categoria = $this->repository->findById($id);
        if (!$categoria) {
            throw new APIException("Categoria não encontrada.", 404);
        }

        // Verifica se há livros associados
        $livrosAssociados = $this->repository->contarLivrosAssociados($id);
        if ($livrosAssociados > 0) {
            throw new APIException(
                "Não é possível excluir esta categoria pois existem $livrosAssociados livro(s) associado(s).",
                409
            );
        }

        $this->repository->delete($id);
    }
}
