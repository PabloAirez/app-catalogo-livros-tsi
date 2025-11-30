<?php

namespace Model;

use JsonSerializable;

class Livro implements JsonSerializable
{
    private ?int $id;
    private string $titulo;
    private string $autor;
    private string $isbn;
    private int $usuario_id;
    private ?string $editora;
    private ?string $data_publicacao;
    private ?string $url_capa;
    private ?string $descricao;
    private array $categorias = [];

    // Construtor
    public function __construct(
        string $titulo,
        string $autor,
        string $isbn,
        int $usuario_id,
        ?string $editora = null,
        ?string $data_publicacao = null,
        ?string $url_capa = null,
        ?string $descricao = null,
        ?int $id = null
    ) {
        $this->id = $id;
        $this->titulo = trim($titulo);
        $this->autor = trim($autor);
        $this->isbn = trim($isbn);
        $this->usuario_id = $usuario_id;
        // Campos opcionais que podem ser NULL no construtor
        $this->editora = $editora !== null ? trim($editora) : null;
        $this->data_publicacao = $data_publicacao !== null ? trim($data_publicacao) : null;
        $this->url_capa = $url_capa !== null ? trim($url_capa) : null;
        $this->descricao = $descricao !== null ? trim($descricao) : null;
    }

    // Métodos GET

    public function getId(): int
    {
        return $this->id;
    }

    public function getTitulo(): string
    {
        return $this->titulo;
    }

    public function getAutor(): string
    {
        return $this->autor;
    }

    public function getIsbn(): string
    {
        return $this->isbn;
    }

    public function getUsuario_id(): int
    {
        return $this->usuario_id;
    }

    public function getEditora(): ?string
    {
        return $this->editora;
    }

    public function getData_publicacao(): ?string
    {
        return $this->data_publicacao;
    }

    public function getUrl_capa(): ?string
    {
        return $this->url_capa;
    }

    public function getDescricao(): ?string
    {
        return $this->descricao;
    }

    public function getCategorias(): array
    {
        return $this->categorias;
    }

    // Métodos SET

    public function setId(int $id)
    {
        $this->id = $id;
    }

    public function setTitulo(string $titulo)
    {
        $this->titulo = trim($titulo);
    }

    public function setAutor(string $autor)
    {
        $this->autor = trim($autor);
    }

    public function setIsbn(string $isbn)
    {
        $this->isbn = trim($isbn);
    }

    public function setUsuario_id(int $usuario_id)
    {
        $this->usuario_id = $usuario_id;
    }

    // Para os setters de campos opcionais, aceitamos NULL
    public function setEditora(?string $editora)
    {
        $this->editora = $editora !== null ? trim($editora) : null;
    }

    public function setData_publicacao(?string $data_publicacao)
    {
        $this->data_publicacao = $data_publicacao !== null ? trim($data_publicacao) : null;
    }

    public function setUrl_capa(?string $url_capa)
    {
        $this->url_capa = $url_capa !== null ? trim($url_capa) : null;
    }

    public function setDescricao(?string $descricao)
    {
        $this->descricao = $descricao !== null ? trim($descricao) : null;
    }

    public function setCategorias(array $categorias)
    {
        $this->categorias = $categorias;
    }

    // Método jsonSerialize() para serialização JSON
    public function jsonSerialize(): array
    {
        $vars = [
            'id' => $this->id,
            'titulo' => $this->getTitulo(),
            'autor' => $this->getAutor(),
            'isbn' => $this->getIsbn(),
            'usuario_id' => $this->getUsuario_id(),
            'editora' => $this->getEditora(),
            'data_publicacao' => $this->getData_publicacao(),
            'url_capa' => $this->getUrl_capa(),
            'descricao' => $this->getDescricao(),
            'categorias' => $this->getCategorias(),
        ];
        return $vars;
    }
}