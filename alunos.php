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

<!-- Modal para adicionar aluno -->
<div class="modal fade" id="adicionarAlunoModal" tabindex="-1" role="dialog" aria-labelledby="adicionarAlunoModalLabel" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="adicionarAlunoModalLabel">Adicionar Aluno</h5>
        <!-- <button type="button" class="close" data-dismiss="modal" aria-label="Fechar">
          <span aria-hidden="true">&times;</span>
        </button> -->
      </div>
      <div class="modal-body">
        <form id="formAdicionarAluno">
          <div class="form-group">
            <label for="emailAluno">Email do Aluno</label>
            <input type="email" class="form-control" id="emailAluno" required>
          </div>
          <!-- Adicione mais campos se quiser -->
          <button type="submit" class="btn btn-primary btnsalvar">Enviar solicitação</button>
          <button type="button" class="btn btn-primary btnsalvar close" data-dismiss="modal" aria-label="Fechar">
            Calcelar</span>
          </button>

        </form>
      </div>
    </div>
  </div>
</div>

<body class="alunospage">

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

          <!-- ***** Featured Games Start ***** -->
          <!-- DENTRO DO HTML ONDE TEM OS ALUNOS, SUBSTITUA ESTA PARTE -->

          <div class="row">
            <div class="col-lg-6">
              <div class="heading-section fonegamer">
                <h4>Seus alunos</h4>
              </div>
              <div class="top-streamers">
                <div class="heading-section ">
                </div>
                <ul>
                  <li>
                    <img src="assets/images/profilefoto.png" alt=""
                      style="max-width: 46px; border-radius: 50%; margin-right: 15px;">
                    <h6>Felipe</h6>
                    <div class="main-button"><a href="veraluno.php">Ver</a></div>
                  </li>
                  <li>
                    <div class="main-button">
                      <a href="#" data-toggle="modal" data-target="#adicionarAlunoModal">Adicionar aluno</a>
                    </div>
                  </li>
                </ul>
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


</body>

</html>