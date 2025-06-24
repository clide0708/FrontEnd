<?php 
include 'conect.php';
// if (!isLoggedIn() || !isPersonalTrainer()) {
//     redirect('index.php');
// }

$alunoId = $_GET['id'] ?? 0;

// Verificar se o personal tem permissão para ver este aluno
$stmt = $conn->prepare("
    SELECT a.* FROM alunos a
    JOIN solicitacoes s ON a.idalunos = s.id_aluno
    WHERE s.id_personal = ? AND s.id_aluno = ? AND s.status = 'aceito'
");
$stmt->execute([$_SESSION['user_id'], $alunoId]);
$aluno = $stmt->fetch();

if (!$aluno) {
    $_SESSION['error'] = "Aluno não encontrado ou você não tem permissão para acessar este aluno.";
    redirect('alunos.php');
}

// Buscar treinos do aluno
$stmt = $conn->prepare("
    SELECT t.* FROM treinos t
    JOIN tem te ON t.idtreinos = te.idtreinos
    WHERE te.idalunos = ?
");
$stmt->execute([$alunoId]);
$treinos = $stmt->fetchAll();

// Adicionar novo treino
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['nome_treino'])) {
    $nomeTreino = $_POST['nome_treino'];
    $descricao = $_POST['descricao'] ?? '';
    
    try {
        $conn->beginTransaction();
        
        // Criar treino
        $stmt = $conn->prepare("INSERT INTO treinos (nome, descricao, concluido) VALUES (?, ?, 0)");
        $stmt->execute([$nomeTreino, $descricao]);
        $treinoId = $conn->lastInsertId();
        
        // Associar ao aluno
        $stmt = $conn->prepare("INSERT INTO tem (idalunos, idtreinos) VALUES (?, ?)");
        $stmt->execute([$alunoId, $treinoId]);
        
        $conn->commit();
        $_SESSION['success'] = "Treino criado com sucesso!";
        redirect("criatreino.php?treino_id=$treinoId&aluno_id=$alunoId");
    } catch (PDOException $e) {
        $conn->rollBack();
        $_SESSION['error'] = "Erro ao criar treino: " . $e->getMessage();
        redirect("veraluno.php?id=$alunoId");
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

  <title>CF - Perfil</title>

  <!-- Bootstrap core CSS -->
  <link href="vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet">


  <!-- Additional CSS Files -->
  <link rel="stylesheet" href="assets/css/fontawesome.css">
  <link rel="stylesheet" href="assets/css/templatemo-cyborg-gaming.css">
  <link rel="stylesheet" href="assets/css/owl.css">
  <link rel="stylesheet" href="assets/css/animate.css">
  <link rel="stylesheet" href="https://unpkg.com/swiper@7/swiper-bundle.min.css" />
  <link rel="stylesheet" href="assets/css/style.css">
  <!--

TemplateMo 579 Cyborg Gaming

https://templatemo.com/tm-579-cyborg-gaming

-->
</head>

<body class="veralunopage">

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
  <div class="voltahead">
    <button class="botao-voltar" onclick="history.back()">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
        <path d="M15 8a.5.5 0 0 1-.5.5H2.707l3.147 3.146a.5.5 0 0 1-.708.708l-4-4a.498.498 0 0 1-.106-.163.498.498 0 0 1 0-.382.498.498 0 0 1 .106-.163l4-4a.5.5 0 1 1 .708.708L2.707 7.5H14.5A.5.5 0 0 1 15 8z" />
      </svg>
      Voltar
    </button>
  </div>

  <!-- ***** Header Area End ***** -->

      <div class="container">
        <div class="row">
            <div class="col-lg-12">
                <div class="row">
                    <div class="col-lg-12">
                        <div class="main-profile">
                            <div class="row">
                                <div class="col-lg-4">
                                    <img src="assets/images/profilefoto.png" alt="" style="border-radius: 23px;">
                                </div>
                                <div class="col-lg-4 align-self-center">
                                    <div class="main-info header-text">
                                        <h4><?php echo htmlspecialchars($aluno['nome']); ?></h4>
                                        <p><?php echo htmlspecialchars($aluno['bio'] ?? 'Nenhuma biografia fornecida.'); ?></p>
                                    </div>
                                </div>
                                <div class="col-lg-4 align-self-center">
                                    <ul>
                                        <li>Treinos solicitados<span><?php echo count($treinos); ?></span></li>
                                        <li>Treinos concluídos<span><?php 
                                            $concluidos = array_reduce($treinos, function($carry, $item) {
                                                return $carry + ($item['concluido'] ? 1 : 0);
                                            }, 0);
                                            echo $concluidos;
                                        ?></span></li>
                                        <li>Email<span><?php echo htmlspecialchars($aluno['email']); ?></span></li>
                                        <li>Data cadastro<span><?php 
                                            $data = new DateTime($aluno['data_cadastro']);
                                            echo $data->format('d/m/Y');
                                        ?></span></li>
                                    </ul>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-lg-12">
                                    <div class="clips">
                                        <div class="row">
                                            <div class="col-lg-12">
                                                <div class="heading-section">
                                                    <h4>Treinos solicitados<br></h4>
                                                    <div class="main-border-button espacin">
                                                        <a href="#" data-toggle="modal" data-target="#novoTreinoModal">Criar novo treino</a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="row mt-3">
                                            <div class="col-lg-12">
                                                <table class="farofa">
                                                    <thead>
                                                        <tr>
                                                            <th>Nome</th>
                                                            <th>Descrição</th>
                                                            <th>Status</th>
                                                            <th>Ações</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <?php foreach ($treinos as $treino): ?>
                                                            <tr>
                                                                <td><?php echo htmlspecialchars($treino['nome']); ?></td>
                                                                <td><?php echo htmlspecialchars($treino['descricao'] ?? 'Nenhuma descrição'); ?></td>
                                                                <td><?php echo $treino['concluido'] ? 'Concluído' : 'Pendente'; ?></td>
                                                                <td>
                                                                    <a href="criatreino.php?treino_id=<?php echo $treino['idtreinos']; ?>&aluno_id=<?php echo $alunoId; ?>">Editar</a> | 
                                                                    <a href="#" onclick="confirmarExclusao(<?php echo $treino['idtreinos']; ?>)">Excluir</a>
                                                                </td>
                                                            </tr>
                                                        <?php endforeach; ?>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal para novo treino -->
    <div class="modal fade" id="novoTreinoModal" tabindex="-1" role="dialog" aria-labelledby="novoTreinoModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="novoTreinoModalLabel">Novo Treino</h5>
                </div>
                <div class="modal-body">
                    <form method="POST" action="veraluno.php?id=<?php echo $alunoId; ?>">
                        <div class="form-group">
                            <label for="nome_treino">Nome do Treino</label>
                            <input type="text" class="form-control" id="nome_treino" name="nome_treino" required>
                        </div>
                        <div class="form-group">
                            <label for="descricao">Descrição (opcional)</label>
                            <textarea class="form-control" id="descricao" name="descricao" rows="3"></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary">Criar Treino</button>
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
                    </form>
                </div>
            </div>
        </div>
    </div>



      <footer>
        <div class="container">
          <div class="row">
            <div class="col-lg-12">
              <p>Copyright © 2036 <a>Cyborg Gaming</a> Company. All rights reserved.

                <br>Design: <a href="https://templatemo.com" target="_blank" title="free CSS templates">TemplateMo</a>
              </p>
            </div>
          </div>
        </div>
      </footer>


      <!-- Scripts -->
      <!-- Bootstrap core JavaScript -->
      <script src="vendor/jquery/jquery.min.js"></script>
      <script src="vendor/bootstrap/js/bootstrap.min.js"></script>

      <script src="assets/js/isotope.min.js"></script>
      <script src="assets/js/owl-carousel.js"></script>
      <script src="assets/js/tabs.js"></script>
      <script src="assets/js/popup.js"></script>
      <script src="assets/js/custom.js"></script>
      <script>
        function confirmarExclusao(treinoId) {
            if (confirm('Tem certeza que deseja excluir este treino?')) {
                window.location.href = 'excluir_treino.php?treino_id=' + treinoId + '&aluno_id=<?php echo $alunoId; ?>';
            }
        }
    </script>

</body>

</html>