<?php
require_once __DIR__ . '/../Config/conect.php';
require_once __DIR__ . '/../Repositories/AlimentosRepository.php';
require_once __DIR__ . '/../Services/AlimentosService.php';

class AlimentosController
{
    private $service;

    public function __construct()
    {
        $pdo = connectDB();
        $repo = new AlimentosRepository($pdo);
        $this->service = new AlimentosService($repo, $pdo);
    }

    public function listarAlimentos()
    {
        header('Content-Type: application/json');
        header('Cache-Control: no-cache, no-store, must-revalidate');
        header('Pragma: no-cache');
        header('Expires: 0');

        try {
            $lista = filter_input(INPUT_GET, 'lista', FILTER_SANITIZE_STRING); // pega e limpa a entrada
            $alimentos = $this->service->listarAlimentos($lista);
            echo json_encode($alimentos);
        } catch (Exception $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function addAlimento()
    {
        header('Content-Type: application/json');
        try {
            $lista = $_POST['lista'] ?? '';
            $nome = $_POST['nome'] ?? '';
            $especificacao = $_POST['especificacao'] ?? '';
            $id = $this->service->addAlimento($lista, $nome, $especificacao);
            echo json_encode(['success' => true, 'id' => $id]);
        } catch (Exception $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function rmvAlimento()
    {
        header('Content-Type: application/json');
        try {
            $lista = $_POST['lista'] ?? '';
            $index = $_POST['index'] ?? '';
            if ($lista === '' || $index === '') throw new Exception('Dados incompletos');

            $this->service->rmvAlimento($lista, $index);
            echo json_encode(['success' => true, 'id_removido' => $index]);
        } catch (Exception $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function updAlimento()
    {
        header('Content-Type: application/json');
        try {
            $lista = $_POST['lista'] ?? '';
            $index = $_POST['index'] ?? '';
            $especificacao_nova = $_POST['especificacao'] ?? '';
            if ($lista === '' || $index === '' || $especificacao_nova === '') throw new Exception('Dados incompletos');

            $this->service->updAlimento($lista, $index, $especificacao_nova);
            echo json_encode(['success' => true, 'message' => 'Especificação e nutrientes atualizados com sucesso']);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
    }

    public function listarTotais()
    {
        header('Content-Type: application/json');
        try {
            $totais = $this->service->listarTotais();
            echo json_encode(['success' => true, 'refeicoes' => $totais['refeicoes'], 'totaisGerais' => $totais['totaisGerais']]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
    }
}
