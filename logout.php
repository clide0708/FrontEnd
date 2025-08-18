<?php

    // logout.php
    require_once __DIR__.'/includes/auth.php';

    // Expira o cookie do token JWT definindo uma data no passado
    setcookie('jwt_token', '', [
        'expires' => time() - 3600, // 1 hora atrás (expira imediatamente)
        'path' => '/',
        'secure' => true, // Apenas HTTPS
        'httponly' => true,
        'samesite' => 'Strict'
    ]);

    session_start();
    $_SESSION = []; // Limpa todas as variáveis de sessão
    session_destroy(); // Destrói a sessão
    header('Location: index.php'); // Redireciona para a página inicial
    exit();

?>