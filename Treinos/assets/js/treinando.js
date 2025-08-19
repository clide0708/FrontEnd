const exercicios = raw.map((e) => ({
  id: parseInt(e.id),
  nome: e.nome,
  num_series: parseInt(e.num_series) || 1,
  num_repeticoes: parseInt(e.num_repeticoes) || 0,
  tempo_descanso: parseInt(e.tempo_descanso) || 0,
  peso: parseInt(e.peso) || 0,
  informacoes: e.informacoes || "",
  url: e.url || "",
  cover: e.cover || "",
  grupo: e.grupo || "",
  concluido: false,
}));

let exIndex = 0;
let serieAtual = 1;
let estado = "execucao";
let timerInterval = null;
let timerRemaining = 0;

const listaEl = document.getElementById("lista");
const viewExecucao = document.getElementById("view-execucao");
const viewDescanso = document.getElementById("view-descanso");
const viewFinalizado = document.getElementById("view-finalizado");

const btnAvancar = document.querySelectorAll("#btn-avancar");
const btnVoltar = document.querySelectorAll("#btn-voltar");

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function clearTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function renderLista() {
  if (exercicios.length === 0) {
    listaEl.innerHTML = "<p>Nenhum exercício encontrado</p>";
    return;
  }
  let html = "";
  exercicios.forEach((ex, i) => {
    let classe = "ex-item";
    if (i === exIndex) classe += " active";
    if (ex.concluido) classe += " concluido";
    html += `<div class="${classe}" data-i="${i}">
      <strong>${ex.nome}</strong>
    </div>`;
  });
  listaEl.innerHTML = html;
  document.querySelectorAll(".ex-item").forEach((el) => {
    el.addEventListener("click", () => {
      const i = parseInt(el.getAttribute("data-i"));
      if (isNaN(i)) return;
      clearTimer();
      exIndex = i;
      serieAtual = 1;
      estado = "execucao";
      renderTudo();
    });
  });
}

function esconderTodasViews() {
  viewExecucao.style.display = "none";
  viewDescanso.style.display = "none";
  viewFinalizado.style.display = "none";
}

function stopVideo() {
  const videoContainer = document.getElementById("video-container");
  videoContainer.innerHTML = ""; // limpa o container e para o vídeo
}

