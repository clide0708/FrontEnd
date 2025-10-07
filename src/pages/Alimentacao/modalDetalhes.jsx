import { useState, useEffect } from "react";
import alimentosService from "../../services/Alimentos/alimentosService";

export default function ModalDetalhes({ item, fechar, onUpdate, onDelete }) {
  const [alimentoDetalhes, setAlimentoDetalhes] = useState(item);
  const [loading, setLoading] = useState(false);
  const [detalhesAPI, setDetalhesAPI] = useState(null);

  useEffect(() => {
    const fetchDetalhes = async () => {
      if (item && item.idItensRef) {
        setLoading(true);
        try {
          // Busca informações atualizadas da API
          const data = await alimentosService.buscarInformacaoAlimento(item.idItensRef, item.quantidade, item.medida);
          if (data.success) {
            setDetalhesAPI(data.alimento);
            // Mescla os dados existentes com os detalhes da API
            setAlimentoDetalhes({ 
              ...item, 
              ...data.alimento.nutrientes?.reduce((acc, nutriente) => {
                if (nutriente.nome === 'calorias') acc.calorias = nutriente.quantidade;
                if (nutriente.nome === 'proteína') acc.proteinas = nutriente.quantidade;
                if (nutriente.nome === 'carboidratos') acc.carboidratos = nutriente.quantidade;
                if (nutriente.nome === 'gordura') acc.gorduras = nutriente.quantidade;
                return acc;
              }, {}) || {}
            });
          }
        } catch (error) {
          console.error("Erro ao buscar detalhes do alimento:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchDetalhes();
  }, [item]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAlimentoDetalhes((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await alimentosService.updAlimento({
        id: alimentoDetalhes.idItensRef,
        quantidade: alimentoDetalhes.especificacao || alimentoDetalhes.quantidade,
        medida: 'g'
      });
      if (onUpdate) onUpdate();
      fechar();
    } catch (error) {
      console.error("Erro ao atualizar alimento:", error);
      alert(`Erro ao atualizar alimento: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await alimentosService.rmvAlimento(alimentoDetalhes.idItensRef);
      if (onDelete) onDelete();
      fechar();
    } catch (error) {
      console.error("Erro ao remover alimento:", error);
      alert(`Erro ao remover alimento: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !alimentoDetalhes) {
    return (
      <div className="modalalimento2 modal-stack show">
        <div className="modalalm2-content">
          <p>Carregando detalhes...</p>
        </div>
      </div>
    );
  }

  if (!alimentoDetalhes) {
    return null;
  }

  return (
    <div className="modalalimento2 modal-stack show">
      <div className="modalalm2-content">
        <div className="addalm">
          <h4 className="h4modal2">Detalhes do Alimento</h4>
        </div>
        
        {/* Informações do alimento - NOVA VERSÃO */}
        <div className="infnm-grid">
          <h2 className="h2modal-grid">{alimentoDetalhes.nome}</h2>
          <div className="select-grid">
            <input
              type="number"
              name="especificacao"
              value={alimentoDetalhes.especificacao || alimentoDetalhes.quantidade}
              onChange={handleInputChange}
              disabled={loading}
            />
            <span>g/ml</span>
          </div>
        </div>

        {/* Valores nutricionais - NOVA VERSÃO COM GRID */}
        <div className="infnt-grid">
          {/* Cabeçalhos */}
          <div className="infnt-header-grid">
            <h1 className="cal">Calorias</h1>
            <h1 className="h1modal1">Proteínas</h1>
            <h1 className="h1modal1">Carboidratos</h1>
            <h1 className="h1modal1">Gorduras</h1>
          </div>

          {/* Inputs */}
          <div className="infnt-inputs-grid">
            <div className="input-group">
              <input 
                type="number" 
                name="calorias" 
                value={alimentoDetalhes.calorias || 0} 
                onChange={handleInputChange} 
                disabled={loading}
              />
              <span className="input-label">kcal</span>
            </div>
            
            <div className="input-group">
              <input 
                type="number" 
                name="proteinas" 
                value={alimentoDetalhes.proteinas || 0} 
                onChange={handleInputChange} 
                disabled={loading}
              />
              <span className="input-label">gramas</span>
            </div>
            
            <div className="input-group">
              <input 
                type="number" 
                name="carboidratos" 
                value={alimentoDetalhes.carboidratos || 0} 
                onChange={handleInputChange} 
                disabled={loading}
              />
              <span className="input-label">gramas</span>
            </div>
            
            <div className="input-group">
              <input 
                type="number" 
                name="gorduras" 
                value={alimentoDetalhes.gorduras || 0} 
                onChange={handleInputChange} 
                disabled={loading}
              />
              <span className="input-label">gramas</span>
            </div>
          </div>

          {/* Botões - NOVA VERSÃO */}
          <div className="btndv-grid">
            <button className="btn2" onClick={handleSave} disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
            <button className="btn2 btn2-remove" onClick={handleDelete} disabled={loading}>
              {loading ? 'Removendo...' : 'Remover'}
            </button>
          </div>
        </div>
        
        {/* Informações adicionais da API */}
        {detalhesAPI && detalhesAPI.nutrientes && (
          <div className="info-adicional">
            <h4>Informações Nutricionais</h4>
            <div className="nutrientes-lista">
              {detalhesAPI.nutrientes.map((nutriente, index) => (
                <div key={index} className="nutriente-item">
                  <span className="nutriente-nome">{nutriente.nome}:</span>
                  <span className="nutriente-valor">
                    {nutriente.quantidade} {nutriente.unidade}
                    {nutriente.percentual_diario && (
                      <span className="percentual"> ({nutriente.percentual_diario}%)</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}