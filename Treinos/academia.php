<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <title>CLIDE Fit</title>
    <link href="vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="assets/css/templatemo-cyborg-gaming.css">
</head>

<body class="treinos">

    <?php include 'header.php'; ?>

    <div class="container">
        <h1>Academia</h1>

        <?php
        $json = file_get_contents('treino.json');
        $treinos = json_decode($json, true);
        ?>

        <div class="tablescrollref">
            <?php foreach ($treinos as $treino): ?>
                <!-- Adiciona um link para cada linha da tabela -->
                <a href="vertreino.php?treino=<?= urlencode($treino['nome']) ?>">
                    <table class="tableref">
                        <tbody>
                            <tr>
                                <td><?= htmlspecialchars($treino['nome']) ?></td>
                                <td><?= htmlspecialchars($treino['dataModificacao']) ?></td>
                                <td><?= htmlspecialchars($treino['numExercicios']) ?></td>
                                <td><?= htmlspecialchars(implode(', ', $treino['musculosTrabalhados'])) ?></td>
                            </tr>
                        </tbody>
                    </table>
                </a>
            <?php endforeach; ?>
        </div>

    </div>

    <script src="assets/js/script.js"></script>
</body>

</html>