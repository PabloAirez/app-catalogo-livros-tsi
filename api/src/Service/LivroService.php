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

    function atualizarLivro(int $id, array $livroData): Livro
    {
        // recebe o id do livro, os novos dados e atualiza (sobrescreve) os dados antigos que tem no banco de dados
        $livroAtualizado = $this->repository->update($id, $livroData);
        return $livroAtualizado;
    }

    function excluirLivro(int $id): void
    {
        $this->repository->delete($id);
    }

    /*
     * Funções relacionadas a associações
     * (PODE SER QUE DÊ ERRO AO ASSOCIAR A MESMA CATEGORIA MAIS DE UMA VEZ)
     * (NAO FAÇO A MINIMA IDEIA SE FIZ CERTO, TEM QUE TESTAR)
     */

    // GET
    function listarCategoriasDoLivro(int $idLivro): array
    {
        return $this->repository->findCategoriasByLivroId($idLivro);
    }

    function listarListasDoLivro(int $idLivro): array
    {
        return $this->repository->findListasByLivroId($idLivro);
    }

    // POST
    function associarCategoriaAoLivro(int $idLivro, int $idCategoria): void
    {
        if($this->repository->isCategoriaAssociada($idLivro, $idCategoria))
        {
            throw new APIException("Categoria já associada ao livro", 400);
        }
        $this->repository->associateCategoriaToLivro($idLivro, $idCategoria);
    }

    function associarListaAoLivro(int $idLivro, int $idLista): void
    {
        if($this->repository->isListaAssociada($idLivro, $idLista))
        {
            throw new APIException("Lista já associada ao livro", 400);
        }
        $this->repository->associateListaToLivro($idLivro, $idLista);
    }

    // DELETE
    function removerCategoriaDoLivro(int $idLivro, int $idCategoria): void
    {
        if(!$this->repository->isCategoriaAssociada($idLivro, $idCategoria))
        {
            throw new APIException("Categoria não associada ao livro", 400);
        }
        $this->repository->removeCategoriaFromLivro($idLivro, $idCategoria);
    }

    function removerListaDoLivro(int $idLivro, int $idLista): void
    {
        if(!$this->repository->isListaAssociada($idLivro, $idLista))
        {
            throw new APIException("Lista não associada ao livro", 400);
        }
        $this->repository->removeListaFromLivro($idLivro, $idLista);
    }
}