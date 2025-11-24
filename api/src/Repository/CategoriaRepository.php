<?php

namespace Repository;

use Database\Database;
use Model\Categoria;
use PDO;

class CategoriaRepository
{
    private $connection;

    public function __construct()
    {
        // Obtém a conexão
        $this->connection = Database::getConnection();
    }

    /**
     * Busca todas as categorias
     */
    public function findAll(): array
    {
        $stmt = $this->connection->prepare("SELECT * FROM CATEGORIAS");
        $stmt->execute();

        $categorias = [];
        while ($row = $stmt->fetch()) {
            $categoria = new Categoria(
                nome: $row['nome'],
                usuario_id: $row['usuario_id'],
                id: $row['id']
            );
            $categorias[] = $categoria;
        }

        return $categorias;
    }

    /**
     * Busca categorias por usuário
     */
    public function findByUsuarioId(int $usuario_id): array
    {
        $stmt = $this->connection->prepare(
            "SELECT * FROM CATEGORIAS WHERE usuario_id = :usuario_id ORDER BY nome ASC"
        );
        $stmt->bindValue(':usuario_id', $usuario_id, PDO::PARAM_INT);
        $stmt->execute();

        $categorias = [];
        while ($row = $stmt->fetch()) {
            $categoria = new Categoria(
                nome: $row['nome'],
                usuario_id: $row['usuario_id'],
                id: $row['id']
            );
            $categorias[] = $categoria;
        }

        return $categorias;
    }

    /**
     * Busca categoria por ID
     */
    public function findById(int $id): ?Categoria
    {
        $stmt = $this->connection->prepare("SELECT * FROM CATEGORIAS WHERE id = :id");
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        $row = $stmt->fetch();
        if (!$row) {
            return null;
        }

        return new Categoria(
            nome: $row['nome'],
            usuario_id: $row['usuario_id'],
            id: $row['id']
        );
    }

    /**
     * Verifica se já existe uma categoria com esse nome para o usuário
     */
    public function existsByNomeAndUsuarioId(string $nome, int $usuario_id, ?int $excludeId = null): bool
    {
        $sql = "SELECT COUNT(*) FROM CATEGORIAS WHERE nome = :nome AND usuario_id = :usuario_id";
        
        if ($excludeId !== null) {
            $sql .= " AND id != :excludeId";
        }
        
        $stmt = $this->connection->prepare($sql);
        $stmt->bindValue(':nome', trim($nome));
        $stmt->bindValue(':usuario_id', $usuario_id, PDO::PARAM_INT);
        
        if ($excludeId !== null) {
            $stmt->bindValue(':excludeId', $excludeId, PDO::PARAM_INT);
        }
        
        $stmt->execute();
        return $stmt->fetchColumn() > 0;
    }

    /**
     * Conta quantos livros estão associados a esta categoria
     */
    public function contarLivrosAssociados(int $categoria_id): int
    {
        // Verifica na tabela LIVROS_CATEGORIAS
        $stmt = $this->connection->prepare(
            "SELECT COUNT(*) FROM LIVROS_CATEGORIAS WHERE categoria_id = :categoria_id"
        );
        $stmt->bindValue(':categoria_id', $categoria_id, PDO::PARAM_INT);
        $stmt->execute();
        
        return (int) $stmt->fetchColumn();
    }

    /**
     * Cria uma nova categoria
     */
    public function create(Categoria $categoria): Categoria
    {
        $stmt = $this->connection->prepare(
            "INSERT INTO CATEGORIAS (nome, usuario_id) VALUES (:nome, :usuario_id)"
        );

        $stmt->bindValue(':nome', $categoria->getNome());
        $stmt->bindValue(':usuario_id', $categoria->getUsuarioId(), PDO::PARAM_INT);
        $stmt->execute();

        // Recupera o ID gerado pelo banco
        $categoria->setId($this->connection->lastInsertId());

        return $categoria;
    }

    /**
     * Atualiza uma categoria existente
     */
    public function update(int $id, array $categoriaData): Categoria
    {
        $stmt = $this->connection->prepare(
            "UPDATE CATEGORIAS SET nome = :nome WHERE id = :id"
        );

        $stmt->bindValue(':nome', $categoriaData['nome']);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        $categoria = $this->findById($id);
        if (!$categoria) {
            throw new \Exception("Categoria com ID $id não encontrada para atualização.");
        }

        return $categoria;
    }

    /**
     * Exclui uma categoria
     */
    public function delete(int $id): void
    {
        $stmt = $this->connection->prepare("DELETE FROM CATEGORIAS WHERE id = :id");
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
    }
}
