import { useState } from "react";
import { User, IdCard, Phone, Building } from "lucide-react";

const EtapaDadosPessoais = ({ dados, onChange, tipoUsuario }) => {
  const [erros, setErros] = useState({});

  const validarCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]/g, '');
    return cpf.length === 11;
  };

  const formatarCPF = (valor) => {
    return valor
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const validarTelefone = (telefone) => {
    const apenasNumeros = telefone.replace(/\D/g, '');
    return apenasNumeros.length === 10 || apenasNumeros.length === 11;
  };

  const formatarTelefone = (valor) => {
    const apenasNumeros = valor.replace(/\D/g, '');
    
    const numerosLimitados = apenasNumeros.slice(0, 11);
    
    if (numerosLimitados.length <= 2) {
      return `(${numerosLimitados}`;
    } else if (numerosLimitados.length <= 6) {
      return `(${numerosLimitados.slice(0, 2)}) ${numerosLimitados.slice(2)}`;
    } else if (numerosLimitados.length <= 10) {
      return `(${numerosLimitados.slice(0, 2)}) ${numerosLimitados.slice(2, 6)}-${numerosLimitados.slice(6)}`;
    } else {
      return `(${numerosLimitados.slice(0, 2)}) ${numerosLimitados.slice(2, 7)}-${numerosLimitados.slice(7)}`;
    }
  };

  const validarRG = (rg) => {
    const apenasNumeros = rg.replace(/[^\d]/g, '');
    return apenasNumeros.length >= 7 && apenasNumeros.length <= 12;
  };

  const formatarRG = (valor) => {
    const apenasNumeros = valor.replace(/\D/g, '');
    
    // RG pode ter 7 a 12 dígitos, formatamos para XX.XXX.XXX-X
    if (apenasNumeros.length <= 2) {
      return apenasNumeros;
    } else if (apenasNumeros.length <= 5) {
      return valor
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '$1.$2');
    } else if (apenasNumeros.length <= 8) {
      return valor
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2');
    } else {
      return valor
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{1,2})\d+?$/, '$1');
    }
  };

  const formatarCNPJ = (valor) => {
    return valor
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };
    
  const handleCpfChange = (e) => {
    const valorFormatado = formatarCPF(e.target.value);
    onChange({ cpf: valorFormatado });

    if (e.target.value.replace(/\D/g, '').length === 11 && !validarCPF(e.target.value)) {
      setErros(prev => ({ ...prev, cpf: 'CPF inválido' }));
    } else {
      setErros(prev => ({ ...prev, cpf: '' }));
    }
  };

  const handleTelefoneChange = (e) => {
    const valorFormatado = formatarTelefone(e.target.value);
    onChange({ numTel: valorFormatado });

    const telefoneNumeros = valorFormatado.replace(/\D/g, '');
    if (telefoneNumeros.length === 10 || telefoneNumeros.length === 11) {
      if (!validarTelefone(valorFormatado)) {
        setErros(prev => ({ ...prev, numTel: 'Telefone inválido' }));
      } else {
        setErros(prev => ({ ...prev, numTel: '' }));
      }
    } else {
      setErros(prev => ({ ...prev, numTel: '' }));
    }
  };

  const handleRgChange = (e) => {
    const valorFormatado = formatarRG(e.target.value);
    onChange({ rg: valorFormatado });

    // Validação em tempo real
    if (e.target.value.replace(/\D/g, '').length >= 7 && !validarRG(e.target.value)) {
      setErros(prev => ({ ...prev, rg: 'RG deve ter entre 7 e 12 dígitos' }));
    } else {
      setErros(prev => ({ ...prev, rg: '' }));
    }
  };

  const handleCnpjChange = (e) => {
    const valorFormatado = formatarCNPJ(e.target.value);
    onChange({ cnpj: valorFormatado });
  };

  if (tipoUsuario === 'academia') {
    return (
      <div className="etapa-dados-pessoais">
        <h2>Dados da Empresa</h2>
        <p>Informe os dados da sua academia</p>

        <div className="form-grid">
          {/* Nome Fantasia */}
          <div className="input-group full-width">
            <label>
              <Building size={16} />
              Nome Fantasia *
            </label>
            <input
              type="text"
              placeholder="Nome da sua academia"
              value={dados.nome_fantasia}
              onChange={(e) => onChange({ nome_fantasia: e.target.value })}
              required
            />
          </div>

          {/* Razão Social */}
          <div className="input-group full-width">
            <label>Razão Social *</label>
            <input
              type="text"
              placeholder="Razão social completa"
              value={dados.razao_social}
              onChange={(e) => onChange({ razao_social: e.target.value })}
              required
            />
          </div>

          {/* CNPJ */}
          <div className="input-group">
            <label>
              <IdCard size={16} />
              CNPJ *
            </label>
            <input
              type="text"
              placeholder="00.000.000/0000-00"
              value={dados.cnpj}
              onChange={handleCnpjChange}
              maxLength={18}
              required
            />
          </div>

          {/* Telefone */}
          <div className="input-group">
            <label>
              <Phone size={16} />
              Telefone *
            </label>
            <input
              type="tel"
              placeholder="(00) 00000-0000 ou (00) 0000-0000"
              value={dados.numTel}
              onChange={handleTelefoneChange}
              maxLength={15}
              required
            />
            {erros.numTel && <span className="erro">{erros.numTel}</span>}
          </div>
        </div>
      </div>
    );
  } else {
    // Para ALUNO e PERSONAL - APENAS documentos e telefone
    return (
      <div className="etapa-dados-pessoais">
        <h2>Dados Pessoais</h2>
        <p>Informe seus dados básicos</p>

        <div className="form-grid">
          {/* Nome Completo */}
          <div className="input-group full-width">
            <label>
              <User size={16} />
              Nome Completo *
            </label>
            <input
              type="text"
              placeholder="Digite seu nome completo"
              value={dados.nome}
              onChange={(e) => onChange({ nome: e.target.value })}
              required
            />
          </div>

          {/* CPF */}
          <div className="input-group">
            <label>
              <IdCard size={16} />
              CPF *
            </label>
            <input
              type="text"
              placeholder="000.000.000-00"
              value={dados.cpf}
              onChange={handleCpfChange}
              maxLength={14}
              required
            />
            {erros.cpf && <span className="erro">{erros.cpf}</span>}
          </div>

          {/* RG */}
          <div className="input-group">
            <label>RG *</label>
            <input
              type="text"
              placeholder="00.000.000-0"
              value={dados.rg}
              onChange={handleRgChange}
              maxLength={12}
              required
            />
            {erros.rg && <span className="erro">{erros.rg}</span>}
          </div>

          {/* Telefone */}
          <div className="input-group">
            <label>
              <Phone size={16} />
              Telefone *
            </label>
            <input
              type="tel"
              placeholder="(00) 00000-0000 ou (00) 0000-0000"
              value={dados.numTel}
              onChange={handleTelefoneChange}
              maxLength={15}
              required
            />
            {erros.numTel && <span className="erro">{erros.numTel}</span>}
          </div>
        </div>
        
        {/* NOTA: Data de nascimento, gênero, etc. foram movidos para EtapaPerfil */}
      </div>
    );
  }
};

export default EtapaDadosPessoais;