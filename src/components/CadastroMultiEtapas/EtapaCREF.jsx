// components/CadastroMultiEtapas/EtapaCREF.jsx
import { useState, useEffect } from "react";
import { FileText, Building, HelpCircle } from "lucide-react";

const EtapaCREF = ({ dados, onChange }) => {
  const [academias, setAcademias] = useState([]);
  const [carregandoAcademias, setCarregandoAcademias] = useState(false);

  // Categorias CREF válidas
  const categoriasCREF = [
    { value: 'G', label: 'G - Graduado' },
    { value: 'P', label: 'P - Provisório' },
    { value: 'L', label: 'L - Licenciatura' },
    { value: 'B', label: 'B - Bacharelado' },
    { value: 'T', label: 'T - Técnico' },
    { value: 'E', label: 'E - Especialista' },
    { value: 'M', label: 'M - Mestre' },
    { value: 'D', label: 'D - Doutor' }
  ];

  // Estados brasileiros
  const estadosBrasileiros = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
    'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
    'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];
  
  const formatarCREFNumero = (valor) => {
    return valor.replace(/\D/g, '').slice(0, 9);
  };

  const handleCREFNumeroChange = (e) => {
    const valorFormatado = formatarCREFNumero(e.target.value);
    onChange({ cref_numero: valorFormatado });
  };

  const handleCREFCompleto = () => {
    if (dados.cref_numero && dados.cref_categoria && dados.cref_regional) {
      return `${dados.cref_numero}-${dados.cref_categoria}/${dados.cref_regional}`;
    }
    return '';
  };

  return (
    <div className="etapa-cref">
      <h2>Registro Profissional (CREF)</h2>
      <p>Informe seus dados do Conselho Regional de Educação Física</p>

      <div className="form-grid">
        {/* Número do CREF */}
        <div className="input-group">
          <label>
            <FileText size={16} />
            Número do CREF *
          </label>
          <input
            type="text"
            placeholder="Ex: 012345678"
            value={dados.cref_numero}
            onChange={handleCREFNumeroChange}
            maxLength={9}
            required
          />
          <small>Digite apenas números (6-9 dígitos)</small>
        </div>

        {/* Categoria CREF */}
        <div className="input-group">
          <label>
            Categoria CREF *
            <HelpCircle size={14} title="Categoria do seu registro profissional" />
          </label>
          <select
            value={dados.cref_categoria}
            onChange={(e) => onChange({ cref_categoria: e.target.value })}
            required
          >
            <option value="">Selecione a categoria</option>
            {categoriasCREF.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Regional CREF */}
        <div className="input-group">
          <label>
            Regional CREF *
            <HelpCircle size={14} title="Estado de registro no CREF" />
          </label>
          <select
            value={dados.cref_regional}
            onChange={(e) => onChange({ cref_regional: e.target.value })}
            required
          >
            <option value="">Selecione o estado</option>
            {estadosBrasileiros.map(estado => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>
        </div>

        {/* CREF Completo (readonly) */}
        <div className="input-group full-width">
          <label>Seu CREF completo está sendo cadastrado como:</label>
          <div className="cref-completo-display">
            <strong>{handleCREFCompleto() || 'Preencha os campos acima'}</strong>
          </div>
        </div>
      </div>

      <div className="info-cref">
        <h4>💡 Informações sobre o CREF:</h4>
        <ul>
          <li>O CREF é <strong>obrigatório</strong> para atuar como Personal Trainer no Brasil</li>
          <li>Verifique se os dados estão corretos com seu conselho regional</li>
          <li>O número do CREF contém <strong>apenas dígitos</strong> (6 a 9 números)</li>
          <li>A categoria define seu tipo de formação e atuação profissional</li>
          <li>A regional corresponde ao estado onde você está registrado</li>
        </ul>
      </div>
    </div>
  );
};

export default EtapaCREF;