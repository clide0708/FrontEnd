const BarraProgresso = ({ etapas, etapaAtual, tipoUsuario }) => {
  const progresso = ((etapaAtual - 1) / (etapas.length - 1)) * 100;

  return (
    <div className="barra-progresso-container">
      <div className="barra-progresso">
        <div 
          className="barra-progresso-preenchimento"
          style={{ width: `${progresso}%` }}
        ></div>
      </div>
      
      <div className="etapas-lista">
        {etapas.map((etapa) => (
          <div
            key={etapa.numero}
            className={`etapa-item ${
              etapa.numero === etapaAtual ? 'ativo' : ''
            } ${
              etapa.numero < etapaAtual ? 'concluido' : ''
            }`}
          >
            <div className="etapa-icone">
              {etapa.numero < etapaAtual ? '✓' : etapa.icone}
            </div>
            <div className="etapa-titulo">{etapa.titulo}</div>
            <div className="etapa-numero">Etapa {etapa.numero}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarraProgresso;