// components/CadastroMultiEtapas/EtapaAcademia.jsx
import { useState, useEffect } from "react";
import { Building, Search, MapPin } from "lucide-react";

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
    academia.endereco?.toLowerCase().includes(filtro.toLowerCase())
  );

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
            placeholder="Buscar academia por nome ou endereço..."
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
              <p>Nenhuma academia encontrada</p>
            </div>
          ) : (
            academiasFiltradas.map(academia => (
              <div
                key={academia.idAcademia}
                className={`academia-card ${dados.idAcademia === academia.idAcademia ? 'selected' : ''}`}
                onClick={() => onChange({ idAcademia: academia.idAcademia })}
              >
                <div className="academia-info">
                  <h4>{academia.nome}</h4>
                  {academia.endereco && (
                    <p className="academia-address">
                      <MapPin size={14} />
                      {academia.endereco}
                    </p>
                  )}
                  {academia.telefone && (
                    <p className="academia-phone">📞 {academia.telefone}</p>
                  )}
                </div>
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
          <div className="academia-info">
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