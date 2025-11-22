<?php

namespace Service;

use Error\APIException;
use Model\Livro;
use Repository\LivroRepository;

class LivroService
{
    private LivroRepository $repository;

    function __construct()
    {
        $this->repository = new LivroRepository();
    }


    function registrarLivro(array $livroData): Livro
    {
        $livro = new Livro(
            titulo: $livroData['titulo'],
            autor: $livroData['autor'],
            isbn: $livroData['isbn'],
            usuario_id: $livroData['usuario_id'],
            editora: $livroData['editora'] ?? null,
            data_publicacao: $livroData['data_publicacao'] ?? null,
            url_capa: $livroData['url_capa'] ?? null,
            descricao: $livroData['descricao'] ?? null
        );
        // $this->validarLivro($livro); // nao tenho certeza se precisa validar algo do livro
        return $this->repository->create($livro);
    }

    function buscarLivroPorId(int $id): ?Livro
    {
        $livro = $this->repository->findById($id);

        return $livro;
    }

    function buscarTodosLivros(): array
    {
        $livros = $this->repository->findAll();

        return $livros;
    }

    function buscarLivrosFiltrados($filtros): array
    {
        $livros = $this->repository->findByFilters($filtros);
        return $livros;
    }

    function atualizarLivro(int $id, array $livroData): void
    {
        // recebe o id do livro, os novos dados e atualiza (sobrescreve) os dados antigos que tem no banco de dados
        $this->repository->update($id, $livroData);
    }

    function excluirLivro(int $id): void
    {
        $this->repository->delete($id);
    }
}