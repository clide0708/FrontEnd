
3
cadastro:1 Uncaught (in promise) Error: A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received
uploadImage.js:16 
 POST http://localhost/BackEnd/api/upload/foto-perfil 400 (Bad Request)
uploadImagemParaServidor	@	uploadImage.js:16
handleSalvarCorte	@	EtapaPerfil.jsx:118
await in handleSalvarCorte		
handleSave	@	modalCrop.jsx:19
<button>		
CropModal	@	modalCrop.jsx:66
<CropModal>		
EtapaPerfil	@	EtapaPerfil.jsx:194
<EtapaPerfil>		
renderizarEtapa	@	index.jsx:328
CadastroMultiEtapas	@	index.jsx:431
uploadImage.js:49 ❌ Erro no upload: Error: Erro HTTP: 400 - Bad Request
    at uploadImagemParaServidor (uploadImage.js:23:13)
    at async handleSalvarCorte (EtapaPerfil.jsx:118:28)
uploadImagemParaServidor	@	uploadImage.js:49
await in uploadImagemParaServidor		
handleSalvarCorte	@	EtapaPerfil.jsx:118
await in handleSalvarCorte		
handleSave	@	modalCrop.jsx:19
<button>		
CropModal	@	modalCrop.jsx:66
<CropModal>		
EtapaPerfil	@	EtapaPerfil.jsx:194
<EtapaPerfil>		
renderizarEtapa	@	index.jsx:328
CadastroMultiEtapas	@	index.jsx:431
client:815 
 GET http://localhost:5173/src/components/CadastroMultiEtapas/EtapaCREF.jsx?t=1762029923865 net::ERR_ABORTED 500 (Internal Server Error)
client:809 [vite] Failed to reload /src/components/CadastroMultiEtapas/EtapaCREF.jsx. This could be due to syntax errors or importing non-existent modules. (see errors above)
client:815 
 GET http://localhost:5173/src/components/CadastroMultiEtapas/EtapaCREF.jsx?t=1762030001418 net::ERR_ABORTED 500 (Internal Server Error)
client:809 [vite] Failed to reload /src/components/CadastroMultiEtapas/EtapaCREF.jsx. This could be due to syntax errors or importing non-existent modules. (see errors above)
error	@	client:809
warnFailedUpdate	@	client:181
fetchUpdate	@	client:212
await in fetchUpdate		
queueUpdate	@	client:189
(anonymous)	@	client:839
handleMessage	@	client:838
await in handleMessage		
(anonymous)	@	client:458
dequeue	@	client:480
(anonymous)	@	client:472
enqueue	@	client:466
(anonymous)	@	client:458
onMessage	@	client:305
(anonymous)	@	client:413

A pasta "api" não existe "fisicamente", porém ela é lida nas rotas e funcionam normalmente

Estrutura real
BackEnd/
├── index.php
├── .htaccess
├──  Routes/
│       └── routes.php
├── Controllers/
│   ├── CadastroController.php
│   └── UploadController.php
└── Config/...

CadastroController.php:

