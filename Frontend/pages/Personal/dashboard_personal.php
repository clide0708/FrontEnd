<?php
    session_start();
    // Conecta ao banco de dados
    require_once('../../../Backend/Config/connect.php');

    $pdo = connectDB();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Supondo que o personal esteja logado com id salvo na session
    $idPersonal = 1; // para testes

    // Carrega alunos do personal
    $stmt = $pdo->prepare("SELECT idAluno, nome FROM alunos WHERE idPersonal = ?");
    $stmt->execute([$idPersonal]);
    $alunos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Carrega compromissos do personal
    $stmt = $pdo->prepare("SELECT c.idAgendamento, c.data_hora, c.local, a.nome as aluno_nome FROM agendamentos c JOIN alunos a ON c.idAluno = a.idAluno WHERE c.idPersonal = ?");
    $stmt->execute([$idPersonal]);
    $compromissos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Carrega exercícios para filtros
    $stmt = $pdo->query("SELECT DISTINCT grupoMuscular FROM exercicios ORDER BY grupoMuscular");
    $musculos = $stmt->fetchAll(PDO::FETCH_COLUMN);

    // Como terá filtro, exercícios serão carregados via Ajax (script JS)

?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Dashboard Personal</title>
<link rel="stylesheet" href="templatemo-cyborg-gaming.css" />
<style>
    /* Custom básico estilo do calendário e listagem */
    #alunos, #calendario, #modulos, #filtros-exercicios, #lista-exercicios {
        margin: 1em; padding: 1em; background: #222; border-radius: 8px; color: #eee;
    }
    #calendario {
        max-width: 600px; overflow-y: auto; max-height: 400px;
    }
    .dia-evento {
        background-color: #3498db; color: #fff; cursor: pointer; position: relative;
        border-radius: 4px;
    }
    .tooltip {
        visibility: hidden;
        background-color: rgba(0,0,0,0.8);
        color: #fff;
        text-align: center;
        border-radius: 6px;
        padding: 5px 10px;
        position: absolute;
        z-index: 1;
        bottom: 100%;
        left: 50%;
        margin-left: -60px;
        width: 120px;
    }
    .dia-evento:hover .tooltip {
        visibility: visible;
    }
    /* Estilo simples para formulários */
    label, input, select, button {
        display: block;
        margin: 0.5em 0;
    }
    .exercicio-item {
        border-bottom: 1px solid #444;
        padding: 5px 0;
        cursor: pointer;
    }
</style>
</head>
<body>

<div id="alunos">
    <h2>Seus Alunos</h2>
    <ul>
        <?php foreach ($alunos as $aluno): ?>
            <li><?= htmlspecialchars($aluno['nome']) ?> <button onclick="verAluno(<?= $aluno['id'] ?>)">Ver</button></li>
        <?php endforeach; ?>
    </ul>
    <button onclick="adicionarAluno()">Adicionar Aluno</button>
</div>

<div id="calendario">
    <h2>Seu Calendário</h2>
    <p>Clique nos dias para adicionar lembretes/compromissos</p>
    <div id="calendario-mes"></div>
</div>

<div id="modulos">
    <h2>Cadastrar Módulo de Treino</h2>
    <form id="form-modulo">
        <label for="nome_modulo">Nome do Módulo:</label>
        <input type="text" id="nome_modulo" name="nome_modulo" required />

        <label for="descricao_modulo">Descrição:</label>
        <textarea id="descricao_modulo" name="descricao_modulo"></textarea>

        <button type="submit">Criar Módulo</button>
    </form>
    <div id="modulos-lista"></div>
</div>

<div id="filtros-exercicios">
    <h2>Filtro para Exercícios</h2>
    <label for="filtro-musculo">Músculo Principal:</label>
    <select id="filtro-musculo">
        <option value="">Todos</option>
        <?php foreach ($musculos as $musculo): ?>
            <option value="<?= htmlspecialchars($musculo) ?>"><?= htmlspecialchars($musculo) ?></option>
        <?php endforeach; ?>
    </select>
    <!-- Pode adicionar mais filtros semelhantes tipo, modalidade etc -->
    <button onclick="carregarExercicios()">Buscar</button>
</div>

<div id="lista-exercicios">
    <h2>Exercícios</h2>
    <div id="exercicios-resultados"></div>
</div>