function showCover() {
  //mudar caso vá mudar a capa
  const ex = exercicios[exIndex];
  const videoContainer = document.getElementById("video-container");

  videoContainer.innerHTML = `
    <img id="ex-cover" src="${ex.cover || ""}" alt="Capa do exercício" />

  `;

  const coverImg = videoContainer.querySelector("#ex-cover");
  coverImg.addEventListener("click", () => {
    const id = getYoutubeId(ex.url);
    if (!id) return;
    videoContainer.innerHTML = `<iframe id="playerex" src="https://www.youtube.com/embed/${id}?autoplay=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
  });
}

// execução

function renderExecucao() {
  clearTimer();
  estado = "execucao";
  esconderTodasViews();
  viewExecucao.style.display = "block";

  const ex = exercicios[exIndex];
  document.getElementById("ex-nome").textContent = ex.nome;
  document.getElementById(
    "ex-serie"
  ).textContent = `${serieAtual} / ${ex.num_series}`;
  document.getElementById("ex-reps").textContent = ex.num_repeticoes;
  document.getElementById("ex-peso").textContent = ex.peso;
  // document.getElementById("ex-info").textContent = ex.informacoes || "";

  stopVideo();
  showCover();
  updateButtons();
}

// descanso

function renderDescansoView() {
  clearTimer();
  estado = "descanso";
  esconderTodasViews();
  viewDescanso.style.display = "block";

  const ex = exercicios[exIndex];
  document.getElementById(
    "descanso-titulo"
  ).textContent = `${ex.nome}`;
  document.getElementById("timer").textContent = formatTime(ex.tempo_descanso);
  document.getElementById(
    "descanso-info"
  ).textContent = `Série ${serieAtual} / ${ex.num_series} • ${ex.tempo_descanso}s de descanso`;

  stopVideo(); // para o áudio no descanso
  startDescanso(ex.tempo_descanso);
  updateButtons();
}

function startDescanso(segundos) {
  clearTimer();
  timerRemaining = Math.max(0, parseInt(segundos) || 0);
  const timerEl = () => document.getElementById("timer");
  btnAvancar.disabled = true;

  if (timerRemaining === 0) {
    avancarDepoisDescanso();
    return;
  }
  if (timerEl()) timerEl().textContent = formatTime(timerRemaining);

  timerInterval = setInterval(() => {
    timerRemaining--;
    if (timerEl()) timerEl().textContent = formatTime(timerRemaining);
    if (timerRemaining <= 0) {
      clearTimer();
      if (timerEl()) timerEl().textContent = "0:00";
      avancarDepoisDescanso();
    }
  }, 1000);
}

function avancarDepoisDescanso() {
  const ex = exercicios[exIndex];
  if (serieAtual < ex.num_series) {
    serieAtual++;
    estado = "execucao";
    renderTudo();
  } else {
    exercicios[exIndex].concluido = true;
    if (exIndex < exercicios.length - 1) {
      exIndex++;
      serieAtual = 1;
      estado = "execucao";
      renderTudo();
    } else {
      renderFinalizado();
    }
  }
}

// Finalizado

function renderFinalizado() {
  clearTimer();
  estado = "finalizado";
  esconderTodasViews();
  viewFinalizado.style.display = "block";
  updateButtons();
}

btnAvancar.forEach((btn) => {
  updateButtons();
  btn.addEventListener("click", () => {
    if (estado === "execucao") {
      estado = "descanso";
      renderDescansoView();
    } else if (estado === "descanso") {
      clearTimer();
      avancarDepoisDescanso();
    }
  });
});

btnVoltar.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (estado === "descanso") {
      clearTimer();
      estado = "execucao";
      renderExecucao();
      return;
    }
    if (estado === "execucao") {
      if (serieAtual > 1) {
        serieAtual--;
        renderExecucao();
      } else if (exIndex > 0) {
        exIndex--;
        serieAtual = exercicios[exIndex].num_series || 1;
        estado = "execucao";
        renderExecucao();
      }
    }
  });
});

function updateButtons() {
  const btnAvancarList = document.querySelectorAll("#btn-avancar");
  const btnVoltarList = document.querySelectorAll("#btn-voltar");

  btnAvancarList.forEach((btn) => {
    if (estado === "execucao") {
      btn.textContent = "⮞";
      btn.disabled = false;
    } else if (estado === "descanso") {
      btn.textContent = "Pular descanso";
      btn.disabled = false;
    } else {
      btn.textContent = "Fim";
      btn.disabled = true;
    }
  });

  const atStart = exIndex === 0 && serieAtual === 1 && estado === "execucao";
  btnVoltarList.forEach((btn) => {
    btn.disabled = atStart;
  });
}

function getYoutubeId(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      return u.searchParams.get("v") || "";
    }
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.slice(1);
    }
  } catch (e) {}
  return "";
}

function renderTudo() {
  renderLista();
  if (estado === "execucao") renderExecucao();
  else if (estado === "descanso") renderDescansoView();
  else renderFinalizado();
}

renderTudo();
window.addEventListener("beforeunload", () => clearTimer());

let totalTime = 0;

const circle = document.querySelector(".progress-ring__circle");
const radius = circle.r.baseVal.value;
const circumference = 2 * Math.PI * radius;

circle.style.strokeDasharray = circumference;
circle.style.strokeDashoffset = circumference;

function setProgress(percent) {
  const offset = circumference - (percent / 100) * circumference;
  circle.style.strokeDashoffset = offset;
}

document.getElementById("btnAdd30").addEventListener("click", () => {
  timerRemaining += 10;
  totalTime += 10;
  updateUI();
});

let startTime;

function startDescanso(segundos) {
  clearTimer();
  timerRemaining = Math.max(0, parseInt(segundos) || 0);
  totalTime = timerRemaining;

  updateUI(); // mostra o valor inicial sem atraso

  timerInterval = setInterval(() => {
    if (timerRemaining <= 0) {
      clearTimer();
      avancarDepoisDescanso();
      return;
    }

    timerRemaining--; // decrementa **depois** de atualizar
    updateUI(); // agora atualiza o círculo e o número
  }, 1000);
}

function updateUI() {
  const timerEl = document.getElementById("timer");
  if (timerEl) timerEl.textContent = formatTime(timerRemaining);

  const percent = ((totalTime - timerRemaining) / totalTime) * 100;
  setProgress(percent);
}
