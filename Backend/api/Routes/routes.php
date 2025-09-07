<?php

    // Define as rotas do sistema
    $routes = [
        // Rotas para ExercíciosController
        'exercicios/buscarTodos' => [
            'controller' => 'ExerciciosController',
            'method' => 'buscarTodosExercicios'
        ],
        'exercicios/buscarPorID' => [
            'controller' => 'ExerciciosController',
            'method' => 'buscarPorID'
        ],
        'exercicios/buscarPorNome' => [
            'controller' => 'ExerciciosController',
            'method' => 'buscarPorNome'
        ],
        'exercicios/cadastrar' => [
            'controller' => 'ExerciciosController',
            'method' => 'cadastrarExercicio'
        ],
        'exercicios/atualizar' => [
            'controller' => 'ExerciciosController',
            'method' => 'atualizarExercicio'
        ],
        'exercicios/deletar' => [
            'controller' => 'ExerciciosController',
            'method' => 'deletarExercicio'
        ],

        // Rota para testar conexão
        'config/testarConexao' => [
            'controller' => 'ConfigController',
            'method' => 'testarConexaoDB'
        ],
    ];

    // Mapeamento de controladores - CAMINHOS ATUALIZADOS
    $controller_paths = [
        'ExerciciosController' => __DIR__ . '/../Controllers/ExerciciosController.php',
        'ConfigController' => __DIR__ . '/../Config/ConfigController.php',
    ];

    // Função para despachar a requisição
    function dispatch($path, $routes, $controller_paths, $method_http) {
        // Remove 'api/' do início do path, se existir
        $path_segments = explode('/', $path);
        if ($path_segments[0] === 'api') {
            array_shift($path_segments);
        }
        $clean_path = implode('/', $path_segments);

        if (array_key_exists($clean_path, $routes)) {
            $route = $routes[$clean_path];
            $controller_name = $route['controller'];
            $method_name = $route['method'];

            if (array_key_exists($controller_name, $controller_paths)) {
                $controller_file = $controller_paths[$controller_name];

                if (file_exists($controller_file)) {
                    require_once $controller_file;

                    // Instancia o controlador
                    $controller_instance = new $controller_name();

                    if (method_exists($controller_instance, $method_name)) {
                        // Captura os dados do corpo da requisição
                        $data = json_decode(file_get_contents('php://input'), true);
                        if ($data === null && in_array($method_http, ['POST', 'PUT', 'DELETE'])) {
                            $data = $_POST;
                        }

                        // Extrai parâmetros da URL
                        $last_segment = $path_segments[count($path_segments) - 1];
                        $param = null;
                        
                        // Se for um ID numérico ou nome, usa como parâmetro
                        if (is_numeric($last_segment) || 
                            ($method_name === 'buscarPorNome' && !in_array($last_segment, ['buscarPorNome', 'buscarTodos', 'cadastrar', 'atualizar', 'deletar']))) {
                            $param = $last_segment;
                        }

                        // Chama o método do controlador
                        switch ($method_http) {
                            case 'GET':
                                if ($param) {
                                    $controller_instance->$method_name($param);
                                } else {
                                    $controller_instance->$method_name();
                                }
                                break;
                            case 'POST':
                                $controller_instance->$method_name($data);
                                break;
                            case 'PUT':
                                if ($param) {
                                    $controller_instance->$method_name($param, $data);
                                } else {
                                    http_response_code(400);
                                    echo json_encode(["error" => "ID necessário para PUT"]);
                                }
                                break;
                            case 'DELETE':
                                if ($param) {
                                    $controller_instance->$method_name($param);
                                } else {
                                    http_response_code(400);
                                    echo json_encode(["error" => "ID necessário para DELETE"]);
                                }
                                break;
                            case 'OPTIONS':
                                http_response_code(200);
                                break;
                            default:
                                http_response_code(405);
                                echo json_encode(["error" => "Método HTTP não permitido"]);
                                break;
                        }
                    } else {
                        http_response_code(404);
                        echo json_encode(["error" => "Método '$method_name' não encontrado no controlador '$controller_name'"]);
                    }
                } else {
                    http_response_code(500);
                    echo json_encode(["error" => "Arquivo do controlador '$controller_file' não encontrado"]);
                }
            } else {
                http_response_code(500);
                echo json_encode(["error" => "Controlador '$controller_name' não mapeado"]);
            }
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Rota '$clean_path' não encontrada"]);
        }
    }

?>