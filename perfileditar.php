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

// Atualizar perfil
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nome = $_POST['nome'] ?? $usuario['nome'];
    $bio = $_POST['bio'] ?? $usuario['bio'] ?? '';
    
    try {
        if (isPersonalTrainer()) {
            $stmt = $conn->prepare("UPDATE proprietarios SET nome = ?, bio = ? WHERE idproprietario = ?");
        } else {
            $stmt = $conn->prepare("UPDATE alunos SET nome = ?, bio = ? WHERE idalunos = ?");
        }
        $stmt->execute([$nome, $bio, $_SESSION['user_id']]);
        
        $_SESSION['user_name'] = $nome;
        $_SESSION['success'] = "Perfil atualizado com sucesso!";
        redirect('perfil.php');
    } catch (PDOException $e) {
        $_SESSION['error'] = "Erro ao atualizar perfil: " . $e->getMessage();
        redirect('perfileditar.php');
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
                                        <label for="foto-perfil">
                                            <img id="preview-foto" src="assets/images/profilefoto.png" alt="" style="border-radius: 23px; cursor: pointer;">
                                            <input type="file" id="foto-perfil" accept="image/*" style="display: none;">
                                        </label>
                                    </div>
                                    <div class="col-lg-4 align-self-center">
                                        <div class="main-info header-text">
                                            <form id="form-editar-perfil" method="POST">
                                                <input type="text" id="nome" class="form-control mb-2" name="nome" 
                                                    value="<?php echo htmlspecialchars($usuario['nome']); ?>" 
                                                    style="font-weight: bold; font-size: 20px;">
                                                <textarea id="bio" class="form-control mb-2" name="bio" rows="3"><?php 
                                                    echo htmlspecialchars($usuario['bio'] ?? 'Algo sobre você.');
                                                ?></textarea>
                                                <div class="main-border-button">
                                                    <button type="submit" class="btn btn-primary" id="btn-salvar">Salvar perfil</button>
                                                </div>
                                            </form>
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
<script>
        // Preview da foto de perfil
        document.getElementById('foto-perfil').addEventListener('change', function(e) {
            if (e.target.files && e.target.files[0]) {
                var reader = new FileReader();
                
                reader.onload = function(e) {
                    document.getElementById('preview-foto').src = e.target.result;
                }
                
                reader.readAsDataURL(e.target.files[0]);
            }
        });
    </script>

</body>

</html>