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

          <!-- ***** Banner Start ***** -->
          <h4 class="churrasqueira">Montar treino</h4>
          <!-- ***** Banner End ***** -->

          <!-- ***** Most Popular Start ***** -->

          <div class="most-popular">
            <div class="row">
              <div class="col-lg-12">
                <form class="form-treino">
                  <!-- Selecionar Músculos -->
                  <div class="form-group">
                    <label for="Músculoss">Músculos</label>
                    <input type="text" id="Músculoss" name="Músculoss" placeholder="--" required>
                  </div>

                  <!-- Selecionar Exercício -->
                  <div class="form-group">
                    <label for="exercicio">Exercício</label>
                    <select id="exercicio" name="exercicio">
                      <option value="">Selecione</option>
                      <option value="agachamento">Agachamento</option>
                      <option value="supino">Supino</option>
                      <option value="abdominal">Abdominal</option>
                    </select>
                  </div>

                  <!-- Número de Séries -->
                  <div class="form-group">
                    <label for="series">Séries</label>
                    <input type="number" id="series" name="series" min="1" placeholder="0">
                  </div>

                  <!-- Número de Repetições -->
                  <div class="form-group">
                    <label for="repeticoes">Repetições</label>
                    <input type="number" id="repeticoes" name="repeticoes" min="1" placeholder="0">
                  </div>

                  <!-- Botão -->
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
                  <th>Músculos</th>
                  <th>Exercício</th>
                  <th>Séries</th>
                  <th>Repetições</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Peito</td>
                  <td>Supino</td>
                  <td>3</td>
                  <td>10</td>
                </tr>
                <tr>
                  <td>Quadríceps</td>
                  <td>Agachamento</td>
                  <td>4</td>
                  <td>12</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- NOME DO TREINO E BOTÃO DE ENVIAR -->
          <div class="form-group mt-3">
            <h5 class="churrasqueira">Nome do Treino</h5>
            <input type="text" id="nomeTreino" placeholder="Ex: Treino A" required>
            <button class="bigmac" onclick="window.location.href='veraluno.php'" style="cursor: pointer">Enviar
              Treino</button>
          </div>

        </div>
      </div>
    </div>
    <!-- ***** Most Popular End ***** -->

    <!-- ***** Gaming Library Start ***** -->
    <!-- <div class="gaming-library">
            <div class="col-lg-12">
              <div class="heading-section">
                <h4><em>Treinos acessíveis</em> -- </h4>
              </div>
              <div class="item">
                <ul>
                  <li><img src="assets/images/game-01.jpg" alt="" class="templatemo-item"></li>
                  <li>
                    <h4>Dota 2</h4><span>Sandbox</span>
                  </li>
                  <li>
                    <h4>Date Added</h4><span>24/08/2036</span>
                  </li>
                  <li>
                    <h4>Hours Played</h4><span>634 H 22 Mins</span>
                  </li>
                  <li>
                    <h4>Currently</h4><span>Downloaded</span>
                  </li>
                  <li>
                    <div class="main-border-button border-no-active"><a href="#">Donwloaded</a></div>
                  </li>
                </ul>
              </div>
              <div class="item">
                <ul>
                  <li><img src="assets/images/game-02.jpg" alt="" class="templatemo-item"></li>
                  <li>
                    <h4>Fortnite</h4><span>Sandbox</span>
                  </li>
                  <li>
                    <h4>Date Added</h4><span>22/06/2036</span>
                  </li>
                  <li>
                    <h4>Hours Played</h4><span>740 H 52 Mins</span>
                  </li>
                  <li>
                    <h4>Currently</h4><span>Downloaded</span>
                  </li>
                  <li>
                    <div class="main-border-button"><a href="#">Donwload</a></div>
                  </li>
                </ul>
              </div>
              <div class="item last-item">
                <ul>
                  <li><img src="assets/images/game-03.jpg" alt="" class="templatemo-item"></li>
                  <li>
                    <h4>CS-GO</h4><span>Sandbox</span>
                  </li>
                  <li>
                    <h4>Date Added</h4><span>21/04/2036</span>
                  </li>
                  <li>
                    <h4>Hours Played</h4><span>892 H 14 Mins</span>
                  </li>
                  <li>
                    <h4>Currently</h4><span>Downloaded</span>
                  </li>
                  <li>
                    <div class="main-border-button border-no-active"><a href="#">Donwloaded</a></div>
                  </li>
                </ul>
              </div>
            </div>
            <div class="col-lg-12">
              <div class="main-button">
                <a href="perfil.php">Mais</a>
              </div>
            </div>
          </div> -->
    <!-- ***** Gaming Library End ***** -->
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


</body>

</html>