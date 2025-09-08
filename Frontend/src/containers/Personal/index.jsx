import { useState } from "react";
import "./style.css";
import clientesData from "./clientes.json";

function Personal() {
  const [clientes, setClientes] = useState(clientesData);
  const [clienteSelecionado, setClienteSelecionado] = useState(clientes[0]);
  const [novoTreino, setNovoTreino] = useState("");

  function adicionarTreino(e) {
    e.preventDefault();
    if (!novoTreino) return;

    const novoId =
      clienteSelecionado.treinos.length > 0
        ? Math.max(...clienteSelecionado.treinos.map((t) => t.id)) + 1
        : 1;

    const treinoObj = { id: novoId, nome: novoTreino };

    // atualiza o cliente selecionado
    const clienteAtualizado = {
      ...clienteSelecionado,
      treinos: [...clienteSelecionado.treinos, treinoObj],
    };

    setClienteSelecionado(clienteAtualizado);

    // atualiza a lista de clientes
    setClientes(
      clientes.map((c) =>
        c.id === clienteSelecionado.id ? clienteAtualizado : c
      )
    );

    setNovoTreino("");
  }

  function apagarTreino(treinoId) {
    const treinosAtualizados = clienteSelecionado.treinos.filter(
      (t) => t.id !== treinoId
    );
    const clienteAtualizado = {
      ...clienteSelecionado,
      treinos: treinosAtualizados,
    };
    setClienteSelecionado(clienteAtualizado);
    setClientes(
      clientes.map((c) =>
        c.id === clienteSelecionado.id ? clienteAtualizado : c
      )
    );
  }

  function editarTreino(treinoId) {
    const novoNome = prompt("Digite o novo nome do treino:");
    if (!novoNome) return;

    const treinosAtualizados = clienteSelecionado.treinos.map((t) =>
      t.id === treinoId ? { ...t, nome: novoNome } : t
    );

    const clienteAtualizado = {
      ...clienteSelecionado,
      treinos: treinosAtualizados,
    };

    setClienteSelecionado(clienteAtualizado);
    setClientes(
      clientes.map((c) =>
        c.id === clienteSelecionado.id ? clienteAtualizado : c
      )
    );
  }

  return (
    <div className="Personal">
      <div className="containerPS">
        <div className="SC1">
          <h4 className="Titulo">{clienteSelecionado.nome}</h4>
          <div className="lnCliente">
            <div className="ftCliente">
              <img
                src={clienteSelecionado.img || "/default-profile.png"}
                alt="Perfil"
              />
            </div>
            <div className="infCliente">
              <p>
                <strong className="Clientestrong">Idade:</strong>{" "}
                {clienteSelecionado.idade}
              </p>
              <p>
                <strong className="Clientestrong">Email:</strong>{" "}
                {clienteSelecionado.email}
              </p>
              <p>
                <strong className="Clientestrong">Telefone:</strong>{" "}
                {clienteSelecionado.telefone}
              </p>
            </div>
          </div>

          <div className="ClienteEX">
            <h1>Treinos atribuídos</h1>

            <form onSubmit={adicionarTreino} style={{ marginBottom: "10px" }}>
              <input
                type="text"
                placeholder="Novo treino"
                value={novoTreino}
                onChange={(e) => setNovoTreino(e.target.value)}
              />
              <button type="submit">Adicionar</button>
            </form>

            <ul>
              {clienteSelecionado.treinos.map((treino) => (
                <li key={treino.id} style={{ marginBottom: "5px" }}>
                  {treino.nome}{" "}
                  <button onClick={() => editarTreino(treino.id)}>
                    Editar
                  </button>{" "}
                  <button onClick={() => apagarTreino(treino.id)}>
                    Apagar
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="SC2">
          <div className="SC2p1">
            <h4 style={{ textAlign: "center" }}>Seu link de convite</h4>
              <h1>{`📄 https://clidefit.com/invite/${clienteSelecionado.id}`}</h1>
          </div>

          <div className="SC2p2">
            <h4 style={{ textAlign: "center" }}>Alunos</h4>
            <ul>
              {clientes.map((cliente) => (
                <li
                  key={cliente.id}
                  onClick={() => setClienteSelecionado(cliente)}
                  className={
                    clienteSelecionado.id === cliente.id ? "selecionado" : ""
                  }
                >
                  <img className="imgpflpqn"
                    src={cliente.img || "/default-profile.png"}
                    alt="Perfil"
                  />
                  {cliente.nome}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Personal;
