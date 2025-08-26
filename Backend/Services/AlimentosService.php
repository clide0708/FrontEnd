<?php

class AlimentosService {
    private $repository;
    private $pdo;

    public function __construct($repository, $pdo) {
        $this->repository = $repository;
        $this->pdo = $pdo;
    }

    public function listarAlimentos($lista) {
        if (empty($lista)) throw new Exception('Lista não especificada');
        return $this->repository->getByLista($lista);
    }

    public function addAlimento($lista, $nome, $especificacao) {
        if (!$lista || !$nome || !$especificacao) throw new Exception('Dados incompletos');

        $this->pdo->beginTransaction();
        try {
            $stmt = $this->pdo->prepare("SELECT id FROM refeicoes_tipos WHERE nome_tipo = :lista");
            $stmt->execute([':lista' => $lista]);
            $tipo_refeicao_id = $stmt->fetchColumn();
            if (!$tipo_refeicao_id) throw new Exception('Tipo de refeição inválido');

            $alimento_id = $this->repository->insertItem($tipo_refeicao_id, $nome, $especificacao);

            $nutrientes = $this->buscarNutrientesAPI($nome);

            $stmt = $this->pdo->prepare("
                INSERT INTO nutrientes (alimento_id, calorias, proteinas, carboidratos, gorduras, unidade) 
                VALUES (:alimento_id, :calorias, :proteinas, :carboidratos, :gorduras, :unidade)
            ");
            $stmt->execute([
                ':alimento_id'=>$alimento_id,
                ':calorias'=>$nutrientes['calorias']/100*$especificacao,
                ':proteinas'=>$nutrientes['proteinas']/100*$especificacao,
                ':carboidratos'=>$nutrientes['carboidratos']/100*$especificacao,
                ':gorduras'=>$nutrientes['gorduras']/100*$especificacao,
                ':unidade'=>$nutrientes['unidade']
            ]);

            $this->pdo->commit();
            return $alimento_id;

        } catch (Exception $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }

    public function rmvAlimento($lista, $id) {
        if ($id === '') throw new Exception('ID do alimento não informado');
        return $this->repository->deleteItem($id);
    }

    public function updAlimento($lista, $id, $especificacao_nova) {
        if ($id === '' || $especificacao_nova === '') throw new Exception('Dados incompletos');

        $this->pdo->beginTransaction();
        try {
            // pega dados atuais
            $stmt = $this->pdo->prepare("SELECT especificacao FROM itens_refeicao WHERE id = :id");
            $stmt->execute([':id'=>$id]);
            $item = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$item) throw new Exception("Item não encontrado");

            $especificacao_antiga = floatval($item['especificacao']);
            $especificacao_nova = floatval($especificacao_nova);

            $nutrientes = $this->repository->getNutrientes($id);
            if (!$nutrientes) throw new Exception("Nutrientes não encontrados");

            // calcula novos nutrientes
            $porGrama = [
                'calorias' => $nutrientes['calorias'] / $especificacao_antiga,
                'proteinas' => $nutrientes['proteinas'] / $especificacao_antiga,
                'carboidratos' => $nutrientes['carboidratos'] / $especificacao_antiga,
                'gorduras' => $nutrientes['gorduras'] / $especificacao_antiga
            ];

            $novosNutrientes = [
                'calorias' => $porGrama['calorias'] * $especificacao_nova,
                'proteinas' => $porGrama['proteinas'] * $especificacao_nova,
                'carboidratos' => $porGrama['carboidratos'] * $especificacao_nova,
                'gorduras' => $porGrama['gorduras'] * $especificacao_nova
            ];

            $this->repository->updateEspecificacao($id, $especificacao_nova);
            $this->repository->updateNutrientes($id, $novosNutrientes);

            $this->pdo->commit();
            return true;

        } catch (Exception $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }

    public function listarTotais() {
        $mealTypes = ['cafe', 'almoco', 'janta', 'outros'];
        $resultado = [];
        $totaisGerais = ['calorias'=>0,'proteinas'=>0,'carboidratos'=>0,'gorduras'=>0];

        foreach ($mealTypes as $tipo) {
            $items = $this->repository->getByLista($tipo);

            $totais = ['calorias'=>0,'proteinas'=>0,'carboidratos'=>0,'gorduras'=>0];

            foreach ($items as $item) {
                $quantidade = floatval($item['especificacao']);
                $proporcao = $quantidade / 100;
                if ($item['calorias'] !== null) {
                    $totais['calorias'] += $proporcao*$item['calorias'];
                    $totais['proteinas'] += $proporcao*$item['proteinas'];
                    $totais['carboidratos'] += $proporcao*$item['carboidratos'];
                    $totais['gorduras'] += $proporcao*$item['gorduras'];
                }
            }

            $totaisGerais['calorias'] += $totais['calorias'];
            $totaisGerais['proteinas'] += $totais['proteinas'];
            $totaisGerais['carboidratos'] += $totais['carboidratos'];
            $totaisGerais['gorduras'] += $totais['gorduras'];

            $resultado[$tipo] = ['items'=>$items,'totais'=>$totais];
        }

        return ['refeicoes'=>$resultado,'totaisGerais'=>$totaisGerais];
    }

    // função auxiliar para buscar nutrientes na API
    private function buscarNutrientesAPI($nome) {
        $apiKey = "617d584fd753442483088b758ccd52fd";
        $searchUrl = "https://api.spoonacular.com/food/ingredients/search?query=".urlencode($nome)."&number=1&apiKey=$apiKey";
        $searchData = json_decode(@file_get_contents($searchUrl), true);

        $nutrientes = ['calorias'=>0,'proteinas'=>0,'carboidratos'=>0,'gorduras'=>0,'unidade'=>'g'];

        if ($searchData && isset($searchData['results'][0]['id'])) {
            $ingredientId = $searchData['results'][0]['id'];
            $nutriUrl = "https://api.spoonacular.com/food/ingredients/$ingredientId/information?amount=100&unit=gram&apiKey=$apiKey";
            $nutriData = json_decode(@file_get_contents($nutriUrl), true);

            if ($nutriData && isset($nutriData['nutrition']['nutrients'])) {
                foreach ($nutriData['nutrition']['nutrients'] as $nutriente) {
                    $n = strtolower($nutriente['name']);
                    if ($n==='calories') $nutrientes['calorias']=$nutriente['amount'];
                    if ($n==='protein') $nutrientes['proteinas']=$nutriente['amount'];
                    if ($n==='carbohydrates') $nutrientes['carboidratos']=$nutriente['amount'];
                    if ($n==='fat') $nutrientes['gorduras']=$nutriente['amount'];
                }
            }
        }

        return $nutrientes;
    }
}
