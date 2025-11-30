<?php

namespace Repository;

use Database\Database;
use Model\Lista;
use PDO;

class ListaRepository
{
    private $connection;

    public function __construct()
    {
        // Obtém a conexão
        $this->connection = Database::getConnection();
    }

    /**
     * Busca todas as listas
     */
    public function findAll(): array
    {
        $stmt = $this->connection->prepare("SELECT * FROM LISTAS");
        $stmt->execute();

        $listas = [];
        while ($row = $stmt->fetch()) {
            $lista = new Lista(
                nome: $row['nome'],
                usuario_id: $row['usuario_id'],
                descricao: $row['descricao'],
                id: $row['id']
            );
            $listas[] = $lista;
        }

        return $listas;
    }

    /**
     * Busca listas por usuário
     */
    public function findByUsuarioId(int $usuario_id): array
    {
        $stmt = $this->connection->prepare(
            "SELECT * FROM LISTAS WHERE usuario_id = :usuario_id ORDER BY nome ASC"
        );
        $stmt->bindValue(':usuario_id', $usuario_id, PDO::PARAM_INT);
        $stmt->execute();

        $listas = [];
        while ($row = $stmt->fetch()) {
            $lista = new Lista(
                nome: $row['nome'],
                usuario_id: $row['usuario_id'],
                descricao: $row['descricao'],
                id: $row['id']
            );
            $listas[] = $lista;
        }

        return $listas;
    }

    /**
     * Busca lista por ID
     */
    public function findById(int $id): ?Lista
    {
        $stmt = $this->connection->prepare("SELECT * FROM LISTAS WHERE id = :id");
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        $row = $stmt->fetch();
        if (!$row) {
            return null;
        }

        return new Lista(
            nome: $row['nome'],
            usuario_id: $row['usuario_id'],
            descricao: $row['descricao'],
            id: $row['id']
        );
    }

    /**
     * Verifica se já existe uma lista com esse nome para o usuário
     */
    public function existsByNomeAndUsuarioId(string $nome, int $usuario_id, ?int $excludeId = null): bool
    {
        $sql = "SELECT COUNT(*) FROM LISTAS WHERE nome = :nome AND usuario_id = :usuario_id";
        
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
     * Conta quantos livros estão associados a esta lista
     */
    public function contarLivrosAssociados(int $lista_id): int
    {
        // Verifica na tabela LIVROS_LISTAS
        $stmt = $this->connection->prepare(
            "SELECT COUNT(*) FROM LIVROS_LISTAS WHERE lista_id = :lista_id"
        );
        $stmt->bindValue(':lista_id', $lista_id, PDO::PARAM_INT);
        $stmt->execute();
        
        return (int) $stmt->fetchColumn();
    }

    /**
     * Cria uma nova lista
     */
    public function create(Lista $lista): Lista
    {
        $stmt = $this->connection->prepare(
            "INSERT INTO LISTAS (nome, usuario_id, descricao) VALUES (:nome, :usuario_id, :descricao)"
        );

        $stmt->bindValue(':nome', $lista->getNome());
        $stmt->bindValue(':usuario_id', $lista->getUsuarioId(), PDO::PARAM_INT);
        $stmt->bindValue(':descricao', $lista->getDescricao());
        $stmt->execute();

        // Recupera o ID gerado pelo banco
        $lista->setId($this->connection->lastInsertId());

        return $lista;
    }

    /**
     * Atualiza uma lista existente
     */
    public function update(int $id, array $listaData): Lista
    {
        $fields = [];
        $params = [':id' => $id];

        if (isset($listaData['nome'])) {
            $fields[] = 'nome = :nome';
            $params[':nome'] = $listaData['nome'];
        }

        if (isset($listaData['descricao'])) {
            $fields[] = 'descricao = :descricao';
            $params[':descricao'] = $listaData['descricao'];
        }

        if (empty($fields)) {
            throw new \Exception("Nenhum campo para atualizar.");
        }

        $sql = "UPDATE LISTAS SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $this->connection->prepare($sql);

        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }

        $stmt->execute();

        $lista = $this->findById($id);
        if (!$lista) {
            throw new \Exception("Lista com ID $id não encontrada para atualização.");
        }

        return $lista;
    }

    /**
     * Exclui uma lista
     */
    public function delete(int $id): void
    {
        $stmt = $this->connection->prepare("DELETE FROM LISTAS WHERE id = :id");
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
    }

    /**
     * Busca listas associadas a um livro específico
     */
    public function findListasByLivroId(int $idLivro): array
    {
        $stmt = $this->connection->prepare(
            "SELECT LISTAS.* FROM LISTAS 
             JOIN LIVROS_LISTAS ON LISTAS.id = LIVROS_LISTAS.lista_id 
             WHERE LIVROS_LISTAS.livro_id = :livro_id
             ORDER BY LISTAS.nome ASC"
        );

        $stmt->bindValue(':livro_id', $idLivro, PDO::PARAM_INT);
        $stmt->execute();

        $listas = [];
        while ($row = $stmt->fetch()) {
            $lista = new Lista(
                nome: $row['nome'],
                usuario_id: $row['usuario_id'],
                descricao: $row['descricao'],
                id: $row['id']
            );
            $listas[] = $lista;
        }

        return $listas;
    }

    /**
     * Associa uma lista a um livro
     */
    public function associateLista(int $livro_id, int $lista_id): void
    {
        // Verifica se já não existe associação
        $stmt = $this->connection->prepare(
            "SELECT COUNT(*) FROM LIVROS_LISTAS WHERE livro_id = :livro_id AND lista_id = :lista_id"
        );
        $stmt->bindValue(':livro_id', $livro_id, PDO::PARAM_INT);
        $stmt->bindValue(':lista_id', $lista_id, PDO::PARAM_INT);
        $stmt->execute();

        if ($stmt->fetchColumn() > 0) {
            return; // Já existe
        }

        $stmt = $this->connection->prepare(
            "INSERT INTO LIVROS_LISTAS (livro_id, lista_id) VALUES (:livro_id, :lista_id)"
        );
        $stmt->bindValue(':livro_id', $livro_id, PDO::PARAM_INT);
        $stmt->bindValue(':lista_id', $lista_id, PDO::PARAM_INT);
        $stmt->execute();
    }

    /**
     * Remove associação de uma lista a um livro
     */
    public function disassociateLista(int $livro_id, int $lista_id): void
    {
        $stmt = $this->connection->prepare(
            "DELETE FROM LIVROS_LISTAS WHERE livro_id = :livro_id AND lista_id = :lista_id"
        );
        $stmt->bindValue(':livro_id', $livro_id, PDO::PARAM_INT);
        $stmt->bindValue(':lista_id', $lista_id, PDO::PARAM_INT);
        $stmt->execute();
    }
}
