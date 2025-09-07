export const calcularIMC = (peso, altura, genero) => {
  if (!peso || !altura) return "";
  const imc = peso / ((altura / 100) ** 2);
  if (genero === "Masculino") {
    if (imc < 20) return "Abaixo do peso";
    else if (imc < 25) return "Normal";
    else if (imc < 30) return "Sobrepeso";
    else if (imc < 35) return "Obesidade grau I";
    else if (imc < 40) return "Obesidade grau II";
    else return "Obesidade grau III";
  } else {
    if (imc < 19) return "Abaixo do peso";
    else if (imc < 24) return "Normal";
    else if (imc < 29) return "Sobrepeso";
    else if (imc < 34) return "Obesidade grau I";
    else if (imc < 39) return "Obesidade grau II";
    else return "Obesidade grau III";
  }
};

export const calcularIDR = (peso, altura, idade, genero, treino) => {
  if (!peso || !altura || !idade) return "";
  let TMB = genero === "Masculino"
    ? 10 * peso + 6.25 * altura - 5 * idade + 5
    : 10 * peso + 6.25 * altura - 5 * idade - 161;

  let fator = 1.2;
  switch (treino) {
    case "Leve": fator = 1.375; break;
    case "Moderado": fator = 1.55; break;
    case "Intenso": fator = 1.725; break;
    case "Extremo": fator = 1.9; break;
  }

  return Math.round(TMB * fator) + " Kcal";
};

export const consumoAgua = (peso) => {
  if (!peso) return "";
  return (peso * 0.037).toFixed(1) + " L/dia";
};
