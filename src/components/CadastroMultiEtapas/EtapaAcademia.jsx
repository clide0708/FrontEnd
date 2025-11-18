// components/CadastroMultiEtapas/EtapaAcademia.jsx
import { useState, useEffect } from "react";
import { Building, Search, MapPin, Phone, Users, Wifi, Car, Activity } from "lucide-react";

const EtapaAcademia = ({ dados, onChange, tipoUsuario }) => {
  const [academias, setAcademias] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    carregarAcademias();
  }, []);

  const carregarAcademias = async () => {
    setCarregando(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}academias-ativas`);
      const data = await response.json();
      if (data.success) {
        setAcademias(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar academias:', error);
    } finally {
      setCarregando(false);
    }
  };

  const academiasFiltradas = academias.filter(academia =>
    academia.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    academia.endereco_completo?.toLowerCase().includes(filtro.toLowerCase()) ||
    academia.modalidades?.toLowerCase().includes(filtro.toLowerCase())
  );

  // Função para formatar telefone
  const formatarTelefone = (telefone) => {
    if (!telefone) return '';
    
    const apenasNumeros = telefone.replace(/\D/g, '');
    
    if (apenasNumeros.length === 11) {
      return `(${apenasNumeros.substring(0, 2)}) ${apenasNumeros.substring(2, 7)}-${apenasNumeros.substring(7)}`;
    } else if (apenasNumeros.length === 10) {
      return `(${apenasNumeros.substring(0, 2)}) ${apenasNumeros.substring(2, 6)}-${apenasNumeros.substring(6)}`;
    }
    
    return telefone;
  };

  // Função para truncar texto longo
  const truncarTexto = (texto, maxLength) => {
    if (!texto) return '';
    if (texto.length <= maxLength) return texto;
    return texto.substring(0, maxLength) + '...';
  };

  // Função para separar modalidades em array
  const separarModalidades = (modalidadesString) => {
    if (!modalidadesString) return [];
    return modalidadesString.split(', ').slice(0, 20); // Mostra no máximo 4 modalidades
  };

  return (
    <div className="etapa-academia">
      <h2>Vinculação com Academia</h2>
      <p>Selecione uma academia para se vincular (opcional)</p>

      <div className="academia-selection">
        {/* Busca */}
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar academia por nome, endereço ou modalidades..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Lista de academias */}
        <div className="academias-list">
          {carregando ? (
            <div className="loading">Carregando academias...</div>
          ) : academiasFiltradas.length === 0 ? (
            <div className="empty-state">
              <Building size={48} />
              <p>{filtro ? 'Nenhuma academia encontrada para sua busca' : 'Nenhuma academia encontrada'}</p>
            </div>
          ) : (
            academiasFiltradas.map(academia => (
              <div
                key={academia.idAcademia}
                className={`academia-card ${dados.idAcademia === academia.idAcademia ? 'selected' : ''}`}
                onClick={() => onChange({ idAcademia: academia.idAcademia })}
              >
                {/* Foto da academia */}
                <div className="academia-foto">
                  {academia.foto_url ? (
                    <img 
                      src={`${import.meta.env.VITE_API_URL}${academia.foto_url}`} 
                      alt={academia.nome}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`foto-placeholder ${academia.foto_url ? 'hidden' : ''}`}>
                    <Building size={32} />
                  </div>
                </div>

                {/* Container principal das informações */}
                <div className="academia-info-container">
                  {/* Header com nome e badges */}
                  <div className="academia-header">
                    <div className="academia-title-section">
                      <h4>{academia.nome}</h4>
                    </div>
                  </div>

                  {/* Sobre */}
                  {academia.sobre && (
                    <p className="academia-sobre">
                      {truncarTexto(academia.sobre, 120)}
                    </p>
                  )}

                  {/* Detalhes */}
                  <div className="academia-details">
                    {/* Endereço */}
                    {academia.endereco_completo && (
                      <div className="academia-detail">
                        <MapPin size={14} />
                        <span>{academia.endereco_completo}</span>
                      </div>
                    )}
                    
                    {/* Telefone */}
                    {academia.telefone && (
                      <div className="academia-detail">
                        <Phone size={14} />
                        <span>{formatarTelefone(academia.telefone)}</span>
                      </div>
                    )}
                  </div>

                  {/* Modalidades como tags */}
                  {academia.modalidades && (
                    <div className="academia-modalidades-tags">
                      {separarModalidades(academia.modalidades).map((modalidade, index) => (
                        <span key={index} className="modalidade-tag">
                          {modalidade}
                        </span>
                      ))}
                      {separarModalidades(academia.modalidades).length < academia.modalidades.split(', ').length && (
                        <span className="modalidade-tag">
                          +{academia.modalidades.split(', ').length - separarModalidades(academia.modalidades).length}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Diferenciais */}
                  <div className="academia-diferenciais">
                    {academia.estacionamento && (
                      <div className="diferencial-item">
                        <Car size={12} />
                        <span>Estacionamento</span>
                      </div>
                    )}
                    {academia.avaliacao_fisica && (
                      <div className="diferencial-item">
                        <span>🏋️</span>
                        <span>Avaliação Física</span>
                      </div>
                    )}
                    {academia.ar_condicionado && (
                      <div className="diferencial-item">
                        <span>❄️</span>
                        <span>Ar Condicionado</span>
                      </div>
                    )}
                    {academia.wifi && (
                      <div className="diferencial-item">
                        <Wifi size={12} />
                        <span>Wi-Fi</span>
                      </div>
                    )}
                    {academia.vestiario && (
                      <div className="diferencial-item">
                        <span>🚿</span>
                        <span>Vestiário</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Indicador de seleção */}
                <div className="selection-indicator">
                  {dados.idAcademia === academia.idAcademia && '✓'}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Opção de não vincular */}
        <div
          className={`academia-card none-option ${!dados.idAcademia ? 'selected' : ''}`}
          onClick={() => onChange({ idAcademia: null })}
        >
          <div className="academia-info-container">
            <h4>Não vincular a nenhuma academia agora</h4>
            <p>Você poderá se vincular posteriormente</p>
          </div>
          <div className="selection-indicator">
            {!dados.idAcademia && '✓'}
          </div>
        </div>
      </div>

      <div className="academia-info-box">
        <h4>💡 Como funciona a vinculação?</h4>
        <ul>
          <li>A vinculação é <strong>opcional</strong></li>
          <li>Será enviada uma solicitação para a academia</li>
          <li>A academia precisa aprovar sua vinculação</li>
          <li>Você receberá uma notificação quando for aprovado</li>
          <li>Você pode se vincular posteriormente se preferir</li>
        </ul>
      </div>
    </div>
  );
};

export default EtapaAcademia;