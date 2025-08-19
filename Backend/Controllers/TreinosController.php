<?php
require_once __DIR__ . '/../Config/conect.php';

class TreinosController
{
    public function listarTreinos()
    {
        header('Content-Type: application/json');

        try {
            $pdo = connectDB();
            $stmt = $pdo->query("SELECT * FROM Treinos ORDER BY data_ultima_modificacao DESC");
            $treinos = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'treinos' => $treinos
            ]);
        } catch (PDOException $e) {
            echo json_encode([
                'success' => false,
                'error' => "Erro ao carregar treinos: " . $e->getMessage()
            ]);
        }
    }

    public function rmvTreino()
    {
        header('Content-Type: application/json');
        require_once __DIR__ . '/../Config/conect.php';

        if (!isset($_GET['id'])) {
            echo json_encode(['success' => false, 'error' => 'ID do treino não especificado']);
            exit;
        }

        $id = (int) $_GET['id'];

        try {
            $pdo = connectDB();
            $stmtEx = $pdo->prepare("DELETE FROM Exercicios WHERE treino_id = ?");
            $stmtEx->execute([$id]);

            $stmtTreino = $pdo->prepare("DELETE FROM Treinos WHERE id = ?");
            $stmtTreino->execute([$id]);

            echo json_encode(['success' => true, 'message' => 'Treino removido com sucesso']);
            exit;
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
            exit;
        }
    }

    public function addTreino()
    {
        header('Content-Type: application/json');
        require_once __DIR__ . '/../Config/conect.php';

        $input = json_decode(file_get_contents('php://input'), true);
        $nome = $input['nome'] ?? ($_POST['nome'] ?? '');
        $especialidades = $input['especialidades'] ?? ($_POST['especialidades'] ?? '');
        $data = date('Y-m-d');

        if ($nome) {
            try {
                $pdo = connectDB();
                $stmt = $pdo->prepare("
                    INSERT INTO Treinos (nome, data_ultima_modificacao, especialidades) 
                    VALUES (?, ?, ?)
                ");
                $stmt->execute([$nome, $data, $especialidades]);

                echo json_encode([
                    'success' => true,
                    'message' => 'Treino adicionado com sucesso',
                    'id' => $pdo->lastInsertId()
                ]);
                exit;
            } catch (PDOException $e) {
                echo json_encode([
                    'success' => false,
                    'error' => $e->getMessage()
                ]);
                exit;
            }
        } else {
            echo json_encode([
                'success' => false,
                'error' => 'Preencha o nome do treino.'
            ]);
            exit;
        }
    }

    public function selectTreino()
    {
        header('Content-Type: application/json');

        $treino_id = $_GET['id'] ?? '';
        if (!$treino_id) {
            echo json_encode([
                'success' => false,
                'error' => 'Treino não especificado'
            ]);
            exit;
        }

        try {
            $pdo = connectDB();

            // select do treino
            $stmtTreino = $pdo->prepare("SELECT * FROM Treinos WHERE id = ?");
            $stmtTreino->execute([$treino_id]);
            $treino = $stmtTreino->fetch(PDO::FETCH_ASSOC);

            if (!$treino) {
                echo json_encode([
                    'success' => false,
                    'error' => 'Treino não encontrado'
                ]);
                exit;
            }

            // select dos exercícios desse treino
            $stmtExercicios = $pdo->prepare("SELECT * FROM Exercicios WHERE treino_id = ?");
            $stmtExercicios->execute([$treino_id]);
            $exercicios = $stmtExercicios->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'treino' => $treino,
                'exercicios' => $exercicios
            ]);
        } catch (PDOException $e) {
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }
}
