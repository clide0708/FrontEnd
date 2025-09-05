<?php
    // Configurações de cabeçalho HTTP
    
    // Permite requisições de qualquer origem (CORS)
    header("Access-Control-Allow-Origin: *");
    
    // Permite métodos específicos
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    
    // Permite cabeçalhos específicos
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    
    // Define o tipo de conteúdo como JSON
    header("Content-Type: application/json; charset=UTF-8");

    // Define o fuso horário para São Paulo
    date_default_timezone_set('America/Sao_Paulo');

    // Captura a rota
    $path = isset($_GET['path']) ? explode('/', $_GET['path']) : [];

    // Verifica se o caminho da API está completo
    if (count($path) < 2) {
        echo json_encode([
            "error" => "Caminho da API incompleto. Use: /api/entidade/acao/[param]",
            
        ]);
        $api   = null;
        $acao  = null;
        $param = null;
        exit;
    }

    // Extrai os componentes da rota

    // Exemplo: /api/entidade/acao/[param]
    // $path[0] = entidade (api)
    // $path[1] = ação (acao)
    // $path[2] = parâmetro opcional (param)
    $api   = $path[0] ?? null;
    $acao  = $path[1] ?? null;
    $param = $path[2] ?? null;

    $method = $_SERVER['REQUEST_METHOD'];

    include_once 'Controllers/ExerciciosController.php';
?>