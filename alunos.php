<?php 
include 'conect.php';
// if (!isLoggedIn() || !isPersonalTrainer()) {
//     redirect('index.php');
// }

// Adicionar aluno via modal
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['emailAluno'])) {
    $emailAluno = $_POST['emailAluno'];
    
    try {
        // Verificar se o aluno existe
        $stmt = $conn->prepare("SELECT idalunos FROM alunos WHERE email = ?");
        $stmt->execute([$emailAluno]);
        $aluno = $stmt->fetch();
        
        if ($aluno) {
            // Verificar se já existe solicitação
            $stmt = $conn->prepare("SELECT id FROM solicitacoes WHERE id_personal = ? AND id_aluno = ?");
            $stmt->execute([$_SESSION['user_id'], $aluno['idalunos']]);
            
            if (!$stmt->fetch()) {
                // Criar nova solicitação
                $stmt = $conn->prepare("INSERT INTO solicitacoes (id_personal, id_aluno, status) VALUES (?, ?, 'pendente')");
                $stmt->execute([$_SESSION['user_id'], $aluno['idalunos']]);
                
                $_SESSION['success'] = "Solicitação enviada com sucesso!";
            } else {
                $_SESSION['error'] = "Já existe uma solicitação para este aluno.";
            }
        } else {
            $_SESSION['error'] = "Aluno não encontrado com este email.";
        }
    } catch (PDOException $e) {
        $_SESSION['error'] = "Erro ao enviar solicitação: " . $e->getMessage();
    }
    
    redirect('alunos.php');
}

// Buscar alunos do personal
$stmt = $conn->prepare("
    SELECT a.* FROM alunos a
    JOIN solicitacoes s ON a.idalunos = s.id_aluno
    WHERE s.id_personal = ? AND s.status = 'aceito'
");
$stmt->execute([$_SESSION['user_id']]);
$alunos = $stmt->fetchAll();
?>

<!DOCTYPE html>
<html lang="pt-BR">

<head>

  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap"
    rel="stylesheet">

  <title>CF - Alunos</title>

  <!-- Bootstrap core CSS -->
  <link href="vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet">


  <!-- Additional CSS Files -->
  <link rel="stylesheet" href="assets/css/style.css">
  <link rel="stylesheet" href="assets/css/fontawesome.css">
  <link rel="stylesheet" href="assets/css/templatemo-cyborg-gaming.css">
  <link rel="stylesheet" href="assets/css/owl.css">
  <link rel="stylesheet" href="assets/css/animate.css">
  <link rel="stylesheet" href="https://unpkg.com/swiper@7/swiper-bundle.min.css" />
  <script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.8/index.global.min.js"></script>
  <link href="https://cdn.jsdelivr.net/npm/fullcalendar@5.11.3/main.min.css" rel="stylesheet">
  <!--

TemplateMo 579 Cyborg Gaming

https://templatemo.com/tm-579-cyborg-gaming

-->
</head>

<body class="alunospage">

  <!-- Modal para adicionar aluno -->
     <div class="modal fade" id="adicionarAlunoModal" tabindex="-1" role="dialog" aria-labelledby="adicionarAlunoModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="adicionarAlunoModalLabel">Adicionar Aluno</h5>
                </div>
                <div class="modal-body">
                    <form id="formAdicionarAluno" method="POST">
                        <div class="form-group">
                            <label for="emailAluno">Email do Aluno</label>
                            <input type="email" class="form-control" id="emailAluno" name="emailAluno" required>
                        </div>
                        <button type="submit" class="btn btn-primary btnsalvar">Enviar solicitação</button>
                        <button type="button" class="btn btn-primary btnsalvar close" data-dismiss="modal" aria-label="Fechar">Cancelar</button>
                    </form>
                </div>
            </div>
        </div>
    </div>

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
                        <div class="col-lg-6">
                            <div class="heading-section fonegamer">
                                <h4>Seus alunos</h4>
                            </div>
                            <div class="top-streamers">
                                <?php if (!empty($alunos)): ?>
                                    <ul>
                                        <?php foreach ($alunos as $aluno): ?>
                                            <li>
                                                <img src="assets/images/profilefoto.png" alt="" style="max-width: 46px; border-radius: 50%; margin-right: 15px;">
                                                <h6><?php echo htmlspecialchars($aluno['nome']); ?></h6>
                                                <div class="main-button"><a href="veraluno.php?id=<?php echo $aluno['idalunos']; ?>">Ver</a></div>
                                            </li>
                                        <?php endforeach; ?>
                                        <li>
                                            <div class="main-button">
                                                <a href="#" data-toggle="modal" data-target="#adicionarAlunoModal">Adicionar aluno</a>
                                            </div>
                                        </li>
                                    </ul>
                                <?php else: ?>
                                    <p>Você ainda não tem alunos. <a href="#" data-toggle="modal" data-target="#adicionarAlunoModal">Adicione um aluno</a> para começar.</p>
                                <?php endif; ?>
                            </div>
                        </div>

                        <div class="col-lg-6">
                            <div class="heading-section fonegamer">
                                <h4>Seu Calendário</h4>
                                <h6>Clique para adicionar um lembrete, arraste para fora para apaga-lo.</h6>
                            </div>
                            <div id="calendar"></div>
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




  <script src="https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/fullcalendar@5.11.3/main.min.js"></script>
  <script src="vendor/jquery/jquery.min.js"></script>
  <script src="vendor/bootstrap/js/bootstrap.min.js"></script>
  <!-- <script src="assets/js/isotope.min.js"></script> -->
  <script src="assets/js/owl-carousel.js"></script>
  <script src="assets/js/tabs.js"></script>
  <script src="assets/js/popup.js"></script>
  <script src="assets/js/custom.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.8/index.global.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.8/locales-all.global.min.js"></script>
  <script src="assets/js/script.js"></script>
  
  <script>
        document.addEventListener('DOMContentLoaded', function() {
            var calendarEl = document.getElementById('calendar');
            var calendar = new FullCalendar.Calendar(calendarEl, {
                initialView: 'dayGridMonth',
                locale: 'pt-br',
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                },
                events: [
                    // Você pode adicionar eventos dinâmicos aqui
                ],
                dateClick: function(info) {
                    alert('Clicou em: ' + info.dateStr);
                    // Aqui você pode adicionar lógica para criar um novo evento
                },
                eventClick: function(info) {
                    if (confirm("Deseja remover este evento?")) {
                        info.event.remove();
                    }
                }
            });
            calendar.render();
        });
    </script>

</body>

</html>