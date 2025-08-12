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
</head>

<body>

    <div id="container">
        <div id="lista-exercicios">
            <h3><?php echo htmlspecialchars($treino['nome'] ?? 'Treino'); ?></h3>
            <div id="lista"></div>
        </div>

        <div id="conteudo">
            <!-- não sei pq fui fazer em ajax dnv, mas vai mostrar execução, descanso e finalizado, só tem q arrumar a validação de conclusão -->
            <div id="view">

                <!-- EXECUÇÃO -->
                <div id="view-execucao" style="display:none;">
                    <h2 id="ex-nome"></h2>

                    <div id="video-container" style="position:relative; width:560px; max-width:100%; cursor:pointer; border-radius:6px; overflow:hidden;">
                        <img id="ex-cover" src="" alt="Capa do exercício" style="width:100%; height:315px; object-fit:cover; display:block; border-radius:6px;" />
                        <div id="play-button" style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); font-size:48px; color:#fff; opacity:0.8; pointer-events:none;">▶</div>
                    </div>

                    <div class="info-row"><strong>Série:</strong> <span id="ex-serie"></span></div>
                    <div class="info-row"><strong>Repetições:</strong> <span id="ex-reps"></span></div>
                    <div class="info-row"><strong>Peso:</strong> <span id="ex-peso"></span> kg</div>
                    <div class="info-row small-muted" id="ex-info"></div>
                </div>

                <!-- DESCANSO -->
                <div id="view-descanso" style="display:none;">
                    <h2 id="descanso-titulo"></h2>
                    <div class="timer" id="timer"></div>
                    <div class="small-muted" id="descanso-info"></div>
                </div>

                <!-- FINALIZADO -->
                <div id="view-finalizado" style="display:none;">
                    <h2>Treino finalizado! 💪🔥</h2>
                    <p class="small-muted">Parabéns — você completou todas as séries e exercícios.</p>
                </div>

            </div>

            <div class="controls" style="position:fixed; left:24px; bottom:24px;">
                <button id="btn-voltar" class="btn btn-voltar">Voltar</button>
            </div>

            <div class="controls" style="right:24px; bottom:24px;">
                <button id="btn-avancar" class="btn btn-avancar">Avançar</button>
            </div>

        </div>
    </div>

    <script>
        const raw = <?php echo json_encode($exercicios, JSON_UNESCAPED_UNICODE); ?> || [];
    </script>
    <script src="assets/js/treinando.js"></script>

</body>

</html>