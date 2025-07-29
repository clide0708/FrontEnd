let nome, idade, peso, altura, genero, treino, meta, pflimg;

fetch("assets/js/user.json")
  .then((response) => response.json())
  .then((data) => {
    nome = data.nome;
    idade = data.idade;
    peso = data.peso;
    altura = data.altura;
    meta = data.meta;
    pflimg = data.img;

    genero =
      data.genero.charAt(0).toUpperCase() + data.genero.slice(1).toLowerCase();

    treino =
      data.treino.charAt(0).toUpperCase() + data.treino.slice(1).toLowerCase();

    if (treino === "Sedentario") {
      treino = "Sedentário";
    }
    document.getElementById("pflimg").src = pflimg;
    document.getElementById("nomevc").innerText = nome;
    document.getElementById("peso").innerText = peso;
    document.getElementById("altura").innerText = altura;
    document.getElementById("genero").innerText = genero;
    document.getElementById("treino").innerText = treino;
    document.getElementById("metacal").innerText = meta + " Kcal";

    IMC();
    IDR();
    Agua();
    MetasCalc();
  })
  .catch((error) => console.error("Erro ao carregar os dados:", error));

// Função para calcular o IMC
function IMC() {
  let IMC = peso / ((altura / 100) * (altura / 100));
  let textoResultado;

  if (genero === "Masculino") {
    if (IMC < 20) {
      textoResultado = "Abaixo do peso";
    } else if (IMC < 25) {
      textoResultado = "Normal";
    } else if (IMC < 30) {
      textoResultado = "Sobrepeso";
    } else if (IMC < 35) {
      textoResultado = "Obesidade grau I";
    } else if (IMC < 40) {
      textoResultado = "Obesidade grau II";
    } else {
      textoResultado = "Obesidade grau III";
    }
  } else {
    if (IMC < 19) {
      textoResultado = "Abaixo do peso";
    } else if (IMC < 24) {
      textoResultado = "Normal";
    } else if (IMC < 29) {
      textoResultado = "Sobrepeso";
    } else if (IMC < 34) {
      textoResultado = "Obesidade grau I";
    } else if (IMC < 39) {
      textoResultado = "Obesidade grau II";
    } else {
      textoResultado = "Obesidade grau III";
    }
  }

  document.getElementById("resultIMC").innerText = textoResultado;
}

//IDR
function IDR() {
  let TMB, fator, IDR;
  if (genero === "Masculino") {
    TMB = 10 * peso + 6.25 * altura - 5 * idade + 5;
  } else {
    TMB = 10 * peso + 6.25 * altura - 5 * idade - 161;
  }

  if (treino === "Sedentário") {
    fator = 1.2;
  } else if (treino === "Leve") {
    fator = 1.375;
  } else if (treino === "Moderado") {
    fator = 1.55;
  } else if (treino === "Intenso") {
    fator = 1.725;
  } else {
    fator = 1.9;
  }

  IDR = TMB * fator;
  document.getElementById("resultIDR").innerText = IDR.toFixed(0) + " Kcal";
}

//Consumo de agua

function Agua() {
  let Consumo = peso * 0.037;
  document.getElementById("resultAgua").innerText =
    Consumo.toFixed(1) + " L/dia";
}

//Metas

function MetasCalc() {
  let caltotal = parseInt(document.getElementById("caltotal").innerText, 10);
  let calres = meta - caltotal;
  if (calres < 0) {
    calres = 0;
  }
  document.getElementById("calres").innerText = calres;
}
