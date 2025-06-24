<?php 
include 'conect.php';
// if (!isLoggedIn()) {
//     redirect('login.php');
// }

// Buscar dados do usuário
if (isPersonalTrainer()) {
    $stmt = $conn->prepare("SELECT * FROM proprietarios WHERE idproprietario = ?");
} else {
    $stmt = $conn->prepare("SELECT * FROM alunos WHERE idalunos = ?");
}
$stmt->execute([$_SESSION['user_id']]);
$usuario = $stmt->fetch();

// Buscar treinos recentes (para alunos)
$treinosRecentes = [];
if (isAluno()) {
    $stmt = $conn->prepare("
        SELECT t.* FROM treinos t
        JOIN tem te ON t.idtreinos = te.idtreinos
        WHERE te.idalunos = ? AND t.concluido = 1
        ORDER BY t.data_conclusao DESC
        LIMIT 4
    ");
    $stmt->execute([$_SESSION['user_id']]);
    $treinosRecentes = $stmt->fetchAll();
}
?>

<!DOCTYPE html>
<html lang="pt-BR">

<head>

  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap"
    rel="stylesheet">

  <title>CLIDE Fit - Perfil</title>

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
                    <div class="row">
                        <div class="col-lg-12">
                            <div class="main-profile">
                                <div class="row">
                                    <div class="col-lg-4">
                                        <img src="assets/images/profilefoto.png" alt="" style="border-radius: 23px;">
                                    </div>
                                    <div class="col-lg-4 align-self-center">
                                        <div class="main-info header-text">
                                            <h4><?php echo htmlspecialchars($usuario['nome']); ?></h4>
                                            <p><?php echo htmlspecialchars($usuario['bio'] ?? 'Nenhuma biografia fornecida.'); ?></p>
                                            <div class="main-border-button">
                                                <a href="perfileditar.php">Editar perfil</a>
                                            </div>
                                            <?php if (isAluno()): ?>
                                                <a class="pinguim" href="treinos.php"><u>Ver meu plano</u></a>
                                            <?php endif; ?>
                                        </div>
                                    </div>
                                    <div class="col-lg-4 align-self-center">
                                        <ul>
                                            <?php if (isAluno()): ?>
                                                <li>Treinos concluídos <span><?php 
                                                    $stmt = $conn->prepare("SELECT COUNT(*) FROM tem t JOIN treinos tr ON t.idtreinos = tr.idtreinos WHERE t.idalunos = ? AND tr.concluido = 1");
                                                    $stmt->execute([$_SESSION['user_id']]);
                                                    echo $stmt->fetchColumn();
                                                ?></span></li>
                                                <li>Horas de treino<span>16</span></li>
                                                <li>Consumo de água por dia<span>2,42 litros</span></li>
                                                <li>Nível<span>Intermediário</span></li>
                                            <?php else: ?>
                                                <li>Alunos ativos<span><?php 
                                                    $stmt = $conn->prepare("SELECT COUNT(*) FROM solicitacoes WHERE id_personal = ? AND status = 'aceito'");
                                                    $stmt->execute([$_SESSION['user_id']]);
                                                    echo $stmt->fetchColumn();
                                                ?></span></li>
                                                <li>Treinos criados<span><?php 
                                                    $stmt = $conn->prepare("SELECT COUNT(*) FROM treinos t JOIN tem te ON t.idtreinos = te.idtreinos JOIN solicitacoes s ON te.idalunos = s.id_aluno WHERE s.id_personal = ?");
                                                    $stmt->execute([$_SESSION['user_id']]);
                                                    echo $stmt->fetchColumn();
                                                ?></span></li>
                                                <li>Membro desde<span><?php 
                                                    $data = new DateTime($usuario['datacadastro']);
                                                    echo $data->format('d/m/Y');
                                                ?></span></li>
                                            <?php endif; ?>
                                        </ul>
                                    </div>
                                </div>
                                
                                <?php if (isAluno() && !empty($treinosRecentes)): ?>
                                <div class="row">
                                    <div class="col-lg-12">
                                        <div class="clips">
                                            <div class="row">
                                                <div class="col-lg-12">
                                                    <div class="heading-section">
                                                        <h4>Treinos recentes<br></h4>
                                                    </div>
                                                </div>
                                                <div class="row">
                                                    <?php foreach ($treinosRecentes as $treino): ?>
                                                        <div class="col-lg-3 col-sm-6 chicagofire">
                                                            <div class="item">
                                                                <img src="assets/images/<?php 
                                                                    $imgMap = [
                                                                        'Costas' => 'costasbiceps.webp',
                                                                        'Pernas' => 'pernas.webp',
                                                                        'Peito' => 'peitotriceps.jpg',
                                                                        'Ombros' => 'ombrotrapezio.webp'
                                                                    ];
                                                                    echo $imgMap[$treino['grupo_principal']] ?? 'default.jpg';
                                                                ?>" alt="">
                                                                <h4>Concluído<br></h4>
                                                                <ul>
                                                                    <li><?php echo htmlspecialchars($treino['nome']); ?></li>
                                                                    <li><?php 
                                                                        $data = new DateTime($treino['data_conclusao']);
                                                                        echo $data->format('d/m');
                                                                    ?></li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    <?php endforeach; ?>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <?php endif; ?>
                            </div>
                        </div>
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
      <script src="vendor/jquery/jquery.min.js"></script>
      <script src="vendor/bootstrap/js/bootstrap.min.js"></script>

      <script src="assets/js/isotope.min.js"></script>
      <script src="assets/js/owl-carousel.js"></script>
      <script src="assets/js/tabs.js"></script>
      <script src="assets/js/popup.js"></script>
      <script src="assets/js/custom.js"></script>


</body>

</html>