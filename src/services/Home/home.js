import { get } from "../api";

const homeService = {
  getPerfil: async () => {
    try {
      // Chama a API de frases em português
      const response = await get(
        "https://cors-anywhere.herokuapp.com/https://allugofrases.herokuapp.com/frases/random"
      );

      // Se a API retornar um array, pega o primeiro item
      const data = Array.isArray(response.data)
        ? response.data[0]
        : response.data;

      // Retorna o conteúdo e o significado
      return {
        content: data.content || "Mantenha-se firme e continue tentando!",
        meaning: data.meaning || "ClideFit",
      };
    } catch (err) {
      console.error(
        "Erro ao buscar frase motivacional:",
        err.response?.data || err.message
      );
      // Retorna uma frase padrão caso a API falhe
      return {
        content: "Mantenha-se firme e continue tentando!",
        meaning: "ClideFit",
      };
    }
  },
};

export default homeService;
