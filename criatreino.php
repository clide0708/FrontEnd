<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
  <title>CF - Início</title>

  <!-- Bootstrap core CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css" rel="stylesheet">

  <!-- Additional CSS Files -->
  <link rel="stylesheet" href="assets/css/style.css" />
  <link rel="stylesheet" href="assets/css/fontawesome.css" />
  <link rel="stylesheet" href="assets/css/templatemo-cyborg-gaming.css" />
  <link rel="stylesheet" href="assets/css/owl.css" />
  <link rel="stylesheet" href="assets/css/animate.css" />
  <link rel="stylesheet" href="https://unpkg.com/swiper@7/swiper-bundle.min.css" />
</head>

<body class="criatreinopage">

  <!-- MODAL DE EDIÇÃO -->
  <div class="modal fade" id="editarExercicioModal" tabindex="-1" role="dialog" aria-labelledby="editarExercicioModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="editarExercicioModalLabel">Editar Exercício</h5>
        </div>
        <div class="modal-body">
          <form id="formEditarExercicio">
            <input type="hidden" id="linhaAtual">
            <div class="form-group">
              <label for="musculoEdit">Músculo</label>
              <input type="text" class="form-control" id="musculoEdit" required />
            </div>
            <div class="form-group">
              <label for="exercicioEdit">Exercício</label>
              <input type="text" class="form-control" id="exercicioEdit" required />
            </div>
            <div class="form-group">
              <label for="seriesEdit">Séries</label>
              <input type="number" class="form-control" id="seriesEdit" required />
            </div>
            <div class="form-group">
              <label for="repeticoesEdit">Repetições</label>
              <input type="number" class="form-control" id="repeticoesEdit" required />
            </div>
            <button type="submit" class="btn btn-primary">Salvar</button>
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
          </form>
        </div>
      </div>
    </div>
  </div>

  <?php include 'btnvoltar.php'; ?>

  <div class="container">
    <div class="row">
      <div class="col-lg-12">
        <div class="page-content">
          <h4 class="churrasqueira">Montar treino</h4>
          <div class="most-popular">
            <div class="row">
              <div class="col-lg-12">
                <form class="form-treino">
                  <div class="form-group">
                    <label for="musculos">Músculos</label>
                    <select id="exercicio" name="exercicio">
                      <option value="">Selecione</option>
                      <option value="agachamento">Pernas</option>
                      <option value="supino">Peitoral</option>
                      <option value="abdominal">Abdômen</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label for="exercicio">Exercício</label>
                    <select id="exercicio" name="exercicio">
                      <option value="">Selecione</option>
                      <option value="agachamento">Agachamento</option>
                      <option value="supino">Supino</option>
                      <option value="abdominal">Abdominal</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label for="series">Séries</label>
                    <input type="number" id="series" name="series" min="1" placeholder="0" />
                  </div>
                  <div class="form-group">
                    <label for="repeticoes">Repetições</label>
                    <input type="number" id="repeticoes" name="repeticoes" min="1" placeholder="0" />
                  </div>
                  <div class="form-group">
                    <button type="submit" class="btn btn-success">Adicionar ao treino</button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div class="tabela-container">
            <table class="table farofa" id="tabela-treinos">
              <thead>
                <tr>
                  <th>Músculos</th>
                  <th>Exercício</th>
                  <th>Séries</th>
                  <th>Repetições</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Peito</td>
                  <td>Supino</td>
                  <td>3</td>
                  <td>10</td>
                  <td>
                    <button class="btn btn-primary btn-editar" data-toggle="modal" data-target="#editarExercicioModal" onclick="abrirModalEditar(this)">Editar</button>
                    <button class="btn btn-danger btn-excluir" onclick="excluirLinha(this)">Excluir</button>
                  </td>
                </tr>
                <tr>
                  <td>Quadríceps</td>
                  <td>Agachamento</td>
                  <td>4</td>
                  <td>12</td>
                  <td>
                    <button class="btn btn-primary btn-editar" data-toggle="modal" data-target="#editarExercicioModal" onclick="abrirModalEditar(this)">Editar</button>
                    <button class="btn btn-danger btn-excluir" onclick="excluirLinha(this)">Excluir</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="form-group mt-3">
            <h5 class="churrasqueira">Nome do Treino</h5>
            <input type="text" id="nomeTreino" placeholder="Ex: Treino A" required />
            <button class="bigmac btn btn-primary mt-2" onclick="window.location.href='veraluno.php'" style="cursor: pointer">Criar Treino</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <footer>
    <div class="container">
      <div class="row">
        <div class="col-lg-12">
          <p>
            Copyright © 2036 <a href="#">Cyborg Gaming</a> Company.
            <br />Design: <a href="https://templatemo.com" target="_blank" title="free CSS templates">TemplateMo</a>
          </p>
        </div>
      </div>
    </div>
  </footer>

  <!-- SCRIPTS NA ORDEM CERTA -->
  <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js"></script>

  <script>
    let linhaSelecionada = null;

    function abrirModalEditar(botao) {
      linhaSelecionada = botao.closest("tr");
      const celulas = linhaSelecionada.querySelectorAll("td");

      document.getElementById("musculoEdit").value = celulas[0].textContent;
      document.getElementById("exercicioEdit").value = celulas[1].textContent;
      document.getElementById("seriesEdit").value = celulas[2].textContent;
      document.getElementById("repeticoesEdit").value = celulas[3].textContent;
    }

    document.getElementById("formEditarExercicio").addEventListener("submit", function(e) {
      e.preventDefault();
      const celulas = linhaSelecionada.querySelectorAll("td");

      celulas[0].textContent = document.getElementById("musculoEdit").value;
      celulas[1].textContent = document.getElementById("exercicioEdit").value;
      celulas[2].textContent = document.getElementById("seriesEdit").value;
      celulas[3].textContent = document.getElementById("repeticoesEdit").value;

      $('#editarExercicioModal').modal('hide');
    });

    function excluirLinha(botao) {
      const linha = botao.closest("tr");
      linha.remove();
    }
  </script>
</body>

</html>