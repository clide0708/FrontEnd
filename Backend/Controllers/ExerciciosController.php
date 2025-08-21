<?php
require_once __DIR__ . '/../Config/conect.php';
require_once __DIR__ . '/../Repositories/ExerciciosRepository.php';
require_once __DIR__ . '/../Services/ExerciciosService.php';

class ExerciciosController {
    private $service;

    public function __construct() {
        $pdo = connectDB();
        $repo = new ExerciciosRepository($pdo);
        $this->service = new ExerciciosService($repo);
    }

    public function getExercicio() {
        header('Content-Type: application/json');
        $id = $_GET['id'] ?? '';
        if (!$id) { http_response_code(400); echo json_encode(['error'=>'ID não informado']); exit; }

        try {
            $ex = $this->service->getExercicio($id);
            echo json_encode($ex);
        } catch (Exception $e) {
            http_response_code(404);
            echo json_encode(['error'=>$e->getMessage()]);
        }
    }

    public function addExercicios() {
        header('Content-Type: application/json');
        try {
            $jsonExercicios = json_decode(file_get_contents(__DIR__ . '/../Data/exercicios.json'), true);
            $this->service->addExercicio($_POST, $jsonExercicios);
            echo json_encode(['success'=>true]);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error'=>$e->getMessage()]);
        }
    }

    public function updExercicio() {
        header('Content-Type: application/json');
        try {
            $this->service->updateExercicio($_POST['id'], $_POST);
            echo json_encode(['success'=>true]);
        } catch (Exception $e) {
            echo json_encode(['success'=>false,'error'=>$e->getMessage()]);
        }
    }

    public function rmvExercicios() {
        header('Content-Type: application/json');
        try {
            $this->service->deleteExercicio($_GET['id']);
            echo json_encode(['success'=>true]);
        } catch (Exception $e) {
            echo json_encode(['success'=>false,'error'=>$e->getMessage()]);
        }
    }

    public function fetchExercicios() {
        header('Content-Type: application/json');
        $muscle = strtolower(trim($_GET['grupo'] ?? ''));
        if (!$muscle) { echo json_encode([]); exit; }

        $jsonPath = __DIR__ . '/../Data/exercicios.json';
        if (!file_exists($jsonPath)) { echo json_encode([]); exit; }

        $data = json_decode(file_get_contents($jsonPath), true);
        $filtered = array_values(array_filter($data, fn($ex) => strtolower($ex['grupo']) === $muscle));
        echo json_encode($filtered);
    }
}
