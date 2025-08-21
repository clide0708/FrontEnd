<?php
require_once 'conect.php';

header('Content-Type: application/json');

$id = $_GET['id'] ?? '';

if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'ID do exercício não informado']);
    exit;
}

try {
    $pdo = connectDB();

    $stmt = $pdo->prepare("SELECT * FROM Exercicios WHERE id = ?");
    $stmt->execute([$id]);
    $exercicio = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$exercicio) {
        http_response_code(404);
        echo json_encode(['error' => 'Exercício não encontrado']);
        exit;
    }

    echo json_encode($exercicio);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro no banco: ' . $e->getMessage()]);
}
