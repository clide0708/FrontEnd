<?php
require_once 'conect.php';

if (!isset($_GET['id'])) {
    die("ID do treino não especificado");
}

$id = (int) $_GET['id'];

try {
    $pdo = connectDB();

    $stmtEx = $pdo->prepare("DELETE FROM Exercicios WHERE treino_id = ?");
    $stmtEx->execute([$id]);

    $stmtTreino = $pdo->prepare("DELETE FROM Treinos WHERE id = ?");
    $stmtTreino->execute([$id]);

    header("Location: academia.php");
    exit;
} catch (PDOException $e) {
    die("Erro ao deletar treino: " . $e->getMessage());
}
