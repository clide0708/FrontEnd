<?php
require_once 'conect.php';

try {
    $pdo = connectDB();
    $stmt = $pdo->query("SELECT * FROM Treinos ORDER BY data_ultima_modificacao DESC");
    $treinos = $stmt->fetchAll();
} catch (PDOException $e) {
    die("Erro ao carregar treinos: " . $e->getMessage());
}
?>

<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <title>Clide Fit - Treinos</title>
</head>

<body class="treinos">

    <?php include 'btnvoltar.php'; ?>

    <div class="container">
        <h1>Academia</h1>
        <form action="post.php" method="POST" style="margin-bottom: 30px;">
            <label>Nome do Treino:</label><br>
            <input type="text" name="nome" required><br><br>

            <label>Especialidades (músculos trabalhados):</label><br>
            <input type="text" name="especialidades"><br><br>

            <button type="submit">Adicionar Treino</button>
        </form>

        <div class="tablescrollref">
            <?php foreach ($treinos as $treino): ?>
                <table class="tableref">
                    <tbody>
                        <tr>
                            <td>
                                <a href="vertreino.php?id=<?= urlencode($treino['id']) ?>">
                                    <?= htmlspecialchars($treino['nome']) ?>
                                </a>
                            </td>
                            <td><?= htmlspecialchars($treino['data_ultima_modificacao']) ?></td>
                            <td>?</td>
                            <td><?= htmlspecialchars($treino['especialidades']) ?></td>
                            <td>
                                <a href="delete.php?id=<?= urlencode($treino['id']) ?>" onclick="return confirm('Tem certeza que deseja deletar o treino <?= htmlspecialchars(addslashes($treino['nome'])) ?>?')">
                                    [deletar]
                                </a>
                            </td>
                        </tr>
                    </tbody>
                </table>
            <?php endforeach; ?>
        </div>

    </div>

</body>

</html>