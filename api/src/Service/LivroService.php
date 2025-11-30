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
        $livroSalvo = $this->repository->create($livro);
        
        // Associar categorias se fornecidas
        if (isset($livroData['categorias']) && is_array($livroData['categorias']) && !empty($livroData['categorias'])) {
            try {
                foreach ($livroData['categorias'] as $idCategoria) {
                    $idCat = (int)$idCategoria;
                    if (!$this->repository->isCategoriaAssociada($livroSalvo->getId(), $idCat)) {
                        $this->repository->associateCategoriaToLivro($livroSalvo->getId(), $idCat);
                    }
                }
            } catch (\Exception $e) {
                error_log("Erro ao associar categorias: " . $e->getMessage());
                throw new APIException("Erro ao associar categorias: " . $e->getMessage(), 500);
            }
        }
        
        // Recarregar o livro com as categorias
        $categorias = $this->repository->findCategoriasByLivroId($livroSalvo->getId());
        $categoriasArray = array_map(fn($cat) => [
            'id' => $cat->getId(),
            'nome' => $cat->getNome()
        ], $categorias);
        $livroSalvo->setCategorias($categoriasArray);
        
        return $livroSalvo;
    }

    function buscarLivroPorId(int $id): ?Livro
    {
        $livro = $this->repository->findById($id);
        
        if ($livro) {
            $categorias = $this->repository->findCategoriasByLivroId($id);
            // Converter categorias para array simples com id e nome
            $categoriasArray = array_map(fn($cat) => [
                'id' => $cat->getId(),
                'nome' => $cat->getNome()
            ], $categorias);
            $livro->setCategorias($categoriasArray);
        }

        return $livro;
    }

    function buscarTodosLivros(): array
    {
        $livros = $this->repository->findAll();
        
        // Adicionar categorias a cada livro
        foreach ($livros as $livro) {
            $categorias = $this->repository->findCategoriasByLivroId($livro->getId());
            // Converter categorias para array simples com id e nome
            $categoriasArray = array_map(fn($cat) => [
                'id' => $cat->getId(),
                'nome' => $cat->getNome()
            ], $categorias);
            $livro->setCategorias($categoriasArray);
        }

        return $livros;
    }

    function buscarLivrosFiltrados($filtros): array
    {
        $livros = $this->repository->findByFilters($filtros);
        
        // Adicionar categorias a cada livro
        foreach ($livros as $livro) {
            $categorias = $this->repository->findCategoriasByLivroId($livro->getId());
            // Converter categorias para array simples com id e nome
            $categoriasArray = array_map(fn($cat) => [
                'id' => $cat->getId(),
                'nome' => $cat->getNome()
            ], $categorias);
            $livro->setCategorias($categoriasArray);
        }
        
        return $livros;
    }

    function atualizarLivro(int $id, array $livroData): Livro
    {
        // recebe o id do livro, os novos dados e atualiza (sobrescreve) os dados antigos que tem no banco de dados
        $livroAtualizado = $this->repository->update($id, $livroData);
        
        // Processar categorias se fornecidas
        if (isset($livroData['categorias'])) {
            // Obter categorias atuais do livro
            $categoriasAtuais = $this->repository->findCategoriasByLivroId($id);
            $idsCategoriasAtuais = array_map(fn($cat) => $cat->getId(), $categoriasAtuais);
            $idsNovasCategorias = array_map('intval', $livroData['categorias']);
            
            // Remover categorias que não estão na nova lista
            foreach ($idsCategoriasAtuais as $idCat) {
                if (!in_array($idCat, $idsNovasCategorias)) {
                    $this->repository->removeCategoriaFromLivro($id, $idCat);
                }
            }
            
            // Adicionar novas categorias
            foreach ($idsNovasCategorias as $idCat) {
                if (!in_array($idCat, $idsCategoriasAtuais)) {
                    $this->repository->associateCategoriaToLivro($id, $idCat);
                }
            }
        }
        
        // Recarregar o livro com as categorias atualizadas
        $categorias = $this->repository->findCategoriasByLivroId($id);
        $categoriasArray = array_map(fn($cat) => [
            'id' => $cat->getId(),
            'nome' => $cat->getNome()
        ], $categorias);
        $livroAtualizado->setCategorias($categoriasArray);
        
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