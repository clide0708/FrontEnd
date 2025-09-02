<?php

    require_once __DIR__ . '/../Config/connect.php';

    header('Content-Type: application/json');
    $pdo = connectDB();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $grupoMuscular = $_GET['grupoMuscular'] ?? '';

    $sql = "SELECT idExercicio, nome, grupoMuscular, descricao FROM exercicios";
    $params = [];
    if($grupoMuscular){
        $sql .= " WHERE grupoMuscular LIKE ?";
        $params[] = "%".$grupoMuscular."%";
    }
    $sql .= " ORDER BY nome LIMIT 10000";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $exercicios = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($exercicios);

?>