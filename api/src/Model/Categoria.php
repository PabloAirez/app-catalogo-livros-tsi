<?php

namespace Model;

use JsonSerializable;

class Categoria implements JsonSerializable
{
    private ?int $id;
    private string $nome;
    private int $usuario_id;

    // Construtor
    public function __construct(
        string $nome,
        int $usuario_id,
        ?int $id = null
    ) {
        $this->id = $id;
        $this->nome = trim($nome);
        $this->usuario_id = $usuario_id;
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

    // Método jsonSerialize() para serialização JSON
    public function jsonSerialize(): array
    {
        return [
            'id' => $this->id,
            'nome' => $this->nome,
            'usuario_id' => $this->usuario_id,
        ];
    }
}
