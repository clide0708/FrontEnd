// src/pages/Alimentacao/TesteRotasAlimentacao.jsx
import { useState } from 'react';
import { 
  criarRefeicao, 
  listarRefeicoes, 
  buscarAlimentos,
  buscarInformacaoAlimento
} from "../../services/Alimentos/alimentos";

export default function TesteRotasAlimentacao() {
  const [resultado, setResultado] = useState(null);
  const [carregando, setCarregando] = useState(false);

  const testarTodasRotas = async () => {
    setCarregando(true);
    try {
      const resultados = {};
      
      console.log("=== INICIANDO TESTE DETALHADO ===");
      
      // Testa listar refeições primeiro
      try {
        console.log("1. Testando listar refeições...");
        resultados.listarRefeicoes = await listarRefeicoes();
        console.log("✅ Listar refeições:", resultados.listarRefeicoes);
      } catch (error) {
        resultados.listarRefeicoes = { 
          error: error.message, 
          status: error.response?.status,
          data: error.response?.data
        };
        console.error("❌ Erro listar refeições:", error);
      }
      
      // Testa criar refeição com nome único
      try {
        console.log("2. Testando criar refeição...");
        const nomeUnico = `teste-${Date.now()}`;
        resultados.criarRefeicao = await criarRefeicao(nomeUnico);
        console.log("✅ Criar refeição:", resultados.criarRefeicao);
      } catch (error) {
        resultados.criarRefeicao = { 
          error: error.message, 
          status: error.response?.status,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            data: error.config?.data
          }
        };
        console.error("❌ Erro criar refeição:", error);
      }
      
      // Testa buscar alimentos com diferentes termos
      try {
        console.log("3. Testando buscar alimentos...");
        const termosTeste = ['arroz', 'ovo', 'banana', 'frango'];
        
        for (const termo of termosTeste) {
          console.log(`   Buscando: ${termo}`);
          resultados[`buscar_${termo}`] = await buscarAlimentos(termo);
        }
        console.log("✅ Buscar alimentos completo");
      } catch (error) {
        resultados.buscarAlimentos = { 
          error: error.message, 
          status: error.response?.status,
          data: error.response?.data
        };
        console.error("❌ Erro buscar alimentos:", error);
      }
      
      // Testa informação de alimento com ID conhecido
      try {
        console.log("4. Testando informação do alimento...");
        // Use um ID conhecido da Spoonacular (ex: 9003 - maçã)
        resultados.informacaoAlimento = await buscarInformacaoAlimento(9003, 100, 'g');
        console.log("✅ Informação alimento:", resultados.informacaoAlimento);
      } catch (error) {
        resultados.informacaoAlimento = { 
          error: error.message, 
          status: error.response?.status,
          data: error.response?.data
        };
        console.error("❌ Erro informação alimento:", error);
      }
      
      setResultado(resultados);
      console.log("=== TESTE COMPLETO ===", resultados);
      
    } catch (error) {
      setResultado({ error: error.message });
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      background: '#000000ff', 
      margin: '10px', 
      border: '2px solid #368dd9',
      borderRadius: '10px'
    }}>
      <h3 style={{ color: '#368dd9', marginBottom: '15px' }}>🧪 Teste de Rotas de Alimentação</h3>
      <p style={{ fontSize: '14px', marginBottom: '15px', color: '#ffffffff' }}>
        Este teste verifica se todas as rotas do backend estão funcionando corretamente.
      </p>
      
      <button 
        onClick={testarTodasRotas} 
        disabled={carregando}
        style={{
          background: '#368dd9',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        {carregando ? '🔄 Testando...' : '🚀 Testar Todas as Rotas'}
      </button>
      
      {resultado && (
        <div style={{ marginTop: '20px' }}>
          <h4 style={{ color: '#ffffffff' }}>Resultados:</h4>
          <div style={{ 
            background: 'black', 
            padding: '15px', 
            borderRadius: '5px',
            border: '1px solid #000000ff',
            maxHeight: '400px',
            overflow: 'auto'
          }}>
            <pre style={{ fontSize: '12px', margin: 0 }}>
              {JSON.stringify(resultado, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}