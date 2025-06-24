<?php
session_start();

$host = "localhost";
$username = "root";
$password = "";  // senha vazia
$dbname = "banco_tcc";

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    die("Erro na conexão: " . $e->getMessage());
}

// Funções úteis
function redirect($url) {
    header("Location: $url");
    exit();
}

function isLoggedIn() {
    return isset($_SESSION['user_id']);
}

function isPersonalTrainer() {
    return isset($_SESSION['user_type']) && $_SESSION['user_type'] === 'personal';
}

function isAluno() {
    return isset($_SESSION['user_type']) && $_SESSION['user_type'] === 'aluno';
}
?>