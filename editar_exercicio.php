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
    $_SESSION['error'] = "Exercício não encontrado ou você não tem permissão para editá-lo.";
    redirect("criatreino.php?treino_id=$treinoId&aluno_id=$alunoId");
}

// Atualizar exercício
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $grupoMuscular = $_POST['grupo_muscular'];
    $nomeExercicio = $_POST['nome_exercicio'];
    $series = $_POST['series'];
    $repeticoes = $_POST['repeticoes'];
    $descricao = $_POST['descricao'] ?? '';
    
    try {
        $stmt = $conn->prepare("
            UPDATE exercicios 
            SET grupo_muscular = ?, nome = ?, descricao = ?, series = ?, repeticoes = ?
            WHERE idexercicio = ?
        ");
        $stmt->execute([$grupoMuscular, $nomeExercicio, $descricao, $series, $repeticoes, $exercicioId]);
        
        $_SESSION['success'] = "Exercício atualizado com sucesso!";
        redirect("criatreino.php?treino_id=$treinoId&aluno_id=$alunoId");
    } catch (PDOException $e) {
        $_SESSION['error'] = "Erro ao atualizar exercício: " . $e->getMessage();
        redirect("editar_exercicio.php?exercicio_id=$exercicioId&treino_id=$treinoId&aluno_id=$alunoId");
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Editar Exercício - CLIDE Fit</title>
    <link href="vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
    <div class="container mt-5">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header">
                        <h3>Editar Exercício</h3>
                    </div>
                    <div class="card-body">
                        <form method="POST">
                            <div class="form-group">
                                <label for="grupo_muscular">Grupo Muscular</label>
                                <input type="text" class="form-control" id="grupo_muscular" name="grupo_muscular" 
                                    value="<?php echo htmlspecialchars($exercicio['grupo_muscular']); ?>" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="nome_exercicio">Exercício</label>
                                <input type="text" class="form-control" id="nome_exercicio" name="nome_exercicio" 
                                    value="<?php echo htmlspecialchars($exercicio['nome']); ?>" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="series">Séries</label>
                                <input type="number" class="form-control" id="series" name="series" min="1" 
                                    value="<?php echo htmlspecialchars($exercicio['series'] ?? ''); ?>" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="repeticoes">Repetições</label>
                                <input type="number" class="form-control" id="repeticoes" name="repeticoes" min="1" 
                                    value="<?php echo htmlspecialchars($exercicio['repeticoes'] ?? ''); ?>" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="descricao">Descrição</label>
                                <textarea class="form-control" id="descricao" name="descricao" rows="3"><?php 
                                    echo htmlspecialchars($exercicio['descricao'] ?? ''); 
                                ?></textarea>
                            </div>
                            
                            <button type="submit" class="btn btn-primary">Salvar Alterações</button>
                            <a href="criatreino.php?treino_id=<?php echo $treinoId; ?>&aluno_id=<?php echo $alunoId; ?>" 
                                class="btn btn-secondary">Cancelar</a>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>