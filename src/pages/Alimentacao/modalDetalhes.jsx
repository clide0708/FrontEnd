export default function ModalDetalhes({ item, fechar }) {
  return (
    <div className="modalalimento2 modal-stack show">
      <div className="modalalm2-content">
        <div className="addalm">
          <h4>Detalhes do Alimento</h4>
        </div>
        <div className="infnm">
          <h2>{item.nome}</h2>
          <div className="select">
            <input type="number" defaultValue={item.especificacao} /> g/ml
          </div>
        </div>
        <div className="infnt">
          <div className="header">
            <h1 className="cal">Cal</h1>
            <h1>Prot</h1>
            <h1>Carb</h1>
            <h1>Gord</h1>
          </div>
          <div className="valores">
            <h1 className="cal">{item.calorias}</h1>
            <h1>{item.proteinas}g</h1>
            <h1>{item.carboidratos}g</h1>
            <h1>{item.gorduras}g</h1>
          </div>
          <div className="btndv">
            <button className="btn2" onClick={fechar}>Salvar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
