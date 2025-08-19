<?php
require_once __DIR__ . '/../Config/conect.php';

class AlimentosController
{
    public function listarAlimentos()
    {
        header('Content-Type: application/json');
        $lista = $_GET['lista'] ?? '';
        if (empty($lista)) {
            echo json_encode(['error' => 'Lista não especificada']);
            return;
        }
        try {
            $pdo = connectDB();

            $stmt = $pdo->prepare("
                SELECT 
                    ir.id,
                    ir.nome, 
                    ir.especificacao,
                    n.calorias,
                    n.proteinas,
                    n.carboidratos,
                    n.gorduras
                FROM itens_refeicao ir
                LEFT JOIN nutrientes n ON ir.id = n.alimento_id
                WHERE ir.id_tipo_refeicao = (
                    SELECT id FROM refeicoes_tipos WHERE nome_tipo = :lista
                )
            ");
            $stmt->execute([':lista' => $lista]);
            $alimentos = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($alimentos);
        } catch (Exception $e) {
            echo json_encode(['error' => 'Erro ao carregar alimentos: ' . $e->getMessage()]);
        }
    }


    public function addAlimento()
    {
        header('Content-Type: application/json');

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            die('Método inválido');
        }

        $lista = $_POST['lista'] ?? '';
        $nome = $_POST['nome'] ?? '';
        $especificacao = $_POST['especificacao'] ?? '';

        if (!$lista || !$nome || !$especificacao) {
            die('Dados incompletos');
        }

        try {
            $pdo = connectDB();
            $pdo->beginTransaction();

            $stmt = $pdo->prepare("SELECT id FROM refeicoes_tipos WHERE nome_tipo = :lista");
            $stmt->execute([':lista' => $lista]);
            $tipo_refeicao_id = $stmt->fetchColumn();

            if (!$tipo_refeicao_id) {
                die('Tipo de refeição inválido.');
            }

            $stmt = $pdo->prepare("INSERT INTO itens_refeicao (id_tipo_refeicao, nome, especificacao) VALUES (:id_tipo, :nome, :especificacao)");
            $stmt->execute([
                ':id_tipo' => $tipo_refeicao_id,
                ':nome' => $nome,
                ':especificacao' => $especificacao
            ]);

            $alimento_id = $pdo->lastInsertId();

            $apiKey = "617d584fd753442483088b758ccd52fd";
            $searchUrl = "https://api.spoonacular.com/food/ingredients/search?query=" . urlencode($nome) . "&number=1&apiKey=$apiKey";
            $searchData = json_decode(@file_get_contents($searchUrl), true);

            $nutrientes = [
                'calorias' => 0,
                'proteinas' => 0,
                'carboidratos' => 0,
                'gorduras' => 0,
                'unidade' => 'g'
            ];

            if ($searchData && isset($searchData['results'][0]['id'])) {
                $ingredientId = $searchData['results'][0]['id'];
                $nutriUrl = "https://api.spoonacular.com/food/ingredients/$ingredientId/information?amount=100&unit=gram&apiKey=$apiKey";
                $nutriData = json_decode(@file_get_contents($nutriUrl), true);

                if ($nutriData && isset($nutriData['nutrition']['nutrients'])) {
                    foreach ($nutriData['nutrition']['nutrients'] as $nutriente) {
                        $nomeNutriente = strtolower($nutriente['name']);
                        if ($nomeNutriente === 'calories') {
                            $nutrientes['calorias'] = $nutriente['amount'];
                        } elseif ($nomeNutriente === 'protein') {
                            $nutrientes['proteinas'] = $nutriente['amount'];
                        } elseif ($nomeNutriente === 'carbohydrates') {
                            $nutrientes['carboidratos'] = $nutriente['amount'];
                        } elseif ($nomeNutriente === 'fat') {
                            $nutrientes['gorduras'] = $nutriente['amount'];
                        }
                    }
                }
            }

            $stmt = $pdo->prepare("INSERT INTO nutrientes (alimento_id, calorias, proteinas, carboidratos, gorduras, unidade) 
                                  VALUES (:alimento_id, :calorias, :proteinas, :carboidratos, :gorduras, :unidade)");
            $stmt->execute([
                ':alimento_id' => $alimento_id,
                ':calorias' => $nutrientes['calorias'] / 100 * $especificacao,
                ':proteinas' => $nutrientes['proteinas'] / 100 * $especificacao,
                ':carboidratos' => $nutrientes['carboidratos'] / 100 * $especificacao,
                ':gorduras' => $nutrientes['gorduras'] / 100 * $especificacao,
                ':unidade' => $nutrientes['unidade']
            ]);

            $pdo->commit();

            echo json_encode([
                'success' => true,
                'id' => $alimento_id
            ]);
            exit;
        } catch (PDOException $e) {
            $pdo->rollBack();
            die("Erro ao adicionar item: " . $e->getMessage());
        } catch (Exception $e) {
            $pdo->rollBack();
            die("Erro ao acessar API: " . $e->getMessage());
        }
    }

    public function rmvAlimento()
    {
        header('Content-Type: application/json');

        $lista = $_POST['lista'] ?? '';
        $index = $_POST['index'] ?? '';

        if ($lista === '' || $index === '') {
            echo json_encode(['error' => 'Dados incompletos']);
            return;
        }

        try {
            $pdo = connectDB();

            $stmt = $pdo->prepare("DELETE FROM itens_refeicao WHERE id = :id");
            $stmt->execute([':id' => $index]);

            echo json_encode([
                'success' => true,
                'id_removido' => $index
            ]);
        } catch (PDOException $e) {
            echo json_encode(['error' => 'Erro ao remover item: ' . $e->getMessage()]);
        }
    }

    public function updAlimento()
    {
        header('Content-Type: application/json');

        $lista = $_POST['lista'] ?? '';
        $index = $_POST['index'] ?? '';
        $especificacao_nova = $_POST['especificacao'] ?? '';

        if ($lista === '' || $index === '' || $especificacao_nova === '') {
            echo json_encode(['success' => false, 'error' => 'Dados incompletos']);
            return;
        }

        try {
            $pdo = connectDB();
            $pdo->beginTransaction();

            // pega info antiga
            $stmt = $pdo->prepare("SELECT especificacao FROM itens_refeicao WHERE id = :id");
            $stmt->execute([':id' => $index]);
            $item = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$item) {
                throw new Exception("Item de refeição não encontrado.");
            }

            $especificacao_antiga = floatval($item['especificacao']);
            $especificacao_nova = floatval($especificacao_nova);

            if ($especificacao_antiga == 0) {
                throw new Exception("Especificação antiga inválida (zero).");
            }

            $stmt = $pdo->prepare("SELECT calorias, proteinas, carboidratos, gorduras FROM nutrientes WHERE alimento_id = :id");
            $stmt->execute([':id' => $index]);
            $nutrientes = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$nutrientes) {
                throw new Exception("Nutrientes não encontrados para este item.");
            }

            // calcula os nutrientes por grama
            $porGrama = [
                'calorias' => $nutrientes['calorias'] / $especificacao_antiga,
                'proteinas' => $nutrientes['proteinas'] / $especificacao_antiga,
                'carboidratos' => $nutrientes['carboidratos'] / $especificacao_antiga,
                'gorduras' => $nutrientes['gorduras'] / $especificacao_antiga,
            ];

            $novosNutrientes = [
                'calorias' => $porGrama['calorias'] * $especificacao_nova,
                'proteinas' => $porGrama['proteinas'] * $especificacao_nova,
                'carboidratos' => $porGrama['carboidratos'] * $especificacao_nova,
                'gorduras' => $porGrama['gorduras'] * $especificacao_nova,
            ];

            // atualiza especificação
            $stmt = $pdo->prepare("UPDATE itens_refeicao SET especificacao = :especificacao WHERE id = :id");
            $stmt->execute([
                ':especificacao' => $especificacao_nova,
                ':id' => $index
            ]);

            // atualiza nutrientes
            $stmt = $pdo->prepare("UPDATE nutrientes SET 
            calorias = :calorias,
            proteinas = :proteinas,
            carboidratos = :carboidratos,
            gorduras = :gorduras
            WHERE alimento_id = :id
        ");
            $stmt->execute([
                ':calorias' => $novosNutrientes['calorias'],
                ':proteinas' => $novosNutrientes['proteinas'],
                ':carboidratos' => $novosNutrientes['carboidratos'],
                ':gorduras' => $novosNutrientes['gorduras'],
                ':id' => $index
            ]);

            $pdo->commit();

            echo json_encode([
                'success' => true,
                'message' => 'Especificação e nutrientes atualizados com sucesso.'
            ]);
            exit;
        } catch (Exception $e) {
            $pdo->rollBack();
            echo json_encode([
                'success' => false,
                'error' => 'Erro: ' . $e->getMessage()
            ]);
            exit;
        }
    }

