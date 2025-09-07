<?php
    // Incluir jwt.config.php uma vez
    require_once __DIR__ . '/../Config/jwt.config.php';

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
        'exercicios/buscarPorID/(\d+)' => [
            'controller' => 'ExerciciosController',
            'method' => 'buscarPorID'
        ],
        'exercicios/buscarPorNome' => [
            'controller' => 'ExerciciosController',
            'method' => 'buscarPorNome'
        ],
        'exercicios/buscarPorNome/([a-zA-Z0-9%C3%A1%C3%A0%C3%A3%C3%A2%C3%A9%C3%A8%C3%AA%C3%AD%C3%AC%C3%B3%C3%B2%C3%B4%C3%BA%C3%FA%C3%BC%C3%A7\s]+)' => [
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
        'exercicios/atualizar/(\d+)' => [ // NOVA ROTA PARA ATUALIZAR COM ID
            'controller' => 'ExerciciosController',
            'method' => 'atualizarExercicio'
        ],
        'exercicios/deletar' => [
            'controller' => 'ExerciciosController',
            'method' => 'deletarExercicio'
        ],
        'exercicios/deletar/(\d+)' => [
            'controller' => 'ExerciciosController',
            'method' => 'deletarExercicio'
        ],

        // Rota para testar conexão
        'config/testarConexao' => [
            'controller' => 'ConfigController',
            'method' => 'testarConexaoDB'
        ],
    ];

    // Mapeamento de controladores
    $controller_paths = [
        'ExerciciosController' => __DIR__ . '/../Controllers/ExerciciosController.php',
        'ConfigController' => __DIR__ . '/../Config/ConfigController.php',
    ];

    // Função para despachar a requisição - CORRIGIDA
    function dispatch($path, $routes, $controller_paths, $method_http) {
        // Remove 'api/' do início do path, se existir
        $path_segments = explode('/', $path);
        if ($path_segments[0] === 'api') {
            array_shift($path_segments);
        }
        
        $clean_path = implode('/', $path_segments);
        $matched_route = null;
        $params = [];

        // Remove query string do path para matching de rotas
        $clean_path = parse_url($clean_path, PHP_URL_PATH);
        $clean_path = trim($clean_path, '/');

        // Procura por correspondência exata primeiro
        if (array_key_exists($clean_path, $routes)) {
            $matched_route = $routes[$clean_path];
        } else {
            // Procura por padrões com parâmetros
            foreach ($routes as $pattern => $route) {
                if (preg_match('#^' . $pattern . '$#', $clean_path, $matches)) {
                    $matched_route = $route;
                    array_shift($matches); // Remove a correspondência completa
                    $params = $matches; // Resto são os parâmetros
                    break;
                }
            }
        }

        if ($matched_route) {
            $controller_name = $matched_route['controller'];
            $method_name = $matched_route['method'];

            if (array_key_exists($controller_name, $controller_paths)) {
                $controller_file = $controller_paths[$controller_name];

                if (file_exists($controller_file)) {
                    require_once $controller_file;

                    // Instancia o controlador
                    $controller_instance = new $controller_name();

                    if (method_exists($controller_instance, $method_name)) {
                        // Captura parâmetros da query string se não houver parâmetros na URL
                        if (empty($params)) {
                            parse_str($_SERVER['QUERY_STRING'] ?? '', $query_params);
                            
                            // Para métodos GET, pega parâmetros específicos baseados no método
                            if ($method_http === 'GET') {
                                switch ($method_name) {
                                    case 'buscarPorID':
                                        if (isset($query_params['id'])) {
                                            $params[] = $query_params['id'];
                                        }
                                        break;
                                    case 'buscarPorNome':
                                        if (isset($query_params['nome'])) {
                                            $params[] = $query_params['nome'];
                                        }
                                        break;
                                    case 'deletarExercicio':
                                        if (isset($query_params['id'])) {
                                            $params[] = $query_params['id'];
                                        }
                                        break;
                                }
                            }
                        }

                        // Captura os dados do corpo da requisição para POST, PUT
                        $data = [];
                        if (in_array($method_http, ['POST', 'PUT'])) {
                            $data = json_decode(file_get_contents('php://input'), true);
                            if ($data === null) {
                                $data = $_POST;
                            }
                        }

                        // Prepara os parâmetros para chamar o método
                        $method_params = [];
                        
                        // Adiciona parâmetros da URL ou query string
                        if (!empty($params)) {
                            $method_params = array_merge($method_params, $params);
                        }
                        
                        // Adiciona dados do corpo para POST/PUT
                        if (in_array($method_http, ['POST', 'PUT']) && !empty($data)) {
                            $method_params[] = $data;
                        }

                        // Verifica se os parâmetros necessários estão presentes
                        $reflection = new ReflectionMethod($controller_instance, $method_name);
                        $required_params = $reflection->getNumberOfRequiredParameters();
                        
                        if (count($method_params) >= $required_params) {
                            // Chama o método do controlador com os parâmetros
                            call_user_func_array([$controller_instance, $method_name], $method_params);
                        } else {
                            http_response_code(400);
                            echo json_encode(["error" => "Parâmetros insuficientes para o método '$method_name'"]);
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