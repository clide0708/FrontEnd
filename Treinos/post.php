<?php
require_once 'conect.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nome = $_POST['nome'] ?? '';
    $especialidades = $_POST['especialidades'] ?? '';
    $data = date('Y-m-d');

    if ($nome) {
        try {
            $pdo = connectDB();
            $stmt = $pdo->prepare("INSERT INTO Treinos (nome, data_ultima_modificacao, especialidades) VALUES (?, ?, ?)");
            $stmt->execute([$nome, $data, $especialidades]);
            header("Location: academia.php");
            exit;
        } catch (PDOException $e) {
            die("Erro ao adicionar treino: " . $e->getMessage());
        }
    } else {
        echo "Preencha o nome do treino.";
    }
}
?>
