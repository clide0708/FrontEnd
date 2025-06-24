<?php
session_start();
include 'conect.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit();
}

// Function to check if user is a personal trainer
function isPersonalTrainer() {
    return isset($_SESSION['user_type']) && $_SESSION['user_type'] === 'trainer';
}

// Function to redirect
function redirect($url) {
    header("Location: $url");
    exit();
}

// Get user data
try {
    if (isPersonalTrainer()) {
        $stmt = $conn->prepare("SELECT * FROM proprietarios WHERE idproprietario = ?");
    } else {
        $stmt = $conn->prepare("SELECT * FROM alunos WHERE idalunos = ?");
    }
    $stmt->execute([$_SESSION['user_id']]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$usuario) {
        throw new Exception("User not found");
    }
} catch (PDOException $e) {
    $_SESSION['error'] = "Database error: " . $e->getMessage();
    redirect('perfil.php');
} catch (Exception $e) {
    $_SESSION['error'] = $e->getMessage();
    redirect('perfil.php');
}

// Handle profile update
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nome = filter_input(INPUT_POST, 'nome', FILTER_SANITIZE_STRING) ?? $usuario['nome'];
    $bio = filter_input(INPUT_POST, 'bio', FILTER_SANITIZE_STRING) ?? ($usuario['bio'] ?? '');
    
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
<html lang="pt-BR">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <title>CF - Editar Perfil</title>

  <!-- Bootstrap core CSS -->
  <link href="vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet">

  <!-- Additional CSS Files -->
  <link rel="stylesheet" href="assets/css/fontawesome.css">
  <link rel="stylesheet" href="assets/css/templatemo-cyborg-gaming.css">
  <link rel="stylesheet" href="assets/css/owl.css">
  <link rel="stylesheet" href="assets/css/animate.css">
  <link rel="stylesheet" href="https://unpkg.com/swiper@7/swiper-bundle.min.css" />
  <link rel="stylesheet" href="assets/css/style.css">
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
          <?php if (isset($_SESSION['error'])): ?>
            <div class="alert alert-danger"><?= htmlspecialchars($_SESSION['error']); unset($_SESSION['error']); ?></div>
          <?php endif; ?>
          
          <div class="row">
            <div class="col-lg-12">
              <div class="main-profile">
                <div class="row">
                  <div class="col-lg-4">
                    <label for="foto-perfil">
                      <img id="preview-foto" src="assets/images/profilefoto.png" alt="Foto de perfil" style="border-radius: 23px; cursor: pointer; max-width: 200px;">
                      <input type="file" id="foto-perfil" accept="image/*" style="display: none;">
                    </label>
                  </div>
                  <div class="col-lg-8 align-self-center">
                    <div class="main-info header-text">
                      <form id="form-editar-perfil" method="POST">
                        <div class="form-group">
                          <label for="nome">Nome</label>
                          <input type="text" id="nome" class="form-control mb-3" name="nome" 
                            value="<?= htmlspecialchars($usuario['nome']); ?>" 
                            style="font-weight: bold; font-size: 20px;" required>
                        </div>
                        <div class="form-group">
                          <label for="bio">Biografia</label>
                          <textarea id="bio" class="form-control mb-3" name="bio" rows="3"><?= 
                            htmlspecialchars($usuario['bio'] ?? 'Algo sobre você.'); 
                          ?></textarea>
                        </div>
                        <div class="main-border-button">
                          <button type="submit" class="btn btn-primary" id="btn-salvar">Salvar perfil</button>
                          <a href="perfil.php" class="btn btn-secondary">Cancelar</a>
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
          <p>Copyright © <?= date('Y'); ?> <a href="#">CF Fitness</a>. All rights reserved.</p>
        </div>
      </div>
    </div>
  </footer>

  <!-- Scripts -->
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
        if (e.target.files[0].size > 2 * 1024 * 1024) {
          alert('A imagem deve ter no máximo 2MB');
          return;
        }
        
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