<?php

namespace Database;

use PDO;
use PDOException;

class Database
{
    private static string $host = 'localhost';
    private static string $dbname = 'catalogo_livros'; // coloque o nome do seu banco
    private static string $username = 'root';
    private static string $password = '';          // ajuste sua senha
    private static string $charset = 'utf8mb4';

    private static ?PDO $connection = null;

    public static function getConnection(): PDO
    {
        if (self::$connection === null) {
            try {
                $dsn = "mysql:host=" . self::$host . ";dbname=" . self::$dbname . ";charset=" . self::$charset;

                self::$connection = new PDO($dsn, self::$username, self::$password);
                self::$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                self::$connection->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            } catch (PDOException $e) {
                // Usar Exception padrão por enquanto
                throw new \Exception("Erro ao conectar ao banco de dados: " . $e->getMessage(), 500);
            }
        }

        return self::$connection;
    }
}