<script>
// Calcular e renderizar calendário simples do mês atual
function renderizarCalendario() {
    const container = document.getElementById('calendario-mes');
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth();

    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const diasNoMes = ultimoDia.getDate();

    let html = '<table border="1" cellpadding="5" cellspacing="0" style="background:#333;color:#eee;width:100%;">';
    html += '<thead><tr><th>Dom</th><th>Seg</th><th>Ter</th><th>Qua</th><th>Qui</th><th>Sex</th><th>Sáb</th></tr></thead><tbody><tr>';

    // Espaços para o primeiro dia da semana
    for(let i = 0; i < primeiroDia.getDay(); i++) {
        html += '<td></td>';
    }

    // Dados dos compromissos do PHP para JS
    const compromissos = <?= json_encode($compromissos) ?>;

    for(let dia=1; dia <= diasNoMes; dia++) {
        let dataAtualStr = `${ano}-${(mes+1).toString().padStart(2,'0')}-${dia.toString().padStart(2,'0')}`;
        // Busca compromissos deste dia
        let compromDia = compromissos.filter(c => c.data.startsWith(dataAtualStr));

        let classeEvento = compromDia.length > 0 ? 'dia-evento' : '';
        html += `<td class="${classeEvento}" onclick="adicionarCompromisso('${dataAtualStr}')">`;

        html += dia;

        // Se tem compromissos, mostra nomes e tooltips
        for(let c of compromDia) {
            html += `<br><small><strong>${c.aluno_nome}</strong></small>`;
            html += `<div class="tooltip">Local: ${c.localizacao}</div>`;
        }

        html += '</td>';

        // Quebra linha no sabado
        if ((dia + primeiroDia.getDay()) % 7 === 0) {
            html += '</tr><tr>';
        }
    }

    html += '</tr></tbody></table>';

    container.innerHTML = html;
}

// Função para abrir modal ou prompt para cadastro de compromisso
function adicionarCompromisso(data) {
    let aluno = prompt(`Adicionar compromisso em ${data} - Informe ID do aluno:`);
    if (!aluno) return alert('Você deve informar o aluno.');
    let local = prompt('Localização do compromisso:');
    if (!local) return alert('Informe a localização.');

    fetch('salvar_compromisso.php', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({data: data, id_aluno: aluno, localizacao: local})
    }).then(resp => resp.json())
    .then(json => {
        if(json.success){
            alert('Compromisso salvo');
            location.reload();
        } else alert('Erro: ' + json.error);
    });
}

// Função para criar módulo de treino
document.getElementById('form-modulo').addEventListener('submit', e => {
    e.preventDefault();
    const nome = e.target.nome_modulo.value;
    const descricao = e.target.descricao_modulo.value;

    fetch('salvar_modulo.php', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({nome: nome, descricao: descricao})
    }).then(r => r.json())
    .then(j => {
        if(j.success){
            alert('Módulo criado');
            e.target.reset();
            carregarModulos();
        } else alert('Erro: ' + j.error);
    });
});

// Carregar módulos já criados
function carregarModulos(){
    fetch('listar_modulos.php').then(r=>r.json()).then(modulos=>{
        let div = document.getElementById('modulos-lista');
        div.innerHTML = '';
        for(let m of modulos){
            div.innerHTML += `<div><strong>${m.nome}</strong><br>${m.descricao}</div><hr>`;
        }
    });
}

// Filtros e carregamento dos exercícios via Ajax
function carregarExercicios(){
    const musculo = document.getElementById('filtro-musculo').value;

    fetch('BuscarExerciciosController.php?grupoMuscular=' + encodeURIComponent(musculo))
    .then(r=>r.json())
    .then(exercicios=>{
        const container = document.getElementById('exercicios-resultados');
        container.innerHTML = '';
        if(exercicios.length === 0){
            container.innerHTML = '<p>Nenhum exercício encontrado.</p>';
            return;
        }
        for(let ex of exercicios){
            container.innerHTML += `
            <div class="exercicio-item" title="${ex.descricao}">
                <strong>${ex.nome}</strong><br>
                Músculo: ${ex.musculo_principal} | Tipo: ${ex.tipo} | Equipamento: ${ex.equipamento}
            </div>`;
        }
    });
}

function verAluno(id){
    alert('Visualizar aluno: ' + id);
    // aqui você pode redirecionar para perfil do aluno etc
}

function adicionarAluno(){
    alert('Funcionalidade em desenvolvimento');
}

// Inicialização
renderizarCalendario();
carregarModulos();

</script>
</body>
</html>