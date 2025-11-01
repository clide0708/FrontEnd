import { useState, useEffect } from "react";
import "./style.css";
import connectService from "../../services/Personal/conectar";
import { Search, MapPin, Filter, User, Users, Navigation } from "lucide-react";

function ConectarPersonalPage() {
  const [dados, setDados] = useState([]);
  const [filtros, setFiltros] = useState({
    academia_id: "",
    genero: "",
    localizacao: "",
    modalidades: [],
    treinosAdaptados: "",
    // Filtros específicos para alunos
    idade_min: "",
    idade_max: "",
    meta: "",
    // Filtros específicos para personais
    cref_tipo: "",
    raio_km: 50
  });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [academias, setAcademias] = useState([]);
  const [modalidades, setModalidades] = useState([]);
  const [localizacaoUsuario, setLocalizacaoUsuario] = useState(null);
  
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const isPersonal = usuario?.tipo === 'personal';
  const tituloPagina = isPersonal ? "Encontre Alunos" : "Conecte-se a um Personal";
  const descricaoPagina = isPersonal 
    ? "Encontre alunos ideais para seu método de trabalho" 
    : "Encontre o personal trainer ideal para seus objetivos";

  // Carrega dados iniciais
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [dadosData, academiasData, modalidadesData] = await Promise.all([
          isPersonal ? connectService.getAlunos(filtros) : connectService.getPersonais(filtros),
          connectService.getAcademias(),
          connectService.getModalidades()
        ]);
        setDados(dadosData || []);
        setAcademias(academiasData || []);
        setModalidades(modalidadesData || []);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        setDados([]);
        setAcademias([]);
        setModalidades([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [filtros, isPersonal]);

  // Detectar localização automática
  const detectarLocalizacao = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocalizacaoUsuario({ latitude, longitude });
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

  // Buscar endereço por CEP
  const buscarEnderecoPorCEP = async (cep) => {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        setFiltros(prev => ({
          ...prev,
          localizacao: `${data.localidade}, ${data.uf}`
        }));
      } else {
        alert("CEP não encontrado.");
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      alert("Erro ao buscar endereço.");
    }
  };

  // Enviar convite
  const enviarConvite = async () => {
    if (!usuarioSelecionado || !mensagem.trim()) {
      alert("Por favor, escreva uma mensagem personalizada.");
      return;
    }

    const dadosConvite = {
      id_remetente: usuario.id,
      tipo_remetente: usuario.tipo,
      id_destinatario: isPersonal ? usuarioSelecionado.idAluno : usuarioSelecionado.idPersonal,
      tipo_destinatario: isPersonal ? 'aluno' : 'personal',
      mensagem: mensagem.trim()
    };

    try {
      await connectService.enviarConvite(dadosConvite);
      alert("Convite enviado com sucesso!");
      setShowModal(false);
      setMensagem("");
      setUsuarioSelecionado(null);

      // Atualizar lista para mostrar convite pendente
      setDados(prev => 
        prev.map(item => 
          (isPersonal ? item.idAluno === usuarioSelecionado.idAluno : item.idPersonal === usuarioSelecionado.idPersonal)
            ? { ...item, convitePendente: true }
            : item
        )
      );
    } catch (err) {
      console.error("Erro ao enviar convite:", err);
      alert(err.response?.data?.error || "Erro ao enviar convite");
    }
  };

  // Modalidades pré-definidas
  const modalidadesOptions = modalidades.map(m => m.nome);

  return (
    <div className="ConectarPersonal">
      <div className="containerPS">
        {/* Painel esquerdo - Lista */}
        <div className="SC1">
          <div className="tituloSection">
            <h1 className="Titulo">{tituloPagina}</h1>
            <p>{descricaoPagina}</p>
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

              {/* Gênero */}
              <div className="filtroGroup">
                <label>Gênero</label>
                <select 
                  value={filtros.genero}
                  onChange={(e) => setFiltros(prev => ({ ...prev, genero: e.target.value }))}
                >
                  <option value="">Todos</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              {/* Filtros específicos para personais */}
              {!isPersonal && (
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
              )}

              {/* Filtros específicos para alunos */}
              {isPersonal && (
                <>
                  <div className="filtroGroup">
                    <label>Idade Mínima</label>
                    <input
                      type="number"
                      placeholder="Ex: 18"
                      value={filtros.idade_min}
                      onChange={(e) => setFiltros(prev => ({ ...prev, idade_min: e.target.value }))}
                    />
                  </div>

                  <div className="filtroGroup">
                    <label>Idade Máxima</label>
                    <input
                      type="number"
                      placeholder="Ex: 60"
                      value={filtros.idade_max}
                      onChange={(e) => setFiltros(prev => ({ ...prev, idade_max: e.target.value }))}
                    />
                  </div>

                  <div className="filtroGroup">
                    <label>Meta</label>
                    <input
                      type="text"
                      placeholder="Ex: Ganhar massa"
                      value={filtros.meta}
                      onChange={(e) => setFiltros(prev => ({ ...prev, meta: e.target.value }))}
                    />
                  </div>
                </>
              )}

              {/* Localização */}
              <div className="filtroGroup">
                <label>Localização</label>
                <div className="localizacaoInput">
                  <input
                    type="text"
                    placeholder="Cidade, estado ou CEP"
                    value={filtros.localizacao}
                    onChange={(e) => setFiltros(prev => ({ ...prev, localizacao: e.target.value }))}
                    onBlur={(e) => {
                      const cep = e.target.value.replace(/\D/g, '');
                      if (cep.length === 8) {
                        buscarEnderecoPorCEP(cep);
                      }
                    }}
                  />
                  <button 
                    type="button" 
                    className="btnLocalizacao"
                    onClick={detectarLocalizacao}
                    title="Usar minha localização atual"
                  >
                    <Navigation size={16} />
                  </button>
                </div>
              </div>

              {/* Raio de busca */}
              <div className="filtroGroup">
                <label>Raio de busca</label>
                <select 
                  value={filtros.raio_km}
                  onChange={(e) => setFiltros(prev => ({ ...prev, raio_km: e.target.value }))}
                >
                  <option value="10">10 km</option>
                  <option value="25">25 km</option>
                  <option value="50">50 km</option>
                  <option value="100">100 km</option>
                  <option value="0">Todo Brasil</option>
                </select>
              </div>

              {/* Tipo Trabalho */}
              <div className="filtroGroup">
                <label>Treinos Adaptados</label>
                <select 
                  value={filtros.treinosAdaptados}
                  onChange={(e) => setFiltros(prev => ({ ...prev, treinosAdaptados: e.target.value }))}
                >
                  <option value="">Todos</option>
                  <option value="true">Com treinos adaptados</option>
                  <option value="false">Sem treinos adaptados</option>
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

          {/* Lista de Usuários */}
          <div className="personaisSection">
            {loading ? (
              <div className="loading">Carregando {isPersonal ? 'alunos' : 'personais'}...</div>
            ) : dados.length === 0 ? (
              <div className="emptyState">
                <User size={48} />
                <p>Nenhum {isPersonal ? 'aluno' : 'personal'} encontrado com os filtros selecionados.</p>
              </div>
            ) : (
              <div className="personaisGrid">
                {dados.map(item => (
                  <div key={isPersonal ? item.idAluno : item.idPersonal} className="personalCard">
                    <div className="personalHeader">
                      <img
                        src={item.foto_perfil || "/assets/images/profilefoto.png"}
                        alt={item.nome}
                        className="personalFoto"
                      />
                      <div className="personalInfo">
                        <h3>{item.nome}</h3>
                        {!isPersonal && (
                          <p className="personalCREF">{item.cref}</p>
                        )}
                        <p className="personalAcademia">
                          {item.cidade && `${item.cidade}, ${item.estado}`}
                          {item.nomeAcademia && ` • ${item.nomeAcademia}`}
                        </p>
                        {isPersonal && item.meta && (
                          <p className="personalMeta"><strong>Meta:</strong> {item.meta}</p>
                        )}
                      </div>
                    </div>

                    <div className="personalDetails">
                      {item.modalidades && item.modalidades.length > 0 && (
                        <div className="modalidadesList">
                          <strong>Modalidades:</strong>
                          <span>{item.modalidades.join(", ")}</span>
                        </div>
                      )}
                      
                      {item.distancia_km && (
                        <div className="distancia">
                          <MapPin size={14} />
                          <span>{item.distancia_km} km de distância</span>
                        </div>
                      )}

                      {!isPersonal && item.treinos_count !== undefined && (
                        <div className="treinosInfo">
                          <strong>{item.treinos_count}</strong> treinos criados
                        </div>
                      )}

                      {item.treinosAdaptados && (
                        <div className="adaptadoInfo">
                          <strong>✓</strong> Trabalha com treinos adaptados
                        </div>
                      )}

                      {isPersonal && (
                        <div className="dadosAluno">
                          {item.idade && <span><strong>Idade:</strong> {item.idade} anos</span>}
                          {item.altura && <span><strong>Altura:</strong> {item.altura}cm</span>}
                          {item.peso && <span><strong>Peso:</strong> {item.peso}kg</span>}
                        </div>
                      )}
                    </div>

                    <div className="personalActions">
                      {item.convitePendente ? (
                        <button className="btnConviteEnviado" disabled>
                          Convite Enviado
                        </button>
                      ) : (
                        <button
                          className="btnConectar"
                          onClick={() => {
                            setUsuarioSelecionado(item);
                            setShowModal(true);
                          }}
                        >
                          {isPersonal ? 'Convidar' : 'Conectar'}
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
              <li>{isPersonal ? 'Encontre alunos qualificados' : 'Encontre personais qualificados'}</li>
              <li>Filtre por especialidade e localização</li>
              <li>Envie convites personalizados</li>
              <li>Aguarde a confirmação</li>
            </ul>
          </div>

          <div className="statsCard">
            <h3>📊 Estatísticas</h3>
            <div className="statItem">
              <strong>{dados.length}</strong>
              <span>{isPersonal ? 'Alunos' : 'Personais'} disponíveis</span>
            </div>
            {!isPersonal && (
              <div className="statItem">
                <strong>
                  {dados.filter(p => p.cref_tipo === 'G').length}
                </strong>
                <span>Graduados (CREF-G)</span>
              </div>
            )}
            <div className="statItem">
              <strong>
                {dados.filter(p => p.treinosAdaptados).length}
              </strong>
              <span>Com treinos adaptados</span>
            </div>
          </div>

          {localizacaoUsuario && (
            <div className="localizacaoCard">
              <h3>📍 Sua Localização</h3>
              <p>Busca baseada na sua localização atual</p>
              <button 
                onClick={detectarLocalizacao}
                className="btnAtualizarLocalizacao"
              >
                Atualizar Localização
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Envio de Convite */}
      {showModal && usuarioSelecionado && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Enviar Convite</h2>
            <p>
              Envie uma mensagem para <strong>{usuarioSelecionado.nome}</strong>
            </p>
            
            <div className="mensagemInput">
              <textarea
                placeholder={`Escreva uma mensagem personalizada explicando por que você gostaria de se conectar com ${usuarioSelecionado.nome}...`}
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                rows={6}
                maxLength={500}
              />
              <div className="contadorCaracteres">
                {mensagem.length}/500 caracteres
              </div>
            </div>

            <div className="modal-actions">
              <button 
                onClick={() => {
                  setShowModal(false);
                  setUsuarioSelecionado(null);
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