<?php
class ExerciciosRepository {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function getById($id) {
        $stmt = $this->pdo->prepare("SELECT * FROM Exercicios WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create($data) {
        $sql = "INSERT INTO Exercicios  
            (treino_id, nome, num_series, num_repeticoes, tempo_descanso, peso, informacoes, url, cover, grupo) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([
            $data['treino_id'], $data['nome'], $data['num_series'], $data['num_repeticoes'],
            $data['tempo_descanso'], $data['peso'], $data['informacoes'], $data['url'],
            $data['cover'], $data['grupo']
        ]);
    }

    public function update($id, $data) {
        $stmt = $this->pdo->prepare("UPDATE Exercicios 
            SET num_series=?, num_repeticoes=?, tempo_descanso=?, peso=? WHERE id=?");
        return $stmt->execute([
            $data['num_series'], $data['num_repeticoes'], $data['tempo_descanso'], $data['peso'], $id
        ]);
    }

    public function delete($id) {
        $stmt = $this->pdo->prepare("DELETE FROM Exercicios WHERE id=?");
        return $stmt->execute([$id]);
    }
}
