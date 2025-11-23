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

  // 🔥 CORREÇÃO SIMPLIFICADA: Função para construir URL correta
  const construirUrlFoto = (fotoUrl) => {
    if (!fotoUrl) return null;
    
    // Extrai apenas o nome do arquivo
    const nomeArquivo = fotoUrl.split('/').pop();
    
    // URL absoluta direta
    const urlAbsoluta = `http://localhost/BackEnd/assets/images/uploads/${nomeArquivo}`;
    
    console.log('🎯 URL Absoluta:', urlAbsoluta);
    return urlAbsoluta;
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
    return modalidadesString.split(', ').slice(0, 4);
  };

  useEffect(() => {
    if (academias.length > 0) {
      academias.forEach(academia => {
        if (academia.foto_url) {
          const url = construirUrlFoto(academia.foto_url);
          console.log('🔍 TESTE DIRETO DA URL:', url);
          
          // Cria uma imagem temporária para testar
          const testImage = new Image();
          testImage.onload = function() {
            console.log('🎉 IMAGEM CARREGADA COM SUCESSO VIA JavaScript!');
            console.log('Largura:', this.width, 'Altura:', this.height);
          };
          testImage.onerror = function() {
            console.error('💥 FALHA NO CARREGAMENTO VIA JavaScript');
          };
          testImage.src = url;
        }
      });
    }
  }, [academias]);

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
            academiasFiltradas.map(academia => {
              const temFoto = !!academia.foto_url;
              const urlFoto = construirUrlFoto(academia.foto_url);

              console.log(`🎯 Renderizando: ${academia.nome}`, {
                temFoto,
                urlFoto
              });

              return (
                <div
                  key={academia.idAcademia}
                  className={`academia-card ${dados.idAcademia === academia.idAcademia ? 'selected' : ''}`}
                  onClick={() => onChange({ idAcademia: academia.idAcademia })}
                >
                  {/* 🔥 CORREÇÃO: Foto da academia com URL corrigida */}
                  <div className="academia-foto">
                    {temFoto ? (
                      <>
                        <img 
                          src={urlFoto} 
                          alt={academia.nome}
                          className="academia-foto-img"
                          onError={(e) => {
                            console.error(`❌ Erro ao carregar: ${urlFoto}`);
                            e.target.style.display = 'none';
                          }}
                          onLoad={(e) => {
                            console.log(`✅ Carregou: ${urlFoto}`);
                            e.target.style.display = 'block';
                          }}
                        />
                        {/* Placeholder de fallback */}
                        <div className="foto-placeholder fallback">
                          <Building size={32} />
                        </div>
                      </>
                    ) : (
                      <div className="foto-placeholder">
                        <Building size={32} />
                      </div>
                    )}
                  </div>

                  {/* Container principal das informações */}
                   <div className="academia-info-container">
                    <div className="academia-header">
                      <div className="academia-title-section">
                        <h4>{academia.nome}</h4>
                      </div>
                    </div>

                    {academia.sobre && (
                      <p className="academia-sobre">
                        {academia.sobre.length > 120 ? `${academia.sobre.substring(0, 120)}...` : academia.sobre}
                      </p>
                    )}

                    <div className="academia-details">
                      {academia.endereco_completo && (
                        <div className="academia-detail">
                          <MapPin size={14} />
                          <span>{academia.endereco_completo}</span>
                        </div>
                      )}
                      
                      {academia.telefone && (
                        <div className="academia-detail">
                          <Phone size={14} />
                          <span>{academia.telefone}</span>
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

                  <div className="selection-indicator">
                    {dados.idAcademia === academia.idAcademia && '✓'}
                  </div>
                </div>
              );
            })
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