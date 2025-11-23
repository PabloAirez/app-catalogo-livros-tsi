<?php

namespace Repository;

use Database\Database;
use Model\Livro;
use PDO;

class LivroRepository
{
    private $connection;

    public function __construct()
    {
        //obtém a conexão
        $this->connection = Database::getConnection();
    }

    public function findAll(): array
    {
        //executa a consulta no banco
        $stmt = $this->connection->prepare("SELECT * FROM LIVROS");
        $stmt->execute();

        //para cada linha de retorno, cria um objeto Livro
        //e aramazena em um array
        $livros = [];
        while ($row = $stmt->fetch()) {
            $livro = new Livro(
                id: $row['id'],
                titulo: $row['titulo'],
                autor: $row['autor'],
                isbn: $row['isbn'],
                usuario_id: $row['usuario_id'],
                editora: $row['editora'],
                data_publicacao: $row['data_publicacao'],
                url_capa: $row['url_capa'],
                descricao: $row['descricao']
            );
            $livros[] = $livro;
        }

        //retorna o conjunto de livros encontrado
        return $livros;
    }

     public function findByFilters(array $filters): array
{
    $sql = "SELECT * FROM LIVROS";
    $where = [];
    $params = [];


    if (!empty($filters['usuario_id'])) {
        $where[] = "usuario_id = :usuario_id";
        $params[':usuario_id'] = (int) $filters['usuario_id'];
    }

    

    // Se tiver condições, adiciona o WHERE
    if (!empty($where)) {
        $sql .= ' WHERE ' . implode(' AND ', $where);
    }

    $stmt = $this->connection->prepare($sql);

    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }

    $stmt->execute();

    $livros = [];
    while ($row = $stmt->fetch()) {
        $livro = new Livro(
            id: $row['id'],
            titulo: $row['titulo'],
            autor: $row['autor'],
            isbn: $row['isbn'],
            usuario_id: $row['usuario_id'],
            editora: $row['editora'],
            data_publicacao: $row['data_publicacao'],
            url_capa: $row['url_capa'],
            descricao: $row['descricao']
        );
        $livros[] = $livro;
    }

    return $livros;
}



    
    public function findById(int $id): ?Livro
    {
        //executa a consulta no banco
        $stmt = $this->connection->prepare("SELECT * FROM LIVROS WHERE id = :id");
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        //se não achou, retorna nulo
        $row = $stmt->fetch();
        if (!$row)
            return null;

        //se achou, cria um objeto Usuario
       $livro = new Livro(
                id: $row['id'],
                titulo: $row['titulo'],
                autor: $row['autor'],
                isbn: $row['isbn'],
                usuario_id: $row['usuario_id'],
                editora: $row['editora'],
                data_publicacao: $row['data_publicacao'],
                url_capa: $row['url_capa'],
                descricao: $row['descricao']
            );

        //retorna o usuario encontrado
        return $livro;
    }

    public function create(Livro $livro): Livro
    {
        //executa a operação no banco
        $stmt = $this->connection->prepare(
            "INSERT INTO LIVROS(
                titulo,
                autor,
                isbn,
                usuario_id,
                editora,
                data_publicacao,
                url_capa,
                descricao)
            VALUES (
                :titulo,
                :autor,
                :isbn,
                :usuario_id,
                :editora,
                :data_publicacao,
                :url_capa,
                :descricao);"
        );

        // Valores obrigatorios
        $stmt->bindValue(':titulo', $livro->getTitulo());
        $stmt->bindValue(':autor', $livro->getAutor());
        $stmt->bindValue(':isbn', $livro->getIsbn());
        $stmt->bindValue(':usuario_id', $livro->getUsuario_id(), PDO::PARAM_INT);
        // Valores possivelmente nulos
        // PDO::PARAM_NULL garante que os valores nulos sejam adicionados corretamente
        $stmt->bindValue(':editora', $livro->getEditora(), $livro->getEditora() === null ? \PDO::PARAM_NULL : \PDO::PARAM_STR);
        $stmt->bindValue(':data_publicacao', $livro->getData_publicacao(), $livro->getData_publicacao() === null ? \PDO::PARAM_NULL : \PDO::PARAM_STR);
        $stmt->bindValue(':url_capa', $livro->getUrl_capa(), $livro->getUrl_capa() === null ? \PDO::PARAM_NULL : \PDO::PARAM_STR);
        $stmt->bindValue(':descricao', $livro->getDescricao(), $livro->getDescricao() === null ? \PDO::PARAM_NULL : \PDO::PARAM_STR);
        $stmt->execute();

        //recupera o id gerado pelo banco
        $livro->setId($this->connection->lastInsertId());

        //retorna o curso criado
        return $livro;
    }

    public function update(int $id, array $livroData): Livro
    {
        //falta validação
        $stmt = $this->connection->prepare(
            "UPDATE LIVROS SET 
                titulo = :titulo, 
                autor = :autor, 
                isbn = :isbn, 
                usuario_id = :usuario_id, 
                editora = :editora, 
                data_publicacao = :data_publicacao, 
                url_capa = :url_capa, 
                descricao = :descricao
            WHERE id = :id"
        );

        $stmt->bindValue(':titulo', $livroData['titulo']);
        $stmt->bindValue(':autor', $livroData['autor']);
        $stmt->bindValue(':isbn', $livroData['isbn']);
        $stmt->bindValue(':usuario_id', $livroData['usuario_id']);
        // Valores possivelmente nulos
        // PDO::PARAM_NULL garante que os valores nulos sejam adicionados corretamente
        $stmt->bindValue(':editora', $livroData['editora'], $livroData['editora'] === null ? \PDO::PARAM_NULL : \PDO::PARAM_STR);
        $stmt->bindValue(':data_publicacao', $livroData['data_publicacao'], $livroData['data_publicacao'] === null ? \PDO::PARAM_NULL : \PDO::PARAM_STR);
        $stmt->bindValue(':url_capa', $livroData['url_capa'], $livroData['url_capa'] === null ? \PDO::PARAM_NULL : \PDO::PARAM_STR);
        $stmt->bindValue(':descricao', $livroData['descricao'], $livroData['descricao'] === null ? \PDO::PARAM_NULL : \PDO::PARAM_STR);
        
        // Bind para a condição WHERE (o ID)
        $stmt->bindValue(':id', $id, \PDO::PARAM_INT);
        
        $stmt->execute();

        $livro = $this->findById($id);
        if (!$livro) {
            throw new \Exception("Livro com ID $id não encontrado para atualização.");
        };

        return $livro;
    }

    public function delete(int $id): void
    {
        $stmt = $this->connection->prepare("DELETE FROM LIVROS WHERE id = :id");

        // Bind para o ID
        $stmt->bindValue(':id', $id, \PDO::PARAM_INT);

        $stmt->execute();
    }
}