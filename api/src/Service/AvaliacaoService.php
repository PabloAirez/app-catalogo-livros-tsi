<?php

namespace Service;

use Model\Avaliacao;
use Repository\AvaliacaoRepository;

class AvaliacaoService
{
    private AvaliacaoRepository $repository;

    function __construct()
    {
        $this->repository = new AvaliacaoRepository();
    }

    function registrarAvaliacao(array $avaliacaoData): Avaliacao
    {
        $avaliacao = new Avaliacao(
            usuario_id: $avaliacaoData['usuario_id'],
            livro_id: $avaliacaoData['livro_id'],
            nota: $avaliacaoData['nota'],
            comentario: $avaliacaoData['comentario'] ?? null,
            criado_em: $avaliacaoData['criado_em'] ?? null
        );
        
        return $this->repository->create($avaliacao);
    }

    function buscarAvaliacaoPorId(int $id): ?Avaliacao
    {
        return $this->repository->findById($id);
    }

    function buscarAvaliacaoPeloIdLivro(int $id): ?Avaliacao
    {
        return $this->repository->findByBookId($id);
    }

    function atualizarAvaliacao(int $id, array $avaliacaoData): Avaliacao
    {
        return $this->repository->update($id, $avaliacaoData);
    }

    function excluirAvaliacao(int $id): void
    {
        $this->repository->delete($id);
    }
}
