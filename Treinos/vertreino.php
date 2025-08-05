<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <title>CLIDE Fit - Detalhes do Treino</title>
    <link href="vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="assets/css/templatemo-cyborg-gaming.css">
</head>

<body class="treinos">

    <?php include 'header.php'; ?>

    <div class="container">
        <?php
        if (isset($_GET['treino'])) {
            $nomeTreino = urldecode($_GET['treino']);
            $json = file_get_contents('treino.json');
            $treinos = json_decode($json, true);

            $treinoEncontrado = null;
            foreach ($treinos as $treino) {
                if ($treino['nome'] === $nomeTreino) {
                    $treinoEncontrado = $treino;
                    break;
                }
            }

            if ($treinoEncontrado) {
                echo "<h1>Detalhes do Treino: " . htmlspecialchars($treinoEncontrado['nome']) . "</h1>";
                echo "<p><strong>Data de Modificação:</strong> " . htmlspecialchars($treinoEncontrado['dataModificacao']) . "</p>";
                echo "<p><strong>Número de Exercícios:</strong> " . htmlspecialchars($treinoEncontrado['numExercicios']) . "</p>";
                echo "<p><strong>Músculos Trabalhados:</strong> " . htmlspecialchars(implode(', ', $treinoEncontrado['musculosTrabalhados'])) . "</p>";
                // Adicione mais detalhes do treino aqui, se houver
            } else {
                echo "<h1>Treino não encontrado.</h1>";
            }
        } else {
            echo "<h1>Nenhum treino selecionado.</h1>";
        }
        ?>
        <p><a href="academia.php">Voltar para Academia</a></p>
    </div>

    <script src="assets/js/script.js"></script>
</body>

</html>
