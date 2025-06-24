<?php 
include 'conect.php';
// if (!isLoggedIn() || !isPersonalTrainer()) {
//     redirect('index.php');
// }

$treinoId = $_GET['treino_id'] ?? 0;
$alunoId = $_GET['aluno_id'] ?? 0;

// Verificar se o treino pertence ao aluno e o personal tem acesso
$stmt = $conn->prepare("
    SELECT t.* FROM treinos t
    JOIN tem te ON t.idtreinos = te.idtreinos
    JOIN solicitacoes s ON te.idalunos = s.id_aluno
    WHERE t.idtreinos = ? AND te.idalunos = ? AND s.id_personal = ? AND s.status = 'aceito'
");
$stmt->execute([$treinoId, $alunoId, $_SESSION['user_id']]);
$treino = $stmt->fetch();

if (!$treino) {
    $_SESSION['error'] = "Treino não encontrado ou você não tem permissão para editá-lo.";
    redirect('alunos.php');
}

// Buscar exercícios do treino
$stmt = $conn->prepare("
    SELECT e.* FROM exercicios e
    JOIN exertreinos et ON e.idexercicio = et.idexercicio
    WHERE et.idtreinos = ?
");
$stmt->execute([$treinoId]);
$exercicios = $stmt->fetchAll();

// Adicionar novo exercício
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['grupo_muscular'])) {
    $grupoMuscular = $_POST['grupo_muscular'];
    $nomeExercicio = $_POST['nome_exercicio'];
    $series = $_POST['series'];
    $repeticoes = $_POST['repeticoes'];
    $descricao = $_POST['descricao'] ?? '';
    
    try {
        $conn->beginTransaction();
        
        // Criar exercício
        $stmt = $conn->prepare("
            INSERT INTO exercicios (grupo_muscular, nome, descricao, concluido, idproprietario) 
            VALUES (?, ?, ?, 0, ?)
        ");
        $stmt->execute([$grupoMuscular, $nomeExercicio, $descricao, $_SESSION['user_id']]);
        $exercicioId = $conn->lastInsertId();
        
        // Associar ao treino
        $stmt = $conn->prepare("INSERT INTO exertreinos (idexercicio, idtreinos) VALUES (?, ?)");
        $stmt->execute([$exercicioId, $treinoId]);
        
        $conn->commit();
        $_SESSION['success'] = "Exercício adicionado com sucesso!";
        redirect("criatreino.php?treino_id=$treinoId&aluno_id=$alunoId");
    } catch (PDOException $e) {
        $conn->rollBack();
        $_SESSION['error'] = "Erro ao adicionar exercício: " . $e->getMessage();
        redirect("criatreino.php?treino_id=$treinoId&aluno_id=$alunoId");
    }
}
?>

<!DOCTYPE html>
<html lang="en">

<head>

  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap"
    rel="stylesheet">

  <title>CF - Inicio</title>

  <!-- Bootstrap core CSS -->
  <link href="vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet">


  <!-- Additional CSS Files -->
  <link rel="stylesheet" href="assets/css/style.css">
  <link rel="stylesheet" href="assets/css/fontawesome.css">
  <link rel="stylesheet" href="assets/css/templatemo-cyborg-gaming.css">
  <link rel="stylesheet" href="assets/css/owl.css">
  <link rel="stylesheet" href="assets/css/animate.css">
  <link rel="stylesheet" href="https://unpkg.com/swiper@7/swiper-bundle.min.css" />
  <!--

TemplateMo 579 Cyborg Gaming

https://templatemo.com/tm-579-cyborg-gaming

-->
</head>

<body>

  <!-- ***** Preloader Start ***** -->
  <div id="js-preloader" class="js-preloader">
    <div class="preloader-inner">
      <span class="dot"></span>
      <div class="dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  </div>
  <!-- ***** Preloader End ***** -->

  <!-- ***** Header Area Start ***** -->

  <?php include 'header.php'; ?>

  <!-- ***** Header Area End ***** -->

  <div class="container">
        <div class="row">
            <div class="col-lg-12">
                <div class="page-content">
                    <h4 class="churrasqueira">Montar treino: <?php echo htmlspecialchars($treino['nome']); ?></h4>
                    
                    <div class="most-popular">
                        <div class="row">
                            <div class="col-lg-12">
                                <form class="form-treino" method="POST">
                                    <div class="form-group">
                                        <label for="grupo_muscular">Grupo Muscular</label>
                                        <input type="text" id="grupo_muscular" name="grupo_muscular" placeholder="Ex: Peito" required>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="nome_exercicio">Exercício</label>
                                        <input type="text" id="nome_exercicio" name="nome_exercicio" placeholder="Ex: Supino" required>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="series">Séries</label>
                                        <input type="number" id="series" name="series" min="1" placeholder="0" required>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="repeticoes">Repetições</label>
                                        <input type="number" id="repeticoes" name="repeticoes" min="1" placeholder="0" required>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="descricao">Descrição (opcional)</label>
                                        <textarea id="descricao" name="descricao" placeholder="Instruções adicionais"></textarea>
                                    </div>
                                    
                                    <div class="form-group">
                                        <button type="submit">Adicionar ao treino</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div class="tabela-container">
                        <table class="farofa" id="tabela-treinos">
                            <thead>
                                <tr>
                                    <th>Grupo Muscular</th>
                                    <th>Exercício</th>
                                    <th>Séries</th>
                                    <th>Repetições</th>
                                    <th>Descrição</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($exercicios as $exercicio): ?>
                                    <tr>
                                        <td><?php echo htmlspecialchars($exercicio['grupo_muscular']); ?></td>
                                        <td><?php echo htmlspecialchars($exercicio['nome']); ?></td>
                                        <td><?php echo htmlspecialchars($exercicio['series'] ?? '-'); ?></td>
                                        <td><?php echo htmlspecialchars($exercicio['repeticoes'] ?? '-'); ?></td>
                                        <td><?php echo htmlspecialchars($exercicio['descricao'] ?? 'Nenhuma descrição'); ?></td>
                                        <td>
                                            <a href="#" onclick="editarExercicio(<?php echo $exercicio['idexercicio']; ?>)">Editar</a> | 
                                            <a href="#" onclick="excluirExercicio(<?php echo $exercicio['idexercicio']; ?>)">Excluir</a>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>

                    <div class="form-group mt-3">
                        <button class="bigmac" onclick="window.location.href='veraluno.php?id=<?php echo $alunoId; ?>'" style="cursor: pointer">Voltar</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

  <footer>
    <div class="container">
      <div class="row">
        <div class="col-lg-12">
          <p>Copyright © 2036 <a href="#">Cyborg Gaming</a> Company. All rights reserved.

            <br>Design: <a href="https://templatemo.com" target="_blank" title="free CSS templates">TemplateMo</a>
          </p>
        </div>
      </div>
    </div>
  </footer>


  <!-- Scripts -->
  <!-- Bootstrap core JavaScript -->
  <script src="https://cdn.jsdelivr.net/npm/fullcalendar@5.11.3/main.min.js"></script>
  <script src="vendor/jquery/jquery.min.js"></script>
  <script src="vendor/bootstrap/js/bootstrap.min.js"></script>

  <script src="assets/js/isotope.min.js"></script>
  <script src="assets/js/owl-carousel.js"></script>
  <script src="assets/js/tabs.js"></script>
  <script src="assets/js/popup.js"></script>
  <script src="assets/js/custom.js"></script>

  <script>
        function editarExercicio(exercicioId) {
            window.location.href = 'editar_exercicio.php?exercicio_id=' + exercicioId + '&treino_id=<?php echo $treinoId; ?>&aluno_id=<?php echo $alunoId; ?>';
        }
        
        function excluirExercicio(exercicioId) {
            if (confirm('Tem certeza que deseja excluir este exercício?')) {
                window.location.href = 'excluir_exercicio.php?exercicio_id=' + exercicioId + '&treino_id=<?php echo $treinoId; ?>&aluno_id=<?php echo $alunoId; ?>';
            }
        }
    </script>

</body>

</html>