<?php
require_once __DIR__ . '/../Controllers/TesteController.php';
require_once __DIR__ . '/../Controllers/AlimentosController.php';
require_once __DIR__ . '/../Controllers/TreinosController.php';
require_once __DIR__ . '/../Controllers/ExerciciosController.php';


$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = '/' . basename($uri);

$method = $_SERVER['REQUEST_METHOD'];



$testeController = new TesteController();
$alimentosController = new AlimentosController();
$treinosController = new TreinosController();
$exerciciosController = new ExerciciosController();


//Teste

if ($uri == '/api' && $method == 'GET') {
    $testeController->index();
}

//Alimentacao

elseif ($uri == '/alimentos' && $method == 'GET') {
    $alimentosController->listarAlimentos();
} elseif ($uri == '/addAlimento' && $method == 'POST') {
    $alimentosController->addAlimento();
} elseif ($uri == '/updAlimento' && $method == 'POST') {
    $alimentosController->updAlimento();
} elseif ($uri == '/rmvAlimento' && $method == 'POST') {
    $alimentosController->rmvAlimento();
} elseif ($uri == '/totalRefeicoes' && $method == 'GET') {
    $alimentosController->listarTotais();
}

//Treinos

elseif ($uri == '/treinos' && $method == 'GET') {
    $treinosController->listarTreinos();
} elseif ($uri == '/getTreino' && $method == 'GET') {
    $treinosController->selectTreino();
} elseif ($uri == '/rmvTreinos' && $method == 'DELETE') {
    $treinosController->rmvTreino();
} elseif ($uri == '/addTreinos' && $method == 'POST') {
    $treinosController->addTreino();
} elseif ($uri == '/getExercicio' && $method == 'GET') {
    $exerciciosController->getExercicio();
} elseif ($uri == '/addExercicios' && $method == 'POST') {
    $exerciciosController->addExercicios();
} elseif ($uri == '/fetchExercicios' && $method == 'GET') {
    $exerciciosController->fetchExercicios();
} elseif ($uri == '/rmvExercicios' && $method == 'DELETE') {
    $exerciciosController->rmvExercicios();
} elseif ($uri == '/updExercicio' && $method == 'POST') {
    $exerciciosController->updExercicio();
}


//erro de rota
else {
    header('Content-Type: application/json');
    http_response_code(404);
    echo json_encode(["erro" => "Rota não encontrada"]);
}
