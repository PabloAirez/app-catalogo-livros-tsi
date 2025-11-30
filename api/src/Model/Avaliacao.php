<?php

namespace Model;

use JsonSerializable;

class Avaliacao implements JsonSerializable
{
    private ?int $id;
    private int $usuario_id;
    private int $livro_id;
    private float $nota;
    private ?string $comentario;
    private ?string $criado_em;

    public function __construct(
        int $usuario_id,
        int $livro_id,
        float $nota,
        ?string $comentario = null,
        ?string $criado_em = null,
        ?int $id = null
    ) {
        $this->id = $id;
        $this->usuario_id = $usuario_id;
        $this->livro_id = $livro_id;
        $this->nota = $nota;
        $this->comentario = $comentario !== null ? trim($comentario) : null;
        $this->criado_em = $criado_em;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(int $id): void
    {
        $this->id = $id;
    }

    public function getUsuarioId(): int
    {
        return $this->usuario_id;
    }

    public function setUsuarioId(int $usuario_id): void
    {
        $this->usuario_id = $usuario_id;
    }

    public function getLivroId(): int
    {
        return $this->livro_id;
    }

    public function setLivroId(int $livro_id): void
    {
        $this->livro_id = $livro_id;
    }

    public function getNota(): float
    {
        return $this->nota;
    }

    public function setNota(float $nota): void
    {
        $this->nota = $nota;
    }

    public function getComentario(): ?string
    {
        return $this->comentario;
    }

    public function setComentario(?string $comentario): void
    {
        $this->comentario = $comentario !== null ? trim($comentario) : null;
    }

    public function getCriadoEm(): ?string
    {
        return $this->criado_em;
    }

    public function setCriadoEm(?string $criado_em): void
    {
        $this->criado_em = $criado_em;
    }

    public function jsonSerialize(): array
    {
        return [
            'id' => $this->id,
            'usuario_id' => $this->usuario_id,
            'livro_id' => $this->livro_id,
            'nota' => $this->nota,
            'comentario' => $this->comentario,
            'criado_em' => $this->criado_em,
        ];
    }
}
