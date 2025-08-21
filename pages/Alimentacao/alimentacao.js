//só a data msm

const hoje = new Date();
const dia = String(hoje.getDate()).padStart(2, "0");
const mes = String(hoje.getMonth() + 1).padStart(2, "0");
const data1 = `${dia}/${mes}`;
document.getElementById("data").innerText = data1;

//modal de adicionar

const cards = document.querySelectorAll(".ref");
const btnOpen = document.querySelectorAll(".add-btn");
const modalOverlay = document.getElementById("modalalimento");
const btnCloseModal = document.getElementById("btn-close-modal");
const btnConfirmModal = document.getElementById("btn-confirm-modal");
const buscaModal = document.getElementById("busca-modal");
const sugestoesModal = document.getElementById("sugestoes-modal");
const modalTitle = document.getElementById("modal-title");
const tblAddMdl = document.getElementById("tbladdmdl");
const existingItemsList = document.getElementById("existing-items-list");

let currentMealList = "";
let isModified = false;

const nomesRefeicoes = {
  cafe: "Café da manhã",
  almoco: "Almoço",
  janta: "Janta",
  outros: "Outros",
};

// abrir as refeições
cards.forEach((card) => {
  const conteudo = card.querySelector(".contalm");

  card.addEventListener("click", () => {
    const isAtiva = card.classList.contains("ativa");

    if (isAtiva) {
      card.classList.remove("ativa");
      conteudo.classList.add("oculto");

      cards.forEach((c) => {
        c.classList.remove("oculto");
        c.style.display = "block";
      });
    } else {
      cards.forEach((c) => {
        if (c !== card) {
          c.classList.add("oculto");
          setTimeout(() => {
            c.style.display = "none";
          });
        }
      });

      card.classList.remove("oculto");
      card.style.display = "block";
      card.style.animation = "abrirCard 0.3s ease forwards";

      setTimeout(() => {
        card.classList.add("ativa");
        conteudo.classList.remove("oculto");
        card.style.animation = "";
      });
    }
  });
});

// modal add alimentos
btnOpen.forEach((button) => {
  button.addEventListener("click", (e) => {
    e.stopPropagation();
    const lista = button.dataset.lista;
    currentMealList = lista;
    modalTitle.textContent = `${nomesRefeicoes[lista]}`;
    modalOverlay.classList.add("show");
    buscaModal.value = "";
    sugestoesModal.innerHTML = "";
    sugestoesModal.style.display = "none";
    existingItemsList.style.display = "block"; // SEMPRE mostra
    carregarAlimentos(lista);
  });
});

// modal de add
function carregarAlimentos(lista) {
  fetch(`get.php?lista=${lista}`)
    .then((response) => response.json())
    .then((data) => {
      tblAddMdl.innerHTML = "";

      if (data.error) {
        tblAddMdl.innerHTML = `<div class="error">${data.error}</div>`;
        return;
      }

      if (data.length === 0) {
        tblAddMdl.innerHTML =
          '<div class="no-items">Nenhum alimento adicionado ainda</div>';
        return;
      }

      data.forEach((item) => {
        const div = document.createElement("div");
        div.className = "itemadd";
        div.innerHTML = `
                    <div class="nm">
                        <h1>${item.nome}</h1>
                        <h2>${item.calorias || 0} cal</h2>
                    </div>
                    <div class="gm">
                        <h1>${item.especificacao || 0} g/ml</h1>
                    </div>
                `;

        div.addEventListener("click", (e) => {
          e.stopPropagation();
          abrirModalDetalhes(lista, item.id);
        });

        tblAddMdl.appendChild(div);
      });
    })
    .catch((error) => {
      console.error("Erro:", error);
      tblAddMdl.innerHTML =
        '<div class="error">Erro ao carregar alimentos</div>';
    });
}

// fechar modal add
if (btnCloseModal) {
  btnCloseModal.addEventListener("click", () => {
    modalOverlay.classList.remove("show");
  });
}

modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) {
    modalOverlay.classList.remove("show");
  }
});

// evitar cliques aleatórios
sugestoesModal.addEventListener("mousedown", (e) => {
  e.preventDefault();
});

// API para adicionar os ingrediente (tem que traduzir isso daqui ou trocar por outra API)
async function buscarIngredientes(termo) {
  if (termo.length < 2) {
    sugestoesModal.innerHTML = "";
    sugestoesModal.style.display = "none";
    existingItemsList.style.display = "block";
    return;
  }

  const apiKey = "617d584fd753442483088b758ccd52fd";
  const url = `https://api.spoonacular.com/food/ingredients/search?query=${encodeURIComponent(
    termo
  )}&number=10&apiKey=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    sugestoesModal.innerHTML = "";

    if (data.results && data.results.length > 0) {
      sugestoesModal.style.display = "block";
      existingItemsList.style.display = "block";

      data.results.forEach((item) => {
        const div = document.createElement("div");
        div.textContent = item.name;
        div.classList.add("sugestao-item");
        div.addEventListener("click", async (e) => {
          // Evita múltiplos cliques
          if (div.classList.contains("loading")) return;

          div.classList.add("loading");
          document.body.style.cursor = "wait";

          // Desativa cliques em outras sugestões também
          const allItems = sugestoesModal.querySelectorAll(".sugestao-item");
          allItems.forEach((el) => (el.style.pointerEvents = "none"));

          try {
            const response = await fetch("post.php", {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                lista: currentMealList,
                nome: item.name,
                especificacao: 100,
              }),
            });

            if (!response.ok) throw new Error("Erro ao adicionar alimento.");

            const result = await response.json();

            if (result.success && result.id) {
              abrirModalDetalhes(currentMealList, result.id);
            } else {
              alert("Erro ao adicionar alimento.");
            }
          } catch (error) {
            console.error("Erro ao adicionar alimento:", error);
            alert("Erro ao adicionar alimento.");
          } finally {
            div.classList.remove("loading");
            document.body.style.cursor = "default";
            allItems.forEach((el) => (el.style.pointerEvents = "auto"));
          }
        });

        sugestoesModal.appendChild(div);
      });
    } else {
      sugestoesModal.innerHTML =
        '<div class="sem-sugestoes">Nenhuma sugestão encontrada.</div>';
      sugestoesModal.style.display = "none";
      existingItemsList.style.display = "block"; // SEMPRE mostra
    }
  } catch (error) {
    console.error("Erro na API:", error);
    sugestoesModal.innerHTML = "";
    sugestoesModal.style.display = "none";
    existingItemsList.style.display = "block"; // SEMPRE mostra
  }
}

buscaModal.addEventListener("input", (event) => {
  buscarIngredientes(event.target.value);
});

btnConfirmModal.addEventListener("click", () => {
  modalOverlay.classList.remove("show");
});

// Esconde sugestões ao clicar fora do campo de busca e da lista
document.addEventListener("click", function (event) {
  const isClickInsideInput = buscaModal.contains(event.target);
  const isClickInsideSugestoes = sugestoesModal.contains(event.target);

  if (!isClickInsideInput && !isClickInsideSugestoes) {
    sugestoesModal.style.display = "none";
  }
});

// Mostra sugestões de novo se clicar no input e houver texto
buscaModal.addEventListener("focus", () => {
  const termo = buscaModal.value.trim();
  if (termo.length >= 2 && sugestoesModal.innerHTML.trim() !== "") {
    sugestoesModal.style.display = "block";
  }
});

// modal dos detalhes
const modalDetalhes = document.getElementById("modalalimento2");
const modalNome = document.getElementById("modalNome");
const modalGramas = document.getElementById("modalGramas");
const modalCal = document.getElementById("modalCal");
const modalProt = document.getElementById("modalProt");
const modalCarb = document.getElementById("modalCarb");
const modalGord = document.getElementById("modalGord");
const inputListaRemover = document.getElementById("modalListaRemover");
const inputIndexRemover = document.getElementById("modalIndexRemover");

let currentLista = "";
let currentItemId = "";
let originalNutrients = {};
let hasChanges = false;

async function abrirModalDetalhes(lista, index) {
  try {
    // get
    const response = await fetch(`get.php?lista=${lista}`);
    const data = await response.json();

    if (data.error) {
      alert(data.error);
      return;
    }

    const item = data.find((i) => i.id == index);

    if (!item) {
      alert("Alimento não encontrado.");
      return;
    }

    currentLista = lista;
    currentItemId = index;
    hasChanges = false;

    modalNome.textContent = item.nome;
    modalGramas.value = item.especificacao;

    originalNutrients = {
      calorias: item.calorias !== null ? item.calorias : 0,
      proteinas: item.proteinas !== null ? item.proteinas : 0,
      carboidratos: item.carboidratos !== null ? item.carboidratos : 0,
      gorduras: item.gorduras !== null ? item.gorduras : 0,
      especificacao: item.especificacao !== null ? item.especificacao : 0,
    };

    atualizarNutrientesModal(item.especificacao);

    inputListaRemover.value = lista;
    inputIndexRemover.value = index;

    modalDetalhes.style.display = "flex";
    modalDetalhes.classList.add("show");
  } catch (e) {
    console.error("Erro ao carregar detalhes do alimento:", e);
    alert("Erro ao carregar detalhes do alimento.");
  }
}

function atualizarNutrientesModal(qtd) {
  const quantidadeBase =
    originalNutrients.especificacao > 0 ? originalNutrients.especificacao : 100;
  const fator = qtd / quantidadeBase;

  modalCal.textContent = (originalNutrients.calorias * fator).toFixed(1);
  modalProt.textContent =
    (originalNutrients.proteinas * fator).toFixed(1) + "g";
  modalCarb.textContent =
    (originalNutrients.carboidratos * fator).toFixed(1) + "g";
  modalGord.textContent = (originalNutrients.gorduras * fator).toFixed(1) + "g";

  hasChanges = true;
}

modalGramas.addEventListener("input", (event) => {
  const value = parseFloat(event.target.value);
  if (!isNaN(value) && value > 0) {
    atualizarNutrientesModal(value);
  }
});

document
  .getElementById("modalFormRemover")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    if (confirm("Tem certeza que deseja remover este alimento?")) {
      fetch("delete.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(new FormData(this)),
      })
        .then((response) => {
          if (response.ok) {
            alert("Alimento removido com sucesso!");
            location.reload(); // recarrega as paginas, tem q fazer ajax nesse carai
          } else {
            alert("Erro ao remover alimento.");
          }
        })
        .catch((error) => {
          console.error("Erro:", error);
          alert("Erro ao remover alimento.");
        });
    }
  });

function salvarAlteracoesAntesDeFechar() { // o nome é meio auto explicativo
  if (hasChanges) {
    const formData = new FormData();
    formData.append("lista", currentLista);
    formData.append("index", currentItemId);
    formData.append("especificacao", modalGramas.value);

    fetch("update.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(formData),
    })
      .then((response) => {
        if (response.ok) {
          location.reload();
        } else {
          console.error("Erro ao atualizar alimento");
        }
      })
      .catch((error) => {
        console.error("Erro:", error);
      });
  }
}

function fecharModalDetalhes() {
  if (hasChanges) {
    const formData = new FormData();
    formData.append("lista", currentLista);
    formData.append("index", currentItemId);
    formData.append("especificacao", modalGramas.value);

    fetch("update.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(formData),
    })
      .then((response) => {
        if (response.ok) {
          location.reload();
          // alert("Item atualizado com sucesso!");

    
          atualizarDadosRefeicao(currentLista);
        } else {
          alert("Erro ao atualizar item.");
          console.error("Erro ao atualizar alimento");
        }
      })
      .catch((error) => {
        console.error("Erro:", error);
      });
  }
  modalDetalhes.classList.remove("show");
}
