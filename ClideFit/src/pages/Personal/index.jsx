import { useState } from "react";
import "./style.css";
import clientesData from "./clientes.json";
import { Pencil, Trash2, Plus } from "lucide-react"; // ícones bonitos

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

    const clienteAtualizado = {
      ...clienteSelecionado,
      treinos: [...clienteSelecionado.treinos, treinoObj],
    };

    setClienteSelecionado(clienteAtualizado);
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
            <div className="clte1">
              <h1>Treinos atribuídos</h1>

              <div className="treinosGrid">
                {clienteSelecionado.treinos.map((treino) => (
                  <div className="treinoCard" key={treino.id}>
                    <p>{treino.nome}</p>
                    <div className="acoesTreino">
                      <button
                        onClick={() => apagarTreino(treino.id)}
                        className="btnIcon delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="clte2">
              <h1>Atribuir</h1>

              <div className="treinosGridedede">
                {clienteSelecionado.treinos.map((treino) => (
                  <div className="treinoCard" key={treino.id}>
                    <p>{treino.nome}</p>
                    <div className="acoesTreino">
                      <button
                        onClick={() => apagarTreino(treino.id)}
                        className="btnIcon delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="clttet">
                <button>Criar Novo</button>
              </div>
            </div>
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
                  <img
                    className="imgpflpqn"
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
