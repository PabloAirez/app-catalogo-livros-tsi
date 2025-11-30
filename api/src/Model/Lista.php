<?php

namespace Model;

use JsonSerializable;

class Lista implements JsonSerializable
{
    private ?int $id;
    private string $nome;
    private int $usuario_id;
    private ?string $descricao;

    // Construtor
    public function __construct(
        string $nome,
        int $usuario_id,
        ?string $descricao = null,
        ?int $id = null
    ) {
        $this->id = $id;
        $this->nome = trim($nome);
        $this->usuario_id = $usuario_id;
        $this->descricao = $descricao !== null ? trim($descricao) : null;
    }

    // Métodos GET

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNome(): string
    {
        return $this->nome;
    }

    public function getUsuarioId(): int
    {
        return $this->usuario_id;
    }

    public function getDescricao(): ?string
    {
        return $this->descricao;
    }

    // Métodos SET

    public function setId(int $id): void
    {
        $this->id = $id;
    }

    public function setNome(string $nome): void
    {
        $this->nome = trim($nome);
    }

    public function setUsuarioId(int $usuario_id): void
    {
        $this->usuario_id = $usuario_id;
    }

    public function setDescricao(?string $descricao): void
    {
        $this->descricao = $descricao !== null ? trim($descricao) : null;
    }

    // Método jsonSerialize() para serialização JSON
    public function jsonSerialize(): array
    {
        return [
            'id' => $this->id,
            'nome' => $this->nome,
            'usuario_id' => $this->usuario_id,
            'descricao' => $this->descricao,
        ];
    }
}
