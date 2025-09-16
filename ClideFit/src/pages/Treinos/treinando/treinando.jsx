import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Treino() {
  const navigate = useNavigate();
  const location = useLocation();
  const treino = location.state?.treino;

  if (!treino) {
    navigate("/Treinos", { replace: true });
    return null;
  }

  function getYoutubeThumbnail(url) {
    try {
      const u = new URL(url);
      let id = "";
      if (u.hostname.includes("youtube.com"))
        id = u.searchParams.get("v") || "";
      else if (u.hostname.includes("youtu.be")) id = u.pathname.slice(1);
      if (!id) return "https://via.placeholder.com/300x200";
      return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    } catch (e) {
      return "https://via.placeholder.com/300x200";
    }
  }

  const [exercicios, setExercicios] = useState(
    treino.exercicios.map((e) => ({
      ...e,
      id: parseInt(e.id),
      num_series: parseInt(e.series) || 1,
      num_repeticoes: parseInt(e.repeticoes) || 0,
      tempo_descanso: parseInt(e.descanso) || 0,
      peso: parseInt(e.peso) || 0,
      concluido: false,
      cover: e.url
        ? getYoutubeThumbnail(e.url)
        : e.cover || "https://via.placeholder.com/300x200",
      url: e.url || "",
      informacoes: e.informacoes || "",
      grupo: e.grupo || "",
    }))
  );

  const [exIndex, setExIndex] = useState(0);
  const [serieAtual, setSerieAtual] = useState(1);
  const [estado, setEstado] = useState("execucao");
  const [timerRemaining, setTimerRemaining] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  const timerRef = useRef(null);
  const circleRef = useRef(null);

  const ex = exercicios[exIndex] || {};

  const totalSeries = exercicios.reduce((acc, e) => acc + e.num_series, 0);
  const seriesConcluidas = exercicios.reduce((acc, e, i) => {
    if (i < exIndex) return acc + e.num_series;
    if (i === exIndex) return acc + serieAtual - 1;
    return acc;
  }, 0);
  const progresso =
    estado === "finalizado"
      ? 100
      : Math.round((seriesConcluidas / totalSeries) * 100);

  function avancarDepoisDescanso() {
    let novosExercicios = [...exercicios];
    if (serieAtual < ex.num_series) {
      setSerieAtual((prev) => prev + 1);
      setEstado("execucao");
      setTimerRemaining(0);
      setTotalTime(0);
    } else {
      novosExercicios[exIndex].concluido = true;
      setExercicios(novosExercicios);

      if (exIndex < exercicios.length - 1) {
        const proximoIndex = exIndex + 1;
        setExIndex(proximoIndex);
        setSerieAtual(1);
        setEstado("execucao");
        setTimerRemaining(0);
        setTotalTime(0);
      } else {
        setEstado("finalizado");
        setTimeout(() => navigate("/Treinos", { replace: true }), 1500);
      }
    }
  }

  useEffect(() => {
    if (
      estado === "descanso" &&
      (!ex.tempo_descanso || ex.tempo_descanso <= 0)
    ) {
      avancarDepoisDescanso();
    }
  }, [estado, exIndex]);

  useEffect(() => {
    if (estado !== "descanso") return;
    if (!ex.tempo_descanso || ex.tempo_descanso <= 0) return;

    setTimerRemaining(ex.tempo_descanso);
    setTotalTime(ex.tempo_descanso);

    timerRef.current = setInterval(() => {
      setTimerRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(timerRef.current);
          avancarDepoisDescanso();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [estado, exIndex]);

  useEffect(() => {
    if (!circleRef.current) return;
    const radius = circleRef.current.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    circleRef.current.style.strokeDasharray = circumference;

    // cálculo direto pro sentido horário
    const percent = totalTime ? timerRemaining / totalTime : 0;
    circleRef.current.style.strokeDashoffset = circumference * (1 - percent);
  }, [timerRemaining, totalTime]);

  useEffect(() => {
    setTimerRemaining(0);
    setTotalTime(0);
  }, [exIndex]);

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
      if (serieAtual > 1) setSerieAtual((prev) => prev - 1);
      else if (exIndex > 0) {
        setExIndex((prev) => prev - 1);
        setSerieAtual(exercicios[exIndex - 1].num_series || 1);
      }
    }
  }

  function getYoutubeId(url) {
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtube.com"))
        return u.searchParams.get("v") || "";
      if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    } catch (e) {}
    return "";
  }

  const renderDescanso = () => {
    if (!ex.tempo_descanso || ex.tempo_descanso <= 0) return null;
    return (
      <div id="view-descanso">
        <div className="descansano">
          <div className="titulo">
            <h2 id="descanso-titulo">{ex.nome}</h2>
          </div>
          <div className="circulozin">
            <div className="timer-wrapper">
              <svg className="progress-ring" width="250" height="250">
                <circle
                  ref={circleRef}
                  className="progress-ring__circle"
                  stroke="#368dd9"
                  strokeWidth="20"
                  fill="transparent"
                  r="150"
                  cx="200"
                  cy="200"
                />
              </svg>
              <div id="timer" className="timer-text">
                {formatTime(timerRemaining)}
              </div>
              <button
                id="btnAdd10"
                onClick={() => {
                  setTimerRemaining((prev) => prev + 10);
                  setTotalTime((prev) => prev + 10);
                }}
              >
                +10s
              </button>
            </div>
          </div>
          <div className="btns">
            <div className="small-muted" id="descanso-info">
              Série {serieAtual} / {ex.num_series} • {ex.tempo_descanso}s de
              descanso
            </div>
            <button className="btnplr" onClick={handleAvancar}>
              Avançar
            </button>
            <button className="btnvtl" onClick={handleVoltar}>
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="adjustfoda">
      {/* BARRA DE PROGRESSO ORIGINAL RESTAURADA */}
      <div
        className="barra-progresso"
        style={{ width: "1200px", height: "8px", background: "#eee" }}
      >
        <div
          style={{
            width: `${progresso}%`,
            height: "100%",
            background: "#368dd9",
            transition: "width 0.3s",
          }}
        ></div>
      </div>

      <div className="treinando">
        <div id="lista-exercicios">
          <h3 className="exnm">{treino.nome}</h3>
          <div id="lista">
            {exercicios.map((e, i) => (
              <div
                key={e.id}
                className={`ex-item ${i === exIndex ? "active" : ""} ${
                  e.concluido ? "concluido" : ""
                }`}
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
          <button
            className="ext"
            onClick={() => navigate("/Treinos", { replace: true })}
          >
            Sair
          </button>
        </div>

        <div id="conteudo">
          {estado === "execucao" && (
            <div id="view-execucao">
              <div className="titulo">
                <h2 id="ex-nome">{ex.nome}</h2>
                <div className="series">
                  <span id="ex-serie">
                    {serieAtual} / {ex.num_series}
                  </span>
                </div>
              </div>

              {/* VIDEO CONTAINER - COVER SEMPRE VISÍVEL, DIMENSÕES PELO CSS */}
              <div id="video-container">
                <img
                  id="ex-cover"
                  src={ex.cover}
                  alt="Capa do exercício"
                  onClick={() => {
                    const id = getYoutubeId(ex.url);
                    if (!id) return;
                    const container =
                      document.getElementById("video-container");
                    if (!document.getElementById("playerex")) {
                      const iframe = document.createElement("iframe");
                      iframe.id = "playerex";
                      iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1`;
                      iframe.frameBorder = "0";
                      iframe.allow = "autoplay; encrypted-media";
                      iframe.allowFullscreen = true;
                      container.appendChild(iframe);
                    }
                  }}
                />
              </div>

              <div className="infos">
                <div className="controls">
                  <button
                    id="btn-voltar"
                    className="btn btn-voltar b1"
                    onClick={handleVoltar}
                  >
                    ⮜
                  </button>
                </div>
                <div className="reps">
                  <strong>X</strong>{" "}
                  <span id="ex-reps">{ex.num_repeticoes}</span>
                  <h1>repetições</h1>
                </div>
                <div className="peso">
                  {ex.peso && ex.peso > 0 ? `${ex.peso} kg` : "\u00A0"}
                </div>

                <div className="controls">
                  <button
                    id="btn-avancar"
                    className="btn btn-avancar b2"
                    onClick={handleAvancar}
                  >
                    ⮞
                  </button>
                </div>
              </div>
            </div>
          )}

          {estado === "descanso" && renderDescanso()}

          {estado === "finalizado" && (
            <div id="view-finalizado">
              <h2>Treino finalizado!</h2>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
