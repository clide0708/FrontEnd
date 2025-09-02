<?php
require_once __DIR__ . '/../Config/connect.php';
require_once __DIR__ . '/../Repositories/TreinosRepository.php';
require_once __DIR__ . '/../Services/TreinosService.php';

class TreinosController {
    private $service;

    public function __construct() {
        $pdo = connectDB();
        $repo = new TreinosRepository($pdo);
        $this->service = new TreinosService($repo);
    }

    public function listarTreinos() {
        header('Content-Type: application/json');
        try {
            $treinos = $this->service->listarTreinos();
            echo json_encode(['success'=>true,'treinos'=>$treinos]);
        } catch (Exception $e) {
            echo json_encode(['success'=>false,'error'=>$e->getMessage()]);
        }
    }

    public function addTreino() {
        header('Content-Type: application/json');
        $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        try {
            $id = $this->service->addTreino($input['nome'] ?? '', $input['especialidades'] ?? '');
            echo json_encode(['success'=>true,'message'=>'Treino adicionado com sucesso','id'=>$id]);
        } catch (Exception $e) {
            echo json_encode(['success'=>false,'error'=>$e->getMessage()]);
        }
    }

    public function rmvTreino() {
        header('Content-Type: application/json');
        $id = $_GET['id'] ?? null;
        try {
            $this->service->rmvTreino($id);
            echo json_encode(['success'=>true,'message'=>'Treino removido com sucesso']);
        } catch (Exception $e) {
            echo json_encode(['success'=>false,'error'=>$e->getMessage()]);
        }
    }

    public function selectTreino() {
        header('Content-Type: application/json');
        $id = $_GET['id'] ?? null;
        try {
            $data = $this->service->selectTreino($id);
            echo json_encode(['success'=>true,'treino'=>$data['treino'],'exercicios'=>$data['exercicios']]);
        } catch (Exception $e) {
            echo json_encode(['success'=>false,'error'=>$e->getMessage()]);
        }
    }
}
