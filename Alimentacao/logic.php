<?php
require_once 'conect.php';

try {
    $pdo = connectDB();

    function getItemsAndTotalsByMealType($pdo, $mealType)
    {
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
            WHERE rt.nome_tipo = :mealType
            ORDER BY ir.id ASC
        ");
        $stmt->execute([':mealType' => $mealType]);
        $items = $stmt->fetchAll();

        $totais = [
            'calorias' => 0,
            'proteinas' => 0,
            'carboidratos' => 0,
            'gorduras' => 0
        ];

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

        return ['items' => $items, 'totais' => $totais];
    }

    $cafe = getItemsAndTotalsByMealType($pdo, 'cafe');
    $almoco = getItemsAndTotalsByMealType($pdo, 'almoco');
    $janta = getItemsAndTotalsByMealType($pdo, 'janta');
    $outros = getItemsAndTotalsByMealType($pdo, 'outros');
} catch (PDOException $e) {
    die("Erro ao carregar refeições: " . $e->getMessage());
}

$totaisGerais = [
    'calorias' => $cafe['totais']['calorias'] + $almoco['totais']['calorias'] + $janta['totais']['calorias'] + $outros['totais']['calorias'],
    'proteinas' => $cafe['totais']['proteinas'] + $almoco['totais']['proteinas'] + $janta['totais']['proteinas'] + $outros['totais']['proteinas'],
    'carboidratos' => $cafe['totais']['carboidratos'] + $almoco['totais']['carboidratos'] + $janta['totais']['carboidratos'] + $outros['totais']['carboidratos'],
    'gorduras' => $cafe['totais']['gorduras'] + $almoco['totais']['gorduras'] + $janta['totais']['gorduras'] + $outros['totais']['gorduras']
];

$lista = $_GET['lista'] ?? '';
if (!$lista) die('Lista não especificada');

$itens = [];
try {
    $pdo = connectDB();

    // Busca o ID do tipo de refeição
    $stmtTipo = $pdo->prepare("SELECT id FROM refeicoes_tipos WHERE nome_tipo = :lista");
    $stmtTipo->execute([':lista' => $lista]);
    $tipo_refeicao_id = $stmtTipo->fetchColumn();

    if ($tipo_refeicao_id) {
        // Busca os itens para o tipo de refeição
        $stmtItens = $pdo->prepare("SELECT id, nome, especificacao FROM itens_refeicao WHERE id_tipo_refeicao = :id_tipo ORDER BY id ASC");
        $stmtItens->execute([':id_tipo' => $tipo_refeicao_id]);
        $itens = $stmtItens->fetchAll();
    }
} catch (PDOException $e) {
    die("Erro ao carregar itens: " . $e->getMessage());
}
