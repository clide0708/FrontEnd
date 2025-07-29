<?php
require_once 'conect.php'; // conecta ao banco

$lista = $_POST['lista'] ?? '';
$index = $_POST['index'] ?? '';
$especificacao_nova = $_POST['especificacao'] ?? '';

if ($lista === '' || $index === '' || $especificacao_nova === '') {
    die('Dados incompletos');
}

try {
    $pdo = connectDB();
    $pdo->beginTransaction();

    // 1. pega a especificacao antiga
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

    // 2. pega os nutrientes atuais
    $stmt = $pdo->prepare("SELECT calorias, proteinas, carboidratos, gorduras FROM nutrientes WHERE alimento_id = :id");
    $stmt->execute([':id' => $index]);
    $nutrientes = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$nutrientes) {
        throw new Exception("Nutrientes não encontrados para este item.");
    }

    // 3. calcula nutrientes por grama
    $porGrama = [
        'calorias' => $nutrientes['calorias'] / $especificacao_antiga,
        'proteinas' => $nutrientes['proteinas'] / $especificacao_antiga,
        'carboidratos' => $nutrientes['carboidratos'] / $especificacao_antiga,
        'gorduras' => $nutrientes['gorduras'] / $especificacao_antiga,
    ];

    // 4. calcula novos nutrientes
    $novosNutrientes = [
        'calorias' => $porGrama['calorias'] * $especificacao_nova,
        'proteinas' => $porGrama['proteinas'] * $especificacao_nova,
        'carboidratos' => $porGrama['carboidratos'] * $especificacao_nova,
        'gorduras' => $porGrama['gorduras'] * $especificacao_nova,
    ];

    // 5. atualiza a especificacao no item
    $stmt = $pdo->prepare("UPDATE itens_refeicao SET especificacao = :especificacao WHERE id = :id");
    $stmt->execute([
        ':especificacao' => $especificacao_nova,
        ':id' => $index
    ]);

    // 6. atualiza os nutrientes
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

    echo json_encode(['success' => true, 'message' => 'Especificação e nutrientes atualizados com sucesso.']);
    exit;

} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(['success' => false, 'error' => 'Erro: ' . $e->getMessage()]);
    exit;
}

