import { useState, useEffect } from "react";
import { Clock, CheckCircle, XCircle } from "lucide-react";

const HorariosAcademia = ({ horarios, onChange }) => {
  const [horariosLocais, setHorariosLocais] = useState(horarios || []);

  // Inicializar horários se estiverem vazios
  useEffect(() => {
    if (!horarios || horarios.length === 0) {
      const horariosIniciais = [
        { dia_semana: 'Segunda-feira', aberto_24h: false, horario_abertura: '', horario_fechamento: '', fechado: false },
        { dia_semana: 'Terça-feira', aberto_24h: false, horario_abertura: '', horario_fechamento: '', fechado: false },
        { dia_semana: 'Quarta-feira', aberto_24h: false, horario_abertura: '', horario_fechamento: '', fechado: false },
        { dia_semana: 'Quinta-feira', aberto_24h: false, horario_abertura: '', horario_fechamento: '', fechado: false },
        { dia_semana: 'Sexta-feira', aberto_24h: false, horario_abertura: '', horario_fechamento: '', fechado: false },
        { dia_semana: 'Sábado', aberto_24h: false, horario_abertura: '', horario_fechamento: '', fechado: false },
        { dia_semana: 'Domingo', aberto_24h: false, horario_abertura: '', horario_fechamento: '', fechado: false }
      ];
      setHorariosLocais(horariosIniciais);
      onChange(horariosIniciais);
    }
  }, []);

  const diasSemana = [
    'Segunda-feira', 'Terça-feira', 'Quarta-feira', 
    'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'
  ];

  const atualizarHorario = (index, campo, valor) => {
    const novosHorarios = [...horariosLocais];
    
    if (campo === 'aberto_24h' && valor) {
      // Se marcar como 24h, limpa os horários específicos e desmarca fechado
      novosHorarios[index] = {
        ...novosHorarios[index],
        aberto_24h: true,
        horario_abertura: '',
        horario_fechamento: '',
        fechado: false
      };
    } else if (campo === 'fechado' && valor) {
      // Se marcar como fechado, limpa tudo e desmarca 24h
      novosHorarios[index] = {
        ...novosHorarios[index],
        fechado: true,
        aberto_24h: false,
        horario_abertura: '',
        horario_fechamento: ''
      };
    } else if (campo === 'horario_especifico') {
      // Quando seleciona horário específico, desmarca as outras opções
      novosHorarios[index] = {
        ...novosHorarios[index],
        fechado: false,
        aberto_24h: false,
        horario_abertura: novosHorarios[index].horario_abertura || '',
        horario_fechamento: novosHorarios[index].horario_fechamento || ''
      };
    } else {
      // Atualização normal de campo
      novosHorarios[index] = {
        ...novosHorarios[index],
        [campo]: valor
      };
    }

    setHorariosLocais(novosHorarios);
    onChange(novosHorarios);
  };

  // Função para verificar se está no modo horário específico
  const isHorarioEspecifico = (horario) => {
    return !horario.fechado && !horario.aberto_24h && (horario.horario_abertura || horario.horario_fechamento);
  };

  // Função para selecionar horário específico
  const selecionarHorarioEspecifico = (index) => {
    const novosHorarios = [...horariosLocais];
    novosHorarios[index] = {
      ...novosHorarios[index],
      fechado: false,
      aberto_24h: false,
      horario_abertura: novosHorarios[index].horario_abertura || '08:00',
      horario_fechamento: novosHorarios[index].horario_fechamento || '22:00'
    };
    
    setHorariosLocais(novosHorarios);
    onChange(novosHorarios);
  };

  const getStatusDia = (horario) => {
    if (horario.fechado) return { texto: 'Fechado', cor: '#ff6b6b', icone: <XCircle size={16} /> };
    if (horario.aberto_24h) return { texto: '24 horas', cor: '#4CAF50', icone: <CheckCircle size={16} /> };
    if (horario.horario_abertura && horario.horario_fechamento) {
      return { 
        texto: `${horario.horario_abertura} - ${horario.horario_fechamento}`, 
        cor: '#368DD9', 
        icone: <Clock size={16} /> 
      };
    }
    return { texto: 'Não definido', cor: '#aaa', icone: null };
  };

  return (
    <div className="horarios-academia">
      <label className="section-label">
        <Clock size={20} />
        Horários de Funcionamento
      </label>
      
      <div className="horarios-grid">
        {diasSemana.map((dia, index) => {
          const horario = horariosLocais[index] || {};
          const status = getStatusDia(horario);
          const modoHorarioEspecifico = isHorarioEspecifico(horario);
          
          return (
            <div key={dia} className="dia-horario">
              <div className="dia-header">
                <span className="dia-nome">{dia}</span>
                <span 
                  className="status-dia" 
                  style={{ color: status.cor }}
                >
                  {status.icone}
                  {status.texto}
                </span>
              </div>
              
              <div className="opcoes-horario">
                {/* Opção: Fechado */}
                <label className="opcao-horario">
                  <input
                    type="radio"
                    name={`horario-${index}`}
                    checked={horario.fechado || false}
                    onChange={(e) => atualizarHorario(index, 'fechado', e.target.checked)}
                  />
                  <span className="checkmark radio"></span>
                  Fechado
                </label>

                {/* Opção: 24 horas */}
                <label className="opcao-horario">
                  <input
                    type="radio"
                    name={`horario-${index}`}
                    checked={horario.aberto_24h || false}
                    onChange={(e) => atualizarHorario(index, 'aberto_24h', e.target.checked)}
                  />
                  <span className="checkmark radio"></span>
                  24 horas
                </label>

                {/* Opção: Horário específico */}
                <label className="opcao-horario">
                  <input
                    type="radio"
                    name={`horario-${index}`}
                    checked={modoHorarioEspecifico}
                    onChange={(e) => selecionarHorarioEspecifico(index)}
                  />
                  <span className="checkmark radio"></span>
                  Horário específico:
                </label>

                {/* Campos de horário específico */}
                <div className="campos-horario">
                  <input
                    type="time"
                    className="cad-input-global time-input"
                    value={horario.horario_abertura || ''}
                    onChange={(e) => {
                      atualizarHorario(index, 'horario_abertura', e.target.value);
                      // Se estiver preenchendo horário, automaticamente seleciona o modo específico
                      if (e.target.value && !modoHorarioEspecifico) {
                        selecionarHorarioEspecifico(index);
                      }
                    }}
                    disabled={horario.fechado || horario.aberto_24h}
                    placeholder="Abertura"
                  />
                  <span className="separador">às</span>
                  <input
                    type="time"
                    className="cad-input-global time-input"
                    value={horario.horario_fechamento || ''}
                    onChange={(e) => {
                      atualizarHorario(index, 'horario_fechamento', e.target.value);
                      // Se estiver preenchendo horário, automaticamente seleciona o modo específico
                      if (e.target.value && !modoHorarioEspecifico) {
                        selecionarHorarioEspecifico(index);
                      }
                    }}
                    disabled={horario.fechado || horario.aberto_24h}
                    placeholder="Fechamento"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HorariosAcademia;