<?php

    require_once __DIR__ . '/../Config/db.connect.php';
    require_once __DIR__ . '/../Config/jwt.config.php';

    class CadastroController{
        private $db;

        public function __construct(){
            $this->db = DB::connectDB();
        }

        // Método auxiliar para buscar um plano pelo nome e tipo de usuário
        private function buscarPlanoId($nomePlano, $tipoUsuario){
            $stmt = $this->db->prepare("SELECT idPlano FROM planos WHERE nome = ? AND tipo_usuario = ?");
            $stmt->execute([$nomePlano, $tipoUsuario]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result ? $result['idPlano'] : null;
        }

        public function cadastrarAluno($data){
            try {
                // Validação dos campos obrigatórios
                $camposObrigatorios = ['nome', 'cpf', 'rg', 'email', 'senha', 'numTel'];
                foreach ($camposObrigatorios as $campo) {
                    if (!isset($data[$campo]) || empty(trim($data[$campo]))) {
                        http_response_code(400);
                        echo json_encode(['success' => false, 'error' => "Campo {$campo} é obrigatório"]);
                        return;
                    }
                }

                $errosEndereco = $this->validarDadosEndereco($data);
                if (!empty($errosEndereco)) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => implode(', ', $errosEndereco)]);
                    return;
                }
                
                // Validações específicas
                if (!$this->validarEmail($data['email'])) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'Email inválido']);
                    return;
                }
                if (!$this->validarCPF($data['cpf'])) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'CPF inválido']);
                    return;
                }
                if (!$this->validarTelefone($data['numTel'])) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'Telefone inválido']);
                    return;
                }
                if (strlen($data['senha']) < 6) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'Senha deve ter pelo menos 6 caracteres']);
                    return;
                }

                // Verifica duplicidade
                if ($this->emailExiste($data['email'])) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'Email já cadastrado']);
                    return;
                }
                if ($this->cpfExiste($data['cpf'])) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'CPF já cadastrado']);
                    return;
                }

                // Hash da senha
                $senhaHash = password_hash($data['senha'], PASSWORD_DEFAULT);
                $cpfFormatado = $this->formatarCPF($data['cpf']);
                $telefoneFormatado = $this->formatarTelefone($data['numTel']);

                // plano padrão (id 1) – mas pode buscar por nome se quiser
                $idPlanoBasico = 1;

                $stmt = $this->db->prepare("
                    INSERT INTO alunos (nome, cpf, rg, email, senha, numTel, data_cadastro, idPlano, status_conta) 
                    VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, 'Ativa')
                ");

                $success = $stmt->execute([
                    trim($data['nome']),
                    $cpfFormatado,
                    trim($data['rg']),
                    trim($data['email']),
                    $senhaHash,
                    $telefoneFormatado,
                    $idPlanoBasico
                ]);

                if ($success) {
                    $alunoId = $this->db->lastInsertId();
                    $aluno = $this->buscarAlunoPorId($alunoId);

                    // Inserir endereço do aluno
                    $this->cadastrarEnderecoUsuario($alunoId, 'aluno', $data);

                    http_response_code(201);
                    echo json_encode([
                        'success' => true,
                        'idAluno' => $alunoId,
                        'aluno' => $aluno,
                        'message' => 'Aluno cadastrado com sucesso no plano básico.'
                    ]);
                } else {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'Erro ao cadastrar aluno']);
                }
            } catch (PDOException $e) {
                if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'Dados já cadastrados no sistema']);
                } else {
                    http_response_code(500);
                    echo json_encode(['success' => false, 'error' => 'Erro ao cadastrar aluno: ' . $e->getMessage()]);
                }
            }
        }

        public function cadastrarPersonal($data){
            try {
                // Validação dos campos obrigatórios
                $camposObrigatorios = [
                    'nome',
                    'cpf',
                    'rg',
                    'cref_numero',
                    'cref_categoria',
                    'cref_regional',
                    'email',
                    'senha',
                    'numTel'
                ];

                foreach ($camposObrigatorios as $campo) {
                    if (!isset($data[$campo]) || empty(trim($data[$campo]))) {
                        http_response_code(400);
                        echo json_encode(['success' => false, 'error' => "Campo {$campo} é obrigatório"]);
                        return;
                    }
                }
                
                $errosEndereco = $this->validarDadosEndereco($data);
                if (!empty($errosEndereco)) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => implode(', ', $errosEndereco)]);
                    return;
                }

                // Validações específicas
                if (!$this->validarEmail($data['email'])) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'Email inválido']);
                    return;
                }

                if (!$this->validarCPF($data['cpf'])) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'CPF inválido']);
                    return;
                }

                if (!$this->validarTelefone($data['numTel'])) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'Telefone inválido']);
                    return;
                }

                if (strlen($data['senha']) < 6) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'Senha deve ter pelo menos 6 caracteres']);
                    return;
                }

                // Validações específicas do CREF
                if (!$this->validarCREFNumero($data['cref_numero'])) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'Número CREF inválido (6-9 dígitos)']);
                    return;
                }

                if (!$this->validarCREFCategoria($data['cref_categoria'])) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'Categoria CREF inválida (1 letra)']);
                    return;
                }

                if (!$this->validarCREFRegional($data['cref_regional'])) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'Regional CREF inválida (2-5 letras)']);
                    return;
                }

                // Verifica se email já existe
                if ($this->emailExiste($data['email'])) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'Email já cadastrado']);
                    return;
                }

                // Verifica se CPF já existe
                if ($this->cpfExiste($data['cpf'])) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'CPF já cadastrado']);
                    return;
                }

                // Verifica se CREF já existe
                if ($this->crefExiste($data['cref_numero'])) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'CREF já cadastrado']);
                    return;
                }

                // Hash da senha
                $senhaHash = password_hash($data['senha'], PASSWORD_DEFAULT);

                // Formatar dados
                $cpfFormatado = $this->formatarCPF($data['cpf']);
                $telefoneFormatado = $this->formatarTelefone($data['numTel']);

                // Formatar CREF corretamente
                $crefNumero = $this->formatarCREFNumero($data['cref_numero']);
                $crefCategoria = $this->formatarCREFCategoria($data['cref_categoria']);
                $crefRegional = $this->formatarCREFRegional($data['cref_regional']);

                // Buscar ID do plano 'Personal Básico'
                $idPlanoBasico = $this->buscarPlanoId('Personal Básico', 'personal');
                if (!$idPlanoBasico) {
                    http_response_code(500);
                    echo json_encode(['success' => false, 'error' => 'Plano padrão para personal não encontrado.']);
                    return;
                }

                $stmt = $this->db->prepare("
                    INSERT INTO personal 
                    (nome, cpf, rg, cref_numero, cref_categoria, cref_regional, email, senha, numTel, data_cadastro, idPlano, status_conta, idAcademia) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, 'Ativa', ?)
                ");

                $success = $stmt->execute([
                    trim($data['nome']),
                    $cpfFormatado,
                    trim($data['rg']),
                    $crefNumero,
                    $crefCategoria,
                    $crefRegional,
                    trim($data['email']),
                    $senhaHash,
                    $telefoneFormatado,
                    $idPlanoBasico,
                    $idAcademia
                ]);

                if ($success) {
                    $personalId = $this->db->lastInsertId();
                    // Criar assinatura para o plano básico
                    $this->criarAssinatura($personalId, 'personal', $idPlanoBasico, 'ativa');

                    $personal = $this->buscarPersonalPorId($personalId);

                    // Inserir endereço do personal
                    $this->cadastrarEnderecoUsuario($personalId, 'personal', $data);

                    http_response_code(201);
                    echo json_encode([
                        'success' => true,
                        'idPersonal' => $personalId,
                        'personal' => $personal,
                        'message' => 'Personal trainer cadastrado com sucesso e plano básico atribuído.'
                    ]);
                } else {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'Erro ao cadastrar personal trainer']);
                }
            } catch (PDOException $e) {
                if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'Dados já cadastrados no sistema']);
                } else {
                    http_response_code(500);
                    echo json_encode(['success' => false, 'error' => 'Erro ao cadastrar personal trainer: ' . $e->getMessage()]);
                }
            }
        }

        public function cadastrarAcademia($data){
            try {
                $camposObrigatorios = ['nome', 'cnpj', 'email', 'senha'];
                foreach ($camposObrigatorios as $campo) {
                    if (!isset($data[$campo]) || empty(trim($data[$campo]))) {
                        http_response_code(400);
                        echo json_encode(['success' => false, 'error' => "Campo {$campo} é obrigatório"]);
                        return;
                    }
                }

                if (!$this->validarEmail($data['email'])) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'Email inválido']);
                    return;
                }

                if (!$this->validarCNPJ($data['cnpj'])) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'CNPJ inválido']);
                    return;
                }

                if (strlen($data['senha']) < 6) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'Senha deve ter pelo menos 6 caracteres']);
                    return;
                }

                if ($this->emailExiste($data['email'])) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'Email já cadastrado']);
                    return;
                }

                if ($this->cnpjExiste($data['cnpj'])) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'CNPJ já cadastrado']);
                    return;
                }

                $senhaHash = password_hash($data['senha'], PASSWORD_DEFAULT);
                $cnpjFormatado = $this->formatarCNPJ($data['cnpj']);

                // Buscar ID do plano 'Academia Premium'
                $idPlanoAcademia = $this->buscarPlanoId('Academia Premium', 'academia');
                if (!$idPlanoAcademia) {
                    http_response_code(500);
                    echo json_encode(['success' => false, 'error' => 'Plano padrão para academia não encontrado.']);
                    return;
                }

                $stmt = $this->db->prepare("
                        INSERT INTO academias (nome, cnpj, email, senha, telefone, endereco, data_cadastro, idPlano, status_conta) 
                        VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, 'Ativa')
                    ");

                $success = $stmt->execute([
                    trim($data['nome']),
                    $cnpjFormatado,
                    trim($data['email']),
                    $senhaHash,
                    isset($data['telefone']) ? $this->formatarTelefone($data['telefone']) : null,
                    isset($data['endereco']) ? trim($data['endereco']) : null,
                    $idPlanoAcademia
                ]);

                if ($success) {
                    $academiaId = $this->db->lastInsertId();
                    // Criar assinatura para o plano da academia
                    $this->criarAssinatura($academiaId, 'academia', $idPlanoAcademia, 'ativa');

                    http_response_code(201);
                    echo json_encode([
                        'success' => true,
                        'idAcademia' => $academiaId,
                        'message' => 'Academia cadastrada com sucesso e plano atribuído.'
                    ]);
                } else {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'Erro ao cadastrar academia']);
                }
            } catch (PDOException $e) {
                if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'Dados já cadastrados no sistema']);
                } else {
                    http_response_code(500);
                    echo json_encode(['success' => false, 'error' => 'Erro ao cadastrar academia: ' . $e->getMessage()]);
                }
            }
        }

        private function calcularIdade($dataNascimento) {
            $hoje = new DateTime();
            $nascimento = new DateTime($dataNascimento);
            $idade = $hoje->diff($nascimento);
            return $idade->y;
        }

        private function salvarModalidadesUsuario($idUsuario, $tipoUsuario, $modalidades) {
            if (empty($modalidades)) return;
            
            $tabela = $tipoUsuario === 'aluno' ? 'modalidades_aluno' : 'modalidades_personal';
            $campoId = $tipoUsuario === 'aluno' ? 'idAluno' : 'idPersonal';
            
            foreach ($modalidades as $idModalidade) {
                $stmt = $this->db->prepare("INSERT INTO {$tabela} ({$campoId}, idModalidade) VALUES (?, ?)");
                $stmt->execute([$idUsuario, $idModalidade]);
            }
        }

        // Método para buscar aluno por ID
        private function buscarAlunoPorId($id){
            $stmt = $this->db->prepare("SELECT idAluno, nome, cpf, rg, email, numTel, data_cadastro, idPlano, status_conta FROM alunos WHERE idAluno = ?");
            $stmt->execute([$id]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        }


        // Método para buscar personal por ID
        private function buscarPersonalPorId($id){
            $stmt = $this->db->prepare("
                    SELECT idPersonal, nome, cpf, rg, 
                        cref_numero, cref_categoria, cref_regional, 
                        email, numTel, data_cadastro, idPlano, status_conta 
                    FROM personal 
                    WHERE idPersonal = ?
                ");
            $stmt->execute([$id]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        }

        // Validação básica de email
        private function validarEmail($email){
            return filter_var(trim($email), FILTER_VALIDATE_EMAIL) !== false;
        }

        // Validação básica de CPF
        private function validarCPF($cpf){
            $cpf = preg_replace('/[^0-9]/', '', $cpf);
            return strlen($cpf) === 11;
        }

        // Validação básica de telefone
        private function validarTelefone($telefone){
            $telefone = preg_replace('/[^0-9]/', '', $telefone);
            return strlen($telefone) >= 10 && strlen($telefone) <= 11;
        }

        // Validação básica de RG
        private function validarRG($rg){
            $rg = preg_replace('/[^0-9]/', '', $rg);
            return strlen($rg) >= 7 && strlen($rg) <= 12;
        }

        // Validação de CNPJ
        private function validarCNPJ($cnpj){
            $cnpj = preg_replace('/[^0-9]/', '', $cnpj);
            return strlen($cnpj) === 14;
        }

        // Função para formatar CPF antes de salvar no banco
        private function formatarCPF($cpf){
            return preg_replace('/[^0-9]/', '', $cpf);
        }

        // Função para formatar telefone antes de salvar no banco
        private function formatarTelefone($telefone){
            return preg_replace('/[^0-9]/', '', $telefone);
        }

        // Função para formatar CNPJ antes de salvar no banco
        private function formatarCNPJ($cnpj){
            return preg_replace('/[^0-9]/', '', $cnpj);
        }

        // Funções para verificar existência de email
        private function emailExiste($email){
            $stmt = $this->db->prepare("SELECT email FROM alunos WHERE email = ? UNION SELECT email FROM personal WHERE email = ? UNION SELECT email FROM academias WHERE email = ?");
            $stmt->execute([trim($email), trim($email), trim($email)]);
            return $stmt->fetch() !== false;
        }

        // Função para verificar existência de CPF
        private function cpfExiste($cpf){
            $cpfNumeros = preg_replace('/[^0-9]/', '', $cpf);
            $stmt = $this->db->prepare("SELECT cpf FROM alunos WHERE cpf = ? UNION SELECT cpf FROM personal WHERE cpf = ?");
            $stmt->execute([$cpfNumeros, $cpfNumeros]);
            return $stmt->fetch() !== false;
        }

        // Função para verificar existência de CNPJ
        private function cnpjExiste($cnpj){
            $cnpjNumeros = preg_replace('/[^0-9]/', '', $cnpj);
            $stmt = $this->db->prepare("SELECT cnpj FROM academias WHERE cnpj = ?");
            $stmt->execute([$cnpjNumeros]);
            return $stmt->fetch() !== false;
        }

        // Método para verificar disponibilidade de email
        public function verificarEmail($data){
            if (!isset($data['email'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Email não fornecido']);
                return;
            }

            $disponivel = !$this->emailExiste($data['email']);

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'disponivel' => $disponivel,
                'email' => $data['email']
            ]);
        }

        // Método para verificar disponibilidade de CPF
        public function verificarCpf($data){
            if (!isset($data['cpf'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'CPF não fornecido']);
                return;
            }

            $disponivel = !$this->cpfExiste($data['cpf']);

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'disponivel' => $disponivel,
                'cpf' => $data['cpf']
            ]);
        }

        // Método para verificar disponibilidade de CNPJ
        public function verificarCnpj($data){
            if (!isset($data['cnpj'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'CNPJ não fornecido']);
                return;
            }

            $disponivel = !$this->cnpjExiste($data['cnpj']);

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'disponivel' => $disponivel,
                'cnpj' => $data['cnpj']
            ]);
        }

        // Validações específicas do CREF

        // Validação do número CREF (apenas números, 6-9 dígitos)
        private function validarCREFNumero($crefNumero){
            $crefNumero = preg_replace('/[^0-9]/', '', $crefNumero);
            return strlen($crefNumero) >= 6 && strlen($crefNumero) <= 9;
        }

        // Validação da categoria CREF (1 letra)
        private function validarCREFCategoria($categoria){
            return preg_match('/^[A-Za-z]{1}$/', trim($categoria)) === 1;
        }

        // Validação da regional CREF (2-5 letras)
        private function validarCREFRegional($regional){
            return preg_match('/^[A-Za-z]{2,5}$/', trim($regional)) === 1;
        }

        // Função para verificar existência de CREF
        private function crefExiste($crefNumero){
            $crefNumeros = preg_replace('/[^0-9]/', '', $crefNumero);
            $stmt = $this->db->prepare("SELECT cref_numero FROM personal WHERE cref_numero = ?");
            $stmt->execute([$crefNumeros]);
            return $stmt->fetch() !== false;
        }

        public function verificarRg($data){
            if (!isset($data['rg'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'RG não fornecido']);
                return;
            }

            $rg = preg_replace('/[^0-9A-Za-z]/', '', $data['rg']); // limpa caracteres
            $disponivel = !$this->rgExiste($rg);

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'disponivel' => $disponivel,
                'rg' => $rg
            ]);
        }

        // Função privada pra checar se o RG já existe
        private function rgExiste($rg){
            $stmt = $this->db->prepare("SELECT rg FROM alunos WHERE rg = ? UNION SELECT rg FROM personal WHERE rg = ?");
            $stmt->execute([$rg, $rg]);
            return $stmt->fetch() !== false;
        }

        // Método para criar uma assinatura inicial
        private function criarAssinatura($idUsuario, $tipoUsuario, $idPlano, $status){
            $stmt = $this->db->prepare("
                    INSERT INTO assinaturas (idUsuario, tipo_usuario, idPlano, data_inicio, status)
                    VALUES (?, ?, ?, NOW(), ?)
                ");
            $stmt->execute([$idUsuario, $tipoUsuario, $idPlano, $status]);
        }
        // funções de formatação do CREF
        private function formatarCREFNumero($crefNumero){
            return preg_replace('/[^0-9]/', '', $crefNumero);
        }

        private function formatarCREFCategoria($categoria){
            return strtoupper(trim($categoria)); // deixa maiúscula e limpa espaços
        }

        private function formatarCREFRegional($regional){
            return strtoupper(trim($regional)); // deixa maiúscula e limpa espaços
        }

        private function academiaExiste($idAcademia){
            if (!$idAcademia) return true; // Academia é opcional
            
            $stmt = $this->db->prepare("SELECT idAcademia FROM academias WHERE idAcademia = ? AND status_conta = 'Ativa'");
            $stmt->execute([$idAcademia]);
            return $stmt->fetch() !== false;
        }

        public function listarAcademiasAtivas(){
            header('Content-Type: application/json');
            
            try {
                $stmt = $this->db->prepare("
                    SELECT idAcademia, nome, endereco, telefone 
                    FROM academias 
                    WHERE status_conta = 'Ativa'
                    ORDER BY nome
                ");
                $stmt->execute();
                $academias = $stmt->fetchAll(PDO::FETCH_ASSOC);

                http_response_code(200);
                echo json_encode([
                    'success' => true,
                    'data' => $academias
                ]);

            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'error' => 'Erro ao buscar academias: ' . $e->getMessage()
                ]);
            }
        }

        private function cadastrarEnderecoUsuario($idUsuario, $tipoUsuario, $data){
            try {
                $stmt = $this->db->prepare("
                    INSERT INTO enderecos_usuarios (
                        idUsuario, tipoUsuario, cep, logradouro, numero, complemento,
                        bairro, cidade, estado, pais, data_criacao
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
                ");

                $stmt->execute([
                    $idUsuario,
                    $tipoUsuario,
                    $data['cep'] ?? null,
                    $data['logradouro'] ?? null,
                    $data['numero'] ?? null,
                    $data['complemento'] ?? null,
                    $data['bairro'] ?? null,
                    $data['cidade'] ?? null,
                    $data['estado'] ?? null,
                    $data['pais'] ?? 'Brasil'
                ]);

                return true;
            } catch (PDOException $e) {
                error_log("Erro ao cadastrar endereço: " . $e->getMessage());
                return false;
            }
        }

        private function validarDadosEndereco($data){
            $errors = [];

            if (empty($data['cep'])) {
                $errors['cep'] = 'CEP é obrigatório';
            } elseif (strlen(preg_replace('/[^0-9]/', '', $data['cep'])) !== 8) {
                $errors['cep'] = 'CEP deve ter 8 dígitos';
            }

            if (empty($data['cidade'])) {
                $errors['cidade'] = 'Cidade é obrigatória';
            }

            if (empty($data['estado'])) {
                $errors['estado'] = 'Estado é obrigatório';
            } elseif (strlen($data['estado']) !== 2) {
                $errors['estado'] = 'Estado deve ter 2 caracteres';
            }

            return $errors;
        }

        public function completarCadastroAcademia($data) {
            try {
                $idAcademia = $data['idAcademia'] ?? null;
                if (!$idAcademia) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'ID da academia é obrigatório']);
                    return;
                }

                // Atualizar dados principais - foto_url é opcional
                $stmt = $this->db->prepare("
                    UPDATE academias 
                    SET endereco = ?, foto_url = ?, cadastro_completo = 1
                    WHERE idAcademia = ?
                ");

                $enderecoCompleto = implode(', ', array_filter([
                    $data['logradouro'] ?? null,
                    $data['numero'] ?? null,
                    $data['bairro'] ?? null,
                    $data['cidade'] ?? null,
                    $data['estado'] ?? null
                ]));

                $success = $stmt->execute([
                    $enderecoCompleto,
                    $data['foto_url'] ?? null, // URL da foto (opcional)
                    $idAcademia
                ]);

                if ($success) {
                    // Processar modalidades da academia
                    if (isset($data['modalidades']) && is_array($data['modalidades'])) {
                        $this->vincularModalidadesAcademia($idAcademia, $data['modalidades']);
                    }

                    http_response_code(200);
                    echo json_encode([
                        'success' => true,
                        'message' => 'Cadastro completado com sucesso'
                    ]);
                } else {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'Erro ao completar cadastro']);
                }

            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Erro ao completar cadastro: ' . $e->getMessage()]);
            }
        }

        public function completarCadastroAluno($data) {
            try {
                $idAluno = $data['idAluno'] ?? null;
                if (!$idAluno) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'ID do aluno é obrigatório']);
                    return;
                }

                // Validar dados do perfil
                $erros = $this->validarDadosPerfil($data);
                if (!empty($erros)) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => implode(', ', $erros)]);
                    return;
                }

                // Atualizar dados principais - foto_url é opcional
                $stmt = $this->db->prepare("
                    UPDATE alunos 
                    SET data_nascimento = ?, genero = ?, altura = ?, meta = ?, 
                        treinoTipo = ?, treinos_adaptados = ?, foto_url = ?, cadastro_completo = 1
                    WHERE idAluno = ?
                ");

                $success = $stmt->execute([
                    $data['data_nascimento'] ?? null,
                    $data['genero'] ?? null,
                    $data['altura'] ?? null,
                    $data['meta'] ?? null,
                    $data['treinoTipo'] ?? null,
                    $data['treinos_adaptados'] ?? 0,
                    $data['foto_url'] ?? null, // URL da foto (opcional)
                    $idAluno
                ]);

                if ($success) {
                    // Processar modalidades
                    if (isset($data['modalidades']) && is_array($data['modalidades'])) {
                        $this->vincularModalidadesAluno($idAluno, $data['modalidades']);
                    }

                    http_response_code(200);
                    echo json_encode([
                        'success' => true,
                        'message' => 'Cadastro completado com sucesso'
                    ]);
                } else {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'Erro ao completar cadastro']);
                }

            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Erro ao completar cadastro: ' . $e->getMessage()]);
            }
        }

        public function completarCadastroPersonal($data) {
            try {
                $idPersonal = $data['idPersonal'] ?? null;
                if (!$idPersonal) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'ID do personal é obrigatório']);
                    return;
                }

                // Validar dados do perfil
                $erros = $this->validarDadosPerfil($data);
                if (!empty($erros)) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => implode(', ', $erros)]);
                    return;
                }

                // Atualizar dados principais - foto_url é opcional
                $stmt = $this->db->prepare("
                    UPDATE personal 
                    SET data_nascimento = ?, genero = ?, foto_url = ?, 
                        sobre = ?, treinos_adaptados = ?, cadastro_completo = 1
                    WHERE idPersonal = ?
                ");

                $success = $stmt->execute([
                    $data['data_nascimento'] ?? null,
                    $data['genero'] ?? null,
                    $data['foto_url'] ?? null, // URL da foto (opcional)
                    $data['sobre'] ?? null,
                    $data['treinos_adaptados'] ?? 0,
                    $idPersonal
                ]);

                if ($success) {
                    // Processar modalidades
                    if (isset($data['modalidades']) && is_array($data['modalidades'])) {
                        $this->vincularModalidadesPersonal($idPersonal, $data['modalidades']);
                    }

                    http_response_code(200);
                    echo json_encode([
                        'success' => true,
                        'message' => 'Cadastro completado com sucesso'
                    ]);
                } else {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'Erro ao completar cadastro']);
                }

            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Erro ao completar cadastro: ' . $e->getMessage()]);
            }
        }


        /**
         * LISTAR MODALIDADES
         */
        public function listarModalidades() {
            header('Content-Type: application/json');
            
            try {
                $stmt = $this->db->prepare("
                    SELECT idModalidade, nome, descricao 
                    FROM modalidades 
                    WHERE ativo = 1 
                    ORDER BY nome
                ");
                $stmt->execute();
                $modalidades = $stmt->fetchAll(PDO::FETCH_ASSOC);

                http_response_code(200);
                echo json_encode([
                    'success' => true,
                    'data' => $modalidades
                ]);

            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'error' => 'Erro ao buscar modalidades: ' . $e->getMessage()
                ]);
            }
        }

        private function vincularModalidadesAcademia($idAcademia, $modalidades) {
            // Limpar modalidades existentes
            $stmt = $this->db->prepare("DELETE FROM modalidades_academia WHERE idAcademia = ?");
            $stmt->execute([$idAcademia]);

            // Inserir novas modalidades
            $stmt = $this->db->prepare("INSERT INTO modalidades_academia (idAcademia, idModalidade) VALUES (?, ?)");
            
            foreach ($modalidades as $idModalidade) {
                if (is_numeric($idModalidade)) {
                    $stmt->execute([$idAcademia, $idModalidade]);
                }
            }
        }

        /**
         * VINCULAR MODALIDADES AO ALUNO
         */
        private function vincularModalidadesAluno($idAluno, $modalidades) {
            // Limpar modalidades existentes
            $stmt = $this->db->prepare("DELETE FROM modalidades_aluno WHERE idAluno = ?");
            $stmt->execute([$idAluno]);

            // Inserir novas modalidades
            $stmt = $this->db->prepare("INSERT INTO modalidades_aluno (idAluno, idModalidade) VALUES (?, ?)");
            
            foreach ($modalidades as $idModalidade) {
                if (is_numeric($idModalidade)) {
                    $stmt->execute([$idAluno, $idModalidade]);
                }
            }
        }

        /**
         * VINCULAR MODALIDADES AO PERSONAL
         */
        private function vincularModalidadesPersonal($idPersonal, $modalidades) {
            // Limpar modalidades existentes
            $stmt = $this->db->prepare("DELETE FROM modalidades_personal WHERE idPersonal = ?");
            $stmt->execute([$idPersonal]);

            // Inserir novas modalidades
            $stmt = $this->db->prepare("INSERT INTO modalidades_personal (idPersonal, idModalidade) VALUES (?, ?)");
            
            foreach ($modalidades as $idModalidade) {
                if (is_numeric($idModalidade)) {
                    $stmt->execute([$idPersonal, $idModalidade]);
                }
            }
        }

        /**
         * VALIDAR DADOS DO PERFIL
         */
        private function validarDadosPerfil($data) {
            $erros = [];

            if (isset($data['data_nascimento'])) {
                $dataNasc = DateTime::createFromFormat('Y-m-d', $data['data_nascimento']);
                $hoje = new DateTime();
                
                if (!$dataNasc || $dataNasc > $hoje) {
                    $erros[] = 'Data de nascimento inválida';
                } else {
                    $idade = $hoje->diff($dataNasc)->y;
                    if ($idade < 12 || $idade > 120) {
                        $erros[] = 'Idade deve estar entre 12 e 120 anos';
                    }
                }
            }

            if (isset($data['altura']) && ($data['altura'] < 100 || $data['altura'] > 250)) {
                $erros[] = 'Altura deve estar entre 100cm e 250cm';
            }

            if (isset($data['genero']) && !in_array($data['genero'], ['Masculino', 'Feminino', 'Outro'])) {
                $erros[] = 'Gênero inválido';
            }

            return $erros;
        }

    }

?>

UploadController.php:

<?php

    require_once __DIR__ . '/../Config/db.connect.php';

    class UploadController {
        private $db;

        public function __construct() {
            $this->db = DB::connectDB();
        }

        public function uploadFotoPerfil($data) {
            try {
                // Verificar se é um upload de arquivo
                if (!isset($_FILES['foto']) || $_FILES['foto']['error'] !== UPLOAD_ERR_OK) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'Nenhum arquivo enviado ou erro no upload']);
                    return;
                }

                $arquivo = $_FILES['foto'];
                
                // Validar tipo de arquivo
                $tiposPermitidos = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
                if (!in_array($arquivo['type'], $tiposPermitidos)) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'Tipo de arquivo não permitido. Use: JPG, PNG, GIF ou WebP']);
                    return;
                }

                // Validar tamanho (máximo 5MB)
                if ($arquivo['size'] > 5 * 1024 * 1024) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'Arquivo muito grande. Máximo: 5MB']);
                    return;
                }

                // Criar diretório se não existir
                $diretorioDestino = __DIR__ . '/../../public/assets/images/uploads/';
                if (!is_dir($diretorioDestino)) {
                    mkdir($diretorioDestino, 0755, true);
                }

                // Gerar nome único para o arquivo
                $extensao = pathinfo($arquivo['name'], PATHINFO_EXTENSION);
                $nomeArquivo = 'perfil_' . time() . '_' . uniqid() . '.' . $extensao;
                $caminhoCompleto = $diretorioDestino . $nomeArquivo;

                // Mover arquivo para o diretório de destino
                if (move_uploaded_file($arquivo['tmp_name'], $caminhoCompleto)) {
                    // URL relativa para acesso via frontend
                    $urlRelativa = '/assets/images/uploads/' . $nomeArquivo;
                    
                    http_response_code(200);
                    echo json_encode([
                        'success' => true,
                        'url' => $urlRelativa,
                        'nome_arquivo' => $nomeArquivo,
                        'message' => 'Foto uploadada com sucesso'
                    ]);
                } else {
                    http_response_code(500);
                    echo json_encode(['success' => false, 'error' => 'Erro ao salvar arquivo']);
                }

            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Erro interno: ' . $e->getMessage()]);
            }
        }

        // Método para salvar URL da foto no banco de dados
        public function salvarFotoUsuario($data) {
            try {
                if (!isset($data['idUsuario']) || !isset($data['tipoUsuario']) || !isset($data['foto_url'])) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'Dados incompletos']);
                    return;
                }

                $idUsuario = $data['idUsuario'];
                $tipoUsuario = $data['tipoUsuario'];
                $fotoUrl = $data['foto_url'];

                // Determinar a tabela e coluna baseado no tipo de usuário
                switch ($tipoUsuario) {
                    case 'aluno':
                        $tabela = 'alunos';
                        $colunaId = 'idAluno';
                        $colunaFoto = 'foto_url';
                        break;
                    case 'personal':
                        $tabela = 'personal';
                        $colunaId = 'idPersonal';
                        $colunaFoto = 'foto_url';
                        break;
                    case 'academia':
                        $tabela = 'academias';
                        $colunaId = 'idAcademia';
                        $colunaFoto = 'foto_url';
                        break;
                    default:
                        http_response_code(400);
                        echo json_encode(['success' => false, 'error' => 'Tipo de usuário inválido']);
                        return;
                }

                // Primeiro, buscar foto antiga para deletar
                $stmt = $this->db->prepare("SELECT {$colunaFoto} FROM {$tabela} WHERE {$colunaId} = ?");
                $stmt->execute([$idUsuario]);
                $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

                // Deletar foto antiga se existir
                if ($usuario && $usuario[$colunaFoto]) {
                    $this->deletarFotoArquivo($usuario[$colunaFoto]);
                }

                // Atualizar com nova foto
                $stmt = $this->db->prepare("UPDATE {$tabela} SET {$colunaFoto} = ? WHERE {$colunaId} = ?");
                $success = $stmt->execute([$fotoUrl, $idUsuario]);

                if ($success) {
                    echo json_encode([
                        'success' => true,
                        'message' => 'Foto salva com sucesso',
                        'foto_url' => $fotoUrl
                    ]);
                } else {
                    http_response_code(500);
                    echo json_encode(['success' => false, 'error' => 'Erro ao salvar foto no banco de dados']);
                }

            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Erro interno: ' . $e->getMessage()]);
            }
        }

        // Método para obter foto atual do usuário
        public function obterFotoUsuario($data) {
            try {
                if (!isset($data['idUsuario']) || !isset($data['tipoUsuario'])) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'Dados incompletos']);
                    return;
                }

                $idUsuario = $data['idUsuario'];
                $tipoUsuario = $data['tipoUsuario'];

                // Determinar a tabela e coluna baseado no tipo de usuário
                switch ($tipoUsuario) {
                    case 'aluno':
                        $tabela = 'alunos';
                        $colunaId = 'idAluno';
                        $colunaFoto = 'foto_url';
                        break;
                    case 'personal':
                        $tabela = 'personal';
                        $colunaId = 'idPersonal';
                        $colunaFoto = 'foto_url';
                        break;
                    case 'academia':
                        $tabela = 'academias';
                        $colunaId = 'idAcademia';
                        $colunaFoto = 'foto_url';
                        break;
                    default:
                        http_response_code(400);
                        echo json_encode(['success' => false, 'error' => 'Tipo de usuário inválido']);
                        return;
                }

                // Buscar foto atual
                $stmt = $this->db->prepare("SELECT {$colunaFoto} FROM {$tabela} WHERE {$colunaId} = ?");
                $stmt->execute([$idUsuario]);
                $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($usuario) {
                    echo json_encode([
                        'success' => true,
                        'foto_url' => $usuario[$colunaFoto],
                        'tem_foto' => !empty($usuario[$colunaFoto])
                    ]);
                } else {
                    echo json_encode([
                        'success' => true,
                        'foto_url' => null,
                        'tem_foto' => false
                    ]);
                }

            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Erro interno: ' . $e->getMessage()]);
            }
        }

        // Método para deletar arquivo físico
        private function deletarFotoArquivo($fotoUrl) {
            try {
                if (empty($fotoUrl)) return;

                // Extrair nome do arquivo da URL
                $nomeArquivo = basename($fotoUrl);
                $diretorioDestino = __DIR__ . '/../../public/assets/images/uploads/';
                $caminhoCompleto = $diretorioDestino . $nomeArquivo;

                if (file_exists($caminhoCompleto) && is_file($caminhoCompleto)) {
                    unlink($caminhoCompleto);
                }
            } catch (Exception $e) {
                // Logar erro mas não interromper o processo
                error_log("Erro ao deletar arquivo: " . $e->getMessage());
            }
        }

        // Método para deletar foto via API
        public function deletarFotoPerfil($data) {
            try {
                if (!isset($data['nome_arquivo'])) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'Nome do arquivo não fornecido']);
                    return;
                }

                $diretorioDestino = __DIR__ . '/../../public/assets/images/uploads/';
                $caminhoCompleto = $diretorioDestino . $data['nome_arquivo'];

                if (file_exists($caminhoCompleto) && unlink($caminhoCompleto)) {
                    echo json_encode(['success' => true, 'message' => 'Foto deletada com sucesso']);
                } else {
                    echo json_encode(['success' => false, 'error' => 'Arquivo não encontrado ou erro ao deletar']);
                }

            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Erro interno: ' . $e->getMessage()]);
            }
        }
    }

?>

routes.php:

<?php

    // Incluir jwt.config.php uma vez
    require_once __DIR__ . '/../Config/jwt.config.php';

    // Define as rotas do sistema
    $routes = [

        // Rota para raiz (URL vazia)
        '' =>[
            'controller' => 'ConfigController',
            'method' => 'bemVindo'
        ],
        //Rota Padrão
        '/' =>[
            'controller' => 'ConfigController',
            'method' => 'bemVindo'
        ],

        // Rotas para Cadastro
        'cadastro/aluno' => [
            'controller' => 'CadastroController',
            'method' => 'cadastrarAluno'
        ],
        'cadastro/personal' => [
            'controller' => 'CadastroController',
            'method' => 'cadastrarPersonal'
        ],
        'cadastro/academia' => [
            'controller' => 'CadastroController',
            'method' => 'cadastrarAcademia'
        ],
        'cadastro/dev' => [
            'controller' => 'CadastroController',
            'method' => 'cadastrarDev'
        ],
        'cadastro/verificar-email' => [
            'controller' => 'CadastroController',
            'method' => 'verificarEmail'
        ],
        'cadastro/verificar-cpf' => [
            'controller' => 'CadastroController',
            'method' => 'verificarCpf'
        ],
        'cadastro/verificar-rg' => [
            'controller' => 'CadastroController',
            'method' => 'verificarRg'
        ],
        'cadastro/verificar-cnpj' => [
            'controller' => 'CadastroController',
            'method' => 'verificarCnpj'
        ],
        'cadastro/completar-aluno' => [
            'controller' => 'CadastroController',
            'method' => 'completarCadastroAluno'
        ],
        'cadastro/completar-personal' => [
            'controller' => 'CadastroController',
            'method' => 'completarCadastroPersonal'
        ],
        'cadastro/completar-academia' => [
            'controller' => 'CadastroController',
            'method' => 'completarCadastroAcademia'
        ],
        'cadastro/modalidades' => [
            'controller' => 'CadastroController',
            'method' => 'listarModalidades'
        ],

        // Rota para upload de foto de perfil
        'upload/foto-perfil' => [
            'controller' => 'UploadController',
            'method' => 'uploadFotoPerfil'
        ],
        'upload/salvar-foto-usuario' => [
            'controller' => 'UploadController',
            'method' => 'salvarFotoUsuario'
        ],
        'upload/obter-foto-usuario' => [
            'controller' => 'UploadController',
            'method' => 'obterFotoUsuario'
        ],
        'upload/deletar-foto' => [
            'controller' => 'UploadController',
            'method' => 'deletarFotoPerfil'
        ],

        // Rotas para Autenticação
        'auth/login' => [
            'controller' => 'AuthController',
            'method' => 'login'
        ],
        'auth/logout' => [
            'controller' => 'AuthController',
            'method' => 'logout'
        ],
        'auth/verificar-token' => [
            'controller' => 'AuthController',
            'method' => 'verificarToken'
        ],
        'auth/obter-usuario' => [
            'controller' => 'AuthController',
            'method' => 'obterUsuarioToken'
        ],
        'auth/verificar-autenticacao' => [
            'controller' => 'AuthController',
            'method' => 'verificarAutenticacao'
        ],

        // =============================
        // ROTAS PARA EXERCÍCIOS CONTROLLER 
        // =============================

        // Exercícios - Buscas gerais
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
        'exercicios/por-tipo/([a-zA-Z]+)' => [
            'controller' => 'ExerciciosController',
            'method' => 'buscarExerciciosPorTipo'
        ],

        // Exercícios - CRUD tradicional (para admins)
        'exercicios/cadastrar' => [
            'controller' => 'ExerciciosController',
            'method' => 'cadastrarExercicio'
        ],
        'exercicios/atualizar' => [
            'controller' => 'ExerciciosController',
            'method' => 'atualizarExercicio'
        ],
        'exercicios/atualizar/(\d+)' => [
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
        'exercicios/listarGruposMusculares' => [
            'controller' => 'ExerciciosController',
            'method' => 'listarGruposMusculares'
        ],

        // Exercícios - Funcionalidades para Personais

        'exercicios/normais' => [
            'controller' => 'ExerciciosController',
            'method' => 'buscarExerciciosNormais'
        ],
        'exercicios/adaptados' => [
            'controller' => 'ExerciciosController',
            'method' => 'buscarExerciciosAdaptados'
        ],
        'exercicios/meus-exercicios' => [
            'controller' => 'ExerciciosController',
            'method' => 'buscarMeusExercicios'
        ],
        'exercicios/por-tipo/([a-zA-Z]+)' => [
            'controller' => 'ExerciciosController',
            'method' => 'buscarExerciciosPorTipo'
        ],
        'exercicios/cadastrar-personal' => [
            'controller' => 'ExerciciosController',
            'method' => 'cadastrarExercicioPersonal'
        ],

        // Exercícios - Buscas específicas
        'exercicios/globais' => [
            'controller' => 'ExerciciosController',
            'method' => 'buscarExerciciosGlobais'
        ],
        'exercicios/para-aluno' => [
            'controller' => 'ExerciciosController',
            'method' => 'buscarExerciciosParaAluno'
        ],

        // Rota para buscar exercício com vídeos
        'exercicios/exercicioComVideos/(\w+)/(\d+)' => [
            'controller' => 'ExerciciosController',
            'method' => 'buscarExercicioComVideos'
        ],

        // =============================
        // ROTAS PARA TREINOS CONTROLLER 
        // =============================

        // Criar treino (básico)
        'treinos/criar' => [
            'controller' => 'TreinosController',
            'method' => 'criarTreino'
        ],

        // Atualizar treino (nome, tipo, descrição)
        'treinos/atualizar/(\d+)' => [
            'controller' => 'TreinosController',
            'method' => 'atualizarTreino'
        ],

        // Adicionar exercício ao treino
        'treinos/(\d+)/adicionar-exercicio' => [
            'controller' => 'TreinosController',
            'method' => 'adicionarExercicioAoTreino'
        ],

        // Listar treinos do aluno
        'treinos/aluno/(\d+)' => [
            'controller' => 'TreinosController',
            'method' => 'listarTreinosAluno'
        ],

        // Listar treinos do personal
        'treinos/personal/(\d+)' => [
            'controller' => 'TreinosController',
            'method' => 'listarTreinosPersonal'
        ],

        'treinos/aluno' => [
            'controller' => 'TreinosController',
            'method' => 'listarTreinosAluno'
        ],

        'treinos/aluno/personal/(\d+)' => [
            'controller' => 'TreinosController',
            'method' => 'listarTreinosAlunoComPersonal'
        ],

        // Atribuir treino a aluno
        'treinos/atribuir' => [
            'controller' => 'TreinosController',
            'method' => 'atribuirTreinoAluno'
        ],

        // Excluir treino
        'treinos/excluir/(\d+)' => [
            'controller' => 'TreinosController',
            'method' => 'excluirTreino',
            'http_method' => 'DELETE'
        ],

        // Listar alunos do personal
        'treinos/personal/(\d+)/alunos' => [
            'controller' => 'TreinosController',
            'method' => 'listarAlunosDoPersonal'
        ],

        // Listar treinos atribuídos a um aluno específico
        'treinos/personal/(\d+)/aluno/(\d+)' => [
            'controller' => 'TreinosController',
            'method' => 'listarTreinosDoAlunoAtribuidos'
        ],

        // Atualizar treino atribuído
        'treinos/atribuido/(\d+)/atualizar' => [
            'controller' => 'TreinosController',
            'method' => 'atualizarTreinoAtribuido'
        ],

        // Desatribuir treino do aluno
        'treinos/atribuido/(\d+)/desatribuir' => [
            'controller' => 'TreinosController',
            'method' => 'desatribuirTreinoDoAluno'
        ],

        // Desvincular aluno do personal
        'personal/(\d+)/desvincular-aluno/(\d+)' => [
            'controller' => 'TreinosController',
            'method' => 'desvincularAluno'
        ],

        // Listar meus treinos (personal)
        'treinos/personal/(\d+)/meus-treinos' => [
            'controller' => 'TreinosController',
            'method' => 'listarMeusTreinosPersonal'
        ],

        // Buscar exercícios para treino
        'treinos/buscarExercicios' => [
            'controller' => 'TreinosController',
            'method' => 'buscarExercicios'
        ],

        'treinos/(\d+)/exercicios' => [
            'controller' => 'TreinosController',
            'method' => 'listarExerciciosDoTreino'
        ],

        // Atualizar exercício no treino
        'treinos/exercicio/(\d+)/atualizar' => [
            'controller' => 'TreinosController',
            'method' => 'atualizarExercicioNoTreino'
        ],

        // Remover exercício do treino
        'treinos/exercicio/(\d+)/remover' => [
            'controller' => 'TreinosController',
            'method' => 'removerExercicioDoTreino'
        ],

        // Listar treinos do usuário autenticado
        'treinos/listarUsuario' => [
            'controller' => 'TreinosController',
            'method' => 'listarTreinosUsuario'
        ],

        // Buscar treino completo com exercícios e vídeos
        'treinos/buscarCompleto/(\d+)' => [
            'controller' => 'TreinosController',
            'method' => 'buscarTreinoCompleto'
        ],

        // Rotas para sessões/histórico de treinos
        'treinos/historico' => [
            'controller' => 'TreinosController',
            'method' => 'getHistoricoTreinos'
        ],
        'treinos/criar-sessao' => [
            'controller' => 'TreinosController',
            'method' => 'criarSessaoTreino'
        ],
        'treinos/finalizar-sessao/(\d+)' => [  // (\d+) para capturar o ID como parâmetro
            'controller' => 'TreinosController',
            'method' => 'finalizarSessaoTreino'
        ],
        'treinos/retomar-sessao/(\d+)' => [  // (\d+) para capturar o ID
            'controller' => 'TreinosController',
            'method' => 'getSessaoParaRetomar'
        ],

        // =============================
        // ROTAS PARA VÍDEOS CONTROLLER
        // =============================
        
        'videos/upload' => [
            'controller' => 'VideosController',
            'method' => 'uploadVideo'
        ],
        'videos/associar-exercicio' => [
            'controller' => 'VideosController',
            'method' => 'associarVideoExercicio'
        ],
        'videos/exercicio/(\d+)' => [
            'controller' => 'VideosController',
            'method' => 'buscarVideosPorExercicio'
        ],

        // =============================
        // ROTAS PARA ALIMENTOS CONTROLLER
        // =============================

        'alimentos/buscar' => [
            'controller' => 'AlimentosController',
            'method' => 'buscarAlimentos'
        ],
        'alimentos/informacao' => [
            'controller' => 'AlimentosController',
            'method' => 'buscarInformacaoAlimento'
        ],
        'alimentos/testar-traducao' => [
            'controller' => 'AlimentosController',
            'method' => 'testarTraducao'
        ],
        'alimentos/listar' => [
            'controller' => 'AlimentosController',
            'method' => 'listarAlimentos'
        ],
        'alimentos/adicionar' => [
            'controller' => 'AlimentosController',
            'method' => 'addAlimento'
        ],
        'alimentos/remover' => [
            'controller' => 'AlimentosController',
            'method' => 'rmvAlimento'
        ],
        'alimentos/atualizar' => [
            'controller' => 'AlimentosController',
            'method' => 'updAlimento'
        ],
        'alimentos/totais' => [
            'controller' => 'AlimentosController',
            'method' => 'listarTotais'
        ],

        'alimentos/diagnosticar-busca' => [
            'controller' => 'AlimentosController',
            'method' => 'diagnosticarBusca'
        ],

        // Rotas para Refeições
        'alimentos/listar-refeicoes' => [
            'controller' => 'AlimentosController',
            'method' => 'listarRefeicoes'
        ],
        'alimentos/listar-refeicoes-simples' => [
            'controller' => 'AlimentosController',
            'method' => 'listarRefeicoesSimples'
        ],
        'alimentos/criar-refeicao' => [
            'controller' => 'AlimentosController',
            'method' => 'criarRefeicao'
        ],
        'alimentos/remover-refeicao' => [
            'controller' => 'AlimentosController',
            'method' => 'removerRefeicao'
        ],
        'alimentos/refeicoes-hoje' => [
            'controller' => 'AlimentosController',
            'method' => 'listarRefeicoesHoje'
        ],
        'alimentos/adicionar-refeicao' => [
            'controller' => 'AlimentosController',
            'method' => 'adicionarAlimentoRefeicao'
        ],
        'alimentos/refeicao/(\d+)' => [
            'controller' => 'AlimentosController',
            'method' => 'listarAlimentosRefeicao'
        ],
        'alimentos/refeicao/alimentos' => [
            'controller' => 'AlimentosController',
            'method' => 'listarAlimentosRefeicao'
        ],

        'alimentos/diagnosticar' => [
            'controller' => 'AlimentosController',
            'method' => 'diagnosticarRefeicoes'
        ],
        'alimentos/diagnosticar-alimentos' => [
            'controller' => 'AlimentosController',
            'method' => 'diagnosticarAlimentos'
        ],

        // Rota para testar conexão
        'config/testarConexao' => [
            'controller' => 'ConfigController',
            'method' => 'testarConexaoDB'
        ],

        // Rotas para ConvitesController
        'convites/criar' => [
            'controller' => 'ConvitesController',
            'method' => 'criarConvite'
        ],
        'convites/([^/]+)' => [
            'controller' => 'ConvitesController',
            'method' => 'getConvites'
        ],

        'convites/(\d+)/aceitar' => [
            'controller' => 'ConvitesController',
            'method' => 'aceitarConvite'
        ],
        'convites/(\d+)/negar' => [
            'controller' => 'ConvitesController',
            'method' => 'negarConvite'
        ],

        // Rotas para Recuperação de Senha
        'recuperacao-senha/esqueci-senha' => [
            'controller' => 'RecuperacaoSenhaController',
            'method' => 'esqueciSenha'
        ],
        'recuperacao-senha/resetar-senha' => [
            'controller' => 'RecuperacaoSenhaController',
            'method' => 'resetarSenha'
        ],

        // Rotas para Perfil

        'perfil/usuario/([A-Za-z0-9@._-]+)' => [
            'controller' => 'PerfilController',
            'method' => 'getUsuarioPorEmail'
        ],

        'perfil/atualizar' => [
            'controller' => 'PerfilController',
            'method' => 'atualizarPerfil',
            'http_method' => 'PUT'
        ],

        'perfil/aluno/(\d+)' => [
            'controller' => 'PerfilController',
            'method' => 'getPerfilAluno'
        ],
        'perfil/aluno' => [
            'controller' => 'PerfilController',
            'method' => 'postPerfilAluno'
        ],
        'perfil/aluno/(\d+)' => [
            'controller' => 'PerfilController',
            'method' => 'putPerfilAluno'
        ],

        'perfil/personalNM/(\d+)' => [
            'controller' => 'PerfilController', // ou PersonalController
            'method' => 'getPersonalPorId'
        ],

        'perfil/personal/(\d+)' => [
            'controller' => 'PerfilController',
            'method' => 'getPerfilPersonal'
        ],
        'perfil/personal' => [
            'controller' => 'PerfilController',
            'method' => 'postPerfilPersonal'
        ],
        'perfil/personal/(\d+)' => [
            'controller' => 'PerfilController',
            'method' => 'putPerfilPersonal'
        ],
        'perfil/academia/(\d+)' => [
            'controller' => 'PerfilController',
            'method' => 'getPerfilAcademia'
        ],
        'perfil/academia' => [
            'controller' => 'PerfilController',
            'method' => 'postPerfilAcademia'
        ],
        'perfil/academia/(\d+)' => [
            'controller' => 'PerfilController',
            'method' => 'putPerfilAcademia'
        ],
        'perfil/dev/(\d+)' => [
            'controller' => 'PerfilController',
            'method' => 'getPerfilDev'
        ],
        'perfil/dev' => [
            'controller' => 'PerfilController',
            'method' => 'putPerfilDev'
        ],
        'perfil/personal/(\d+)/alunos' => [
            'controller' => 'PerfilController',
            'method' => 'getAlunosDoPersonal'
        ],
        'perfil/personal/(\d+)/treinos-criados' => [
            'controller' => 'PerfilController',
            'method' => 'getTreinosCriadosPorPersonal'
        ],
        'perfil/plano' => [
            'controller' => 'PerfilController',
            'method' => 'getPlanoUsuario'
        ],
        'perfil/plano/trocar' => [
            'controller' => 'PerfilController',
            'method' => 'trocarPlano'
        ],
        'perfil/plano/cancelar' => [
            'controller' => 'PerfilController',
            'method' => 'cancelarPlano'
        ],
        'perfil/excluir-conta' => [
            'controller' => 'PerfilController',
            'method' => 'excluirConta'
        ],

        // Rotas para Planos
        'planos' => [
            'controller' => 'PlanosController',
            'method' => 'getAllPlanos'
        ],
        'planos/(\d+)' => [
            'controller' => 'PlanosController',
            'method' => 'getPlanoById'
        ],
        'planos/criar' => [
            'controller' => 'PlanosController',
            'method' => 'createPlano'
        ],
        'planos/atualizar/(\d+)' => [
            'controller' => 'PlanosController',
            'method' => 'updatePlano'
        ],
        'planos/deletar/(\d+)' => [
            'controller' => 'PlanosController',
            'method' => 'deletePlano'
        ],

        // Rotas para Pagamentos
        'pagamentos/iniciar' => [
            'controller' => 'PagamentosController',
            'method' => 'iniciarPagamento'
        ],
        'pagamentos/confirmar' => [
            'controller' => 'PagamentosController',
            'method' => 'confirmarPagamento'
        ],
        'pagamentos/historico' => [
            'controller' => 'PagamentosController',
            'method' => 'getHistoricoPagamentos'
        ],

        // Rotas Conectar Aluno/Personal

        'academias' => [
            'controller' => 'ConnectPersonalController', 
            'method' => 'listarAcademias'
        ],
        'academias-ativas' => [
            'controller' => 'CadastroController',
            'method' => 'listarAcademiasAtivas'
        ],
        'personais' => [
            'controller' => 'ConectarPersonalController',
            'method' => 'listarPersonais'
        ],
        'alunos' => [
            'controller' => 'ConectarPersonalController', 
            'method' => 'listarAlunos'
        ],
        'convite' => [
            'controller' => 'ConectarPersonalController',
            'method' => 'enviarConvite'
        ],
        'modalidades' => [
            'controller' => 'ConectarPersonalController',
            'method' => 'listarModalidades'
        ],
        'meus-convites' => [
            'controller' => 'ConectarPersonalController',
            'method' => 'meusConvites'
        ],
    ];

    // Mapeamento de controladores - ADICIONAR VideosController
    $controller_paths = [
        'CadastroController' => __DIR__ . '/../Controllers/CadastroController.php',
        'AuthController' => __DIR__ . '/../Controllers/AuthController.php',
        'ExerciciosController' => __DIR__ . '/../Controllers/ExerciciosController.php',
        'ConfigController' => __DIR__ . '/../Config/ConfigController.php',
        'AlimentosController' => __DIR__ . '/../Controllers/AlimentosController.php',
        'TreinosController' => __DIR__ . '/../Controllers/TreinosController.php',
        'ConvitesController' => __DIR__ . '/../Controllers/ConvitesController.php',
        'RecuperacaoSenhaController' => __DIR__ . '/../Controllers/RecuperacaoSenhaController.php',
        'PerfilController' => __DIR__ . '/../Controllers/PerfilController.php',
        'PlanosController' => __DIR__ . '/../Controllers/PlanosController.php',
        'PagamentosController' => __DIR__ . '/../Controllers/PagamentosController.php',
        'VideosController' => __DIR__ . '/../Controllers/VideosController.php',
        'ConectarPersonalController' => __DIR__ . '/../Controllers/ConectarPersonalController.php',
        'UploadController' => __DIR__ . '/../Controllers/UploadController.php',
    ];

    // ATUALIZAR Rotas Públicas - Adicionar novas rotas públicas
    $rotasPublicas = [
        '',
        '/',
        'auth/login',
        'auth/verificar-token',
        'auth/logout',
        'auth/obter-usuario',
        'auth/verificar-autenticacao',
        'cadastro/aluno',
        'cadastro/personal',
        'cadastro/academia',
        'cadastro/dev',
        'cadastro/verificar-email',
        'cadastro/verificar-cpf',
        'cadastro/verificar-rg',
        'cadastro/verificar-cnpj',
        'config/testarConexao',
        'recuperacao-senha/esqueci-senha',
        'recuperacao-senha/resetar-senha',
        'alimentos/buscar',
        'alimentos/informacao',
        'alimentos/testar-traducao',
        'convites/email/([^/]+)',
        'convites/([a-zA-Z0-9]{64})',
        'perfil/aluno/(\d+)',
        'perfil/personal/(\d+)',
        'perfil/academia/(\d+)',
        'perfil/dev/(\d+)',
        'perfil/aluno',
        'perfil/personal',
        'perfil/academia',
        'planos',
        'planos/(\d+)',
        'exercicios/buscarTodos',
        'exercicios/globais',
        'academias-ativas',
        'modalidades',
        'personais',
        'alunos',
        'academias',
        'meus-convites',
        'convite',
        'upload/foto-perfil',
        'upload/salvar-foto-usuario',
        'upload/obter-foto-usuario',
        'upload/deletar-foto',
        'cadastro/modalidades',
    ];

    // Função para despachar a requisição
    function dispatch($path, $routes, $controller_paths, $method_http)
    {
        // Remove 'api/' do início do path, se existir
        $path_segments = explode('/', $path);
        if ($path_segments[0] === 'api') {
            array_shift($path_segments);
        }

        $clean_path = implode('/', $path_segments);
        $matched_route = null;
        $params = [];

        require_once __DIR__ . '/../Config/auth.middleware.php';

        // Remove query string do path para matching de rotas
        $clean_path = parse_url($clean_path, PHP_URL_PATH);
        $clean_path = trim($clean_path, '/');

        // Rotas públicas que não precisam de autenticação
        $rotasPublicas = [
            '',
            '/',
            'auth/login',
            'auth/verificar-token',
            'auth/logout',
            'auth/obter-usuario',
            'auth/verificar-autenticacao',
            'cadastro/aluno',
            'cadastro/personal',
            'cadastro/academia',
            'cadastro/dev',
            'cadastro/verificar-email',
            'cadastro/verificar-cpf',
            'cadastro/verificar-rg',
            'cadastro/verificar-cnpj',
            'config/testarConexao',
            'recuperacao-senha/esqueci-senha',
            'recuperacao-senha/resetar-senha',
            'alimentos/buscar',
            'alimentos/informacao',
            'alimentos/testar-traducao',
            'convites/email/([^/]+)',
            'convites/([a-zA-Z0-9]{64})',
            'perfil/aluno/(\d+)',
            'perfil/personal/(\d+)',
            'perfil/academia/(\d+)',
            'perfil/dev/(\d+)',
            'perfil/aluno',
            'perfil/personal',
            'perfil/academia',
            'planos',
            'planos/(\d+)',
            'academias-ativas',
            'modalidades',
            'personais',
            'alunos',
            'academias',
            'meus-convites',
            'convite',
            'upload/foto-perfil',
            'upload/salvar-foto-usuario',
            'upload/obter-foto-usuario',
            'upload/deletar-foto',
            'cadastro/modalidades',
        ];

        // Se a rota não for pública, exige autenticação
        if (!in_array($clean_path, $rotasPublicas)) {
            autenticar();
        }

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
                                    case 'deletarExercicio':
                                        if (isset($query_params['id'])) {
                                            $params[] = $query_params['id'];
                                        }
                                        break;
                                    case 'verificarEmail':
                                        if (isset($query_params['email'])) {
                                            $params[] = ['email' => $query_params['email']];
                                        }
                                        break;
                                    case 'verificarCpf':
                                        if (isset($query_params['cpf'])) {
                                            $params[] = ['cpf' => $query_params['cpf']];
                                        }
                                        break;
                                    case 'verificarCnpj':
                                        if (isset($query_params['cnpj'])) {
                                            $params[] = ['cnpj' => $query_params['cnpj']];
                                        }
                                        break;
                                }
                            }
                        }

                        // Captura os dados do corpo da requisição para POST, PUT
                        $data = [];
                        if (in_array($method_http, ['POST', 'PUT'])) {
                            $content_type = $_SERVER['CONTENT_TYPE'] ?? '';

                            if (strpos($content_type, 'application/json') !== false) {
                                $data = json_decode(file_get_contents('php://input'), true);
                                if ($data === null) {
                                    $data = [];
                                }
                            } else {
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
                            // Para métodos sem parâmetros obrigatórios, chama sem parâmetros
                            if ($required_params === 0) {
                                call_user_func([$controller_instance, $method_name]);
                            } else {
                                http_response_code(400);
                                echo json_encode(["error" => "Parâmetros insuficientes para o método '$method_name'"]);
                            }
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

Config/ConfigController.php:

<?php

require_once __DIR__ . '/db.connect.php';

class ConfigController {
    public function testarConexaoDB() {
        try {
            $pdo = DB::connectDB();
            echo json_encode(["success" => true, "message" => "Conexão com o banco de dados estabelecida com sucesso!"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => "Erro ao conectar ao banco de dados: " . $e->getMessage()]);
        }
    }

    public function bemVindo(){
        // Informações da API
        $apiStatus = "200 OK";
        $apiMessage = "API CLIDE Fit está funcionando!";
        $timestamp = date('Y-m-d H:i:s');
        
        // Testar conexão com o banco
        $dbStatus = "Conectado";
        $dbMessage = "Conexão com o banco de dados estabelecida com sucesso!";
        
        try {
            $pdo = DB::connectDB();
            
            // Testar consulta simples no banco
            $stmt = $pdo->query("SELECT 1 as test");
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($result && $result['test'] == 1) {
                $dbStatus = "Conectado";
                $dbMessage = "Banco de dados respondendo corretamente";
            } else {
                $dbStatus = "Aviso";
                $dbMessage = "Conexão OK mas consulta de teste falhou";
            }
            
        } catch (PDOException $e) {
            $dbStatus = "Erro";
            $dbMessage = "Erro ao conectar ao banco de dados: " . $e->getMessage();
        }

        // Informações do servidor
        $serverInfo = [
            "servidor" => $_SERVER['SERVER_NAME'] ?? 'N/A',
            "php_version" => PHP_VERSION,
            "timestamp" => $timestamp
        ];

        http_response_code(200);
        echo json_encode([
            "success" => true, 
            "message" => "Bem-vindo à API CLIDE Fit",
            "status" => [
                "api" => [
                    "codigo" => 200,
                    "status" => $apiStatus,
                    "mensagem" => $apiMessage
                ],
                "banco_dados" => [
                    "status" => $dbStatus,
                    "mensagem" => $dbMessage,
                    "timestamp" => $timestamp
                ],
                "servidor" => $serverInfo
            ],
            "endpoints" => [
                "documentacao" => "Em breve",
                "versao" => "1.0.0"
            ]
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    }
}

?>

Resultado:

{
    "success": true,
    "message": "Bem-vindo à API CLIDE Fit",
    "status": {
        "api": {
            "codigo": 200,
            "status": "200 OK",
            "mensagem": "API CLIDE Fit está funcionando!"
        },
        "banco_dados": {
            "status": "Conectado",
            "mensagem": "Banco de dados respondendo corretamente",
            "timestamp": "2025-11-01 17:05:43"
        },
        "servidor": {
            "servidor": "localhost",
            "php_version": "8.0.26",
            "timestamp": "2025-11-01 17:05:43"
        }
    },
    "endpoints": {
        "documentacao": "Em breve",
        "versao": "1.0.0"
    }
}

Config/.env.development:

# 🚀 Ambiente
APP_ENV=development

# 🚨 CONFIGURAÇÕES OBRIGATÓRIAS

# Banco de Dados
DB_HOST=localhost
DB_NAME=bd_clidefit
DB_USER=root
DB_PASS=

# JWT - Gerar em: https://randomkeygen.com/ (use CodeIgniter Encryption Keys)
JWT_SECRET=42ea9ce29ca3c0e8c5d6558334f3a8b4d727c94a2758bd6463953a9a3656c286

# Configurações SMTP para PHPMailer
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=mensagensclidefit@gmail.com
SMTP_PASS=rkxlrrvaodleaair
SMTP_FROM_EMAIL=nao-responda@clidefit.com
SMTP_FROM_NAME='CLIDE Fit'
SMTP_charset=UTF-8
SMTP_SECURE=tls
SMTP_DEBUG=0

# Chave da API Spoonacular (https://spoonacular.com/food-api)
SPOONACULAR_API_KEY=617d584fd753442483088b758ccd52fd

# 🌐 API
API_DEBUG=true
API_TIMEZONE=America/Sao_Paulo

index.php:

<?php
// Cabeçalhos CORS

$allowed_origins = [
    'https://www.clidefit.com.br',
    'https://clidefit.com.br',
    'http://localhost:5173',
];

$http_origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($http_origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: " . $http_origin);
} else {
    header("Access-Control-Allow-Origin: https://www.clidefit.com.br");
}

header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Credentials: true");

// Responde preflight (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Fuso horário
date_default_timezone_set('America/Sao_Paulo');

// Composer
require_once __DIR__ . '/vendor/autoload.php';

// Base da URI
$script_name = $_SERVER['SCRIPT_NAME'];
$base_path = str_replace('index.php', '', $script_name);
$request_uri = $_SERVER['REQUEST_URI'];
$path = (strpos($request_uri, $base_path) === 0) ? substr($request_uri, strlen($base_path)) : $request_uri;
$method_http = $_SERVER['REQUEST_METHOD'];
$path = parse_url($path, PHP_URL_PATH);
$path = trim($path, '/');

// Rotas
require_once __DIR__ . '/Routes/routes.php';

// Despacha a requisição
dispatch($path, $routes, $controller_paths, $method_http);
?>

.htaccess:

RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php?path=$1 [QSA,L]

Cadastro parcial realizado (como está no banco de dados):

idAluno
nome
cpf
rg
email
senha
numTel
altura
meta
treinoTipo
foto_perfil
foto_url
data_cadastro
tipoPlano
idPersonal
status_vinculo
status_conta
idade
data_nascimento
genero
peso
idPlano
treinos_adaptados
cadastro_completo

1
Enzo Krebs
32453453453
345345345
enzokrebs8@gmail.com
$2y$10$.VvcAzEmrwIblIy/VEOQMuG4fjGKSxJ8W4sodfFUs5j...
12312313422
NULL
NULL
NULL
NULL
NULL
2025-11-01 16:57:39
Básico(Gratuito)
NULL
Inativo
Ativa
NULL
NULL
NULL
NULL
1
0
0

frontend:

utils/:

cropImage.js:

const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = await new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = imageSrc
    img.onload = () => resolve(img)
    img.onerror = (err) => reject(err)
  })

  console.log("[v0] Image natural dimensions:", image.naturalWidth, "x", image.naturalHeight)
  console.log("[v0] Crop area received:", pixelCrop)

  const clippedCrop = {
    x: Math.max(0, Math.min(pixelCrop.x, image.naturalWidth)),
    y: Math.max(0, Math.min(pixelCrop.y, image.naturalHeight)),
    width: Math.min(pixelCrop.width, image.naturalWidth - pixelCrop.x),
    height: Math.min(pixelCrop.height, image.naturalHeight - pixelCrop.y),
  }

  console.log("[v0] Clipped crop area:", clippedCrop)

  const MAX_SIZE = 800
  let outputWidth = clippedCrop.width
  let outputHeight = clippedCrop.height

  if (outputWidth > MAX_SIZE || outputHeight > MAX_SIZE) {
    const ratio = Math.min(MAX_SIZE / outputWidth, MAX_SIZE / outputHeight)
    outputWidth = Math.round(outputWidth * ratio)
    outputHeight = Math.round(outputHeight * ratio)
    console.log("[v0] Resizing output to:", outputWidth, "x", outputHeight)
  }

  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d", { alpha: false })

  canvas.width = outputWidth
  canvas.height = outputHeight

  ctx.drawImage(
    image,
    clippedCrop.x,
    clippedCrop.y,
    clippedCrop.width,
    clippedCrop.height,
    0,
    0,
    outputWidth,
    outputHeight,
  )

  console.log("[v0] Canvas created:", canvas.width, "x", canvas.height)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"))
          return
        }
        console.log("[v0] Blob size:", (blob.size / 1024).toFixed(2), "KB")
        resolve(blob)
      },
      "image/jpeg",
      0.8,
    )
  })
}