    public function listarTotais()
    {
        header('Content-Type: application/json');
        try {
            $pdo = connectDB();

            $mealTypes = ['cafe', 'almoco', 'janta', 'outros'];
            $resultado = [];
            $totaisGerais = [
                'calorias' => 0,
                'proteinas' => 0,
                'carboidratos' => 0,
                'gorduras' => 0
            ];

            foreach ($mealTypes as $tipo) {
                $stmt = $pdo->prepare("
                    SELECT 
                        ir.id, 
                        ir.nome, 
                        ir.especificacao,
                        n.calorias,
                        n.proteinas,
                        n.carboidratos,
                        n.gorduras
                    FROM itens_refeicao ir
                    JOIN refeicoes_tipos rt ON ir.id_tipo_refeicao = rt.id
                    LEFT JOIN nutrientes n ON n.alimento_id = ir.id
                    WHERE rt.nome_tipo = :tipo
                    ORDER BY ir.id ASC
                ");
                $stmt->execute([':tipo' => $tipo]);
                $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

                $totais = ['calorias' => 0, 'proteinas' => 0, 'carboidratos' => 0, 'gorduras' => 0];

                foreach ($items as $item) {
                    $quantidade = floatval($item['especificacao']);
                    $proporcao = $quantidade / 100;
                    if ($item['calorias'] !== null) {
                        $totais['calorias'] += $proporcao * $item['calorias'];
                        $totais['proteinas'] += $proporcao * $item['proteinas'];
                        $totais['carboidratos'] += $proporcao * $item['carboidratos'];
                        $totais['gorduras'] += $proporcao * $item['gorduras'];
                    }
                }

                $totaisGerais['calorias'] += $totais['calorias'];
                $totaisGerais['proteinas'] += $totais['proteinas'];
                $totaisGerais['carboidratos'] += $totais['carboidratos'];
                $totaisGerais['gorduras'] += $totais['gorduras'];

                $resultado[$tipo] = ['items' => $items, 'totais' => $totais];
            }

            echo json_encode([
                'success' => true,
                'refeicoes' => $resultado,
                'totaisGerais' => $totaisGerais
            ]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
    }
}
