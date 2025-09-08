import React, { useState, useEffect, useRef } from "react";

export default function Treino({ treino }) {
  // transforma os exercícios do treino em formato do JS original
  const [exercicios, setExercicios] = useState(
    treino.exercicios.map((e) => ({
      ...e,
      id: parseInt(e.id),
      num_series: parseInt(e.series) || 1,
      num_repeticoes: parseInt(e.repeticoes) || 0,
      tempo_descanso: parseInt(e.descanso) || 0,
      peso: parseInt(e.peso) || 0,
      concluido: false,
      cover: e.cover || "https://via.placeholder.com/300x200",
      url: e.url || "",
      informacoes: e.informacoes || "",
      grupo: e.grupo || "",
    }))
  );

  const [exIndex, setExIndex] = useState(0);
  const [serieAtual, setSerieAtual] = useState(1);
  const [estado, setEstado] = useState("execucao"); // execucao | descanso | finalizado
  const [timerRemaining, setTimerRemaining] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  const timerRef = useRef(null);
  const circleRef = useRef(null);

  const ex = exercicios[exIndex] || {};


  // TIMER DO DESCANSO
  useEffect(() => {
    if (estado !== "descanso") return;
    if (!ex.tempo_descanso) return;

    setTimerRemaining(ex.tempo_descanso);
    setTotalTime(ex.tempo_descanso);

    timerRef.current = setInterval(() => {
      setTimerRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          avancarDepoisDescanso();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [estado, exIndex]);

  // FUNÇÃO QUE ATUALIZA CÍRCULO
  useEffect(() => {
    if (!circleRef.current) return;
    const radius = circleRef.current.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    circleRef.current.style.strokeDasharray = circumference;

    const percent = totalTime ? ((totalTime - timerRemaining) / totalTime) * 100 : 0;
    circleRef.current.style.strokeDashoffset = circumference - (percent / 100) * circumference;
  }, [timerRemaining, totalTime]);

  function avancarDepoisDescanso() {
    let novosExercicios = [...exercicios];
    if (serieAtual < ex.num_series) {
      setSerieAtual(serieAtual + 1);
      setEstado("execucao");
    } else {
      novosExercicios[exIndex].concluido = true;
      setExercicios(novosExercicios);
      if (exIndex < exercicios.length - 1) {
        setExIndex(exIndex + 1);
        setSerieAtual(1);
        setEstado("execucao");
      } else {
        setEstado("finalizado");
      }
    }
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  function handleAvancar() {
    if (estado === "execucao") setEstado("descanso");
    else if (estado === "descanso") {
      clearInterval(timerRef.current);
      avancarDepoisDescanso();
    }
  }

  function handleVoltar() {
    if (estado === "descanso") {
      clearInterval(timerRef.current);
      setEstado("execucao");
      return;
    }
    if (estado === "execucao") {
      if (serieAtual > 1) {
        setSerieAtual(serieAtual - 1);
      } else if (exIndex > 0) {
        setExIndex(exIndex - 1);
        setSerieAtual(exercicios[exIndex - 1].num_series || 1);
      }
    }
  }

  function getYoutubeId(url) {
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtube.com")) return u.searchParams.get("v") || "";
      if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    } catch (e) {}
    return "";
  }

  // RENDERIZAÇÕES
  return (
    <div className="adjustfoda">
      <div className="treinando">
        <div id="lista-exercicios">
          <h3 className="exnm">{ex.nome}</h3>
          <div id="lista">
            {exercicios.map((e, i) => (
              <div
                key={e.id}
                className={`ex-item ${i === exIndex ? "active" : ""} ${e.concluido ? "concluido" : ""}`}
                onClick={() => {
                  clearInterval(timerRef.current);
                  setExIndex(i);
                  setSerieAtual(1);
                  setEstado("execucao");
                }}
              >
                <strong>{e.nome}</strong>
              </div>
            ))}
          </div>
          <button className="ext" onClick={() => window.history.back()}>
            Sair
          </button>
        </div>

        <div id="conteudo">
          {/* EXECUÇÃO */}
          {estado === "execucao" && (
            <div id="view-execucao">
              <div className="titulo">
                <h2 id="ex-nome">{ex.nome}</h2>
                <div className="series">
                  <strong></strong> <span id="ex-serie">{serieAtual} / {ex.num_series}</span>
                </div>
              </div>

              <div id="video-container">
                <img
                  id="ex-cover"
                  src={ex.cover}
                  alt="Capa do exercício"
                  onClick={() => {
                    const id = getYoutubeId(ex.url);
                    if (!id) return;
                    const container = document.getElementById("video-container");
                    container.innerHTML = `<iframe id="playerex" src="https://www.youtube.com/embed/${id}?autoplay=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
                  }}
                />
              </div>

              <div className="infos">
                <div className="controls">
                  <button id="btn-voltar" className="btn btn-voltar b1" onClick={handleVoltar}>⮜</button>
                </div>
                <div className="reps">
                  <strong>X</strong> <span id="ex-reps">{ex.num_repeticoes}</span>
                  <h1>repetições</h1>
                </div>
                <div className="peso"><span id="ex-peso">{ex.peso}</span> kg</div>
                <div className="controls">
                  <button id="btn-avancar" className="btn btn-avancar b2" onClick={handleAvancar}>⮞</button>
                </div>
              </div>
            </div>
          )}

          {/* DESCANSO */}
          {estado === "descanso" && (
            <div id="view-descanso">
              <div className="descansano">
                <div className="titulo">
                  <h2 id="descanso-titulo">{ex.nome}</h2>
                </div>
                <div className="circulozin">
                  <div className="timer-wrapper">
                    <svg className="progress-ring" width="120" height="120">
                      <circle
                        ref={circleRef}
                        className="progress-ring__circle"
                        stroke="#368dd9"
                        strokeWidth="20"
                        fill="transparent"
                        r="50"
                        cx="60"
                        cy="60"
                      />
                    </svg>
                    <div id="timer" className="timer-text">{formatTime(timerRemaining)}</div>
                    <button id="btnAdd30" onClick={() => setTimerRemaining(timerRemaining + 10)}>+10s</button>
                  </div>
                </div>
                <div className="btns">
                  <div className="small-muted" id="descanso-info">
                    Série {serieAtual} / {ex.num_series} • {ex.tempo_descanso}s de descanso
                  </div>
                  <button className="btnplr" onClick={handleAvancar}>Avançar</button>
                  <button className="btnvtl" onClick={handleVoltar}>Voltar</button>
                </div>
              </div>
            </div>
          )}

          {/* FINALIZADO */}
          {estado === "finalizado" && (
            <div id="view-finalizado">
              <h2>Treino finalizado! 💪🔥</h2>
              <p className="small-muted">Parabéns — você completou todas as séries e exercícios.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