export default getCroppedImg;

saveImageLocal.js:

/**
 * Salvar imagem automaticamente no servidor
 */
export const salvarImagemLocalmente = async (blob, nomeArquivo = null) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Gerar nome único para o arquivo
      const nomeFinal = nomeArquivo || `perfil_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
      
      // Criar FormData para upload
      const formData = new FormData();
      formData.append('foto', blob, nomeFinal);

      console.log('📤 Iniciando upload da imagem...');

      // Fazer upload para o servidor
      const response = await fetch('/api/upload/foto-perfil', {
        method: 'POST',
        body: formData,
        // Não definir Content-Type - o browser vai definir automaticamente com boundary
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Upload realizado com sucesso:', result.nome_arquivo);
        
        // Gerar preview da imagem
        const dataURL = await blobParaDataURL(blob);
        
        resolve({
          url_relativa: result.url_relativa,
          nome_arquivo: result.nome_arquivo,
          blob: blob,
          data_url: dataURL
        });
      } else {
        throw new Error(result.error || 'Erro no upload');
      }
      
    } catch (error) {
      console.error('❌ Erro no upload:', error);
      
      // Fallback: usar blob URL se o upload falhar
      const urlBlob = URL.createObjectURL(blob);
      const nomeFinal = nomeArquivo || `perfil_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
      const urlRelativa = `/assets/images/fotosPerfil/${nomeFinal}`;
      
      console.warn('⚠️ Usando fallback com blob URL');
      
      resolve({
        url_relativa: urlRelativa,
        nome_arquivo: nomeFinal,
        blob: blob,
        blob_url: urlBlob,
        data_url: await blobParaDataURL(blob),
        fallback: true
      });
    }
  });
};

/**
 * Deletar foto do servidor
 */
