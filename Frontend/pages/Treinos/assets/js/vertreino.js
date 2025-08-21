function carregarExercicio(id) {
  fetch("get2.php?id=" + id)
    .then((response) => {
      if (!response.ok) throw new Error("Erro ao buscar exercício");
      return response.json();
    })
    .then((data) => {
      if (data.error) {
        alert("Erro: " + data.error);
        return;
      }
      // pega os bagui pra fazer ajax
      document.getElementById("titulo-exercicio").innerText =
        data.nome;
      document.getElementById("exercicio-id").value = data.id;
      document.getElementById("num_series").value = data.num_series;
      document.getElementById("num_repeticoes").value = data.num_repeticoes;
      document.getElementById("tempo_descanso").value =
        data.tempo_descanso ?? "";
      document.getElementById("peso").value = data.peso ?? "";
      document.getElementById("painel-edicao").style.display = "block";
      document.getElementById("info").innerText = data.informacoes ?? "";
    })
    .catch((err) => {
      alert(err.message);
    });
}

function abrirModal() {
  document.getElementById("modal").style.display = "block";
}

function fecharModal() {
  document.getElementById("modal").style.display = "none";
  document.getElementById("formAddExercicio").reset();
}

document
  .getElementById("formAddExercicio")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    fetch("post2.php", {
      method: "POST",
      body: new FormData(this),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          window.location.reload();
        } else if (data.error) {
          alert("Erro: " + data.error);
        } else {
          alert("Resposta inesperada do servidor");
        }
      })
      .catch((err) => {
        alert("Erro ao adicionar exercício: " + err.message);
      });
  });

// isso daqui vai filtrar para os exercícios só aparecerem conforme o maluco botar o músculo, e vai pegar do json

const muscleSelect = document.getElementById("muscle-select");
const exerciseSelect = document.getElementById("exercise-select");

muscleSelect.addEventListener("change", () => {
  const muscle = muscleSelect.value.trim();
  exerciseSelect.innerHTML = "";

  if (!muscle) {
    exerciseSelect.innerHTML =
      '<option value="">Selecione um músculo primeiro</option>';
    exerciseSelect.disabled = true;
    return;
  }

  exerciseSelect.disabled = false;
  exerciseSelect.innerHTML = "<option>Carregando...</option>";

  fetch("fetch_exercises.php?grupo=" + encodeURIComponent(muscle))
    .then((res) => {
      if (!res.ok) throw new Error("Erro na resposta do servidor");
      return res.json();
    })
    .then((data) => {
      exerciseSelect.innerHTML = "";
      if (!Array.isArray(data) || data.length === 0) {
        exerciseSelect.innerHTML =
          "<option>Nenhum exercício encontrado</option>";
        return;
      }

      exerciseSelect.innerHTML =
        '<option value="">-- Selecione o Exercício --</option>';
      data.forEach((ex) => {
        const opt = document.createElement("option");
        opt.value = ex.nome;
        opt.textContent = ex.nome;
        exerciseSelect.appendChild(opt);
      });
    })
    .catch(() => {
      exerciseSelect.innerHTML = "<option>Erro ao carregar exercícios</option>";
    });
});
