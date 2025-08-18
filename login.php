<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
    <meta name="description" content="" />
    <meta name="author" content="" />
    <title>Login | CLIDE Fit</title>
    <link href="assets/css/login_styles.css" rel="stylesheet" />
    <script src="https://use.fontawesome.com/releases/v6.3.0/js/all.js" crossorigin="anonymous"></script>
    <link rel="icon" type="image/x-icon" href="assets/images/Logo_Sandra_Soares_Imobiliaria.png" />
</head>
<body class="bg-primary">
    <div id="layoutAuthentication">
        <div id="layoutAuthentication_content">
            <main>
                <div class="container">
                    <div class="row justify-content-center">
                        <div class="col-lg-5">
                            <div class="card shadow-lg border-0 rounded-lg mt-5">
                                <div class="card-header"><h3 class="text-center preto font-weight-light my-4">Login</h3></div>
                                <div class="card-body">
                                    <form action="processa_login.php" method="POST">
                                        <div class="form-floating mb-3">
                                            <input name="email" class="form-control" id="inputEmail" type="email" placeholder="exemplo@email.com" required />
                                            <label for="inputEmail">Endereço de Email</label>
                                        </div>
                                        <div class="form-floating mb-3">
                                            <input name="senha" class="form-control" id="inputPassword" type="password" placeholder="Password" required />
                                            <label for="inputPassword">Senha</label>
                                        </div>
                                        <div class="form-check mb-3">
                                            <input class="form-check-input" id="inputRememberPassword" type="checkbox" value="" />
                                            <label class="form-check-label" for="inputRememberPassword">Lembrar senha</label>
                                        </div>
                                        <div class="d-flex align-items-center justify-content-between mt-4 mb-0">
                                            <a class="small" href="esqueceu_senha.php">Esqueceu sua senha?</a>
                                            <input class="btn btn-primary" type="submit" value="Logar">
                                        </div>
                                    </form>
                                </div>
                                <div class="card-footer text-center py-3">
                                    <div class="small"><a href="cadastro.php">Precisa de uma conta? Cadastre-se!</a></div>
                                    <div href="logout.php" class="small"><a href="index.php">Voltar ao início</a></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
    <script src="js/scripts.js"></script>
</body>
</html>