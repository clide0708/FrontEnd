<?php include 'conect.php'; ?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CLIDE Fit - Login</title>
    <link href="vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
    <div class="container mt-5">
        <div class="row justify-content-center">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h3 class="text-center">Login CLIDE Fit</h3>
                    </div>
                    <div class="card-body">
                        <?php
                        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                            $email = $_POST['email'] ?? '';
                            $senha = $_POST['senha'] ?? '';
                            $tipo = $_POST['tipo'] ?? 'aluno';
                            
                            try {
                                // Verificar se é aluno ou personal
                                if ($tipo === 'aluno') {
                                    $stmt = $conn->prepare("SELECT * FROM alunos WHERE email = ?");
                                } else {
                                    $stmt = $conn->prepare("SELECT * FROM proprietarios WHERE email = ?");
                                }
                                
                                $stmt->execute([$email]);
                                $user = $stmt->fetch();
                                
                                if ($user && password_verify($senha, $user['senha'])) {
                                    $_SESSION['user_id'] = $user[$tipo === 'aluno' ? 'idalunos' : 'idproprietario'];
                                    $_SESSION['user_type'] = $tipo;
                                    $_SESSION['user_name'] = $user['nome'];
                                    $_SESSION['user_email'] = $user['email'];
                                    
                                    redirect('index.php');
                                } else {
                                    echo '<div class="alert alert-danger">Email ou senha incorretos!</div>';
                                }
                            } catch (PDOException $e) {
                                echo '<div class="alert alert-danger">Erro ao fazer login: ' . $e->getMessage() . '</div>';
                            }
                        }
                        ?>
                        <form method="POST">
                            <div class="form-group">
                                <label for="email">Email</label>
                                <input type="email" class="form-control" id="email" name="email" required>
                            </div>
                            <div class="form-group">
                                <label for="senha">Senha</label>
                                <input type="password" class="form-control" id="senha" name="senha" required>
                            </div>
                            <div class="form-group">
                                <label for="tipo">Tipo de Usuário</label>
                                <select class="form-control" id="tipo" name="tipo">
                                    <option value="aluno">Aluno</option>
                                    <option value="personal">Personal Trainer</option>
                                </select>
                            </div>
                            <button type="submit" class="btn btn-primary btn-block">Entrar</button>
                        </form>
                        <div class="text-center mt-3">
                            <a href="registro.php">Não tem uma conta? Registre-se</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>