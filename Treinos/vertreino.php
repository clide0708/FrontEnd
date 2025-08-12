<?php
require_once 'conect.php';

$treino_id = $_GET['id'] ?? '';
if (!$treino_id) die("Treino não especificado");

try {
    $pdo = connectDB();

    // Buscar dados do treino
    $stmtTreino = $pdo->prepare("SELECT * FROM Treinos WHERE id = ?");
    $stmtTreino->execute([$treino_id]);
    $treino = $stmtTreino->fetch();

    if (!$treino) die("Treino não encontrado");

    $treino_id = $treino['id']; // Garante que $treino_id está definido para o formulário do modal

    // Buscar exercícios do treino
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
    <!-- <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="assets/css/templatemo-cyborg-gaming.css"> -->
</head>

<body class="treinos">

    <?php include 'btnvoltar.php'; ?>

    <div class="container">
        <h1>Treino: <?= htmlspecialchars($treino['nome']) ?></h1>

        <div style="display: flex; gap: 20px;">

            <div id="painel-edicao" style="flex: 2; display: none;">
                <h2 id="titulo-exercicio">Selecione um exercício para editar</h2>
                <form id="form-exercicio" method="POST" action="update2.php">
                    <input type="hidden" name="id" id="exercicio-id">
                    <input type="hidden" name="treino_id" value="<?= $treino_id ?>">

                    <label>Séries:</label><br>
                    <input type="number" name="num_series" id="num_series" min="1"><br><br>

                    <label>Repetições:</label><br>
                    <input type="number" name="num_repeticoes" id="num_repeticoes" min="1"><br><br>

                    <label>Descanso (segundos):</label><br>
                    <input type="number" name="tempo_descanso" id="tempo_descanso"><br><br>

                    <label>Peso (kg):</label><br>
                    <input type="number" step="0.01" name="peso" id="peso"><br><br>

                    <button type="submit">Salvar Alterações</button>
                </form>
            </div>

            <!-- Lista de Exercícios -->
            <div style="flex: 1;">
                <h3>Exercícios</h3>
                <ul id="listaExercicios">
                    <?php foreach ($exercicios as $ex): ?>
                        <li>
                            <a href="#" onclick="carregarExercicio(<?= $ex['id'] ?>); return false;">
                                <?= htmlspecialchars($ex['nome']) ?>
                            </a>
                            <a href="delete2.php?id=<?= $ex['id'] ?>&treino_id=<?= $treino_id ?>" onclick="return confirm('Tem certeza que deseja remover este exercício?')">[remover]</a>
                        </li>
                    <?php endforeach; ?>
                </ul>

                <h4>Adicionar Novo Exercício</h4>
                <button onclick="abrirModal()">+ Adicionar Exercício</button>
            </div>

            <a href="treinando.php?id=<?= urlencode($treino['id']) ?>">Iniciar Treino</a>
        </div>

        <!-- Modal para Adicionar Exercício -->
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

    <script>
        function carregarExercicio(id) {
            fetch('get2.php?id=' + id)
                .then(response => {
                    if (!response.ok) throw new Error('Erro ao buscar exercício');
                    return response.json();
                })
                .then(data => {
                    if (data.error) {
                        alert('Erro: ' + data.error);
                        return;
                    }
                    // Preenche os campos
                    document.getElementById('titulo-exercicio').innerText = 'Editar: ' + data.nome;
                    document.getElementById('exercicio-id').value = data.id;
                    document.getElementById('num_series').value = data.num_series;
                    document.getElementById('num_repeticoes').value = data.num_repeticoes;
                    document.getElementById('tempo_descanso').value = data.tempo_descanso ?? '';
                    document.getElementById('peso').value = data.peso ?? '';

                    // Mostrar o painel
                    document.getElementById('painel-edicao').style.display = 'block';
                })
                .catch(err => {
                    alert(err.message);
                });
        }


        function abrirModal() {
            document.getElementById('modal').style.display = 'block';
        }

        function fecharModal() {
            document.getElementById('modal').style.display = 'none';
            document.getElementById('formAddExercicio').reset();
        }

        document.getElementById('formAddExercicio').addEventListener('submit', function(e) {
            e.preventDefault();

            fetch('post2.php', {
                    method: 'POST',
                    body: new FormData(this)
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        window.location.reload();
                    } else if (data.error) {
                        alert('Erro: ' + data.error);
                    } else {
                        alert('Resposta inesperada do servidor');
                    }
                })
                .catch(err => {
                    alert('Erro ao adicionar exercício: ' + err.message);
                });
        });


        // isso daqui vai filtrar para os exercícios só aparecerem conforme o maluco botar o músculo, e vai pegar do json

        const muscleSelect = document.getElementById('muscle-select');
        const exerciseSelect = document.getElementById('exercise-select');

        muscleSelect.addEventListener('change', () => {
            const muscle = muscleSelect.value.trim();
            exerciseSelect.innerHTML = '';

            if (!muscle) {
                exerciseSelect.innerHTML = '<option value="">Selecione um músculo primeiro</option>';
                exerciseSelect.disabled = true;
                return;
            }

            exerciseSelect.disabled = false;
            exerciseSelect.innerHTML = '<option>Carregando...</option>';

            fetch('fetch_exercises.php?grupo=' + encodeURIComponent(muscle))
                .then(res => {
                    if (!res.ok) throw new Error('Erro na resposta do servidor');
                    return res.json();
                })
                .then(data => {
                    exerciseSelect.innerHTML = '';
                    if (!Array.isArray(data) || data.length === 0) {
                        exerciseSelect.innerHTML = '<option>Nenhum exercício encontrado</option>';
                        return;
                    }

                    exerciseSelect.innerHTML = '<option value="">-- Selecione o Exercício --</option>';
                    data.forEach(ex => {
                        const opt = document.createElement('option');
                        opt.value = ex.nome;
                        opt.textContent = ex.nome;
                        exerciseSelect.appendChild(opt);
                    });
                })
                .catch(() => {
                    exerciseSelect.innerHTML = '<option>Erro ao carregar exercícios</option>';
                });
        });
    </script>

    <style>
        /* Estilos básicos para o modal */
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