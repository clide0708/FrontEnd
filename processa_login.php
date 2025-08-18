<?php
    session_start();
    require('bd/conecta.php');

    $email = $conexao->real_escape_string($_POST['email']);
    $senha = $conexao->real_escape_string($_POST['senha']);

    $dadosTabelas = [
        'alunos' => ['id' => 'email', 'redirect' => 'Treinos/treinos.php'],
        'personal' => ['id' => 'email', 'redirect' => 'alunos.php']
    ];

    $mensagemErro = "Usuário ou senha incorretos!";
    foreach ($dadosTabelas as $tabela => $dados) {
        $campoID = $dados['id'];
        $redirect = $dados['redirect'];

        $query = "SELECT * FROM $tabela WHERE email = '$email'";
        $resultado = $conexao->query($query);

        if ($resultado && $resultado->num_rows == 1) {
            $usuario = $resultado->fetch_assoc();
            if (password_verify($senha, $usuario['senha'])) {
                $_SESSION['id'] = $usuario[$campoID];
                $_SESSION['nome'] = $usuario['nome'];
                $_SESSION['email'] = $usuario['email'];
                $_SESSION['senha'] = $usuario['senha'];
                $_SESSION['tipo'] = $tabela;
                header("Location: $redirect");
                exit;
            } else {
                $mensagem = "Usuário ou senha incorretos!";
                echo "<script>alert('$mensagemErro');window.location.href = 'login.php';</script>";
                exit;
            }
        }
    }
    

?>
