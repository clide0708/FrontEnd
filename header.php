<header class="header-area header-sticky">
    <div class="container">
        <div class="row">
            <div class="col-12">
                <nav class="main-nav">

                    <!-- ***** Logo Start ***** -->
                    <!-- <a href="index.php" class="logo">             </a> -->
                    <h1 style="color: #368DD9;">ClideFit</h1>
                    <!-- ***** Logo End ***** -->
                    <!-- ***** Search End ***** -->
                    <!-- <div class="search-input">
                      <form id="search" action="#">
                        <input type="text" placeholder="Pesquisar" id='searchText' name="searchKeyword" onkeypress="handle" />
                        <i class="fa fa-search"></i>
                      </form>
                    </div> -->
                    <!-- ***** Search End ***** -->
                    <!-- ***** Menu Start ***** -->
                    <ul class="nav">
                        <li><a href="index.php" class="<?= basename($_SERVER['PHP_SELF']) == 'index.php' ? 'active' : '' ?>">Início</a></li>
                        <li><a href="treinos.php" class="<?= basename($_SERVER['PHP_SELF']) == 'treinos.php' ? 'active' : '' ?>">Treinos e Planos Personalizados</a></li>
                        <li><a href="alimentacao.php" class="<?= basename($_SERVER['PHP_SELF']) == 'alimentacao.php' ? 'active' : '' ?>">Alimentação</a></li>
                        <li><a href="meustreinos.php" class="<?= basename($_SERVER['PHP_SELF']) == 'meustreinos.php' ? 'active' : '' ?>">Meus Treinos</a></li>
                        <li><a href="alunos.php" class="<?= basename($_SERVER['PHP_SELF']) == 'alunos.php' ? 'active' : '' ?>">Alunos</a></li>
                        <li>
                            <a href="perfil.php" class="<?= basename($_SERVER['PHP_SELF']) == 'perfil.php' ? 'active' : '' ?>">
                                Perfil <img src="assets/images/profilefoto.png" alt="">
                            </a>
                        </li>
                    </ul>

                    <a class='menu-trigger'>
                        <span>Menu</span>
                    </a>
                    <!-- ***** Menu End ***** -->
                </nav>
            </div>
        </div>
    </div>
</header>