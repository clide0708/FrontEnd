import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  UserCheck, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  TrendingUp,
  MapPin,
  Mail
} from "lucide-react";
import academiaService from "../../services/Academia/academia";
import "./style.css";

const PainelControleAcademiaPage = () => {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState('overview');
  const [modalAberto, setModalAberto] = useState(null);
  const [mensagemResposta, setMensagemResposta] = useState('');
  const navigate = useNavigate();

   useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario || usuario.tipo !== "academia") {
      navigate("/home");
      return;
    }
  }, [navigate]);

  useEffect(() => {
    carregarPainel();
  }, []);

  const carregarPainel = async () => {
    try {
        const response = await academiaService.getPainelControle();
        
        // CORREÇÃO: Acesse response.data diretamente
        if (response.data.success) {
        setDados(response.data.data);
        } else {
        throw new Error(response.data.error || 'Erro ao carregar dados');
        }
    } catch (error) {
        console.error('Erro ao carregar painel:', error);
        alert(error.response?.data?.error || error.message || 'Erro ao carregar dados do painel');
    } finally {
        setCarregando(false);
    }
  };

  const aceitarSolicitacao = async (idSolicitacao) => {
    try {
      await academiaService.aceitarSolicitacao(idSolicitacao);
      alert('Solicitação aceita com sucesso!');
      carregarPainel();
    } catch (error) {
      console.error('Erro ao aceitar solicitação:', error);
      alert(error.response?.data?.error || 'Erro ao aceitar solicitação');
    }
  };

  const recusarSolicitacao = async (idSolicitacao) => {
    try {
      await academiaService.recusarSolicitacao(idSolicitacao, mensagemResposta);
      alert('Solicitação recusada');
      setModalAberto(null);
      setMensagemResposta('');
      carregarPainel();
    } catch (error) {
      console.error('Erro ao recusar solicitação:', error);
      alert(error.response?.data?.error || 'Erro ao recusar solicitação');
    }
  };

  const desvincularUsuario = async (idUsuario, tipoUsuario) => {
    if (confirm('Tem certeza que deseja desvincular este usuário?')) {
      try {
        await academiaService.desvincularUsuario({
          idUsuario,
          tipoUsuario,
          motivo: 'Desvinculado pelo administrador da academia'
        });
        alert('Usuário desvinculado com sucesso');
        carregarPainel();
      } catch (error) {
        console.error('Erro ao desvincular usuário:', error);
        alert(error.response?.data?.error || 'Erro ao desvincular usuário');
      }
    }
  };

  if (carregando) {
    return (
      <div className="painel-academia loading">
        <div className="loading-spinner">Carregando...</div>
      </div>
    );
  }

  if (!dados) {
    return (
      <div className="painel-academia error">
        <p>Erro ao carregar dados do painel</p>
      </div>
    );
  }

  const { academia, estatisticas, solicitacoes_pendentes, usuarios_vinculados } = dados;

  return (
    <div className="painel-academia">
      {/* Header */}
      <div className="painel-header">
        <div className="academia-info">
          <h1>{academia.nome}</h1>
          <p>Painel de Controle</p>
        </div>
        <div className="academia-contato">
          <p><Mail size={16} /> {academia.email}</p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon alunos">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h3>{estatisticas.alunos_vinculados}</h3>
            <p>Alunos Vinculados</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon personais">
            <UserCheck size={24} />
          </div>
          <div className="stat-info">
            <h3>{estatisticas.personais_vinculados}</h3>
            <p>Personais Vinculados</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon solicitacoes">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <h3>{estatisticas.solicitacoes_pendentes}</h3>
            <p>Solicitações Pendentes</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon total">
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <h3>{estatisticas.alunos_vinculados + estatisticas.personais_vinculados}</h3>
            <p>Total de Usuários</p>
          </div>
        </div>
      </div>

      {/* Navegação */}
      <div className="painel-navigation">
        <button 
          className={`nav-btn ${abaAtiva === 'overview' ? 'active' : ''}`}
          onClick={() => setAbaAtiva('overview')}
        >
          Visão Geral
        </button>
        <button 
          className={`nav-btn ${abaAtiva === 'solicitacoes' ? 'active' : ''}`}
          onClick={() => setAbaAtiva('solicitacoes')}
        >
          Solicitações
          {solicitacoes_pendentes.length > 0 && (
            <span className="badge">{solicitacoes_pendentes.length}</span>
          )}
        </button>
        <button 
          className={`nav-btn ${abaAtiva === 'vinculados' ? 'active' : ''}`}
          onClick={() => setAbaAtiva('vinculados')}
        >
          Usuários Vinculados
        </button>
      </div>

      {/* Conteúdo das Abas */}
      <div className="painel-content">
        {abaAtiva === 'overview' && (
          <div className="overview-tab">
            <div className="overview-grid">
              {/* Solicitações Recentes */}
              <div className="overview-card">
                <h3>Solicitações Recentes</h3>
                {solicitacoes_pendentes.slice(0, 5).map(solicitacao => (
                  <div key={solicitacao.idSolicitacao} className="solicitacao-item">
                    <div className="solicitacao-info">
                      <strong>{solicitacao.nome_usuario}</strong>
                      <span className="user-type">{solicitacao.tipo_usuario}</span>
                      <p>{solicitacao.email_usuario}</p>
                      {solicitacao.mensagem_solicitante && (
                        <p className="solicitacao-mensagem">"{solicitacao.mensagem_solicitante}"</p>
                      )}
                    </div>
                    <div className="solicitacao-actions">
                      <button 
                        className="btn-accept"
                        onClick={() => aceitarSolicitacao(solicitacao.idSolicitacao)}
                      >
                        <CheckCircle size={16} />
                        Aceitar
                      </button>
                      <button 
                        className="btn-reject"
                        onClick={() => setModalAberto(solicitacao.idSolicitacao)}
                      >
                        <XCircle size={16} />
                        Recusar
                      </button>
                    </div>
                  </div>
                ))}
                {solicitacoes_pendentes.length === 0 && (
                  <p className="empty-message">Nenhuma solicitação pendente</p>
                )}
              </div>

              {/* Usuários Vinculados Recentes */}
              <div className="overview-card">
                <h3>Usuários Vinculados Recentes</h3>
                {usuarios_vinculados.slice(0, 5).map(usuario => (
                  <div key={usuario.idVinculo} className="usuario-item">
                    <img 
                      src={usuario.foto_perfil || "/assets/images/profilefoto.png"} 
                      alt={usuario.nome_usuario}
                      className="usuario-avatar"
                    />
                    <div className="usuario-info">
                      <strong>{usuario.nome_usuario}</strong>
                      <span className={`user-type ${usuario.tipo_usuario}`}>
                        {usuario.tipo_usuario}
                      </span>
                      <p>Vinculado em: {new Date(usuario.data_vinculo).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
                {usuarios_vinculados.length === 0 && (
                  <p className="empty-message">Nenhum usuário vinculado</p>
                )}
              </div>
            </div>
          </div>
        )}

        {abaAtiva === 'solicitacoes' && (
          <div className="solicitacoes-tab">
            <h3>Solicitações de Vinculação Pendentes</h3>
            {solicitacoes_pendentes.length === 0 ? (
              <div className="empty-state">
                <Clock size={48} />
                <p>Nenhuma solicitação pendente</p>
              </div>
            ) : (
              <div className="solicitacoes-list">
                {solicitacoes_pendentes.map(solicitacao => (
                  <div key={solicitacao.idSolicitacao} className="solicitacao-card">
                    <div className="solicitacao-header">
                      <div className="solicitacao-user">
                        <img 
                          src="/assets/images/profilefoto.png" 
                          alt={solicitacao.nome_usuario}
                          className="user-avatar"
                        />
                        <div>
                          <h4>{solicitacao.nome_usuario}</h4>
                          <p className="user-email">{solicitacao.email_usuario}</p>
                          <span className={`user-type-badge ${solicitacao.tipo_usuario}`}>
                            {solicitacao.tipo_usuario === 'aluno' ? 'Aluno' : 'Personal Trainer'}
                          </span>
                        </div>
                      </div>
                      <div className="solicitacao-meta">
                        <p>Solicitado em: {new Date(solicitacao.data_criacao).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {solicitacao.mensagem_solicitante && (
                      <div className="solicitacao-message">
                        <MessageSquare size={16} />
                        <p>"{solicitacao.mensagem_solicitante}"</p>
                      </div>
                    )}

                    <div className="solicitacao-actions">
                      <button 
                        className="btn-accept-large"
                        onClick={() => aceitarSolicitacao(solicitacao.idSolicitacao)}
                      >
                        <CheckCircle size={18} />
                        Aceitar Solicitação
                      </button>
                      <button 
                        className="btn-reject-large"
                        onClick={() => setModalAberto(solicitacao.idSolicitacao)}
                      >
                        <XCircle size={18} />
                        Recusar Solicitação
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {abaAtiva === 'vinculados' && (
          <div className="vinculados-tab">
            <h3>Usuários Vinculados à Academia</h3>
            <div className="vinculados-grid">
              {/* Alunos */}
              <div className="vinculados-section">
                <h4>Alunos ({usuarios_vinculados.filter(u => u.tipo_usuario === 'aluno').length})</h4>
                {usuarios_vinculados
                  .filter(u => u.tipo_usuario === 'aluno')
                  .map(usuario => (
                    <UsuarioCard 
                      key={usuario.idVinculo}
                      usuario={usuario}
                      onDesvincular={desvincularUsuario}
                    />
                  ))
                }
              </div>

              {/* Personais */}
              <div className="vinculados-section">
                <h4>Personal Trainers ({usuarios_vinculados.filter(u => u.tipo_usuario === 'personal').length})</h4>
                {usuarios_vinculados
                  .filter(u => u.tipo_usuario === 'personal')
                  .map(usuario => (
                    <UsuarioCard 
                      key={usuario.idVinculo}
                      usuario={usuario}
                      onDesvincular={desvincularUsuario}
                    />
                  ))
                }
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Recusa */}
      {modalAberto && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Recusar Solicitação</h3>
            <p>Deseja enviar uma mensagem explicando o motivo da recusa?</p>
            <textarea
              placeholder="Mensagem opcional para o solicitante..."
              value={mensagemResposta}
              onChange={(e) => setMensagemResposta(e.target.value)}
              rows={4}
            />
            <div className="modal-actions">
              <button 
                onClick={() => {
                  setModalAberto(null);
                  setMensagemResposta('');
                }}
                className="btn-cancel"
              >
                Cancelar
              </button>
              <button 
                onClick={() => recusarSolicitacao(modalAberto)}
                className="btn-confirm-reject"
              >
                Recusar Solicitação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente de Card de Usuário
const UsuarioCard = ({ usuario, onDesvincular }) => (
  <div className="usuario-card">
    <div className="usuario-header">
      <img 
        src={usuario.foto_perfil || "/assets/images/profilefoto.png"} 
        alt={usuario.nome_usuario}
        className="usuario-avatar"
      />
      <div className="usuario-info">
        <h5>{usuario.nome_usuario}</h5>
        <p className="usuario-email">{usuario.email_usuario}</p>
        <div className="usuario-meta">
          <span className={`user-type-badge ${usuario.tipo_usuario}`}>
            {usuario.tipo_usuario === 'aluno' ? 'Aluno' : 'Personal Trainer'}
          </span>
          <span className="vinculo-date">
            Vinculado em: {new Date(usuario.data_vinculo).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
    <button 
      className="btn-desvincular"
      onClick={() => onDesvincular(usuario.idUsuario, usuario.tipo_usuario)}
    >
      Desvincular
    </button>
  </div>
);

export default PainelControleAcademiaPage;