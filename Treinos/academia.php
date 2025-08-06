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
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="assets/css/templatemo-cyborg-gaming.css">
</head>
<body class="treinos">

    <?php include 'header.php'; ?>

    <div class="container">
        <h1>Academia</h1>

        <!-- Formulário para adicionar novo treino -->
        <form action="post.php" method="POST" style="margin-bottom: 30px;">
            <label>Nome do Treino:</label><br>
            <input type="text" name="nome" required><br><br>

            <label>Especialidades (músculos trabalhados):</label><br>
            <input type="text" name="especialidades"><br><br>

            <button type="submit">Adicionar Treino</button>
        </form>

        <!-- Listagem dos treinos -->
        <div class="tablescrollref">
            <?php foreach ($treinos as $treino): ?>
                <a href="vertreino.php?treino=<?= urlencode($treino['nome']) ?>">
                    <table class="tableref">
                        <tbody>
                            <tr>
                                <td><?= htmlspecialchars($treino['nome']) ?></td>
                                <td><?= htmlspecialchars($treino['data_ultima_modificacao']) ?></td>
                                <td>?</td> <!-- quantidade de exercícios ainda não implementado -->
                                <td><?= htmlspecialchars($treino['especialidades']) ?></td>
                            </tr>
                        </tbody>
                    </table>
                </a>
            <?php endforeach; ?>
        </div>
    </div>

</body>
</html>
