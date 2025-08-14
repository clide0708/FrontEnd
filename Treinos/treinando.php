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
</head>

<body>

    <?php include 'header.php'; ?>

    <div class="treinando">
        <div id="lista-exercicios">
            <h3><?php echo htmlspecialchars($treino['nome'] ?? 'Treino'); ?></h3>
            <div id="lista"></div>
            <h3>Sair</h3>
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
                        <div class="reps"><strong>X</strong> <span id="ex-reps"></span><h1>repetições</h1></div>
                        <div class="peso"><span id="ex-peso"></span> kg</div>
                        <div class="info-row small-muted" id="ex-info"></div>
                        <div class="controls">
                            <button id="btn-avancar" class="btn btn-avancar b2">⮞</button>
                        </div>
                    </div>
                </div>

                <!-- DESCANSO -->
                <div id="view-descanso" style="display:none;">
                    <h2 id="descanso-titulo"></h2>
                    <div class="timer" id="timer"></div>
                    <div class="small-muted" id="descanso-info"></div>
                    <div id="controles">
                        <button id="btn-voltar">Voltar</button>
                        <button id="btn-avancar">Avançar</button>
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

    <script>
        const raw = <?php echo json_encode($exercicios, JSON_UNESCAPED_UNICODE); ?> || [];
    </script>
    <script src="assets/js/treinando.js"></script>

</body>

</html>