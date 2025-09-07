<?php
class TreinosRepository {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function getAll() {
        $stmt = $this->pdo->query("SELECT * FROM Treinos ORDER BY data_ultima_modificacao DESC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById($id) {
        $stmt = $this->pdo->prepare("SELECT * FROM Treinos WHERE id=?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create($nome, $especialidades, $data) {
        $stmt = $this->pdo->prepare("
            INSERT INTO Treinos (nome, data_ultima_modificacao, especialidades) 
            VALUES (?, ?, ?)
        ");
        $stmt->execute([$nome, $data, $especialidades]);
        return $this->pdo->lastInsertId();
    }

    public function delete($id) {
        // primeiro deleta exercícios
        $stmtEx = $this->pdo->prepare("DELETE FROM Exercicios WHERE treino_id=?");
        $stmtEx->execute([$id]);
        // depois treino
        $stmtTreino = $this->pdo->prepare("DELETE FROM Treinos WHERE id=?");
        return $stmtTreino->execute([$id]);
    }

    public function getExerciciosByTreino($treino_id) {
        $stmt = $this->pdo->prepare("SELECT * FROM Exercicios WHERE treino_id=?");
        $stmt->execute([$treino_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
