<?php include 'logic.php'; ?>

<!DOCTYPE html>
<html lang="pt-BR">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="pt-BR" lang="pt-BR">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <title>CLIDE Fit</title>
    <link href="vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="../../assets/vendor/css/templatemo-cyborg-gaming.css">
</head>

<body class="alimentacao">

    <!--  Preloader Start  -->
    <!-- <div id="js-preloader" class="js-preloader">
        <div class="preloader-inner">
            <span class="dot"></span>
            <div class="dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    </div> -->
    <!--  Preloader End  -->

    <?php include 'header.php'; ?>

    <!-- Modal Adicionar Alimentos -->
    <div class="modalalimento" id="modalalimento">
        <div class="modalalm-content">
            <div class="addalm">
                <h4 id="modal-title">Adicionar alimentos</h4>
            </div>
            <div class="psqsalm">
                <div class="campo">
                    <input class="inmputmodal" type="text" id="busca-modal" placeholder="Pesquisar alimento..." autocomplete="off">
                </div>
                <div class="sugestoes" id="sugestoes-modal"></div>
            </div>
            <div class="IAinput" action="">
                <input type="file" name="imgia" id="imgia">
                <label for="imgia" class="imgialabel">Upload IMG</label>
                <h3>fazer scan com IA</h3>
            </div>
            <div class="almadd">
                <div class="existing-items" id="existing-items-list">
                    <div class="tbladdmdl" id="tbladdmdl">
                    </div>
                </div>
                <div class="addalmbtn">
                    <button class="mdlcl" id="btn-confirm-modal">Confirmar</button>
                </div>
            </div>
        </div>
    </div>
    <!-- Modal Adicionar Alimentos End -->

    <!-- MODAL DE DETALHES DO ALIMENTO -->
    <div class="modalalimento2 modal-stack" id="modalalimento2">
        <div class="modalalm2-content">
            <div class="addalm">
                <h4>Detalhes do Alimento</h4>
            </div>
            <div class="infnm">
                <h2 id="modalNome">Nome</h2>
                <div class="select">
                    <input maxlength="4" minlength="1" type="number" id="modalGramas" step="0.1"> g/ml
                </div>
            </div>
            <div class="infnt">
                <div class="header">
                    <h1 class="cal">Cal</h1>
                    <h1>Prot</h1>
                    <h1>Carb</h1>
                    <h1>Gord</h1>
                </div>
                <div class="valores">
                    <h1 class="cal" id="modalCal">0</h1>
                    <h1 id="modalProt">0g</h1>
                    <h1 id="modalCarb">0g</h1>
                    <h1 id="modalGord">0g</h1>
                </div>
                <div class="btndv">
                    <form id="modalFormRemover">
                        <input type="hidden" name="lista" id="modalListaRemover">
                        <input type="hidden" name="index" id="modalIndexRemover">
                        <button type="submit" class="btn1"><img src="assets/images/lata-de-lixo.png" alt=""></button>
                    </form>
                    <button class="btn2" onclick="fecharModalDetalhes()">Salvar</button>
                </div>
            </div>
        </div>
    </div>
    <!-- MODAL DE DETALHES DO ALIMENTO END -->


    <div class="container">
        <div class="geral">
            <div class="alim-content">
                <div class="pt1">
                    <div class="heading-section">
                        <h4 class="data"><span id="data">10/07</span></h4>
                    </div>
                    <div class="caltotal">
                        <h1>Calorias</h1>
                        <h1 id="caltotal"><?= round($totaisGerais['calorias'], 1) ?></h1>
                    </div>
                </div>
                <div class="pt2">
                    <h2>Prot - <?= round($totaisGerais['proteinas'], 1) ?>g</h2>
                    <h2>Carb - <?= round($totaisGerais['carboidratos'], 1) ?>g</h2>
                    <h2>Gord - <?= round($totaisGerais['gorduras'], 1) ?>g</h2>
                </div>

                <div class="refeicoes">
                    <div class="ref">
                        <div class="refln">
                            <h1>Café da manhã</h1>
                            <h2><?= round($cafe['totais']['calorias'], 1) ?> Cal</h2>
                        </div>
                        <div class="contalm oculto">
                            <div class="tableheadref">
                                <h1>Prot - <?= round($cafe['totais']['proteinas'], 1) ?>g</h1>
                                <h1>Carb - <?= round($cafe['totais']['carboidratos'], 1) ?>g</h1>
                                <h1>Gord - <?= round($cafe['totais']['gorduras'], 1) ?>g</h1>
                            </div>
                            <div class="tablescrollref">
                                <?php foreach ($cafe['items'] as $item): ?>
                                    <table class="tableref" onclick="event.stopPropagation(); abrirModalDetalhes('cafe', <?= $item['id'] ?>)">
                                        <tbody>
                                            <tr>
                                                <td><?= htmlspecialchars($item['nome']) ?></td>
                                                <td><?= htmlspecialchars($item['especificacao']) ?> g/ml</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                <?php endforeach; ?>
                            </div>
                            <div class="btns">
                                <button type="button" class="add-btn" data-lista="cafe">+</button>
                            </div>
                        </div>
                    </div>

                    <div class="ref">
                        <div class="refln">
                            <h1>Almoço</h1>
                            <h2><?= round($almoco['totais']['calorias'], 1) ?> Cal</h2>
                        </div>
                        <div class="contalm oculto">
                            <div class="tableheadref">
                                <h1>Prot - <?= round($almoco['totais']['proteinas'], 1) ?>g</h1>
                                <h1>Carb - <?= round($almoco['totais']['carboidratos'], 1) ?>g</h1>
                                <h1>Gord - <?= round($almoco['totais']['gorduras'], 1) ?>g</h1>
                            </div>
                            <div class="tablescrollref">
                                <?php foreach ($almoco['items'] as $item): ?>
                                    <table class="tableref" onclick="event.stopPropagation(); abrirModalDetalhes('almoco', <?= $item['id'] ?>)">
                                        <tbody>
                                            <tr>
                                                <td><?= htmlspecialchars($item['nome']) ?></td>
                                                <td><?= htmlspecialchars($item['especificacao']) ?> g/ml</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                <?php endforeach; ?>
                            </div>
                            <div class="btns">
                                <button type="button" class="add-btn" data-lista="almoco">+</button>
                            </div>
                        </div>
                    </div>

                    <div class="ref">
                        <div class="refln">
                            <h1>Jantar</h1>
                            <h2><?= round($janta['totais']['calorias'], 1) ?> Cal</h2>
                        </div>
                        <div class="contalm oculto">
                            <div class="tableheadref">
                                <h1>Prot - <?= round($janta['totais']['proteinas'], 1) ?>g</h1>
                                <h1>Carb - <?= round($janta['totais']['carboidratos'], 1) ?>g</h1>
                                <h1>Gord - <?= round($janta['totais']['gorduras'], 1) ?>g</h1>
                            </div>
                            <div class="tablescrollref">
                                <?php foreach ($janta['items'] as $item): ?>
                                    <table class="tableref" onclick="event.stopPropagation(); abrirModalDetalhes('janta', <?= $item['id'] ?>)">
                                        <tbody>
                                            <tr>
                                                <td><?= htmlspecialchars($item['nome']) ?></td>
                                                <td><?= htmlspecialchars($item['especificacao']) ?> g/ml</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                <?php endforeach; ?>
                            </div>
                            <div class="btns">
                                <button type="button" class="add-btn" data-lista="janta">+</button>
                            </div>
                        </div>
                    </div>

                    <div class="ref">
                        <div class="refln">
                            <h1>Outros</h1>
                            <h2><?= round($outros['totais']['calorias'], 1) ?> Cal</h2>
                        </div>
                        <div class="contalm oculto">
                            <div class="tableheadref">
                                <h1>Prot - <?= round($outros['totais']['proteinas'], 1) ?>g</h1>
                                <h1>Carb - <?= round($outros['totais']['carboidratos'], 1) ?>g</h1>
                                <h1>Gord - <?= round($outros['totais']['gorduras'], 1) ?>g</h1>
                            </div>
                            <div class="tablescrollref">
                                <?php foreach ($outros['items'] as $item): ?>
                                    <table class="tableref" onclick="event.stopPropagation(); abrirModalDetalhes('outros', <?= $item['id'] ?>)">
                                        <tbody>
                                            <tr>
                                                <td><?= htmlspecialchars($item['nome']) ?></td>
                                                <td><?= htmlspecialchars($item['especificacao']) ?> g/ml</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                <?php endforeach; ?>
                            </div>
                            <div class="btns">
                                <button type="button" class="add-btn" data-lista="outros">+</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="metas">
                    <h4>Sua meta</h4>
                    <div class="metaalign">
                        <div class="metatbl">
                            <div class="metapt1">
                                <h1><span id="metacal">??</span></h1>
                            </div>
                            <div class="metapt2">
                                <h1><span id="calres">7777</span></h1>
                                <h2>cal restantes</h2>
                            </div>
                        </div>
                        <div class="metadt">
                            <h3>Ganho de massa</h3>
                            <h5>60kg - 80kg</h5>
                            <button class="btnperfil">Alterar meta</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="pfl-content">
                <div class="heading-section">
                    <h4 class="nmpfl"><span id="nomevc">Você</span></h4>
                </div>
                <div class="pflaln">
                    <div class="sts ">
                        <ul>
                            <li>Peso </li>
                            <p><span id="peso"></span></p>
                            <li>Altura</li>
                            <p><span id="altura"></span></p>
                            <li>Gênero</li>
                            <p><span id="genero"></span></p>
                            <li>Treino</li>
                            <p><span id="treino"></span></p>
                        </ul>
                    </div>
                    <div class="pflft">
                        <img id="pflimg" src="assets/images/profilefoto.png" alt="">
                        <button class="btnperfil2">Editar perfil</button>
                    </div>
                </div>
                <div class="pflidc">
                    <ul>
                        <li>Consumo de água ideal <span id="resultAgua"></span></li>
                        <li>IMC (Índice de Massa Corporal) <span id="resultIMC"></span></li>
                        <li>IDR (Ingestão Diária Recomendada) <span id="resultIDR"></span></li>
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <!-- Scripts -->
    <script src="calculos.js"></script>
    <script src="alimentacao.js"></script>
</body>

</html>