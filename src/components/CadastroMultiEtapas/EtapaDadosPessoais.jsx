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

  const formatarTelefone = (valor) => {
    return valor
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
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
              onChange={(e) => {
                const valorFormatado = e.target.value
                  .replace(/\D/g, '')
                  .replace(/(\d{2})(\d)/, '$1.$2')
                  .replace(/(\d{3})(\d)/, '$1.$2')
                  .replace(/(\d{3})(\d)/, '$1/$2')
                  .replace(/(\d{4})(\d)/, '$1-$2')
                  .replace(/(-\d{2})\d+?$/, '$1');
                onChange({ cnpj: valorFormatado });
              }}
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
              placeholder="(00) 00000-0000"
              value={dados.numTel}
              onChange={handleTelefoneChange}
              maxLength={15}
              required
            />
          </div>
        </div>
      </div>
    );
  } else{
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
              placeholder="Digite seu RG"
              value={dados.rg}
              onChange={(e) => onChange({ rg: e.target.value })}
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
              placeholder="(00) 00000-0000"
              value={dados.numTel}
              onChange={handleTelefoneChange}
              maxLength={15}
              required
            />
          </div>
        </div>
      </div>
    );
  }
};

export default EtapaDadosPessoais;