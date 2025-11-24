<?php

namespace Repository;

use Database\Database;
use Model\Avaliacao;
use PDO;

class AvaliacaoRepository
{
    private $connection;

    public function __construct()
    {
        $this->connection = Database::getConnection();
    }

    public function findById(int $id): ?Avaliacao
    {
        $stmt = $this->connection->prepare("SELECT * FROM AVALIACOES WHERE id = :id");
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        $row = $stmt->fetch();
        if (!$row) {
            return null;
        }

        return $this->mapRowToModel($row);
    }

    public function findByBookId(int $id): ?Avaliacao
    {
        $stmt = $this->connection->prepare("SELECT * FROM AVALIACOES WHERE livro_id = :id");
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        $row = $stmt->fetch();
        if (!$row) {
            return null;
        }

        return $this->mapRowToModel($row);
    }

    public function create(Avaliacao $avaliacao): Avaliacao
    {
        $stmt = $this->connection->prepare(
            "INSERT INTO AVALIACOES(
                usuario_id,
                livro_id,
                nota,
                comentario,
                criado_em)
            VALUES (
                :usuario_id,
                :livro_id,
                :nota,
                :comentario,
                :criado_em);"
        );

        $stmt->bindValue(':usuario_id', $avaliacao->getUsuarioId(), PDO::PARAM_INT);
        $stmt->bindValue(':livro_id', $avaliacao->getLivroId(), PDO::PARAM_INT);
        $stmt->bindValue(':nota', $avaliacao->getNota());
        $stmt->bindValue(':comentario', $avaliacao->getComentario(), $avaliacao->getComentario() === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
        $stmt->bindValue(':criado_em', $avaliacao->getCriadoEm(), $avaliacao->getCriadoEm() === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
        
        $stmt->execute();

        $avaliacao->setId($this->connection->lastInsertId());

        return $avaliacao;
    }

    public function update(int $id, array $avaliacaoData): Avaliacao
    {
        $stmt = $this->connection->prepare(
            "UPDATE AVALIACOES SET
                usuario_id = :usuario_id,
                livro_id = :livro_id,
                nota = :nota,
                comentario = :comentario
            WHERE id = :id"
        );

        $stmt->bindValue(':usuario_id', $avaliacaoData['usuario_id'], PDO::PARAM_INT);
        $stmt->bindValue(':livro_id', $avaliacaoData['livro_id'], PDO::PARAM_INT);
        $stmt->bindValue(':nota', $avaliacaoData['nota']);
        $stmt->bindValue(':comentario', $avaliacaoData['comentario'], $avaliacaoData['comentario'] === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
        
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        
        $stmt->execute();

        $avaliacao = $this->findById($id);
        if (!$avaliacao) {
            throw new \Exception("Avaliacao com ID $id não encontrada para atualização.");
        };

        return $avaliacao;
    }

    public function delete(int $id): void
    {
        $stmt = $this->connection->prepare("DELETE FROM AVALIACOES WHERE id = :id");
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
    }

    // Função privada que mapeia uma linha do banco de dados para um objeto Avaliacao
    private function mapRowToModel(array $row): Avaliacao
    {
        return new Avaliacao(
            usuario_id: $row['usuario_id'],
            livro_id: $row['livro_id'],
            nota: $row['nota'],
            comentario: $row['comentario'],
            criado_em: $row['criado_em'],
            id: $row['id']
        );
    }
}
