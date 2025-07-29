<?php
header('Content-Type: application/json');

require_once 'conect.php';

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

    // 1. Obter o ID do tipo de refeição
    $stmt = $pdo->prepare("SELECT id FROM refeicoes_tipos WHERE nome_tipo = :lista");
    $stmt->execute([':lista' => $lista]);
    $tipo_refeicao_id = $stmt->fetchColumn();

    if (!$tipo_refeicao_id) {
        die('Tipo de refeição inválido.');
    }

    // 2. Inserir o novo item na tabela itens_refeicao
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
