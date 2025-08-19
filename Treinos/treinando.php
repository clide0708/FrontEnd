<?php
require_once 'conect.php';

$treino_id = $_GET['id'] ?? '';
if (!$treino_id) {
    die("Treino não especificado");
}

try {
    $pdo = connectDB();

    $stmt = $pdo->prepare("SELECT * FROM treinos WHERE id = ?");
    $stmt->execute([$treino_id]);
    $treino = $stmt->fetch(PDO::FETCH_ASSOC);

    $stmtEx = $pdo->prepare("SELECT * FROM exercicios WHERE treino_id = ? ORDER BY id ASC");
    $stmtEx->execute([$treino_id]);
    $exercicios = $stmtEx->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {
    die("Erro: " . $e->getMessage());
}
?>
<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title><?php echo htmlspecialchars($treino['nome'] ?? 'Treino'); ?></title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="assets/css/templatemo-cyborg-gaming.css">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
</head>

<body>

    <?php include 'header.php'; ?>

    <div class="adjustfoda">
        <div class="treinando">
            <div id="lista-exercicios">
                <h3 class="exnm"><?php echo htmlspecialchars($treino['nome'] ?? 'Treino'); ?></h3>
                <div id="lista"></div>
                <button class="ext" onclick="history.back()">Sair</button>
            </div>

            <div id="conteudo">
                <!-- não sei pq fui fazer em ajax dnv, mas vai mostrar execução, descanso e finalizado, só tem q arrumar a validação de conclusão -->
                <div id="view">

                    <!-- EXECUÇÃO -->
                    <div id="view-execucao" style="display:none;">
                        <div class="titulo">
                            <h2 id="ex-nome"></h2>
                            <div class="series"><strong></strong> <span id="ex-serie"></span></div>
                        </div>

                        <div id="video-container">
                            <img id="ex-cover" src="" alt="Capa do exercício" />
                        </div>

                        <div class="infos">
                            <div class="controls">
                                <button id="btn-voltar" class="btn btn-voltar b1">⮜</button>
                            </div>
                            <div class="reps"><strong>X</strong> <span id="ex-reps"></span>
                                <h1>repetições</h1>
                            </div>
                            <div class="peso"><span id="ex-peso"></span> kg</div>
                            <div class="controls">
                                <button id="btn-avancar" class="btn btn-avancar b2">⮞</button>
                            </div>
                        </div>
                    </div>

                    <!-- DESCANSO -->
                    <div id="view-descanso" style="display:none;">
                        <div class="descansano">
                            <div class="titulo">
                                <h2 id="descanso-titulo"></h2>
                            </div>
                            <div class="circulozin">
                                <div class="timer-wrapper">
                                    <svg class="progress-ring" width="120" height="120">
                                        <circle
                                            class="progress-ring__circle"
                                            stroke="#368dd9"
                                            stroke-width="20"
                                            fill="transparent"
                                            r="190"
                                            cx="200"
                                            cy="200" />
                                    </svg>
                                    <div id="timer" class="timer-text"></div>
                                    <button id="btnAdd30">+10s</button>
                                </div>
                            </div>
                            <div class="btns">

                                <div class="small-muted" id="descanso-info"></div>
                                <button class="btnplr" id="btn-avancar">Avançar</button>
                                <button class="btnvtl" id="btn-voltar">Voltar</button>
                            </div>
                        </div>
                    </div>

                    <!-- FINALIZADO -->
                    <div id="view-finalizado" style="display:none;">
                        <h2>Treino finalizado! 💪🔥</h2>
                        <p class="small-muted">Parabéns — você completou todas as séries e exercícios.</p>
                    </div>

                </div>
            </div>
        </div>
    </div>

    <script>
        const raw = <?php echo json_encode($exercicios, JSON_UNESCAPED_UNICODE); ?> || [];
    </script>
    <script src="assets/js/treinando.js"></script>

</body>

</html>