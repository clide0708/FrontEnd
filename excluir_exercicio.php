<?php 
include 'conect.php';
// if (!isLoggedIn() || !isPersonalTrainer()) {
//     redirect('index.php');
// }

$exercicioId = $_GET['exercicio_id'] ?? 0;
$treinoId = $_GET['treino_id'] ?? 0;
$alunoId = $_GET['aluno_id'] ?? 0;

// Verificar permissões
$stmt = $conn->prepare("
    SELECT e.* FROM exercicios e
    JOIN exertreinos et ON e.idexercicio = et.idexercicio
    JOIN treinos t ON et.idtreinos = t.idtreinos
    JOIN tem te ON t.idtreinos = te.idtreinos
    JOIN solicitacoes s ON te.idalunos = s.id_aluno
    WHERE e.idexercicio = ? AND t.idtreinos = ? AND te.idalunos = ? AND s.id_personal = ? AND s.status = 'aceito'
");
$stmt->execute([$exercicioId, $treinoId, $alunoId, $_SESSION['user_id']]);
$exercicio = $stmt->fetch();

if (!$exercicio) {
    $_SESSION['error'] = "Exercício não encontrado ou você não tem permissão para excluí-lo.";
    redirect("criatreino.php?treino_id=$treinoId&aluno_id=$alunoId");
}

// Excluir exercício
try {
    $conn->beginTransaction();
    
    // Remover da tabela de relacionamento
    $stmt = $conn->prepare("DELETE FROM exertreinos WHERE idexercicio = ? AND idtreinos = ?");
    $stmt->execute([$exercicioId, $treinoId]);
    
    // Remover o exercício
    $stmt = $conn->prepare("DELETE FROM exercicios WHERE idexercicio = ?");
    $stmt->execute([$exercicioId]);
    
    $conn->commit();
    $_SESSION['success'] = "Exercício excluído com sucesso!";
} catch (PDOException $e) {
    $conn->rollBack();
    $_SESSION['error'] = "Erro ao excluir exercício: " . $e->getMessage();
}

redirect("criatreino.php?treino_id=$treinoId&aluno_id=$alunoId");
?>