export default function ModalAdd({ fechar }) {
  return (
    <div className="modalalimento show">
      <div className="modalalm-content">
        <div className="addalm">
          <h4>Adicionar alimentos</h4>
        </div>
        <div className="psqsalm">
          <input className="inmputmodal" placeholder="Pesquisar alimento..." />
          <div className="sugestoes"></div>
        </div>
        <div className="IAinput">
          <input type="file" />
          <label className="imgialabel">Upload IMG</label>
        </div>
        <div className="almadd">
          <div className="existing-items">
            <div className="tbladdmdl"></div>
          </div>
          <div className="addalmbtn">
            <button className="mdlcl" onClick={fechar}>Confirmar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
