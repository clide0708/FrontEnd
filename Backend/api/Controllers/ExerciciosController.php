<?php
    require_once __DIR__ . '/../Config/db.connect.php'; // Caminho corrigido

    class ExerciciosController {
        private $db;

        public function __construct() {
            $this->db = DB::connectDB();
        }

        public function buscarTodosExercicios() {
            try {
                $stmt = $this->db->query("SELECT * FROM exercicios");
                $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
                http_response_code(200);
                echo json_encode($result);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(["error" => "Erro ao buscar exercícios: " . $e->getMessage()]);
            }
        }

        public function buscarPorID($id) {
            try {
                $stmt = $this->db->prepare("SELECT * FROM exercicios WHERE id = ?");
                $stmt->execute([$id]);
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($result) {
                    http_response_code(200);
                    echo json_encode($result);
                } else {
                    http_response_code(404);
                    echo json_encode(["error" => "Exercício não encontrado"]);
                }
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(["error" => "Erro ao buscar exercício: " . $e->getMessage()]);
            }
        }

        public function buscarPorNome($nome) {
            try {
                $stmt = $this->db->prepare("SELECT * FROM exercicios WHERE nome LIKE ?");
                $stmt->execute(["%$nome%"]);
                $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                if ($result) {
                    http_response_code(200);
                    echo json_encode($result);
                } else {
                    http_response_code(404);
                    echo json_encode(["error" => "Nenhum exercício encontrado com esse nome"]);
                }
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(["error" => "Erro ao buscar exercício: " . $e->getMessage()]);
            }
        }

        public function cadastrarExercicio($data) {
            try {
                // Validação básica
                if (!isset($data['nome']) || !isset($data['descricao']) || !isset($data['duracao'])) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'Dados incompletos']);
                    return;
                }

                $stmt = $this->db->prepare("INSERT INTO exercicios (nome, descricao, duracao) VALUES (?, ?, ?)");
                $success = $stmt->execute([$data['nome'], $data['descricao'], $data['duracao']]);
                
                if ($success) {
                    http_response_code(201);
                    echo json_encode(['success' => true, 'id' => $this->db->lastInsertId()]);
                } else {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'Falha ao cadastrar exercício']);
                }
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Erro ao cadastrar exercício: ' . $e->getMessage()]);
            }
        }

        public function atualizarExercicio($id, $data) {
            try {
                $stmt = $this->db->prepare("UPDATE exercicios SET nome = ?, descricao = ?, duracao = ? WHERE id = ?");
                $success = $stmt->execute([$data['nome'], $data['descricao'], $data['duracao'], $id]);
                
                if ($success && $stmt->rowCount() > 0) {
                    http_response_code(200);
                    echo json_encode(['success' => true]);
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'error' => 'Exercício não encontrado ou dados idênticos']);
                }
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Erro ao atualizar exercício: ' . $e->getMessage()]);
            }
        }

        public function deletarExercicio($id) {
            try {
                $stmt = $this->db->prepare("DELETE FROM exercicios WHERE id = ?");
                $success = $stmt->execute([$id]);
                
                if ($success && $stmt->rowCount() > 0) {
                    http_response_code(200);
                    echo json_encode(['success' => true]);
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'error' => 'Exercício não encontrado']);
                }
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Erro ao deletar exercício: ' . $e->getMessage()]);
            }
        }
    }
?>