import { useState } from "react";
import { MapPin, Search } from "lucide-react";

const EtapaEndereco = ({ dados, onChange }) => {
  const [carregandoCep, setCarregandoCep] = useState(false);

  const buscarEnderecoPorCEP = async (cep) => {
    const cepLimpo = cep.replace(/\D/g, '');
    
    if (cepLimpo.length !== 8) return;

    setCarregandoCep(true);
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const endereco = await response.json();
      
      if (!endereco.erro) {
        onChange({
          logradouro: endereco.logradouro || '',
          bairro: endereco.bairro || '',
          cidade: endereco.localidade || '',
          estado: endereco.uf || ''
        });
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setCarregandoCep(false);
    }
  };

  const formatarCEP = (valor) => {
    return valor
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1');
  };

  const handleCepChange = (e) => {
    const valorFormatado = formatarCEP(e.target.value);
    onChange({ cep: valorFormatado });

    if (valorFormatado.replace(/\D/g, '').length === 8) {
      buscarEnderecoPorCEP(valorFormatado);
    }
  };

  return (
    <div className="etapa-endereco">
      <h2>Endereço</h2>
      <p>Informe seu endereço completo</p>

      <div className="form-grid">
        {/* CEP */}
        <div className="input-group">
          <label>
            <MapPin size={16} />
            CEP *
          </label>
          <div className="input-with-button">
            <input
              type="text"
              placeholder="00000-000"
              value={dados.cep}
              onChange={handleCepChange}
              maxLength={9}
              required
            />
            <button
              type="button"
              className="btn-buscar-cep"
              onClick={() => buscarEnderecoPorCEP(dados.cep)}
              disabled={carregandoCep || !dados.cep || dados.cep.replace(/\D/g, '').length !== 8}
            >
              <Search size={16} />
              {carregandoCep ? '...' : 'Buscar'}
            </button>
          </div>
        </div>

        {/* Logradouro */}
        <div className="input-group full-width">
          <label>Logradouro *</label>
          <input
            type="text"
            placeholder="Rua, Avenida, etc."
            value={dados.logradouro}
            onChange={(e) => onChange({ logradouro: e.target.value })}
            required
          />
        </div>

        {/* Número */}
        <div className="input-group">
          <label>Número *</label>
          <input
            type="text"
            placeholder="Nº"
            value={dados.numero}
            onChange={(e) => onChange({ numero: e.target.value })}
            required
          />
        </div>

        {/* Complemento */}
        <div className="input-group">
          <label>Complemento</label>
          <input
            type="text"
            placeholder="Apto, Casa, etc."
            value={dados.complemento}
            onChange={(e) => onChange({ complemento: e.target.value })}
          />
        </div>

        {/* Bairro */}
        <div className="input-group">
          <label>Bairro *</label>
          <input
            type="text"
            placeholder="Bairro"
            value={dados.bairro}
            onChange={(e) => onChange({ bairro: e.target.value })}
            required
          />
        </div>

        {/* Cidade */}
        <div className="input-group">
          <label>Cidade *</label>
          <input
            type="text"
            placeholder="Cidade"
            value={dados.cidade}
            onChange={(e) => onChange({ cidade: e.target.value })}
            required
          />
        </div>

        {/* Estado */}
        <div className="input-group">
          <label>Estado *</label>
          <select
            value={dados.estado}
            onChange={(e) => onChange({ estado: e.target.value })}
            required
          >
            <option value="">Selecione</option>
            <option value="AC">Acre</option>
            <option value="AL">Alagoas</option>
            <option value="AP">Amapá</option>
            <option value="AM">Amazonas</option>
            <option value="BA">Bahia</option>
            <option value="CE">Ceará</option>
            <option value="DF">Distrito Federal</option>
            <option value="ES">Espírito Santo</option>
            <option value="GO">Goiás</option>
            <option value="MA">Maranhão</option>
            <option value="MT">Mato Grosso</option>
            <option value="MS">Mato Grosso do Sul</option>
            <option value="MG">Minas Gerais</option>
            <option value="PA">Pará</option>
            <option value="PB">Paraíba</option>
            <option value="PR">Paraná</option>
            <option value="PE">Pernambuco</option>
            <option value="PI">Piauí</option>
            <option value="RJ">Rio de Janeiro</option>
            <option value="RN">Rio Grande do Norte</option>
            <option value="RS">Rio Grande do Sul</option>
            <option value="RO">Rondônia</option>
            <option value="RR">Roraima</option>
            <option value="SC">Santa Catarina</option>
            <option value="SP">São Paulo</option>
            <option value="SE">Sergipe</option>
            <option value="TO">Tocantins</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default EtapaEndereco;