<?php
class TreinosService {
    private $repo;

    public function __construct($repo) {
        $this->repo = $repo;
    }

    public function listarTreinos() {
        return $this->repo->getAll();
    }

    public function addTreino($nome, $especialidades) {
        if (!$nome) throw new Exception("Preencha o nome do treino");
        $data = date('Y-m-d');
        return $this->repo->create($nome, $especialidades, $data);
    }

    public function rmvTreino($id) {
        if (!$id) throw new Exception("ID do treino não especificado");
        return $this->repo->delete($id);
    }

    public function selectTreino($id) {
        if (!$id) throw new Exception("Treino não especificado");

        $treino = $this->repo->getById($id);
        if (!$treino) throw new Exception("Treino não encontrado");

        $exercicios = $this->repo->getExerciciosByTreino($id);
        return ['treino'=>$treino, 'exercicios'=>$exercicios];
    }
}
