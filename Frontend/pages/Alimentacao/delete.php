<?php
require_once 'conect.php';

$lista = $_POST['lista'] ?? '';
$index = $_POST['index'] ?? '';

if ($lista === '' || $index === '') {
    die('Dados incompletos');
}

try {
    $pdo = connectDB();

    $stmt = $pdo->prepare("DELETE FROM itens_refeicao WHERE id = :id");
    $stmt->execute([':id' => $index]);

    header("Location: index.php?lista=$lista");
    exit;

} catch (PDOException $e) {
    die("Erro ao remover item: " . $e->getMessage());
}
