<?php
    require_once __DIR__ . '/../../Config/connect.php'; // Inclui o arquivo de conexão com o banco de dados

    class ExerciciosController {
        private $db;

        public function __construct() {
            $this->db = DB::connectDB(); // Conecta ao banco de dados no construtor
        }

        public function buscarTodosExercicios() {
            $stmt = $this->db->query("SELECT * FROM exercicios");
            $result = $stmt->fetchAll();
            header('Content-Type: application/json');
            echo json_encode($result); // Retorna todos os exercícios em JSON
        }

        public function buscarPorID($id) {
            $stmt = $this->db->prepare("SELECT * FROM exercicios WHERE id = ?");
            $stmt->execute([$id]);
            $result = $stmt->fetch();
            header('Content-Type: application/json');
            echo json_encode($result); // Retorna o exercício encontrado em JSON
        }

        public function buscarPorNome($nome) {
            $stmt = $this->db->prepare("SELECT * FROM exercicios WHERE nome = ?");
            $stmt->execute([$nome]);
            $result = $stmt->fetch();
            header('Content-Type: application/json');
            echo json_encode($result); // Retorna o exercício encontrado em JSON
        }

        public function cadastrarExercicio($data) {
            $stmt = $this->db->prepare("INSERT INTO exercicios (nome, descricao, duracao) VALUES (?, ?, ?)");
            $success = $stmt->execute([$data['nome'], $data['descricao'], $data['duracao']]);
            header('Content-Type: application/json');
            echo json_encode(['success' => $success, 'id' => $this->db->lastInsertId()]); // Retorna o ID do novo exercício
        }

        public function atualizarExercicio($id, $data) {
            $stmt = $this->db->prepare("UPDATE exercicios SET nome = ?, descricao = ?, duracao = ? WHERE id = ?");
            $success = $stmt->execute([$data['nome'], $data['descricao'], $data['duracao'], $id]);
            header('Content-Type: application/json');
            echo json_encode(['success' => $success]); // Retorna sucesso ou falha
        }

        public function deletarExercicio($id) {
            $stmt = $this->db->prepare("DELETE FROM exercicios WHERE id = ?");
            $success = $stmt->execute([$id]);
            header('Content-Type: application/json');
            echo json_encode(['success' => $success]); // Retorna sucesso ou falha
        }
    }
?>