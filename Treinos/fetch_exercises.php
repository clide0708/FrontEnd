<?php
header('Content-Type: application/json');

$muscle = isset($_GET['grupo']) ? strtolower(trim($_GET['grupo'])) : '';

if (!$muscle) {
    echo json_encode([]);
    exit;
}

$jsonPath = __DIR__ . '/exercicios.json';

if (!file_exists($jsonPath)) {
    echo json_encode([]);
    exit;
}

$data = json_decode(file_get_contents($jsonPath), true);

if (!is_array($data)) {
    echo json_encode([]);
    exit;
}

$filtered = array_values(array_filter($data, function ($ex) use ($muscle) {
    return strtolower($ex['grupo']) === $muscle;
}));

echo json_encode($filtered);
