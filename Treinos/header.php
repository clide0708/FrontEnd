<header class="nav-header">
  <div class="container">
    <div class="nav-bar">

      <!-- Logo -->
      <h1> <a class="nav-CF" href="../index.php">ClideFit</a></h1>

      <!-- Botão mobile -->
      <div class="menu-icon" onclick="toggleMenu()">
        <span></span>
        <span></span>
        <span></span>
      </div>

      <!-- Menu -->
      <ul class="nav-menu" id="navMenu">
        <li><a href="../index.php" class="<?= basename($_SERVER['PHP_SELF']) == 'index.php' ? 'active' : '' ?>">Início</a></li>
        <li><a href="../planos.php" class="<?= basename($_SERVER['PHP_SELF']) == 'planos.php' ? 'active' : '' ?>">Planos Personalizados</a></li>
        <li><a href="../Alimentacao/alimentacao.php?lista=cafe" class="<?= basename($_SERVER['PHP_SELF']) == 'alimentacao.php' ? 'active' : '' ?>">Alimentação</a></li>
        <li><a href="../Treinos/treinos.php" class="<?= basename($_SERVER['PHP_SELF']) == 'treinos.php' || basename($_SERVER['PHP_SELF']) == 'academia.php' || basename($_SERVER['PHP_SELF']) == 'calistenia.php' || basename($_SERVER['PHP_SELF']) == 'treinando.php' ? 'active' : '' ?>">Treinos</a></li> 
        <li><a href="../alunos.php" class="<?= basename($_SERVER['PHP_SELF']) == 'alunos.php' ? 'active' : '' ?>">Alunos</a></li>
        <li>
          <a href="../perfil.php" class="profile-link <?= basename($_SERVER['PHP_SELF']) == 'perfil.php' ? 'active' : '' ?>">
            <span>Perfil</span>
            <img src="assets/images/profilefoto.png" alt="Foto de perfil">
          </a>
        </li>
      </ul>
    </div>
  </div>
</header>

<script>
  function toggleMenu() {
    const navMenu = document.getElementById('navMenu')
    navMenu.classList.toggle('show')
  }
</script>