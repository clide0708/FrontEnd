import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import treinosService from "../../../services/Treinos/treinos";

export default function Treino() {
  const navigate = useNavigate();
  const location = useLocation();
  const { treino, progresso: progressoInicial } = location.state || {};

  // Estados
  const [exercicios, setExercicios] = useState([]);
  const [exIndex, setExIndex] = useState(0);
  const [serieAtual, setSerieAtual] = useState(1);
  const [estado, setEstado] = useState("execucao");
  const [timerRemaining, setTimerRemaining] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [duracaoTotal, setDuracaoTotal] = useState(0);

  const timerRef = useRef(null);
  const circleRef = useRef(null);
  const videoContainerRef = useRef(null);

  // Funções auxiliares (mantenha as mesmas)
  const getYoutubeThumbnail = (url) => {
    if (!url) return "/assets/images/no-video-placeholder.jpg";
    try {
      const u = new URL(url);
      let id = "";
      if (u.hostname.includes("youtube.com"))
        id = u.searchParams.get("v") || "";
      else if (u.hostname.includes("youtu.be")) id = u.pathname.slice(1);

      if (!id) return "/assets/images/no-video-placeholder.jpg";
      return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    } catch (error) {
      return "/assets/images/no-video-placeholder.jpg";
    }
  };

  const getYoutubeId = (url) => {
    if (!url) return "";
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtube.com"))
        return u.searchParams.get("v") || "";
      if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    } catch (error) {
      console.error("Erro ao extrair ID do YouTube:", error);
    }
    return "";
  };

  // CORREÇÃO PRINCIPAL: Função de avanço simplificada
  const avancarDepoisDescanso = useCallback(() => {
    if (!exercicios[exIndex]) return;

    const ex = exercicios[exIndex];
    let novosExercicios = [...exercicios];

    console.log(
      `🔄 Avançando: Exercício ${exIndex + 1}, Série ${serieAtual}/${
        ex.num_series
      }`
    );

    if (serieAtual < ex.num_series) {
      // Próxima série do mesmo exercício
      setSerieAtual((prev) => prev + 1);
      setEstado("execucao");
    } else {
      // Última série concluída - marcar exercício como concluído
      novosExercicios[exIndex].concluido = true;
      setExercicios(novosExercicios);

      if (exIndex < exercicios.length - 1) {
        // Próximo exercício
        setExIndex((prev) => prev + 1);
        setSerieAtual(1);
        setEstado("execucao");
      } else {
        // Treino finalizado
        console.log("🎉 TREINO CONCLUÍDO!");
        setEstado("finalizado");

        const todosConcluidos = novosExercicios.map((ex) => ({
          ...ex,
          concluido: true,
        }));
        setExercicios(todosConcluidos);

        const progressoFinal = {
          exIndex: exercicios.length,
          serieAtual: 1,
          exercicios_concluidos: todosConcluidos.map((ex) => ex.id),
        };

        treinosService
          .finalizarSessao(
            treino.idSessao,
            progressoFinal,
            duracaoTotal,
            "Treino concluído"
          )
          .then(() => {
            setTimeout(() => navigate("/treinos", { replace: true }), 3000);
          })
          .catch((err) => {
            console.error("Erro ao salvar treino concluído:", err);
            setTimeout(() => navigate("/treinos", { replace: true }), 3000);
          });
      }
    }

    // Resetar estados do timer e vídeo
    setTimerRemaining(0);
    setTotalTime(0);
    setShowVideo(false);
  }, [
    exercicios,
    exIndex,
    serieAtual,
    navigate,
    treino?.idSessao,
    duracaoTotal,
  ]);

  // Debug do estado
  useEffect(() => {
    console.log("=== DEBUG ===");
    console.log("Exercício:", exIndex, "/", exercicios.length - 1);
    console.log("Série:", serieAtual, "/", exercicios[exIndex]?.num_series);
    console.log("Estado:", estado);
    console.log("Timer:", timerRemaining, "s");
    console.log("========================");
  }, [exIndex, serieAtual, estado, timerRemaining, exercicios]);

  // Inicializar exercícios
  useEffect(() => {
    if (treino && treino.exercicios) {
      console.log("🏋️ Inicializando treino com progresso:", progressoInicial);

      const exerciciosIniciais = treino.exercicios.map((e, index) => ({
        ...e,
        id: parseInt(e.id) || parseInt(e.idTreino_Exercicio) || index,
        num_series: parseInt(e.series) || 3,
        num_repeticoes: parseInt(e.repeticoes) || 10,
        tempo_descanso: parseInt(e.descanso) || 60,
        peso: parseInt(e.carga) || 0,
        concluido: false,
        url: e.video_url || e.url || "",
        cover: getYoutubeThumbnail(e.video_url || e.url),
        informacoes: e.descricao || e.informacoes || "",
        grupo: e.grupoMuscular || e.grupo || "",
        nome: e.nome || "Exercício sem nome",
      }));

      setExercicios(exerciciosIniciais);

      // Aplicar progresso inicial se existir
      if (progressoInicial) {
        console.log("📥 Aplicando progresso salvo:", progressoInicial);

        if (progressoInicial.exIndex !== undefined) {
          setExIndex(progressoInicial.exIndex);
        }

        if (progressoInicial.serieAtual !== undefined) {
          setSerieAtual(progressoInicial.serieAtual);
        }

        if (progressoInicial.exercicios_concluidos) {
          setExercicios((prev) =>
            prev.map((ex, index) => ({
              ...ex,
              concluido:
                progressoInicial.exercicios_concluidos.includes(ex.id) ||
                index < (progressoInicial.exIndex || 0),
            }))
          );
        }
      }
    }
  }, [treino, progressoInicial]);

  // Verificar se não há treino
  if (!treino) {
    navigate("/treinos", { replace: true });
    return null;
  }

  const ex = exercicios[exIndex] || {};

  // Cálculo do progresso
  const totalSeries = exercicios.reduce((acc, e) => acc + e.num_series, 0);
  const seriesConcluidas = exercicios.reduce((acc, e, i) => {
    if (i < exIndex) return acc + e.num_series;
    if (i === exIndex) return acc + serieAtual - 1;
    return acc;
  }, 0);

  const progressoPercentual =
    estado === "finalizado"
      ? 100
      : Math.round((seriesConcluidas / totalSeries) * 100);

  // Timer de duração total
  useEffect(() => {
    if (estado === "execucao" || estado === "descanso") {
      const interval = setInterval(() => {
        setDuracaoTotal((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [estado]);

  // CORREÇÃO PRINCIPAL: Timer de descanso simplificado
  useEffect(() => {
    console.log(
      "⏰ Efeito do timer - Estado:",
      estado,
      "Tempo descanso:",
      ex.tempo_descanso
    );

    // Se não está em descanso, limpar timer
    if (estado !== "descanso") {
      console.log("❌ Saindo do modo descanso, limpando timer");
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Se não tem tempo de descanso, avançar imediatamente
    if (!ex.tempo_descanso || ex.tempo_descanso <= 0) {
      console.log("⚡ Sem tempo de descanso, avançando...");
      avancarDepoisDescanso();
      return;
    }

    console.log(
      "✅ Iniciando timer de descanso:",
      ex.tempo_descanso,
      "segundos"
    );

    // Configurar timer
    setTimerRemaining(ex.tempo_descanso);
    setTotalTime(ex.tempo_descanso);

    // Limpar timer anterior
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Criar novo timer
    timerRef.current = setInterval(() => {
      setTimerRemaining((prev) => {
        if (prev <= 1) {
          console.log("🎯 Timer finalizado!");
          clearInterval(timerRef.current);
          timerRef.current = null;

          // Usar timeout para evitar problemas de estado
          setTimeout(() => {
            avancarDepoisDescanso();
          }, 100);

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup
    return () => {
      if (timerRef.current) {
        console.log("🧹 Limpando timer");
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [estado, exIndex, ex.tempo_descanso]); // CORREÇÃO: Removida a dependência de avancarDepoisDescanso

  // Atualizar círculo de progresso
  useEffect(() => {
    if (!circleRef.current || !totalTime) return;

    const radius = circleRef.current.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    circleRef.current.style.strokeDasharray = circumference;

    const percent = timerRemaining / totalTime;
    circleRef.current.style.strokeDashoffset = circumference * (1 - percent);
  }, [timerRemaining, totalTime]);

  // Resetar estados ao mudar de exercício
  useEffect(() => {
    setTimerRemaining(0);
    setTotalTime(0);
    setShowVideo(false);
  }, [exIndex]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handlePararTreino = async () => {
    try {
      const exerciciosConcluidos = exercicios
        .slice(0, exIndex)
        .map((ex) => ex.id);

      const exerciciosConcluidosFinal =
        serieAtual >= exercicios[exIndex]?.num_series
          ? [...exerciciosConcluidos, exercicios[exIndex]?.id].filter(Boolean)
          : exerciciosConcluidos;

      const progressoParaSalvar = {
        exIndex: exIndex,
        serieAtual: serieAtual,
        exercicios_concluidos: exerciciosConcluidosFinal,
      };

      await treinosService.finalizarSessao(
        treino.idSessao,
        progressoParaSalvar,
        duracaoTotal,
        "Treino pausado"
      );
      navigate("/treinos");
    } catch (err) {
      console.error("Erro ao parar treino:", err);
      alert("Não foi possível parar o treino. Tente novamente.");
    }
  };

  const handleAvancar = () => {
    if (estado === "execucao") {
      setEstado("descanso");
    } else if (estado === "descanso") {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      avancarDepoisDescanso();
    }
  };

  const handleVoltar = () => {
    if (estado === "descanso") {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setEstado("execucao");
      setShowVideo(false);
      return;
    }
    if (estado === "execucao") {
      if (serieAtual > 1) {
        setSerieAtual((prev) => prev - 1);
      } else if (exIndex > 0) {
        setExIndex((prev) => prev - 1);
        setSerieAtual(exercicios[exIndex - 1]?.num_series || 1);
      }
      setShowVideo(false);
    }
  };

  const handleVideoClick = () => {
    const youtubeId = getYoutubeId(ex.url);
    if (!youtubeId) {
      console.log("Nenhum vídeo disponível");
      return;
    }
    setShowVideo(true);
  };

  const renderDescanso = () => {
    if (!ex.tempo_descanso || ex.tempo_descanso <= 0) return null;

    return (
      <div id="treinando view-descanso">
        <div className="descansano">
          <div className="titulo">
            <h2 id="descanso-titulo">Descanso: {ex.nome}</h2>
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
              Pular Descanso
            </button>
            <button className="btnvtl" onClick={handleVoltar}>
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  };

  // O restante do JSX permanece igual ao seu código atual...
  return (
    <div className="treinando adjustfoda">
      {/* Seu JSX existente aqui - mantendo a mesma estrutura */}
      <div
        className="barra-progresso"
        style={{ width: "1200px", height: "8px", background: "#eee" }}
      >
        <div
          style={{
            width: `${progressoPercentual}%`,
            height: "100%",
            background: "#368dd9",
            transition: "width 0.3s",
          }}
        ></div>
      </div>

      <div className="treinandorr">
        <div id="lista-exercicios">
          <h3 className="exnm">{treino.nome}</h3>
          <div id="lista">
            {exercicios.map((exerc, i) => (
              <div
                key={exerc.id}
                className={`ex-item ${i === exIndex ? "active" : ""} ${
                  exerc.concluido ? "concluido" : ""
                }`}
                onClick={() => {
                  if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                  }
                  setExIndex(i);
                  setSerieAtual(1);
                  setEstado("execucao");
                  setShowVideo(false);
                }}
              >
                <strong>{exerc.nome}</strong>
                {exerc.url && <span className="video-indicator"></span>}
              </div>
            ))}
          </div>
          <button className="ext" onClick={handlePararTreino}>
            Sair
          </button>
        </div>

        <div id="conteudo">
          {estado === "execucao" && (
            <div id="view-execucao">
              {/* Conteúdo de execução mantido igual */}
              <div className="titulo">
                <h2 id="ex-nome">{ex.nome}</h2>
                <div className="series">
                  <span id="ex-serie">
                    {serieAtual} / {ex.num_series}
                  </span>
                </div>
              </div>

              <div
                id="video-container"
                ref={videoContainerRef}
                style={{
                  display: "flex",
                  width: "100%",
                  aspectRatio: "16/9",
                  borderRadius: "8px",
                  overflow: "hidden",
                  position: "relative",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {showVideo ? (
                  <iframe
                    id="playerex"
                    src={`https://www.youtube.com/embed/${getYoutubeId(
                      ex.url
                    )}?autoplay=1`}
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    style={{
                      width: "90%",
                      height: "auto", // ocupa 100% do container
                      borderRadius: "8px",
                      top: 0,
                      left: 0,
                      margin: "auto",
                    }}
                  ></iframe>
                ) : (
                  <img
                    id="ex-cover"
                    src={ex.cover}
                    alt="Capa do exercício"
                    onClick={handleVideoClick}
                    style={{
                      width: "90%",
                      height: "auto", // ocupa 100% do container
                      borderRadius: "8px",
                      objectFit: "cover", // mantém proporção sem esticar
                      cursor: ex.url ? "pointer" : "default",
                      opacity: ex.url ? 1 : 0.7,
                      top: 0,
                      left: 0,
                    }}
                  />
                )}
                {!ex.url && (
                  <div
                    className="no-video-message"
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      color: "#666",
                      fontStyle: "italic",
                      position: "absolute",
                      width: "100%",
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  >
                    🏋️ Nenhum vídeo disponível para este exercício
                    <br />
                    <small>Execute o movimento conforme as instruções</small>
                  </div>
                )}
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
