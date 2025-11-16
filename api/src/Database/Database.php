<?php

namespace Database;

use PDO;
use PDOException;
use Error\APIException;

// Padrão Singleton para conexão com o banco de dados
class Database
{
    // Dados de conexão com o MySQL
    private static string $host = 'localhost';
    private static string $dbname = 'catalogo_livros';
    private static string $username = 'root';
    private static string $password = '';
    private static string $charset = 'utf8mb4';

    // Instância única da conexão (Singleton)
    private static ?PDO $connection = null;

    // Método estático para obter a conexão
    public static function getConnection(): PDO
    {
        // se ainda não existe uma conexão, cria uma
        if (self::$connection === null) {
            try {
                // DSN para MySQL
                $dsn = "mysql:host=" . self::$host . ";dbname=" . self::$dbname . ";charset=" . self::$charset;

                // Cria a conexão uma única vez
                self::$connection = new PDO($dsn, self::$username, self::$password);

                // Configurações da conexão para gerar exceções e retornar arrays associativos
                self::$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                self::$connection->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

            } catch (PDOException $e) {
                throw new APIException("Erro ao conectar ao banco de dados: " . $e->getMessage(), 500);
            }
        }

        // Retorna sempre a mesma instância
        return self::$connection;
    }
}
