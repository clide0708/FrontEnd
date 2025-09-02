<?php //se tu tá lendo isso daqui provavelmente algo deu errado, espero que não seja eu kkkkkkkkkk
    function connectDB() { //NÃO ESTÁ EM MYSQL, ESTÁ EM PDO PELO AMOR DE DEUS
        $host = 'localhost';
        $db   = 'bd_tcc'; 
        $user = 'root';
        $pass = ''; 
        $charset = 'utf8mb4';

        $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];

        try {
            $pdo = new PDO($dsn, $user, $pass, $options);
            return $pdo;
        } catch (\PDOException $e) {
            throw new \PDOException($e->getMessage(), (int)$e->getCode());
        }
    }
?>
