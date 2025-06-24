<?php include 'conect.php'; ?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CLIDE Fit - Registro</title>
    <link href="vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
    <div class="container mt-5">
        <div class="row justify-content-center">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h3 class="text-center">Registro CLIDE Fit</h3>
                    </div>
                    <div class="card-body">
                        <?php
                        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                            $nome = $_POST['nome'] ?? '';
                            $email = $_POST['email'] ?? '';
                            $senha = $_POST['senha'] ?? '';
                            $tipo = $_POST['tipo'] ?? 'aluno';
                            
                            try {
                                // Verificar se email já existe
                                if ($tipo === 'aluno') {
                                    $stmt = $conn->prepare("SELECT idalunos FROM alunos WHERE email = ?");
                                } else {
                                    $stmt = $conn->prepare("SELECT idproprietario FROM proprietarios WHERE email = ?");
                                }
                                
                                $stmt->execute([$email]);
                                
                                if ($stmt->fetch()) {
                                    echo '<div class="alert alert-danger">Email já cadastrado!</div>';
                                } else {
                                    $senhaHash = password_hash($senha, PASSWORD_DEFAULT);
                                    $dataAtual = date('Y-m-d H:i:s');
                                    
                                    if ($tipo === 'aluno') {
                                        $stmt = $conn->prepare("INSERT INTO alunos (nome, email, senha, data_cadastro) VALUES (?, ?, ?, ?)");
                                    } else {
                                        $stmt = $conn->prepare("INSERT INTO proprietarios (nome, email, senha, datacadastro) VALUES (?, ?, ?, ?)");
                                    }
                                    
                                    $stmt->execute([$nome, $email, $senhaHash, $dataAtual]);
                                    
                                    echo '<div class="alert alert-success">Registro realizado com sucesso! <a href="login.php">Faça login</a></div>';
                                }
                            } catch (PDOException $e) {
                                echo '<div class="alert alert-danger">Erro ao registrar: ' . $e->getMessage() . '</div>';
                            }
                        }
                        ?>
                        <form method="POST">
                            <div class="form-group">
                                <label for="nome">Nome Completo</label>
                                <input type="text" class="form-control" id="nome" name="nome" required>
                            </div>
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
                            <button type="submit" class="btn btn-primary btn-block">Registrar</button>
                        </form>
                        <div class="text-center mt-3">
                            <a href="login.php">Já tem uma conta? Faça login</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>