export const deletarFotoServidor = async (nomeArquivo) => {
  try {
    if (!nomeArquivo) return { success: true };

    const response = await fetch('/api/upload/foto-perfil', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nome_arquivo: nomeArquivo })
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Erro ao deletar foto:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Gerar preview da imagem a partir do blob
 */
export const blobParaDataURL = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Verificar se a imagem existe no servidor
 */
export const verificarImagemExiste = async (urlRelativa) => {
  try {
    const response = await fetch(urlRelativa, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
};

uploadImage.js:

/**
 * Upload de imagem para o servidor
 */
export const uploadImagemParaServidor = async (blob, nomeArquivo = null) => {
  try {
    // Gerar nome único para o arquivo
    const nomeFinal = nomeArquivo || `perfil_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
    
    // Criar FormData para upload
    const formData = new FormData();
    formData.append('foto', blob, nomeFinal);

    console.log('📤 Iniciando upload da imagem...');

    // Fazer upload para o servidor - REMOVA o /api/ da URL
    const response = await fetch(`${import.meta.env.VITE_API_URL}upload/foto-perfil`, {
      method: 'POST',
      body: formData,
    });

    // Verificar se a resposta é válida
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
    }

    // Verificar se é JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Resposta não é JSON:', text.substring(0, 200));
      throw new Error('Resposta do servidor não é JSON válido');
    }

    const result = await response.json();

    if (result.success) {
      console.log('✅ Upload realizado com sucesso:', result.nome_arquivo);
      return {
        success: true,
        url: result.url,
        nome_arquivo: result.nome_arquivo,
        message: result.message
      };
    } else {
      throw new Error(result.error || 'Erro no upload');
    }
    
  } catch (error) {
    console.error('❌ Erro no upload:', error);
    
    // Fallback: usar blob URL localmente
    const urlBlob = URL.createObjectURL(blob);
    console.warn('⚠️ Usando fallback com blob URL local');
    
    return {
      success: true, // Marcamos como sucesso para continuar o processo
      url: urlBlob,
      nome_arquivo: nomeArquivo || `perfil_local_${Date.now()}.jpg`,
      message: 'Imagem salva localmente (fallback)',
      fallback: true
    };
  }
};

/**
 * Salvar URL da foto no banco de dados do usuário
 */
export const salvarFotoNoBanco = async (idUsuario, tipoUsuario, fotoUrl) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}upload/salvar-foto-usuario`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idUsuario: idUsuario,
        tipoUsuario: tipoUsuario,
        foto_url: fotoUrl
      })
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Erro ao salvar foto no banco:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Obter foto atual do usuário
 */
export const obterFotoUsuario = async (idUsuario, tipoUsuario) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}upload/obter-foto-usuario`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idUsuario: idUsuario,
        tipoUsuario: tipoUsuario
      })
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Erro ao obter foto do usuário:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Deletar foto do servidor
 */
export const deletarFotoServidor = async (nomeArquivo) => {
  try {
    if (!nomeArquivo) return { success: true };

    const response = await fetch(`${import.meta.env.VITE_API_URL}upload/deletar-foto`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nome_arquivo: nomeArquivo })
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Erro ao deletar foto:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Gerar preview da imagem a partir do blob
 */
export const blobParaDataURL = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Exportação padrão para compatibilidade
export default {
  uploadImagemParaServidor,
  salvarFotoNoBanco,
  obterFotoUsuario,
  deletarFotoServidor,
  blobParaDataURL
};



pages/Auth/cadastro.jsx:

import { useState } from "react";
import { User, Dumbbell, Building } from "lucide-react";
import CadastroMultiEtapas from "../../components/CadastroMultiEtapas";
import "./style.css";

export default function CadastroPage() {
  const [userType, setUserType] = useState("aluno");

  const userTypes = [
    { 
      id: "aluno", 
      label: "Aluno", 
      icon: User, 
      color: "#368DD9",
      description: "Quero treinar e evoluir"
    },
    { 
      id: "personal", 
      label: "Personal Trainer", 
      icon: Dumbbell, 
      color: "#4CAF50",
      description: "Quero treinar alunos"
    },
    { 
      id: "academia", 
      label: "Academia", 
      icon: Building, 
      color: "#FF6B35",
      description: "Quero gerenciar minha academia"
    }
  ];

  return (
    <div className="cadastroCC">
      <div className="animated-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
      </div>

      <div className="topppp-global">
        <div className="logo-container">
          <h2>CLIDE Fit</h2>
        </div>
      </div>

      {/* Componente de Cadastro Multi-Etapas com seletor integrado */}
      <CadastroMultiEtapas tipoUsuario={userType} />
    </div>
  );
}

components/CadastroMultiEtapas/:

BarraProgresso.jsx:

const BarraProgresso = ({ etapas, etapaAtual, tipoUsuario }) => {
  const progresso = ((etapaAtual - 1) / (etapas.length - 1)) * 100;

  return (
    <div className="barra-progresso-container">
      <div className="barra-progresso">
        <div 
          className="barra-progresso-preenchimento"
          style={{ width: `${progresso}%` }}
        ></div>
      </div>
      
      <div className="etapas-lista">
        {etapas.map((etapa) => (
          <div
            key={etapa.numero}
            className={`etapa-item ${
              etapa.numero === etapaAtual ? 'ativo' : ''
            } ${
              etapa.numero < etapaAtual ? 'concluido' : ''
            }`}
          >
            <div className="etapa-icone">
              {etapa.numero < etapaAtual ? '✓' : etapa.icone}
            </div>
            <div className="etapa-titulo">{etapa.titulo}</div>
            <div className="etapa-numero">Etapa {etapa.numero}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarraProgresso;

EtapaCREF.jsx:

import { useState, useEffect } from "react";
import { FileText, Building } from "lucide-react";

const EtapaCREF = ({ dados, onChange }) => {
const [academias, setAcademias] = useState([]);
const [carregandoAcademias, setCarregandoAcademias] = useState(false);

    useEffect(() => {
        carregarAcademias();
    }, []);

    const carregarAcademias = async () => {
        setCarregandoAcademias(true);
        try {
        const response = await fetch('/api/academias-ativas');
        const data = await response.json();
        if (data.success) {
            setAcademias(data.data);
        }
        } catch (error) {
        console.error('Erro ao carregar academias:', error);
        } finally {
        setCarregandoAcademias(false);
        }
    };

    const formatarCREF = (valor) => {
        return valor.replace(/\D/g, '').slice(0, 9);
    };

    const handleCREFNumeroChange = (e) => {
        const valorFormatado = formatarCREF(e.target.value);
        onChange({ cref_numero: valorFormatado });
    };

    return (
        <div className="etapa-cref">
            <h2>Registro Profissional</h2>
            <p>Informe seus dados do CREF e academia</p>

            <div className="form-grid">
                {/* Número do CREF */}
                <div className="input-group">
                    <label>
                        <FileText size={16} />
                        Número CREF *
                    </label>
                    <input
                        type="text"
                        placeholder="Apenas números"
                        value={dados.cref_numero}
                        onChange={handleCREFNumeroChange}
                        maxLength={9}
                        required
                    />
                    <small>Digite apenas números (6-9 dígitos)</small>
                </div>

                {/* Categoria CREF */}
                <div className="input-group">
                    <label>Categoria CREF *</label>
                    <select
                        value={dados.cref_categoria}
                        onChange={(e) => onChange({ cref_categoria: e.target.value })}
                        required
                    >
                        <option value="">Selecione</option>
                        <option value="A">A - Profissional de Educação Física</option>
                        <option value="B">B - Técnico Desportivo</option>
                        <option value="C">C - Estagiário</option>
                        <option value="D">D - Outras Categorias</option>
                    </select>
                </div>

                {/* Regional CREF */}
                <div className="input-group">
                    <label>Regional CREF *</label>
                    <select
                        value={dados.cref_regional}
                        onChange={(e) => onChange({ cref_regional: e.target.value })}
                        required
                    >
                        <option value="">Selecione a regional</option>
                        <option value="SP">SP - São Paulo</option>
                        <option value="RJ">RJ - Rio de Janeiro</option>
                        <option value="MG">MG - Minas Gerais</option>
                        <option value="RS">RS - Rio Grande do Sul</option>
                        <option value="PR">PR - Paraná</option>
                        <option value="SC">SC - Santa Catarina</option>
                        <option value="BA">BA - Bahia</option>
                        <option value="DF">DF - Distrito Federal</option>
                        <option value="ES">ES - Espírito Santo</option>
                        <option value="GO">GO - Goiás</option>
                        <option value="PE">PE - Pernambuco</option>
                        <option value="CE">CE - Ceará</option>
                        <option value="PA">PA - Pará</option>
                        <option value="MA">MA - Maranhão</option>
                        <option value="AM">AM - Amazonas</option>
                        <option value="OUT">OUT - Outra Regional</option>
                    </select>
                </div>

                {/* Academia */}
                <div className="input-group full-width">
                    <label>
                        <Building size={16} />
                        Academia (Opcional)
                    </label>
                    <select
                        value={dados.idAcademia}
                        onChange={(e) => onChange({ idAcademia: e.target.value })}
                    >
                        <option value="">Selecione uma academia (opcional)</option>
                        {carregandoAcademias ? (
                        <option value="">Carregando academias...</option>
                        ) : (
                        academias.map(academia => (
                            <option key={academia.idAcademia} value={academia.idAcademia}>
                            {academia.nome} - {academia.endereco}
                            </option>
                        ))
                        )}
                    </select>
                    <small>Você pode vincular-se a uma academia posteriormente</small>
                </div>
            </div>

            <div className="info-cref">
                <h4>Informações sobre o CREF:</h4>
                <ul>
                <li>O CREF é obrigatório para atuar como Personal Trainer</li>
                <li>Verifique se os dados estão corretos com seu conselho regional</li>
                <li>O número do CREF contém apenas dígitos</li>
                <li>A categoria define seu tipo de atuação profissional</li>
                </ul>
            </div>
        </div>
    );
};

export default EtapaCREF;

EtapaDadosPessoais.jsx:

import { useState } from "react";
import { User, IdCard, Phone } from "lucide-react";

const EtapaDadosPessoais = ({ dados, onChange, tipoUsuario }) => {
  const [erros, setErros] = useState({});

  const validarCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]/g, '');
    return cpf.length === 11;
  };

  const formatarCPF = (valor) => {
    return valor
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatarTelefone = (valor) => {
    return valor
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const handleCpfChange = (e) => {
    const valorFormatado = formatarCPF(e.target.value);
    onChange({ cpf: valorFormatado });

    if (e.target.value.replace(/\D/g, '').length === 11 && !validarCPF(e.target.value)) {
      setErros(prev => ({ ...prev, cpf: 'CPF inválido' }));
    } else {
      setErros(prev => ({ ...prev, cpf: '' }));
    }
  };

  const handleTelefoneChange = (e) => {
    const valorFormatado = formatarTelefone(e.target.value);
    onChange({ numTel: valorFormatado });
  };

  return (
    <div className="etapa-dados-pessoais">
      <h2>Dados Pessoais</h2>
      <p>Informe seus dados básicos</p>

      <div className="form-grid">
        {/* Nome Completo */}
        <div className="input-group full-width">
          <label>
            <User size={16} />
            Nome Completo *
          </label>
          <input
            type="text"
            placeholder="Digite seu nome completo"
            value={dados.nome}
            onChange={(e) => onChange({ nome: e.target.value })}
            required
          />
        </div>

        {/* CPF */}
        <div className="input-group">
          <label>
            <IdCard size={16} />
            CPF *
          </label>
          <input
            type="text"
            placeholder="000.000.000-00"
            value={dados.cpf}
            onChange={handleCpfChange}
            maxLength={14}
            required
          />
          {erros.cpf && <span className="erro">{erros.cpf}</span>}
        </div>

        {/* RG */}
        <div className="input-group">
          <label>RG *</label>
          <input
            type="text"
            placeholder="Digite seu RG"
            value={dados.rg}
            onChange={(e) => onChange({ rg: e.target.value })}
            required
          />
        </div>

        {/* Telefone */}
        <div className="input-group">
          <label>
            <Phone size={16} />
            Telefone *
          </label>
          <input
            type="tel"
            placeholder="(00) 00000-0000"
            value={dados.numTel}
            onChange={handleTelefoneChange}
            maxLength={15}
            required
          />
        </div>
      </div>
    </div>
  );
};

export default EtapaDadosPessoais;

EtapaEndereco.jsx:

import { useState } from "react";
import { MapPin, Search } from "lucide-react";

const EtapaEndereco = ({ dados, onChange }) => {
  const [carregandoCep, setCarregandoCep] = useState(false);

  const buscarEnderecoPorCEP = async (cep) => {
    const cepLimpo = cep.replace(/\D/g, '');
    
    if (cepLimpo.length !== 8) return;

    setCarregandoCep(true);
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const endereco = await response.json();
      
      if (!endereco.erro) {
        onChange({
          logradouro: endereco.logradouro || '',
          bairro: endereco.bairro || '',
          cidade: endereco.localidade || '',
          estado: endereco.uf || ''
        });
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setCarregandoCep(false);
    }
  };

  const formatarCEP = (valor) => {
    return valor
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1');
  };

  const handleCepChange = (e) => {
    const valorFormatado = formatarCEP(e.target.value);
    onChange({ cep: valorFormatado });

    if (valorFormatado.replace(/\D/g, '').length === 8) {
      buscarEnderecoPorCEP(valorFormatado);
    }
  };

  return (
    <div className="etapa-endereco">
      <h2>Endereço</h2>
      <p>Informe seu endereço completo</p>

      <div className="form-grid">
        {/* CEP */}
        <div className="input-group">
          <label>
            <MapPin size={16} />
            CEP *
          </label>
          <div className="input-with-button">
            <input
              type="text"
              placeholder="00000-000"
              value={dados.cep}
              onChange={handleCepChange}
              maxLength={9}
              required
            />
            <button
              type="button"
              className="btn-buscar-cep"
              onClick={() => buscarEnderecoPorCEP(dados.cep)}
              disabled={carregandoCep || !dados.cep || dados.cep.replace(/\D/g, '').length !== 8}
            >
              <Search size={16} />
              {carregandoCep ? '...' : 'Buscar'}
            </button>
          </div>
        </div>

        {/* Logradouro */}
        <div className="input-group full-width">
          <label>Logradouro *</label>
          <input
            type="text"
            placeholder="Rua, Avenida, etc."
            value={dados.logradouro}
            onChange={(e) => onChange({ logradouro: e.target.value })}
            required
          />
        </div>

        {/* Número */}
        <div className="input-group">
          <label>Número *</label>
          <input
            type="text"
            placeholder="Nº"
            value={dados.numero}
            onChange={(e) => onChange({ numero: e.target.value })}
            required
          />
        </div>

        {/* Complemento */}
        <div className="input-group">
          <label>Complemento</label>
          <input
            type="text"
            placeholder="Apto, Casa, etc."
            value={dados.complemento}
            onChange={(e) => onChange({ complemento: e.target.value })}
          />
        </div>

        {/* Bairro */}
        <div className="input-group">
          <label>Bairro *</label>
          <input
            type="text"
            placeholder="Bairro"
            value={dados.bairro}
            onChange={(e) => onChange({ bairro: e.target.value })}
            required
          />
        </div>

        {/* Cidade */}
        <div className="input-group">
          <label>Cidade *</label>
          <input
            type="text"
            placeholder="Cidade"
            value={dados.cidade}
            onChange={(e) => onChange({ cidade: e.target.value })}
            required
          />
        </div>

        {/* Estado */}
        <div className="input-group">
          <label>Estado *</label>
          <select
            value={dados.estado}
            onChange={(e) => onChange({ estado: e.target.value })}
            required
          >
            <option value="">Selecione</option>
            <option value="AC">Acre</option>
            <option value="AL">Alagoas</option>
            <option value="AP">Amapá</option>
            <option value="AM">Amazonas</option>
            <option value="BA">Bahia</option>
            <option value="CE">Ceará</option>
            <option value="DF">Distrito Federal</option>
            <option value="ES">Espírito Santo</option>
            <option value="GO">Goiás</option>
            <option value="MA">Maranhão</option>
            <option value="MT">Mato Grosso</option>
            <option value="MS">Mato Grosso do Sul</option>
            <option value="MG">Minas Gerais</option>
            <option value="PA">Pará</option>
            <option value="PB">Paraíba</option>
            <option value="PR">Paraná</option>
            <option value="PE">Pernambuco</option>
            <option value="PI">Piauí</option>
            <option value="RJ">Rio de Janeiro</option>
            <option value="RN">Rio Grande do Norte</option>
            <option value="RS">Rio Grande do Sul</option>
            <option value="RO">Rondônia</option>
            <option value="RR">Roraima</option>
            <option value="SC">Santa Catarina</option>
            <option value="SP">São Paulo</option>
            <option value="SE">Sergipe</option>
            <option value="TO">Tocantins</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default EtapaEndereco;

EtapaLogin.jsx:

import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

const EtapaLogin = ({ dados, onChange }) => {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [erros, setErros] = useState({});

  const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validarSenha = (senha) => {
    return senha.length >= 6;
  };

  const handleEmailChange = (e) => {
    const email = e.target.value;
    onChange({ email });

    if (email && !validarEmail(email)) {
      setErros(prev => ({ ...prev, email: 'Email inválido' }));
    } else {
      setErros(prev => ({ ...prev, email: '' }));
    }
  };

  const handleSenhaChange = (e) => {
    const senha = e.target.value;
    onChange({ senha });

    if (senha && !validarSenha(senha)) {
      setErros(prev => ({ ...prev, senha: 'Senha deve ter pelo menos 6 caracteres' }));
    } else {
      setErros(prev => ({ ...prev, senha: '' }));
    }

    // Validar confirmação se já estiver preenchida
    if (dados.confirmarSenha && senha !== dados.confirmarSenha) {
      setErros(prev => ({ ...prev, confirmarSenha: 'Senhas não coincidem' }));
    } else {
      setErros(prev => ({ ...prev, confirmarSenha: '' }));
    }
  };

  const handleConfirmarSenhaChange = (e) => {
    const confirmarSenha = e.target.value;
    onChange({ confirmarSenha });

    if (confirmarSenha && confirmarSenha !== dados.senha) {
      setErros(prev => ({ ...prev, confirmarSenha: 'Senhas não coincidem' }));
    } else {
      setErros(prev => ({ ...prev, confirmarSenha: '' }));
    }
  };

  return (
    <div className="etapa-login">
      <h2>Dados de Login</h2>
      <p>Crie suas credenciais de acesso</p>

      <div className="form-grid">
        {/* Email */}
        <div className="input-group full-width">
          <label>
            <Mail size={16} />
            Email *
          </label>
          <input
            type="email"
            placeholder="seu@email.com"
            value={dados.email}
            onChange={handleEmailChange}
            required
          />
          {erros.email && <span className="erro">{erros.email}</span>}
        </div>

        {/* Senha */}
        <div className="input-group">
          <label>
            <Lock size={16} />
            Senha *
          </label>
          <div className="password-input-container">
            <input
              type={mostrarSenha ? "text" : "password"}
              placeholder="Mínimo 6 caracteres"
              value={dados.senha}
              onChange={handleSenhaChange}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setMostrarSenha(!mostrarSenha)}
            >
              {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {erros.senha && <span className="erro">{erros.senha}</span>}
        </div>

        {/* Confirmar Senha */}
        <div className="input-group">
          <label>Confirmar Senha *</label>
          <div className="password-input-container">
            <input
              type={mostrarConfirmarSenha ? "text" : "password"}
              placeholder="Digite novamente sua senha"
              value={dados.confirmarSenha}
              onChange={handleConfirmarSenhaChange}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
            >
              {mostrarConfirmarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {erros.confirmarSenha && <span className="erro">{erros.confirmarSenha}</span>}
        </div>
      </div>

      <div className="dicas-senha">
        <p><strong>Dicas para uma senha segura:</strong></p>
        <ul>
          <li>Mínimo de 6 caracteres</li>
          <li>Use letras maiúsculas e minúsculas</li>
          <li>Inclua números e símbolos</li>
          <li>Evite sequências óbvias</li>
        </ul>
      </div>
    </div>
  );
};

export default EtapaLogin;

EtapaPerfil.jsx:

import { useState, useEffect } from "react";
import { Calendar, Ruler, Target, Users, Upload, X } from "lucide-react";
import CropModal from "../../pages/Perfil/modalCrop";
import getCroppedImg from "../../utils/cropImage";
import { uploadImagemParaServidor, blobParaDataURL, deletarFotoServidor } from "../../utils/uploadImage";

const EtapaPerfil = ({ dados, onChange, tipoUsuario }) => {
  const [modalidades, setModalidades] = useState([]);
  const [cropModalAberto, setCropModalAberto] = useState(false);
  const [imagemParaCortar, setImagemParaCortar] = useState(null);
  const [salvandoImagem, setSalvandoImagem] = useState(false);
  const [carregandoModalidades, setCarregandoModalidades] = useState(false);

  useEffect(() => {
    carregarModalidades();
  }, []);

  const carregarModalidades = async () => {
    setCarregandoModalidades(true);
    try {
      // CORRIGIDO: Remove /api/ da URL
      const response = await fetch(`${import.meta.env.VITE_API_URL}cadastro/modalidades`);
      
      // Verificar se a resposta é válida
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // Se não for JSON, usar fallback
        console.warn('Resposta não é JSON, usando modalidades padrão');
        setModalidades(getModalidadesPadrao());
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        setModalidades(data.data || []);
      } else {
        console.error('Erro na resposta:', data.error);
        setModalidades(getModalidadesPadrao());
      }
    } catch (error) {
      console.error('Erro ao carregar modalidades:', error);
      // Fallback com modalidades básicas
      setModalidades(getModalidadesPadrao());
    } finally {
      setCarregandoModalidades(false);
    }
  };

  // Função auxiliar para modalidades padrão
  const getModalidadesPadrao = () => {
    return [
      { idModalidade: 1, nome: 'Musculação' },
      { idModalidade: 2, nome: 'Cardio' },
      { idModalidade: 3, nome: 'Yoga' },
      { idModalidade: 4, nome: 'Pilates' },
      { idModalidade: 5, nome: 'Crossfit' },
      { idModalidade: 6, nome: 'Artes Marciais' },
      { idModalidade: 7, nome: 'Dança' },
      { idModalidade: 8, nome: 'Natação' }
    ];
  };

  const calcularIdade = (dataNascimento) => {
    if (!dataNascimento) return '';
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  const handleSelecionarFoto = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Verificar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem válida.');
      return;
    }

    // Verificar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.');
      return;
    }

    // Abrir modal de corte automaticamente
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagemParaCortar(e.target.result);
      setCropModalAberto(true);
    };
    reader.readAsDataURL(file);

    // Limpar input
    event.target.value = '';
  };

  const handleSalvarCorte = async (pixelCrop) => {
    if (!imagemParaCortar || !pixelCrop) return;
    
    setSalvandoImagem(true);
    
    try {
      // Cortar imagem
      const blob = await getCroppedImg(imagemParaCortar, pixelCrop);
      
      // Fazer upload para o servidor
      const uploadResult = await uploadImagemParaServidor(blob);
      
      if (uploadResult.success) {
        // Gerar preview local
        const dataURL = await blobParaDataURL(blob);
        
        // Atualizar dados do formulário com a URL do servidor
        onChange({ 
          foto_url: uploadResult.url,
          foto_data: dataURL, // Para preview
          foto_nome: uploadResult.nome_arquivo,
          foto_fallback: uploadResult.fallback || false
        });

        console.log('✅ Foto processada e salva no servidor:', uploadResult.nome_arquivo);
        
        if (uploadResult.fallback) {
          console.warn('⚠️ Imagem salva localmente (fallback)');
        }
        
      } else {
        throw new Error(uploadResult.error || 'Erro no upload');
      }
      
    } catch (error) {
      console.error('❌ Erro ao processar imagem:', error);
      alert('Erro ao salvar imagem. Tente novamente.');
    } finally {
      setSalvandoImagem(false);
      setCropModalAberto(false);
      setImagemParaCortar(null);
    }
  };

  const removerFoto = async () => {
    // Se tiver uma foto salva no servidor, tentar deletar
    if (dados.foto_nome && !dados.foto_fallback) {
      try {
        await deletarFotoServidor(dados.foto_nome);
      } catch (error) {
        console.error('Erro ao deletar foto do servidor:', error);
      }
    }

    onChange({ 
      foto_url: '', 
      foto_data: null,
      foto_nome: '',
      foto_fallback: false
    });
  };

  const handleModalidadeChange = (idModalidade) => {
    const novasModalidades = dados.modalidades?.includes(idModalidade.toString())
      ? dados.modalidades.filter(id => id !== idModalidade.toString())
      : [...(dados.modalidades || []), idModalidade.toString()];
    
    onChange({ modalidades: novasModalidades });
  };

  const metas = [
    { value: 'Perder peso', label: 'Perder peso' },
    { value: 'Manter peso', label: 'Manter peso' },
    { value: 'Ganhar peso', label: 'Ganhar peso' },
    { value: 'Ganhar massa muscular', label: 'Ganhar massa muscular' },
    { value: 'Melhorar condicionamento', label: 'Melhorar condicionamento' },
    { value: 'Outro', label: 'Outro' }
  ];

  return (
    <div className="etapa-perfil">
      <h2>Seu Perfil</h2>
      <p>Complete suas informações pessoais</p>

      {/* Modal de Corte */}
      {cropModalAberto && (
        <CropModal
          imagem={imagemParaCortar}
          onClose={() => {
            setCropModalAberto(false);
            setImagemParaCortar(null);
          }}
          onSave={handleSalvarCorte}
          loading={salvandoImagem}
        />
      )}

      {/* Upload de Foto - OPICIONAL para todos os tipos */}
      <div className="foto-perfil-section">
        <label className="foto-label">
          <Upload size={20} />
          Foto de Perfil (Opcional)
        </label>
        
        <div className="foto-container">
          {dados.foto_data ? (
            <div className="foto-preview">
              <img src={dados.foto_data} alt="Preview" />
              <button type="button" className="btn-remover-foto" onClick={removerFoto}>
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="foto-placeholder">
              <Users size={40} />
              <span>Clique para adicionar foto</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleSelecionarFoto}
                className="foto-input"
              />
            </label>
          )}
        </div>
        
        <p className="foto-instructions">
          Formatos: JPG, PNG, GIF, WebP • Máximo: 5MB
        </p>
      </div>

      {/* Resto do formulário */}
      <div className="form-grid">
        {/* Data de Nascimento */}
        <div className="input-group">
          <label>
            <Calendar size={16} />
            Data de Nascimento *
          </label>
          <input
            type="date"
            value={dados.data_nascimento}
            onChange={(e) => onChange({ data_nascimento: e.target.value })}
            max={new Date().toISOString().split('T')[0]}
            required
          />
          {dados.data_nascimento && (
            <span className="idade-calculada">
              {calcularIdade(dados.data_nascimento)} anos
            </span>
          )}
        </div>

        {/* Gênero */}
        <div className="input-group">
          <label>Gênero *</label>
          <select
            value={dados.genero}
            onChange={(e) => onChange({ genero: e.target.value })}
            required
          >
            <option value="">Selecione</option>
            <option value="Masculino">Masculino</option>
            <option value="Feminino">Feminino</option>
            <option value="Outro">Outro</option>
          </select>
        </div>

        {/* Altura (apenas alunos) */}
        {tipoUsuario === 'aluno' && (
          <div className="input-group">
            <label>
              <Ruler size={16} />
              Altura (cm)
            </label>
            <input
              type="number"
              min="100"
              max="250"
              placeholder="Ex: 175"
              value={dados.altura}
              onChange={(e) => onChange({ altura: e.target.value })}
            />
          </div>
        )}

        {/* Meta (apenas alunos) */}
        {tipoUsuario === 'aluno' && (
          <div className="input-group">
            <label>
              <Target size={16} />
              Sua Meta Principal
            </label>
            <select
              value={dados.meta}
              onChange={(e) => onChange({ meta: e.target.value })}
            >
              <option value="">Selecione sua meta</option>
              {metas.map(meta => (
                <option key={meta.value} value={meta.value}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Sobre (apenas personal) */}
      {tipoUsuario === 'personal' && (
        <div className="input-group full-width">
          <label>Sobre Você</label>
          <textarea
            placeholder="Conte um pouco sobre sua experiência, metodologia de trabalho, especializações..."
            value={dados.sobre}
            onChange={(e) => onChange({ sobre: e.target.value })}
            rows={4}
            maxLength={500}
          />
          <div className="caracteres-restantes">
            {dados.sobre?.length || 0}/500 caracteres
          </div>
        </div>
      )}

      {/* Treinos Adaptados */}
      <div className="checkbox-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={dados.treinos_adaptados || false}
            onChange={(e) => onChange({ treinos_adaptados: e.target.checked })}
          />
          <span className="checkmark"></span>
          {tipoUsuario === 'personal' 
            ? 'Trabalho com treinos adaptados' 
            : 'Preciso de treinos adaptados'
          }
        </label>
      </div>

      {/* Modalidades */}
      <div className="modalidades-section">
        <label>
          {tipoUsuario === 'personal' ? 'Modalidades que Trabalha' : 'Modalidades de Interesse'} *
        </label>
        
        {carregandoModalidades ? (
          <div className="loading-modalidades">
            <p>Carregando modalidades...</p>
          </div>
        ) : modalidades.length > 0 ? (
          <div className="modalidades-grid">
            {modalidades.map(modalidade => (
              <label key={modalidade.idModalidade} className="modalidade-checkbox">
                <input
                  type="checkbox"
                  checked={dados.modalidades?.includes(modalidade.idModalidade.toString()) || false}
                  onChange={() => handleModalidadeChange(modalidade.idModalidade)}
                />
                <span className="checkmark"></span>
                {modalidade.nome}
              </label>
            ))}
          </div>
        ) : (
          <div className="erro-modalidades">
            <p>Não foi possível carregar as modalidades. Tente novamente mais tarde.</p>
          </div>
        )}
        
        {dados.modalidades?.length === 0 && (
          <span className="cad-error">Selecione pelo menos uma modalidade</span>
        )}
      </div>
    </div>
  );
};

export default EtapaPerfil;

index.jsx:

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EtapaDadosPessoais from "./EtapaDadosPessoais";
import EtapaPerfil from "./EtapaPerfil";
import EtapaEndereco from "./EtapaEndereco";
import EtapaLogin from "./EtapaLogin";
import EtapaCREF from "./EtapaCREF";
import BarraProgresso from "./BarraProgresso";
import { cadastrarAluno, cadastrarPersonal } from "../../services/Auth/cadastro";
import { User, Dumbbell, Building, Loader2 } from "lucide-react";
import "./style.css";

const CadastroMultiEtapas = ({ tipoUsuario = "aluno" }) => {
  const navigate = useNavigate();
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [loading, setLoading] = useState(false);
  const [usuarioCadastrado, setUsuarioCadastrado] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState(tipoUsuario);

  const userTypes = [
    { 
      id: "aluno", 
      label: "Aluno", 
      icon: User, 
      color: "#368DD9",
      shortLabel: "Aluno"
    },
    { 
      id: "personal", 
      label: "Personal Trainer", 
      icon: Dumbbell, 
      color: "#4CAF50",
      shortLabel: "Personal"
    },
    { 
      id: "academia", 
      label: "Academia", 
      icon: Building, 
      color: "#FF6B35",
      shortLabel: "Academia"
    }
  ];

  const [dadosFormulario, setDadosFormulario] = useState({
    // Dados pessoais (Etapa 1)
    nome: "",
    cpf: "",
    rg: "",
    numTel: "",
    
    // Campos específicos para academia
    cnpj: "",
    nome_fantasia: "",
    razao_social: "",
    
    // Perfil (Etapa 2)
    data_nascimento: "",
    genero: "",
    altura: "",
    meta: "",
    sobre: "",
    treinos_adaptados: false,
    modalidades: [],
    foto_url: "",
    foto_blob: null,
    
    // Endereço (Etapa 3)
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    pais: "Brasil",
    
    // Login (Etapa 4)
    email: "",
    senha: "",
    confirmarSenha: "",
    
    // CREF (Etapa 5 - apenas personal)
    cref_numero: "",
    cref_categoria: "",
    cref_regional: "",
    idAcademia: ""
  });

  const totalEtapas = selectedUserType === "personal" ? 5 : 4;

  const etapas = [
    { numero: 1, titulo: "Dados Pessoais", icone: "👤" },
    { numero: 2, titulo: "Perfil", icone: "🎯" },
    { numero: 3, titulo: "Endereço", icone: "📍" },
    { numero: 4, titulo: "Login", icone: "🔐" },
  ];

  if (selectedUserType === "personal") {
    etapas.push({ numero: 5, titulo: "CREF", icone: "📋" });
  }

  // Função para mudar o tipo de usuário
  const handleUserTypeChange = async (type) => {
    if (type === selectedUserType) return;
    
    setIsSwitching(true);
    
    // Animação de transição
    await new Promise(resolve => setTimeout(resolve, 200));
    
    setSelectedUserType(type);
    // Limpar campos específicos ao mudar o tipo
    setDadosFormulario(prev => ({
      ...prev,
      cref_numero: "",
      cref_categoria: "",
      cref_regional: "",
      idAcademia: "",
      cnpj: "",
      nome_fantasia: "",
      razao_social: ""
    }));
    
    // Finalizar animação
    setTimeout(() => setIsSwitching(false), 300);
  };

  const avancarEtapa = () => {
    if (etapaAtual < totalEtapas) {
      setEtapaAtual(etapaAtual + 1);
    }
  };

  const voltarEtapa = () => {
    if (etapaAtual > 1) {
      setEtapaAtual(etapaAtual - 1);
    }
  };

  const atualizarDados = (novosDados) => {
    setDadosFormulario(prev => ({ ...prev, ...novosDados }));
  };

  const validarEtapa = (etapa) => {
    switch (etapa) {
      case 1: // Dados pessoais
        if (selectedUserType === 'academia') {
            return dadosFormulario.nome && 
                dadosFormulario.cnpj && 
                dadosFormulario.nome_fantasia && 
                dadosFormulario.razao_social;
        } else {
            return dadosFormulario.nome && 
                dadosFormulario.cpf && 
                dadosFormulario.rg && 
                dadosFormulario.numTel;
        }
      
      case 2: // Perfil
        return dadosFormulario.data_nascimento && 
               dadosFormulario.genero &&
               dadosFormulario.modalidades.length > 0;
      
      case 3: // Endereço
        return dadosFormulario.cep && 
               dadosFormulario.cidade && 
               dadosFormulario.estado;
      
      case 4: // Login
        return dadosFormulario.email && 
               dadosFormulario.senha && 
               dadosFormulario.senha === dadosFormulario.confirmarSenha &&
               dadosFormulario.senha.length >= 6;
      
      case 5: // CREF
        return dadosFormulario.cref_numero && 
               dadosFormulario.cref_categoria && 
               dadosFormulario.cref_regional;
      
      default:
        return false;
    }
  };

  // Cadastro inicial (apenas dados básicos)
  const handleCadastroInicial = async () => {
    setLoading(true);
    setIsAnimating(true);
    
    try {
      const dadosCadastro = {
        nome: dadosFormulario.nome,
        cpf: dadosFormulario.cpf.replace(/\D/g, ""),
        rg: dadosFormulario.rg,
        numTel: dadosFormulario.numTel.replace(/\D/g, ""),
        email: dadosFormulario.email,
        senha: dadosFormulario.senha,
        // Endereço
        cep: dadosFormulario.cep.replace(/\D/g, ""),
        logradouro: dadosFormulario.logradouro,
        numero: dadosFormulario.numero,
        complemento: dadosFormulario.complemento,
        bairro: dadosFormulario.bairro,
        cidade: dadosFormulario.cidade,
        estado: dadosFormulario.estado,
        pais: dadosFormulario.pais
      };

      let resultado;
      if (selectedUserType === "aluno") {
        resultado = await cadastrarAluno(dadosCadastro);
      } else {
        // Adicionar dados específicos do personal
        dadosCadastro.cref_numero = dadosFormulario.cref_numero.replace(/\D/g, "");
        dadosCadastro.cref_categoria = dadosFormulario.cref_categoria;
        dadosCadastro.cref_regional = dadosFormulario.cref_regional;
        dadosCadastro.idAcademia = dadosFormulario.idAcademia;
        
        resultado = await cadastrarPersonal(dadosCadastro);
      }

      if (resultado.success) {
        setUsuarioCadastrado({
          id: selectedUserType === "aluno" ? resultado.idAluno : resultado.idPersonal,
          tipo: selectedUserType
        });
        
        // Avançar para completar perfil
        avancarEtapa();
      } else {
        alert(resultado.error || "Erro ao realizar cadastro inicial");
      }
    } catch (error) {
      console.error("Erro no cadastro inicial:", error);
      alert("Erro ao realizar cadastro. Tente novamente.");
    } finally {
      setLoading(false);
      setIsAnimating(false);
    }
  };

  // Completar cadastro (dados do perfil)
  // No método handleCompletarCadastro, atualize as URLs:
  const handleCompletarCadastro = async () => {
    if (!usuarioCadastrado) {
        alert("Erro: usuário não cadastrado.");
        return;
    }

    setLoading(true);
    
    try {
        const dadosPerfil = {
        [selectedUserType === "aluno" ? "idAluno" : "idPersonal"]: usuarioCadastrado.id,
        data_nascimento: dadosFormulario.data_nascimento,
        genero: dadosFormulario.genero,
        foto_url: dadosFormulario.foto_url,
        treinos_adaptados: dadosFormulario.treinos_adaptados ? 1 : 0,
        modalidades: dadosFormulario.modalidades
        };

        // Adicionar campos específicos
        if (selectedUserType === "aluno") {
        dadosPerfil.altura = dadosFormulario.altura ? parseFloat(dadosFormulario.altura) : null;
        dadosPerfil.meta = dadosFormulario.meta;
        } else {
        dadosPerfil.sobre = dadosFormulario.sobre;
        }

        // CORRIGIDO: Remove /api/ da URL
        const endpoint = selectedUserType === "aluno" 
        ? "cadastro/completar-aluno" 
        : "cadastro/completar-personal";

        const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(dadosPerfil),
        });

        const resultado = await response.json();

        if (resultado.success) {
        navigate("/login", {
            state: {
            message: "Cadastro realizado com sucesso! Faça login para continuar.",
            email: dadosFormulario.email
            }
        });
        } else {
        alert(resultado.error || "Erro ao completar cadastro");
        }
    } catch (error) {
        console.error("Erro ao completar cadastro:", error);
        alert("Erro ao completar cadastro. Tente novamente.");
    } finally {
        setLoading(false);
    }
  };

  const handleFinalizar = () => {
    if (etapaAtual === 4 && !usuarioCadastrado) {
      // Primeira parte do cadastro (dados básicos + login)
      handleCadastroInicial();
    } else if (etapaAtual === totalEtapas && usuarioCadastrado) {
      // Segunda parte (completar perfil)
      handleCompletarCadastro();
    }
  };

  const renderizarEtapa = () => {
    switch (etapaAtual) {
      case 1:
        return (
          <EtapaDadosPessoais
            dados={dadosFormulario}
            onChange={atualizarDados}
            tipoUsuario={selectedUserType}
          />
        );
      
      case 2:
        return (
          <EtapaPerfil
            dados={dadosFormulario}
            onChange={atualizarDados}
            tipoUsuario={selectedUserType}
          />
        );
      
      case 3:
        return (
          <EtapaEndereco
            dados={dadosFormulario}
            onChange={atualizarDados}
          />
        );
      
      case 4:
        return (
          <EtapaLogin
            dados={dadosFormulario}
            onChange={atualizarDados}
          />
        );
      
      case 5:
        return (
          <EtapaCREF
            dados={dadosFormulario}
            onChange={atualizarDados}
          />
        );
      
      default:
        return null;
    }
  };

  const getTextoBotao = () => {
    if (etapaAtual === 4 && !usuarioCadastrado) {
      return loading ? "Cadastrando..." : "Cadastrar e Continuar";
    } else if (etapaAtual === totalEtapas && usuarioCadastrado) {
      return loading ? "Finalizando..." : "Finalizar Cadastro";
    } else {
      return "Próximo";
    }
  };

  const CurrentIcon = userTypes.find(type => type.id === selectedUserType)?.icon || User;
  const currentType = userTypes.find(type => type.id === selectedUserType);

  return (
    <div className="cadastro-multi-etapas">
      <div className="cadastro-header">
        <h1>Criar Conta - {currentType?.label}</h1>
        <p>Complete seu cadastro em {totalEtapas} etapas simples</p>
      </div>

      {/* Seletor de Tipo de Usuário Compacto (igual ao antigo) */}
      <div className="user-type-selector-compact">
        <div className="user-type-slider">
          <div className="slider-track">
            <div 
              className="slider-thumb" 
              style={{ 
                transform: `translateX(${userTypes.findIndex(type => type.id === selectedUserType) * 100}%)`,
                backgroundColor: currentType?.color 
              }}
            />
          </div>
          <div className="user-type-buttons">
            {userTypes.map((type, index) => {
              const IconComponent = type.icon;
              return (
                <button
                  key={type.id}
                  type="button"
                  className={`user-type-btn ${selectedUserType === type.id ? 'active' : ''}`}
                  onClick={() => handleUserTypeChange(type.id)}
                  style={{ color: selectedUserType === type.id ? type.color : '#aaa' }}
                >
                  <IconComponent size={20} />
                  <span>{type.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Indicador do Tipo Atual */}
        <div className={`current-type-indicator ${isSwitching ? 'switching' : ''}`}>
          <div className="indicator-icon" style={{ color: currentType?.color }}>
            <CurrentIcon size={24} />
          </div>
          <span className="indicator-label">{currentType?.label}</span>
        </div>
      </div>

      <BarraProgresso
        etapas={etapas}
        etapaAtual={etapaAtual}
        tipoUsuario={selectedUserType}
      />

      <div className={`etapa-conteudo ${isAnimating ? 'pulse-animation' : ''}`}>
        {renderizarEtapa()}
      </div>

      <div className="navegacao-etapas">
        {etapaAtual > 1 && (
          <button
            type="button"
            className="btn-voltar"
            onClick={voltarEtapa}
            disabled={loading}
          >
            Voltar
          </button>
        )}
    
        <button
          type="button"
          className={etapaAtual === totalEtapas ? "btn-finalizar" : "btn-avancar"}
          onClick={etapaAtual === 4 || etapaAtual === totalEtapas ? handleFinalizar : avancarEtapa}
          disabled={!validarEtapa(etapaAtual) || loading}
        >
          {loading ? (
            <>
              <Loader2 className="spinner" size={20} />
              {getTextoBotao()}
            </>
          ) : (
            getTextoBotao()
          )}
        </button>
      </div>

      {usuarioCadastrado && (
        <div className="cadastro-pendente">
          <p>✅ Cadastro básico realizado! Complete seu perfil para finalizar.</p>
        </div>
      )}
    </div>
  );
};

export default CadastroMultiEtapas;

style.css:

/* ======================= */
/* CADASTRO MULTI-ETAPAS */
/* ======================= */

.cadastro-multi-etapas {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  z-index: 2;
}

.cadastro-header {
  text-align: center;
  margin-bottom: 40px;
}

.cadastro-header h1 {
  color: white;
  font-size: 2.2em;
  margin-bottom: 10px;
  font-weight: 600;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.cadastro-header p {
  color: #aaa;
  font-size: 1.1em;
}

/* ======================= */
/* BARRA DE PROGRESSO */
/* ======================= */

.barra-progresso-container {
  margin-bottom: 40px;
}

.barra-progresso {
  height: 6px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  margin-bottom: 30px;
  position: relative;
  overflow: hidden;
}

.barra-progresso-preenchimento {
  height: 100%;
  background: linear-gradient(135deg, #368DD9, #2a6dad);
  border-radius: 3px;
  transition: width 0.3s ease;
  box-shadow: 0 2px 8px rgba(54, 141, 217, 0.3);
}

.etapas-lista {
  display: flex;
  justify-content: space-between;
  position: relative;
}

.etapa-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
}

.etapa-item:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 20px;
  right: -50%;
  width: 100%;
  height: 2px;
  background-color: rgba(255, 255, 255, 0.1);
  z-index: 1;
}

.etapa-item.concluido:not(:last-child)::after {
  background-color: #368DD9;
}

.etapa-icone {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 8px;
  z-index: 2;
  transition: all 0.3s ease;
  color: #aaa;
  font-size: 14px;
}

.etapa-item.ativo .etapa-icone {
  background-color: #368DD9;
  border-color: #368DD9;
  color: white;
  transform: scale(1.1);
  box-shadow: 0 4px 15px rgba(54, 141, 217, 0.4);
}

.etapa-item.concluido .etapa-icone {
  background-color: #4CAF50;
  border-color: #4CAF50;
  color: white;
}

.etapa-titulo {
  font-size: 12px;
  font-weight: 500;
  color: #aaa;
  text-align: center;
  margin-bottom: 4px;
  transition: all 0.3s ease;
}

.etapa-item.ativo .etapa-titulo {
  color: #368DD9;
  font-weight: 600;
}

.etapa-item.concluido .etapa-titulo {
  color: #4CAF50;
}

.etapa-numero {
  font-size: 10px;
  color: #666;
}

/* ======================= */
/* CONTEÚDO DA ETAPA */
/* ======================= */

.etapa-conteudo {
  background: rgba(39, 41, 42, 0.95);
  backdrop-filter: blur(10px);
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 30px;
  animation: slideInFromRight 0.5s ease-out;
}

.etapa-perfil h2,
.etapa-dados-pessoais h2,
.etapa-endereco h2,
.etapa-login h2,
.etapa-cref h2 {
  color: white;
  margin-bottom: 8px;
  font-size: 1.6em;
  font-weight: 600;
}

.etapa-perfil > p,
.etapa-dados-pessoais > p,
.etapa-endereco > p,
.etapa-login > p,
.etapa-cref > p {
  color: #aaa;
  margin-bottom: 30px;
  font-size: 0.95em;
}

/* ======================= */
/* FOTO DE PERFIL */
/* ======================= */

.foto-perfil-section {
  margin-bottom: 30px;
}

.foto-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  margin-bottom: 15px;
  color: white;
}

.foto-container {
  position: relative;
  width: 120px;
  height: 120px;
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.foto-container:hover {
  border-color: #368DD9;
  transform: translateY(-2px);
}

.foto-preview {
  position: relative;
  width: 100%;
  height: 100%;
}

.foto-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
}

.btn-remover-foto {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s ease;
  color: #333;
}

.btn-remover-foto:hover {
  background: white;
  transform: scale(1.1);
}

.foto-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #aaa;
  gap: 8px;
  transition: all 0.3s ease;
}

.foto-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.foto-instructions {
  color: #888;
  font-size: 12px;
  margin-top: 8px;
}

/* ======================= */
/* FORM GRID */
/* ======================= */

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
}

.input-group.full-width {
  grid-column: 1 / -1;
}

.input-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  margin-bottom: 8px;
  color: white;
  font-size: 14px;
}

.input-group-animated {
  position: relative;
  margin-bottom: 20px;
  width: 100%;
}

.cad-input-global {
  width: 100%;
  padding: 14px 15px;
  border: 2px solid transparent;
  border-radius: 8px;
  background: rgba(30, 31, 32, 0.9);
  color: white;
  font-size: 14px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.cad-input-global::placeholder {
  color: #888;
}

.cad-input-global:focus {
  outline: none;
  border-color: #368DD9;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(54, 141, 217, 0.3);
}

.input-focus-border {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: #368DD9;
  transition: all 0.3s ease;
  transform: translateX(-50%);
}

.cad-input-global:focus ~ .input-focus-border {
  width: 100%;
}

/* ======================= */
/* IDADE CALCULADA */
/* ======================= */

.idade-calculada {
  font-size: 12px;
  color: #368DD9;
  margin-top: 4px;
  font-weight: 500;
}

/* ======================= */
/* CHECKBOX */
/* ======================= */

.checkbox-group {
  margin-bottom: 20px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-weight: 500;
  color: white;
  font-size: 14px;
}

.checkbox-label input {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #666;
  border-radius: 4px;
  position: relative;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.checkbox-label input:checked + .checkmark {
  background: #368DD9;
  border-color: #368DD9;
}

.checkbox-label input:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

/* ======================= */
/* MODALIDADES */
/* ======================= */

.modalidades-section {
  margin-top: 20px;
}

.modalidades-section label {
  display: block;
  font-weight: 500;
  margin-bottom: 15px;
  color: white;
  font-size: 14px;
}

.modalidades-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.modalidade-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.05);
  color: white;
}

.modalidade-checkbox:hover {
  border-color: #368DD9;
  background: rgba(54, 141, 217, 0.1);
  transform: translateY(-2px);
}

.modalidade-checkbox input:checked + .checkmark {
  background-color: #368DD9;
  border-color: #368DD9;
}

/* ======================= */
/* PASSWORD INPUT */
/* ======================= */

.password-input-container {
  position: relative;
  width: 100%;
}

.password-input-container input {
  padding-right: 45px !important;
  width: 100%;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #aaa;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: all 0.3s ease;
  z-index: 2;
}

.password-toggle:hover {
  color: #368DD9;
  background: rgba(54, 141, 217, 0.1);
}

/* ======================= */
/* DICAS SENHA */
/* ======================= */

.dicas-senha {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 15px;
  margin-top: 20px;
}

.dicas-senha p {
  color: white;
  margin-bottom: 10px;
  font-weight: 500;
}

.dicas-senha ul {
  margin: 10px 0 0 20px;
  color: #aaa;
}

.dicas-senha li {
  margin-bottom: 5px;
  font-size: 14px;
}

/* ======================= */
/* INFO CREF */
/* ======================= */

.info-cref {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
}

.info-cref h4 {
  color: white;
  margin-bottom: 10px;
  font-size: 1.1em;
}

.info-cref ul {
  margin: 10px 0 0 20px;
  color: #aaa;
}

.info-cref li {
  margin-bottom: 8px;
  font-size: 14px;
}

/* ======================= */
/* INPUT WITH BUTTON */
/* ======================= */

.input-with-button {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.btn-buscar-cep {
  background: #368DD9;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 14px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  white-space: nowrap;
  transition: all 0.3s ease;
  margin-left: 0;
  min-width: 100px;
  justify-content: center;
}

.btn-buscar-cep:hover:not(:disabled) {
  background: #2a6dad;
  transform: translateY(-1px);
}

.btn-buscar-cep:disabled {
  background: #666;
  cursor: not-allowed;
  opacity: 0.7;
}

/* ======================= */
/* NAVEGAÇÃO */
/* ======================= */

.navegacao-etapas {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}

.btn-voltar,
.btn-avancar,
.btn-finalizar {
  padding: 14px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-voltar {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-voltar:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.btn-avancar {
  background: linear-gradient(135deg, #368DD9, #2a6dad);
  color: white;
}

.btn-avancar:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(54, 141, 217, 0.4);
}

.btn-finalizar {
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
}

.btn-finalizar:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(76, 175, 80, 0.4);
}

.btn-voltar:disabled,
.btn-avancar:disabled,
.btn-finalizar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* ======================= */
/* CARACTERES RESTANTES */
/* ======================= */

.caracteres-restantes {
  font-size: 12px;
  color: #888;
  margin-top: 5px;
  text-align: right;
}

/* ======================= */
/* ERROS */
/* ======================= */

.erro {
  color: #ff6b6b;
  font-size: 12px;
  margin-top: 5px;
  display: block;
  padding-left: 5px;
  animation: fadeIn 0.3s ease-out;
}

/* ======================= */
/* INSTRUÇÕES SALVAMENTO */
/* ======================= */

.instrucoes-salvamento {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 15px;
  margin-top: 15px;
  font-size: 14px;
}

.instrucao-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: #aaa;
}

.instrucao-item:last-child {
  margin-bottom: 0;
}

.instrucao-item code {
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  color: white;
}

/* ======================= */
/* CADASTRO PENDENTE */
/* ======================= */

.cadastro-pendente {
  background: rgba(76, 175, 80, 0.1);
  color: #4CAF50;
  border: 1px solid rgba(76, 175, 80, 0.3);
  padding: 12px 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
  width: 100%;
  font-size: 14px;
  animation: fadeIn 0.3s ease-out;
}

/* ======================= */
/* ANIMAÇÕES */
/* ======================= */

@keyframes slideInFromRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ======================= */
/* RESPONSIVIDADE */
/* ======================= */

@media (max-width: 768px) {
  .cadastro-multi-etapas {
    padding: 15px;
    max-width: 100%;
  }
  
  .etapa-conteudo {
    padding: 20px;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .modalidades-grid {
    grid-template-columns: 1fr;
  }
  
  .etapas-lista {
    flex-direction: column;
    gap: 20px;
  }
  
  .etapa-item:not(:last-child)::after {
    display: none;
  }
  
  .navegacao-etapas {
    flex-direction: column;
  }
  
  .btn-voltar,
  .btn-avancar,
  .btn-finalizar {
    width: 100%;
  }
  
  .input-with-button {
    flex-direction: column;
  }
  
  .btn-buscar-cep {
    width: 100%;
    margin-left: 0;
    margin-top: 10px;
  }
}

@media (max-width: 480px) {
  .cadastro-header h1 {
    font-size: 1.8em;
  }
  
  .cadastro-header p {
    font-size: 1em;
  }
  
  .etapa-conteudo {
    padding: 15px;
  }
  
  .foto-container {
    width: 100px;
    height: 100px;
  }
}

/* ======================= */
/* ACESSIBILIDADE */
/* ======================= */

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

.cad-input-global:focus-visible {
  outline: 2px solid #368DD9;
  outline-offset: 2px;
}

/* ======================= */
/* SCROLL SUAVE */
/* ======================= */

.cadastro-multi-etapas {
  overflow-y: auto;
}

.cadastro-multi-etapas::-webkit-scrollbar {
  width: 6px;
}

.cadastro-multi-etapas::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.cadastro-multi-etapas::-webkit-scrollbar-thumb {
  background: rgba(54, 141, 217, 0.5);
  border-radius: 3px;
}

.cadastro-multi-etapas::-webkit-scrollbar-thumb:hover {
  background: rgba(54, 141, 217, 0.7);
}









/* ======================= */
/* ANIMAÇÕES ADICIONAIS */
/* ======================= */

.pulse-animation {
  animation: pulse 0.5s ease-in-out;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}

/* ======================= */
/* BOTÃO LOADING */
/* ======================= */

.btn-avancar.loading,
.btn-finalizar.loading {
  opacity: 0.8;
  cursor: not-allowed;
}

.btn-avancar .spinner,
.btn-finalizar .spinner {
  animation: spin 1s linear infinite;
  margin-right: 8px;
}



.foto-info {
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 8px;
  padding: 10px;
  margin-top: 10px;
  color: #ffc107;
  font-size: 12px;
  text-align: center;
}

services/api.js (antigo):

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 
    "Content-Type": "application/json",
  },
  // REMOVA withCredentials da configuração global
  timeout: 30000,
});

// Interceptor para injetar token APENAS para rotas autenticadas
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  
  // Apenas rotas autenticadas precisam de credentials
  const publicRoutes = [
    '/auth/login',
    '/cadastro/',
    '/recuperacao-senha/',
    '/config/'
  ];
  
  const isPublicRoute = publicRoutes.some(route => config.url?.includes(route));
  
  if (!isPublicRoute && token) {
    config.headers.Authorization = `Bearer ${token}`;
    config.withCredentials = true; // Apenas para rotas autenticadas
  }
  
  console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Interceptor de resposta mantém o mesmo
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`❌ API Error:`, {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      localStorage.removeItem("lembrarLogin");
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;

services/api.js (novo):

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 
    "Content-Type": "application/json",
  },
  // REMOVA withCredentials da configuração global
  timeout: 30000,
});

// Interceptor para injetar token APENAS para rotas autenticadas
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  
  // Apenas rotas autenticadas precisam de credentials
  const publicRoutes = [
    '/auth/login',
    '/cadastro/',
    '/recuperacao-senha/',
    '/config/'
  ];
  
  const isPublicRoute = publicRoutes.some(route => config.url?.includes(route));
  
  if (!isPublicRoute && token) {
    config.headers.Authorization = `Bearer ${token}`;
    config.withCredentials = true; // Apenas para rotas autenticadas
  }
  
  console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Interceptor de resposta mantém o mesmo
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`❌ API Error:`, {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      localStorage.removeItem("lembrarLogin");
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;

services/Auth/:

cadastro.js:

import api from "../api";

// cadastrar aluno
export const cadastrarAluno = async (dados) => {
  try {
    const response = await api.post("/cadastro/aluno", dados);
    return response.data;
  } catch (error) {
    console.error("Erro ao cadastrar aluno:", error);
    throw error;
  }
};

// cadastrar personal
export const cadastrarPersonal = async (dados) => {
  try {
    const response = await api.post("/cadastro/personal", dados);
    return response.data;
  } catch (error) {
    console.error("Erro ao cadastrar personal:", error);
    throw error;
  }
};

// cadastrar academia - FUNÇÃO ADICIONADA
export const cadastrarAcademia = async (dados) => {
  try {
    const response = await api.post("/cadastro/academia", dados);
    return response.data;
  } catch (error) {
    console.error("Erro ao cadastrar academia:", error);
    throw error;
  }
};

// verificar se o email já existe
export const verificarEmail = async (dados) => {
  try {
    const res = await api.post("/cadastro/verificar-email", dados);
    return res.data; // { success: true, disponivel: true/false, email: "..." }
  } catch (err) {
    console.error("Erro ao verificar email:", err);
    return { success: false, disponivel: false };
  }
};

// verificar se o CPF já existe
export const verificarCpf = async (dados) => {
  try {
    const res = await api.post("/cadastro/verificar-cpf", dados);
    return res.data; // { success: true, disponivel: true/false, cpf: "..." }
  } catch (err) {
    console.error("Erro ao verificar CPF:", err);
    return { success: false, disponivel: false };
  }
};

// verificar se o RG já existe
export const verificarRg = async (dados) => {
  try {
    const res = await api.post("/cadastro/verificar-rg", dados);
    return res.data; // { success: true, disponivel: true/false, rg: "..." }
  } catch (err) {
    console.error("Erro ao verificar RG:", err);
    return { success: false, disponivel: false };
  }
};

// verificar se o CNPJ já existe - FUNÇÃO ADICIONADA
export const verificarCnpj = async (dados) => {
  try {
    const res = await api.post("/cadastro/verificar-cnpj", dados);
    return res.data; // { success: true, disponivel: true/false, cnpj: "..." }
  } catch (err) {
    console.error("Erro ao verificar CNPJ:", err);
    return { success: false, disponivel: false };
  }
};

// buscar academias ativas para select
export const buscarAcademiasAtivas = async () => {
  try {
    const response = await api.get("/academias-ativas");
    return response.data; // { success: true, data: [...] }
  } catch (error) {
    console.error("Erro ao buscar academias:", error);
    return { success: false, data: [] };
  }
};

.env.development:

VITE_API_URL=http://localhost/BackEnd/api/

.env.production:

VITE_API_URL=https://api.clidefit.com.br/

lembre-se que cada um dos 3 tipos de usuários (aluno, personal e academia) deve poder adicionar uma foto de perfil, se quiser (opcional)