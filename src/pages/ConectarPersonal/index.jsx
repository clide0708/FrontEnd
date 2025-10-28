import { useState, useEffect } from "react";
import "./style.css";
import connectService from "../../services/Personal/conectar";
import { Search, MapPin, Filter, User } from "lucide-react";

function ConectarPersonalPage() {
  const [personais, setPersonais] = useState([]);
  const [filtros, setFiltros] = useState({
    academia_id: "",
    cref_tipo: "",
    localizacao: "",
    modalidades: [],
    personalizado: ""
  });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [personalSelecionado, setPersonalSelecionado] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [academias, setAcademias] = useState([]);
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  // Carrega personais e academias
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [personaisData, academiasData] = await Promise.all([
          connectService.getPersonais(filtros),
          connectService.getAcademias()
        ]);
        setPersonais(personaisData || []);
        setAcademias(academiasData || []);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        setPersonais([]);
        setAcademias([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [filtros]);

  // Detectar localização automática
  const detectarLocalizacao = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFiltros(prev => ({
            ...prev,
            latitude,
            longitude
          }));
        },
        (error) => {
          console.error("Erro ao obter localização:", error);
          alert("Não foi possível obter sua localização automaticamente.");
        }
      );
    }
  };

  // Verificar se já existe convite pendente
  const temConvitePendente = (idPersonal) => {
    return personais.some(p => 
      p.idPersonal === idPersonal && p.convitePendente
    );
  };

  // Enviar convite
  const enviarConvite = async () => {
    if (!personalSelecionado || !mensagem.trim()) {
      alert("Por favor, escreva uma mensagem para o personal.");
      return;
    }

    try {
      await connectService.enviarConvite({
        id_remetente: usuario.id,
        tipo_remetente: 'aluno',
        id_destinatario: personalSelecionado.idPersonal,
        tipo_destinatario: 'personal',
        mensagem: mensagem.trim()
      });

      alert("Convite enviado com sucesso!");
      setShowModal(false);
      setMensagem("");
      setPersonalSelecionado(null);

      // Atualizar lista para mostrar convite pendente
      setPersonais(prev => 
        prev.map(p => 
          p.idPersonal === personalSelecionado.idPersonal 
            ? { ...p, convitePendente: true }
            : p
        )
      );
    } catch (err) {
      console.error("Erro ao enviar convite:", err);
      alert(err.response?.data?.error || "Erro ao enviar convite");
    }
  };

  // Modalidades pré-definidas
  const modalidadesOptions = [
    "Musculação", "CrossFit", "Calistenia", "Pilates", 
    "Funcional", "Yoga", "Alongamento", "Reabilitação"
  ];

  return (
    <div className="ConectarPersonal">
      <div className="containerPS">
        {/* Painel esquerdo - Lista de Personais */}
        <div className="SC1">
          <div className="tituloSection">
            <h1 className="Titulo">Conecte-se a um Personal</h1>
            <p>Encontre o personal trainer ideal para seus objetivos</p>
          </div>

          {/* Filtros */}
          <div className="filtrosSection">
            <div className="filtrosHeader">
              <Filter size={20} />
              <h3>Filtros</h3>
            </div>
            
            <div className="filtrosGrid">
              {/* Academia */}
              <div className="filtroGroup">
                <label>Academia</label>
                <select 
                  value={filtros.academia_id}
                  onChange={(e) => setFiltros(prev => ({ ...prev, academia_id: e.target.value }))}
                >
                  <option value="">Todas as academias</option>
                  {academias.map(academia => (
                    <option key={academia.idAcademia} value={academia.idAcademia}>
                      {academia.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tipo CREF */}
              <div className="filtroGroup">
                <label>Tipo CREF</label>
                <select 
                  value={filtros.cref_tipo}
                  onChange={(e) => setFiltros(prev => ({ ...prev, cref_tipo: e.target.value }))}
                >
                  <option value="">Todos</option>
                  <option value="G">Graduado (G)</option>
                  <option value="P">Provisionado (P)</option>
                </select>
              </div>

              {/* Localização */}
              <div className="filtroGroup">
                <label>Localização</label>
                <div className="localizacaoInput">
                  <input
                    type="text"
                    placeholder="Cidade ou endereço"
                    value={filtros.localizacao}
                    onChange={(e) => setFiltros(prev => ({ ...prev, localizacao: e.target.value }))}
                  />
                  <button 
                    type="button" 
                    className="btnLocalizacao"
                    onClick={detectarLocalizacao}
                  >
                    <MapPin size={16} />
                  </button>
                </div>
              </div>

              {/* Tipo Trabalho */}
              <div className="filtroGroup">
                <label>Tipo de Trabalho</label>
                <select 
                  value={filtros.personalizado}
                  onChange={(e) => setFiltros(prev => ({ ...prev, personalizado: e.target.value }))}
                >
                  <option value="">Todos</option>
                  <option value="true">Com treinos personalizados</option>
                  <option value="false">Sem treinos personalizados</option>
                </select>
              </div>
            </div>

            {/* Modalidades */}
            <div className="filtroGroup fullWidth">
              <label>Modalidades</label>
              <div className="modalidadesGrid">
                {modalidadesOptions.map(modalidade => (
                  <label key={modalidade} className="checkboxLabel">
                    <input
                      type="checkbox"
                      checked={filtros.modalidades.includes(modalidade)}
                      onChange={(e) => {
                        const newModalidades = e.target.checked
                          ? [...filtros.modalidades, modalidade]
                          : filtros.modalidades.filter(m => m !== modalidade);
                        setFiltros(prev => ({ ...prev, modalidades: newModalidades }));
                      }}
                    />
                    {modalidade}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Lista de Personais */}
          <div className="personaisSection">
            {loading ? (
              <div className="loading">Carregando personais...</div>
            ) : personais.length === 0 ? (
              <div className="emptyState">
                <User size={48} />
                <p>Nenhum personal encontrado com os filtros selecionados.</p>
              </div>
            ) : (
              <div className="personaisGrid">
                {personais.map(personal => (
                  <div key={personal.idPersonal} className="personalCard">
                    <div className="personalHeader">
                      <img
                        src={personal.foto_perfil || "/assets/images/profilefoto.png"}
                        alt={personal.nome}
                        className="personalFoto"
                      />
                      <div className="personalInfo">
                        <h3>{personal.nome}</h3>
                        <p className="personalCREF">{personal.cref}</p>
                        <p className="personalAcademia">{personal.nomeAcademia}</p>
                      </div>
                    </div>

                    <div className="personalDetails">
                      {personal.modalidades && personal.modalidades.length > 0 && (
                        <div className="modalidadesList">
                          <strong>Modalidades:</strong>
                          <span>{personal.modalidades.join(", ")}</span>
                        </div>
                      )}
                      
                      {personal.distancia_km && (
                        <div className="distancia">
                          <MapPin size={14} />
                          <span>{personal.distancia_km} km de distância</span>
                        </div>
                      )}

                      {personal.treinos_count !== undefined && (
                        <div className="treinosInfo">
                          <strong>{personal.treinos_count}</strong> treinos criados
                        </div>
                      )}
                    </div>

                    <div className="personalActions">
                      {temConvitePendente(personal.idPersonal) ? (
                        <button className="btnConviteEnviado" disabled>
                          Convite Enviado
                        </button>
                      ) : (
                        <button
                          className="btnConectar"
                          onClick={() => {
                            setPersonalSelecionado(personal);
                            setShowModal(true);
                          }}
                        >
                          Conectar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Painel direito - Informações */}
        <div className="SC2">
          <div className="infoCard">
            <h3>💡 Como funciona?</h3>
            <ul>
              <li>Encontre personais qualificados</li>
              <li>Filtre por especialidade e localização</li>
              <li>Envie convites personalizados</li>
              <li>Aguarde a confirmação</li>
            </ul>
          </div>

          <div className="statsCard">
            <h3>📊 Estatísticas</h3>
            <div className="statItem">
              <strong>{personais.length}</strong>
              <span>Personais disponíveis</span>
            </div>
            <div className="statItem">
              <strong>
                {personais.filter(p => p.cref_tipo === 'G').length}
              </strong>
              <span>Graduados (CREF-G)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Envio de Convite */}
      {showModal && personalSelecionado && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Enviar Convite</h2>
            <p>
              Envie uma mensagem para <strong>{personalSelecionado.nome}</strong>
            </p>
            
            <div className="mensagemInput">
              <textarea
                placeholder="Escreva uma mensagem personalizada explicando por que você gostaria de se conectar..."
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                rows={6}
                maxLength={255}
              />
              <div className="contadorCaracteres">
                {mensagem.length}/255 caracteres
              </div>
            </div>

            <div className="modal-actions">
              <button 
                onClick={() => {
                  setShowModal(false);
                  setPersonalSelecionado(null);
                  setMensagem("");
                }}
                className="btnCancelar"
              >
                Cancelar
              </button>
              <button 
                onClick={enviarConvite}
                className="btnEnviar"
                disabled={!mensagem.trim()}
              >
                Enviar Convite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ConectarPersonalPage;