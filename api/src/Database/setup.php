<?php

require_once __DIR__ . '/Database.php'; // ajuste o caminho se precisar

use Database\Database; // <-- esse SIM você precisa, porque Database tem namespace

try {
    $pdo = Database::getConnection();

    // Desabilita verificação de FK para poder dropar em qualquer ordem
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");

    // Dropa as tabelas se existirem (ordem inversa das dependências)
    $tables = [
        'LIVROS_LISTAS',
        'LIVROS_CATEGORIAS',
        'AVALIACOES',
        'LISTAS',
        'CATEGORIAS',
        'LIVROS',
        'USUARIOS'
    ];

    foreach ($tables as $t) {
        $pdo->exec("DROP TABLE IF EXISTS `$t`");
    }

    // Reabilita FK
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");

    // ------------------------
    // Criação das tabelas
    // ------------------------

    // USUARIOS
    $pdo->exec("
        CREATE TABLE USUARIOS (
            id          INT AUTO_INCREMENT PRIMARY KEY,
            nome        VARCHAR(255) NOT NULL,
            email       VARCHAR(255) NOT NULL UNIQUE,
            senha  VARCHAR(255) NOT NULL
        ) ENGINE=InnoDB;
    ");

    // LIVROS
    $pdo->exec("
        CREATE TABLE LIVROS (
            id              INT AUTO_INCREMENT PRIMARY KEY,
            titulo          VARCHAR(255) NOT NULL,
            autor           VARCHAR(255) NOT NULL,
            isbn            VARCHAR(20) NOT NULL UNIQUE, -- Número ISBN, único e validado
            usuario_id      INT NOT NULL,                -- dono do catálogo
            editora         VARCHAR(255) NULL,
            data_publicacao DATE NULL,
            url_capa        VARCHAR(500) NULL,
            descricao       TEXT NULL,
            CONSTRAINT fk_livro_usuario
                FOREIGN KEY (usuario_id) REFERENCES USUARIOS(id)
                ON DELETE CASCADE
                ON UPDATE CASCADE
        ) ENGINE=InnoDB;
    ");

    // CATEGORIAS
    $pdo->exec("
        CREATE TABLE CATEGORIAS (
            id          INT AUTO_INCREMENT PRIMARY KEY,
            nome        VARCHAR(255) NOT NULL,
            usuario_id  INT NOT NULL,                    -- cada usuário pode criar categorias
            CONSTRAINT fk_categoria_usuario
                FOREIGN KEY (usuario_id) REFERENCES USUARIOS(id)
                ON DELETE CASCADE
                ON UPDATE CASCADE
        ) ENGINE=InnoDB;
    ");

    // LISTAS
    $pdo->exec("
        CREATE TABLE LISTAS (
            id          INT AUTO_INCREMENT PRIMARY KEY,
            nome        VARCHAR(255) NOT NULL,
            usuario_id  INT NOT NULL,
            descricao   TEXT NULL,
            CONSTRAINT fk_lista_usuario
                FOREIGN KEY (usuario_id) REFERENCES USUARIOS(id)
                ON DELETE CASCADE
                ON UPDATE CASCADE
        ) ENGINE=InnoDB;
    ");

   

    // AVALIACOES
    $pdo->exec("
        CREATE TABLE AVALIACOES (
            id          INT AUTO_INCREMENT PRIMARY KEY,
            usuario_id  INT NOT NULL,
            livro_id    INT NOT NULL,
            nota        INT NOT NULL,                    -- 1 a 5 estrelas
            comentario  TEXT NULL,
            criado_em   DATE NOT NULL,
            CONSTRAINT fk_avaliacao_usuario
                FOREIGN KEY (usuario_id) REFERENCES USUARIOS(id)
                ON DELETE CASCADE
                ON UPDATE CASCADE,
            CONSTRAINT fk_avaliacao_livro
                FOREIGN KEY (livro_id) REFERENCES LIVROS(id)
                ON DELETE CASCADE
                ON UPDATE CASCADE
        ) ENGINE=InnoDB;
    ");

    
    // LIVROS_CATEGORIAS (tabela de junção)
    $pdo->exec("
        CREATE TABLE LIVROS_CATEGORIAS (
            livro_id     INT NOT NULL,
            categoria_id INT NOT NULL,
            PRIMARY KEY (livro_id, categoria_id),
            CONSTRAINT fk_livro_categoria_livro
                FOREIGN KEY (livro_id) REFERENCES LIVROS(id)
                ON DELETE CASCADE
                ON UPDATE CASCADE,
            CONSTRAINT fk_livro_categoria_categoria
                FOREIGN KEY (categoria_id) REFERENCES CATEGORIAS(id)
                ON DELETE CASCADE
                ON UPDATE CASCADE
        ) ENGINE=InnoDB;
    ");

    // LIVROS_LISTAS (tabela de junção)
    $pdo->exec("
        CREATE TABLE LIVROS_LISTAS (
            livro_id INT NOT NULL,
            lista_id INT NOT NULL,
            PRIMARY KEY (livro_id, lista_id),
            CONSTRAINT fk_livro_lista_livro
                FOREIGN KEY (livro_id) REFERENCES LIVROS(id)
                ON DELETE CASCADE
                ON UPDATE CASCADE,
            CONSTRAINT fk_livro_lista_lista
                FOREIGN KEY (lista_id) REFERENCES LISTAS(id)
                ON DELETE CASCADE
                ON UPDATE CASCADE
        ) ENGINE=InnoDB;
    ");

    // ------------------------
    // Dados de exemplo
    // ------------------------

    // USUARIOS
    $pdo->exec("
        INSERT INTO USUARIOS (nome, email,senha) VALUES
        ('Teste', 'Teste@teste.com',  'teste1212'),
    ");

    // CATEGORIAS
    $pdo->exec("
        INSERT INTO CATEGORIAS (nome, usuario_id) VALUES
        ('Ficção',          1),
        ('Tecnologia',      1),
        ('Não-ficção',      2);
    ");

    // LISTAS
    $pdo->exec("
        INSERT INTO LISTAS (nome, usuario_id, descricao) VALUES
        ('Para ler em 2025',   1, 'Livros que quero ler este ano'),
        ('Favoritos da vida',  1, 'Meus livros preferidos'),
        ('Estudos',            2, 'Leituras para estudo e trabalho');
    ");

    // LIVROS
    $pdo->exec("
        INSERT INTO LIVROS (titulo, autor, isbn, usuario_id, editora, data_publicacao, url_capa, descricao) VALUES
        ('O Senhor dos Anéis',   'J. R. R. Tolkien',    '9780544003415', 1, 'HarperCollins', '1954-07-29', 'https://exemplo.com/capas/sda.jpg', 'Clássico de fantasia épica.'),
        ('Clean Code',           'Robert C. Martin',    '9780132350884', 1, 'Prentice Hall', '2008-08-01', 'https://exemplo.com/capas/cleancode.jpg', 'Práticas de código limpo em software.'),
        ('Sapiens',              'Yuval Noah Harari',   '9780062316097', 2, 'Harper',       '2011-01-01', 'https://exemplo.com/capas/sapiens.jpg', 'Uma breve história da humanidade.');
    ");

 
    // AVALIACOES
    $pdo->exec("
        INSERT INTO AVALIACOES (usuario_id, livro_id, nota, comentario, criado_em) VALUES
        (1, 1, 5, 'Obra-prima absoluta!', '2025-01-10'),
        (1, 2, 4, 'Excelente para melhorar a qualidade do código.', '2025-01-15'),
        (2, 3, 5, 'Livro muito interessante e bem escrito.', '2025-02-01');
    ");


    // LIVROS_CATEGORIAS
    $pdo->exec("
        INSERT INTO LIVROS_CATEGORIAS (livro_id, categoria_id) VALUES
        (1, 1), -- SDA em Ficção
        (2, 2), -- Clean Code em Tecnologia
        (3, 3); -- Sapiens em Não-ficção
    ");

    // LIVROS_LISTAS
    $pdo->exec("
        INSERT INTO LIVROS_LISTAS (livro_id, lista_id) VALUES
        (1, 2), -- SDA em Favoritos da vida
        (2, 1), -- Clean Code em Para ler em 2025
        (3, 3); -- Sapiens em Estudos
    ");

    echo "Banco de dados e tabelas criados com sucesso, com dados de exemplo.\n";

} catch (PDOException $e) {
    echo "Erro: " . $e->getMessage() . PHP_EOL;
    exit(1);
}
