<?php
require_once __DIR__ . '/../Config/conect.php';

class ExerciciosController
{

    public function getExercicio()
    {

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
    }

    public function addExercicios()
    {
        require_once __DIR__ . '/../Config/conect.php';

        header('Content-Type: application/json');

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Método não permitido']);
            exit;
        }

        try {
            $pdo = connectDB();

            $treino_id = $_POST['treino_id'] ?? '';
            $nome = trim($_POST['nome'] ?? '');  // nome do exercício vindo do select
            $grupo = trim($_POST['grupo'] ?? '');
            $num_series = $_POST['num_series'] ?? '';
            $num_repeticoes = $_POST['num_repeticoes'] ?? '';
            $descanso = $_POST['tempo_descanso'] ?? null;
            $peso = $_POST['peso'] ?? null;
            $informacoes = $_POST['informacoes'] ?? null;

            if (!$nome || !$num_series || !$num_repeticoes) {
                http_response_code(400);
                echo json_encode(['error' => 'Campos obrigatórios faltando']);
                exit;
            }

            $num_series = (int)$num_series;
            $num_repeticoes = (int)$num_repeticoes;
            $descanso = ($descanso === '' ? null : (int)$descanso);
            $peso = ($peso === '' ? null : (float)$peso);

            $jsonPath = __DIR__ . '/../Data/exercicios.json';
            if (!file_exists($jsonPath)) {
                http_response_code(500);
                echo json_encode(['error' => 'Arquivo de exercícios não encontrado']);
                exit;
            }

            $exercicios = json_decode(file_get_contents($jsonPath), true);

            $url = null;
            $cover = null;
            foreach ($exercicios as $ex) {
                if (strcasecmp($ex['nome'], $nome) === 0) {
                    $url = $ex['url'] ?? null;
                    $informacoes = $ex['informacoes'] ?? $informacoes;
                    $grupo = $ex['grupo'] ?? $grupo;
                    break;
                }
            }

            function pegarCoverYoutube(string $url): ?string // se a gente for usar a nossa capa personalizada, apaga isso daqui e bota o cover do json pra mandar pro BD
            {
                $id = null;

                //pegar id essas parada
                if (preg_match('/v=([^&]+)/', $url, $matches)) {
                    $id = $matches[1];
                } elseif (preg_match('/youtu\.be\/([^?&]+)/', $url, $matches)) {
                    $id = $matches[1];
                }

                if (!$id) return null;

                return "https://img.youtube.com/vi/{$id}/hqdefault.jpg";
            }

            $cover = pegarCoverYoutube($url);

            if ($url === null || $cover === null) {
                http_response_code(400);
                echo json_encode(['error' => 'Exercício não encontrado no JSON']);
                exit;
            }

            //manda os vídeos pro BD

            $sql = "INSERT INTO Exercicios  
        (treino_id, nome, num_series, num_repeticoes, tempo_descanso, peso, informacoes, url, cover, grupo) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

            $stmt = $pdo->prepare($sql);
            $stmt->execute([$treino_id, $nome, $num_series, $num_repeticoes, $descanso, $peso, $informacoes, $url, $cover, $grupo]);

            echo json_encode(['success' => true]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Erro no banco: ' . $e->getMessage()]);
        }
    }

    public function fetchExercicios()
    {
        header('Content-Type: application/json');

        $muscle = isset($_GET['grupo']) ? strtolower(trim($_GET['grupo'])) : '';

        if (!$muscle) {
            echo json_encode([]);
            exit;
        }

        $jsonPath = __DIR__ . '/../Data/exercicios.json';

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
    }

    public function rmvExercicios()
    {
        header('Content-Type: application/json');

        $id = $_GET['id'] ?? null;
        $treino_id = $_GET['treino_id'] ?? null;

        if (!$id || !$treino_id) {
            echo json_encode(['success' => false, 'error' => 'ID do exercício ou treino não informado']);
            return;
        }

        try {
            $pdo = connectDB();
            $stmt = $pdo->prepare("DELETE FROM Exercicios WHERE id = ?");
            $stmt->execute([$id]);

            echo json_encode(['success' => true, 'treino_id' => $treino_id]);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
    }

    public function updExercicio()
    {
        header('Content-Type: application/json');

        $id = $_POST['id'] ?? null;
        $num_series = $_POST['num_series'] ?? null;
        $num_repeticoes = $_POST['num_repeticoes'] ?? null;
        $tempo_descanso = $_POST['tempo_descanso'] ?? null;
        $peso = $_POST['peso'] ?? null;

        if (!$id || !$num_series || !$num_repeticoes) {
            echo json_encode(['success' => false, 'error' => 'Campos obrigatórios faltando']);
            return;
        }

        try {
            $pdo = connectDB();
            $stmt = $pdo->prepare("UPDATE Exercicios 
                SET num_series=?, num_repeticoes=?, tempo_descanso=?, peso=?
                WHERE id=?");
            $stmt->execute([$num_series, $num_repeticoes, $tempo_descanso, $peso, $id]);

            echo json_encode(['success' => true]);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
    }
}
