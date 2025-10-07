// utils/calculos.js

// Cálculo de IMC com diferenciação por gênero
export const calcularIMC = (peso, altura, genero) => {
  if (!peso || !altura) return "";
  
  const imc = peso / ((altura / 100) ** 2);
  
  // Classificação do IMC diferenciada por gênero
  if (genero?.toLowerCase() === "masculino") {
    // Classificação para homens
    if (imc < 20) return `${imc.toFixed(1)} (Abaixo do peso)`;
    else if (imc < 25) return `${imc.toFixed(1)} (Peso normal)`;
    else if (imc < 30) return `${imc.toFixed(1)} (Sobrepeso)`;
    else if (imc < 35) return `${imc.toFixed(1)} (Obesidade Grau I)`;
    else if (imc < 40) return `${imc.toFixed(1)} (Obesidade Grau II)`;
    else return `${imc.toFixed(1)} (Obesidade Grau III)`;
  } else {
    // Classificação para mulheres
    if (imc < 19) return `${imc.toFixed(1)} (Abaixo do peso)`;
    else if (imc < 24) return `${imc.toFixed(1)} (Peso normal)`;
    else if (imc < 29) return `${imc.toFixed(1)} (Sobrepeso)`;
    else if (imc < 34) return `${imc.toFixed(1)} (Obesidade Grau I)`;
    else if (imc < 39) return `${imc.toFixed(1)} (Obesidade Grau II)`;
    else return `${imc.toFixed(1)} (Obesidade Grau III)`;
  }
};

// Função auxiliar para determinar o nível de atividade
export const getFatorAtividade = (treino) => {
  if (!treino) return 1.2;
  
  const treinoLower = treino.toLowerCase();
  
  if (treinoLower.includes('sedentário') || treinoLower.includes('sedentario')) return 1.2;
  if (treinoLower.includes('leve')) return 1.375;
  if (treinoLower.includes('moderado')) return 1.55;
  if (treinoLower.includes('intenso')) return 1.725;
  if (treinoLower.includes('extremo')) return 1.9;
  
  return 1.2; // padrão sedentário
};

// Cálculo da Taxa Metabólica Basal (TMB) - Fórmula de Harris-Benedict revisada
export const calcularTMB = (peso, altura, idade, genero) => {
  if (!peso || !altura || !idade) return 0;
  
  if (genero?.toLowerCase() === "masculino") {
    // Fórmula para homens: 88.362 + (13.397 × peso em kg) + (4.799 × altura em cm) - (5.677 × idade em anos)
    return 88.362 + (13.397 * peso) + (4.799 * altura) - (5.677 * idade);
  } else {
    // Fórmula para mulheres: 447.593 + (9.247 × peso em kg) + (3.098 × altura em cm) - (4.330 × idade em anos)
    return 447.593 + (9.247 * peso) + (3.098 * altura) - (4.330 * idade);
  }
};

// Cálculo da Ingestão Diária Recomendada (IDR) - Calorias totais para manutenção
export const calcularIDR = (peso, altura, idade, genero, treino) => {
  if (!peso || !altura || !idade) return "";
  
  const tmb = calcularTMB(peso, altura, idade, genero);
  const fator = getFatorAtividade(treino);
  const idr = Math.round(tmb * fator);
  
  return idr + " kcal";
};

// Cálculo da meta calórica baseada no objetivo
export const calcularMetaCalorica = (peso, altura, idade, genero, treino, objetivo) => {
  if (!peso || !altura || !idade || !genero) return 0;
  
  const tmb = calcularTMB(peso, altura, idade, genero);
  const fator = getFatorAtividade(treino);
  const caloriasManutencao = Math.round(tmb * fator);
  
  // Ajuste baseado no objetivo
  const objetivoLower = objetivo?.toLowerCase() || "";
  
  if (objetivoLower.includes("perder") || objetivoLower.includes("emagrecimento")) {
    // Déficit calórico de 500 kcal para perder ~0.5kg por semana
    return Math.max(caloriasManutencao - 500, 1200);
  } else if (objetivoLower.includes("ganhar") || objetivoLower.includes("massa")) {
    // Superávit calórico de 500 kcal para ganhar ~0.5kg por semana
    return caloriasManutencao + 500;
  } else {
    // Manter peso
    return caloriasManutencao;
  }
};

// Cálculo de calorias restantes
export const calcularCaloriasRestantes = (caloriasConsumidas, peso, altura, idade, genero, treino, objetivo) => {
  const metaCalorica = calcularMetaCalorica(peso, altura, idade, genero, treino, objetivo);
  return Math.max(metaCalorica - caloriasConsumidas, 0);
};

// Cálculo de consumo ideal de água
export const consumoAgua = (peso, treino) => {
  if (!peso) return "";
  
  let baseAgua = peso * 0.035; // Base: 35ml por kg
  
  // Ajuste baseado no nível de atividade
  const fatorTreino = getFatorAtividade(treino);
  if (fatorTreino >= 1.55) { // Moderado ou mais
    baseAgua *= 1.2; // 20% a mais para atividades intensas
  }
  
  return baseAgua.toFixed(1) + " L/dia";
};

// Cálculo de peso ideal (método de Hamwi)
export const pesoIdeal = (altura, genero) => {
  if (!altura) return "";
  
  let pesoIdealCalculado;
  
  if (genero?.toLowerCase() === "masculino") {
    // Homens: 48 kg + 2.7 kg para cada 2.54 cm acima de 152.4 cm
    pesoIdealCalculado = 48 + 2.7 * ((altura - 152.4) / 2.54);
  } else {
    // Mulheres: 45.5 kg + 2.2 kg para cada 2.54 cm acima de 152.4 cm  
    pesoIdealCalculado = 45.5 + 2.2 * ((altura - 152.4) / 2.54);
  }
  
  return pesoIdealCalculado > 0 ? pesoIdealCalculado.toFixed(1) + " kg" : "";
};

// Cálculo de gordura corporal estimada (fórmula simplificada)
export const gorduraCorporalEstimada = (peso, altura, idade, genero) => {
  if (!peso || !altura || !idade) return "";
  
  const imc = peso / ((altura / 100) ** 2);
  let gorduraCorporal;
  
  if (genero?.toLowerCase() === "masculino") {
    gorduraCorporal = (1.20 * imc) + (0.23 * idade) - 16.2;
  } else {
    gorduraCorporal = (1.20 * imc) + (0.23 * idade) - 5.4;
  }
  
  return gorduraCorporal > 0 ? gorduraCorporal.toFixed(1) + "%" : "";
};