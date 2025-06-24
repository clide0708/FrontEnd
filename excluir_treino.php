<?php 
include 'conect.php';
// if (!isLoggedIn() || !isPersonalTrainer()) {
//     redirect('index.php');
// }

$treinoId = $_GET['treino_id'] ?? 0;
$alunoId = $_GET['aluno_id'] ?? 0;

// Verificar permissões
$stmt = $conn->prepare("
    SELECT t.* FROM treinos t
    JOIN tem te ON t.idtreinos = te.idtreinos
    JOIN solicitacoes s ON te.idalunos = s.id_aluno
    WHERE t.idtreinos = ? AND te.idalunos = ? AND s.id_personal = ? AND s.status = 'aceito'
");
$stmt->execute([$treinoId, $alunoId, $_SESSION['user_id']]);
$treino = $stmt->fetch();

if (!$treino) {
    $_SESSION['error'] = "Treino não encontrado ou você não tem permissão para excluí-lo.";
    redirect("veraluno.php?id=$alunoId");
}

// Excluir treino e seus relacionamentos
try {
    $conn->beginTransaction();
    
    // Primeiro, excluir os exercícios associados
    $stmt = $conn->prepare("
        DELETE e FROM exercicios e
        JOIN exertreinos et ON e.idexercicio = et.idexercicio
        WHERE et.idtreinos = ?
    ");
    $stmt->execute([$treinoId]);
    
    // Depois, excluir os relacionamentos do treino
    $stmt = $conn->prepare("DELETE FROM tem WHERE idtreinos = ?");
    $stmt->execute([$treinoId]);
    
    $stmt = $conn->prepare("DELETE FROM exertreinos WHERE idtreinos = ?");
    $stmt->execute([$treinoId]);
    
    // Finalmente, excluir o treino
    $stmt = $conn->prepare("DELETE FROM treinos WHERE idtreinos = ?");
    $stmt->execute([$treinoId]);
    
    $conn->commit();
    $_SESSION['success'] = "Treino excluído com sucesso!";
} catch (PDOException $e) {
    $conn->rollBack();
    $_SESSION['error'] = "Erro ao excluir treino: " . $e->getMessage();
}

redirect("veraluno.php?id=$alunoId");
?>