<?php
require_once 'conect.php';

$id = $_GET['id'] ?? 0;
$treino_id = $_GET['treino_id'] ?? 0;

if ($id) {
    try {
        $pdo = connectDB();
        $stmt = $pdo->prepare("DELETE FROM Exercicios WHERE id = ?");
        $stmt->execute([$id]);
    } catch (PDOException $e) {
        die("Erro ao deletar: " . $e->getMessage());
    }
}

header("Location: vertreino.php?id=" . urlencode($treino_id));
