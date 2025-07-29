<?php
include 'conect.php';

header('Content-Type: application/json');

$lista = $_GET['lista'] ?? '';
if (empty($lista)) {
    echo json_encode(['error' => 'Lista não especificada']);
    exit;
}

try {
    $pdo = connectDB();

    // Busca diretamente os alimentos sem verificar tipo de refeição primeiro
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
