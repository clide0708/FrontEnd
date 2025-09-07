<?php 
    class DB{
        public static function connectDB() { 
        $host = 'localhost';
        $db   = 'bd_tcc'; 
        $user = 'root';
        $pass = ''; 
        $charset = 'utf8mb4';

        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];

        try {
            return new PDO("mysql:host={$host};dbname={$db};charset={$charset}", $user, $pass, $options);
        } catch (\PDOException $e) {
            throw new \PDOException($e->getMessage(), (int)$e->getCode());
        }
    }
    }
?>