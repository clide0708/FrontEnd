<?php
require_once __DIR__ . '/../Controllers/TesteController.php';
require_once __DIR__ . '/../Controllers/AlimentosController.php';



$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = '/' . basename($uri);

$method = $_SERVER['REQUEST_METHOD'];




$testeController = new TesteController();
$alimentosController = new AlimentosController();




if ($uri == '/api' && $method == 'GET') {
    $testeController->index();
} elseif ($uri == '/alimentos' && $method == 'GET') {
    $alimentosController->listarAlimentos();
} elseif ($uri == '/addAlimento' && $method == 'POST') {
    $alimentosController->addAlimento();
} elseif ($uri == '/updAlimento' && $method == 'POST') {
    $alimentosController->updAlimento();
} elseif ($uri == '/rmvAlimento' && $method == 'POST') {
    $alimentosController->rmvAlimento();
} elseif ($uri == '/totalRefeicoes' && $method == 'GET') {
    $alimentosController->listarTotais();
} else {
    header('Content-Type: application/json');
    http_response_code(404);
    echo json_encode(["erro" => "Rota não encontrada"]);
}
