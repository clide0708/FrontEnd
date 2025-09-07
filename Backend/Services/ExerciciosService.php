<?php
class ExerciciosService {
    private $repo;

    public function __construct($repo) {
        $this->repo = $repo;
    }

    public function getExercicio($id) {
        $exercicio = $this->repo->getById($id);
        if (!$exercicio) throw new Exception("Exercício não encontrado");
        return $exercicio;
    }

    public function addExercicio($data, $jsonExercicios) {
        if (!$data['nome'] || !$data['num_series'] || !$data['num_repeticoes']) {
            throw new Exception("Campos obrigatórios faltando");
        }

        // pega info do JSON
        $ex = array_filter($jsonExercicios, fn($e) => strcasecmp($e['nome'], $data['nome']) === 0);
        $ex = reset($ex);
        if (!$ex) throw new Exception("Exercício não encontrado no JSON");

        $data['url'] = $ex['url'] ?? null;
        $data['cover'] = $ex['url'] ? "https://img.youtube.com/vi/".preg_replace('/.*v=([^&]+).*/', '$1', $ex['url'])."/hqdefault.jpg" : null;
        $data['informacoes'] = $ex['informacoes'] ?? $data['informacoes'];
        $data['grupo'] = $ex['grupo'] ?? $data['grupo'];

        return $this->repo->create($data);
    }

    public function updateExercicio($id, $data) {
        return $this->repo->update($id, $data);
    }

    public function deleteExercicio($id) {
        return $this->repo->delete($id);
    }
}
