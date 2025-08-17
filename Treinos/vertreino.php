<?php
require_once 'conect.php';

$treino_id = $_GET['id'] ?? '';
if (!$treino_id) die("Treino não especificado");

try {
    $pdo = connectDB();

    // select dos treinos
    $stmtTreino = $pdo->prepare("SELECT * FROM Treinos WHERE id = ?");
    $stmtTreino->execute([$treino_id]);
    $treino = $stmtTreino->fetch();

    if (!$treino) die("Treino não encontrado");

    $treino_id = $treino['id'];

    // select dos exercícios dos treinos
    $stmtExercicios = $pdo->prepare("SELECT * FROM Exercicios WHERE treino_id = ?");
    $stmtExercicios->execute([$treino_id]);
    $exercicios = $stmtExercicios->fetchAll();
} catch (PDOException $e) {
    die("Erro: " . $e->getMessage());
}
?>

<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>Treino: <?= htmlspecialchars($treino['nome']) ?></title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="assets/css/templatemo-cyborg-gaming.css">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">


</head>

<body class="treinos">

    <?php include 'header.php'; ?>

    <div class="vertreinopt">
        <div class="cbctt">
            <h1 class="ttltrn"><?= htmlspecialchars($treino['nome']) ?></h1>

        </div>
        <div class="vertreinopt2">


            <div class="painel" style="display: flex; gap: 20px;">
                <h2 id="titulo-exercicio">Selecione um exercício</h2>
                <div id="painel-edicao" style="flex: 2; display: none;">
                    <form id="form-exercicio" method="POST" action="update2.php">
                        <div class="formedit">
                            <div class="form1">
                                <input type="hidden" name="id" id="exercicio-id">
                                <input type="hidden" name="treino_id" value="<?= $treino_id ?>">

                                <label>Séries*</label><br>
                                <input type="number" name="num_series" id="num_series" min="1"><br><br>

                                <label>Repetições*</label><br>
                                <input type="number" name="num_repeticoes" id="num_repeticoes" min="1"><br><br>

                                <label>Peso (kg)</label><br>
                                <input type="number" step="0.01" name="peso" id="peso"><br><br>
                            </div>
                            <div class="form2">
                                <label>Descanso (segundos):</label><br>
                                <input type="number" name="tempo_descanso" id="tempo_descanso"><br><br>
                            </div>
                        </div>
                        <h2 id="info"></h2>
                        <button type="submit" class="slvex">Salvar</button>
                    </form>
                </div>
            </div>

            <!-- lista exercícios  -->
            <div class="p2" style="flex: 1;">
                <h3> Exercícios</h3>
                <ul id="listaExercicios">
                    <?php foreach ($exercicios as $ex): ?>
                        <li class="exitem">
                            <a class="nmextt" href="#" onclick="carregarExercicio(<?= $ex['id'] ?>); return false;">
                                <?= htmlspecialchars($ex['nome']) ?>
                            </a>
                            <a class="exdlt" href="delete2.php?id=<?= $ex['id'] ?>&treino_id=<?= $treino_id ?>" onclick="return confirm('Tem certeza que deseja remover este exercício?')">X</a>
                        </li>
                    <?php endforeach; ?>
                </ul>
                <button onclick="abrirModal()">+ Adicionar Exercício</button>
            </div>


        </div>

        <a href="treinando.php?id=<?= urlencode($treino['id']) ?>">Iniciar Treino</a>

        <!-- modal add exercício  -->
        <div id="modal" class="modal" style="display:none;">
            <div class="modal-content">
                <span class="close-button" onclick="fecharModal()">&times;</span>
                <h2>Adicionar Novo Exercício</h2>
                <form id="formAddExercicio" method="POST" action="post2.php">
                    <input type="hidden" name="treino_id" value="<?= $treino_id ?>">

                    <div class="form-group">
                        <label for="muscle-select">Escolha o Músculo:</label>
                        <select id="muscle-select" name="grupo">
                            <option value="abdomen">Abdomen</option>
                            <option value="abdutores">Abdutores</option>
                            <option value="adutores">Adutores</option>
                            <option value="antebraco">Antebraços</option>
                            <option value="biceps">Bíceps</option>
                            <option value="costas">Costas</option>
                            <option value="gluteos">Glúteos</option>
                            <option value="ombros">Ombros</option>
                            <option value="panturrilha">Panturrilhas</option>
                            <option value="peitoral">Peitos</option>
                            <option value="posteriordecoxa">Posterior da Coxa</option>
                            <option value="quadriceps">Quadríceps</option>
                            <option value="trapezio">Trapézio</option>
                            <option value="triceps">Tríceps</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="exercise-select">Exercises:</label>
                        <select id="exercise-select" name="nome" disabled>
                            <option value="">Selecione um músculo primeiro</option>
                        </select>
                    </div>

                    <label>Nº de Séries*</label>
                    <input type="number" name="num_series" required min="1"><br><br>

                    <label>Nº de Repetições*</label>
                    <input type="number" name="num_repeticoes" required min="1"><br><br>

                    <label>Tempo de Descanso (segundos - opcional)</label>
                    <input type="number" name="tempo_descanso"><br><br>

                    <label>Peso (kg - opcional)</label>
                    <input type="number" step="0.01" name="peso"><br><br>

                    <button type="submit">Adicionar Exercício</button>
                    <button type="button" onclick="fecharModal()">Cancelar</button>
                </form>
            </div>
        </div>
    </div>

    <script src="assets/js/vertreino.js"></script>


    <style>
        /* css bucha só pra teste, mas não apaga */
        .modal {
            display: none;
            position: fixed;
            z-index: 1;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto;
            background-color: rgba(0, 0, 0, 0.4);
            padding-top: 60px;
        }

        .modal-content {
            background-color: #fefefe;
            margin: 5% auto;
            padding: 20px;
            border: 1px solid #888;
            width: 80%;
            max-width: 500px;
            position: relative;
            border-radius: 8px;
        }

        .close-button {
            color: #aaa;
            float: right;
            font-size: 28px;
            font-weight: bold;
        }

        .close-button:hover,
        .close-button:focus {
            color: black;
            text-decoration: none;
            cursor: pointer;
        }
    </style>

</body>

</html>