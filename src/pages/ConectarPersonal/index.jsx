import { useState, useEffect, useCallback, useRef } from "react";
import "./style.css";
import connectService from "../../services/Personal/conectar";
import { MapPin, Filter, User, Navigation } from "lucide-react";

function ConectarPersonalPage() {
  const [dados, setDados] = useState([]);
  const [dadosComDistancia, setDadosComDistancia] = useState([]);
  const [filtros, setFiltros] = useState({
    academia_id: "",
    genero: "",
    localizacao: "",
    modalidades: [],
    treinosAdaptados: "",
    idade_min: "",
    idade_max: "",
    meta: "",
    cref_tipo: "",
    raio_km: 50,
    latitude: null,
    longitude: null
  });
  
  const [loading, setLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [academias, setAcademias] = useState([]);
  const [modalidades, setModalidades] = useState([]);
  const [localizacaoUsuario, setLocalizacaoUsuario] = useState(null);
  const [tipoLocalizacao, setTipoLocalizacao] = useState(null);
  
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const isPersonal = usuario?.tipo === 'personal';
  
  // ⭐⭐ CACHE OTIMIZADO - Agora usando todas as variáveis
  const cacheGeocodificacao = useRef({});
  const cacheCalculoDistancia = useRef(new Map());
  const cacheDados = useRef({
    personais: null,
    alunos: null,
    academias: null,
    modalidades: null,
    timestamp: null
  });

  // ⭐⭐ DEBOUNCE otimizado
  const atualizarFiltrosComDebounce = useCallback((novosFiltros) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => setFiltros(novosFiltros), 500);
    setSearchTimeout(timeout);
  }, [searchTimeout]);

  const handleFiltroChange = useCallback((campo, valor) => {
    console.log(`🎛️ Alterando filtro ${campo}:`, valor);
    
    const novosFiltros = { 
      ...filtros, 
      [campo]: valor 
    };
    
    // ⭐⭐ CORREÇÃO: Limpar cache quando filtros importantes mudarem
    if (['academia_id', 'genero', 'localizacao', 'raio_km'].includes(campo)) {
      console.log('🧹 Limpando cache devido a mudança de filtro importante');
      // Limpar apenas entradas específicas relacionadas a este tipo de filtro
      const cacheKeys = Object.keys(cacheDados.current);
      cacheKeys.forEach(key => {
        if (key.includes('personais') || key.includes('alunos')) {
          delete cacheDados.current[key];
        }
      });
    }
    
    // Para filtros de texto, usar debounce
    if (['localizacao', 'meta'].includes(campo)) {
      atualizarFiltrosComDebounce(novosFiltros);
    } else {
      // Para selects e outros, atualizar imediatamente
      setFiltros(novosFiltros);
    }
  }, [filtros, atualizarFiltrosComDebounce]);

  // ⭐⭐ CÁLCULO DE DISTÂNCIA COM CACHE
  const calcularDistancia = useCallback((lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    
    const cacheKey = `${lat1}_${lon1}_${lat2}_${lon2}`;
    if (cacheCalculoDistancia.current.has(cacheKey)) {
      return cacheCalculoDistancia.current.get(cacheKey);
    }
    
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distancia = R * c;
    const resultado = Math.round(distancia * 10) / 10;
    
    cacheCalculoDistancia.current.set(cacheKey, resultado);
    return resultado;
  }, []);

  // ⭐⭐ GEOCODIFICAÇÃO com cache otimizado
  const geocodificarComCache = useCallback(async (endereco) => {
    if (!endereco) return null;
    
    const cacheKey = endereco.toLowerCase().trim();
    if (cacheGeocodificacao.current[cacheKey]) {
      return cacheGeocodificacao.current[cacheKey];
    }
    
    try {
      const resultado = await connectService.geocodificarEndereco(endereco);
      if (resultado) {
        cacheGeocodificacao.current[cacheKey] = resultado;
        return resultado;
      }
    } catch (error) {
      console.error('❌ Erro na geocodificação:', error);
    }
    return null;
  }, []);

  // ⭐⭐ CARREGAR DADOS COM CACHE INTELIGENTE
  const carregarDadosComCache = useCallback(async (filtrosAtuais, isPersonal) => {
    const cacheKey = isPersonal ? 'alunos' : 'personais';
    const agora = Date.now();
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
    
    // ⭐⭐ CORREÇÃO: Criar uma chave única baseada nos filtros
    const filtrosKey = JSON.stringify(filtrosAtuais);
    const cacheCompletoKey = `${cacheKey}_${filtrosKey}`;
    
    // Verificar se temos cache válido para ESTES filtros específicos
    if (cacheDados.current[cacheCompletoKey] && 
        cacheDados.current.timestamp && 
        (agora - cacheDados.current.timestamp) < CACHE_DURATION) {
      console.log('📦 Usando dados do cache para filtros:', filtrosAtuais);
      return cacheDados.current[cacheCompletoKey];
    }

    console.log('🔄 Buscando dados da API com filtros:', filtrosAtuais);
    try {
      const dados = await (isPersonal 
        ? connectService.getAlunos(filtrosAtuais)
        : connectService.getPersonais(filtrosAtuais));
      
      // ⭐⭐ CORREÇÃO: Atualizar cache com chave específica dos filtros
      cacheDados.current[cacheCompletoKey] = dados;
      cacheDados.current.timestamp = agora;
      
      return dados;
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    // Limpar cache se os filtros mudarem significativamente
    const cacheKeys = Object.keys(cacheDados.current);
    if (cacheKeys.length > 10) { // Limitar cache a 10 entradas
      const keysToRemove = cacheKeys.slice(0, 5); // Remove as 5 mais antigas
      keysToRemove.forEach(key => {
        delete cacheDados.current[key];
      });
      console.log('🧹 Cache limpo - removidas entradas antigas');
    }
  }, [filtros]);

  const limparFiltros = useCallback(() => {
    console.log('🧹 Limpando todos os filtros e cache');
    
    // Limpar todos os filtros
    setFiltros({
      academia_id: "",
      genero: "",
      localizacao: "",
      modalidades: [],
      treinosAdaptados: "",
      idade_min: "",
      idade_max: "",
      meta: "",
      cref_tipo: "",
      raio_km: 50,
      latitude: null,
      longitude: null
    });
    
    // Limpar cache completamente
    cacheDados.current = {
      personais: null,
      alunos: null,
      academias: null,
      modalidades: null,
      timestamp: null
    };
    
    setLocalizacaoUsuario(null);
    setTipoLocalizacao(null);
  }, []);

  useEffect(() => {
    console.log('🎯 Filtros ativos:', {
      ...filtros,
      modalidades_count: filtros.modalidades.length,
      has_location: !!(filtros.latitude && filtros.longitude)
    });
  }, [filtros]);

  // ⭐⭐ CARREGAR DADOS INICIAIS (academias e modalidades) com cache
  const carregarDadosIniciais = useCallback(async () => {
    const agora = Date.now();
    const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos para dados estáticos
    
    try {
      const [academiasData, modalidadesData] = await Promise.all([
        // Verificar cache para academias
        cacheDados.current.academias && 
        cacheDados.current.timestamp && 
        (agora - cacheDados.current.timestamp) < CACHE_DURATION
          ? Promise.resolve(cacheDados.current.academias)
          : connectService.getAcademias().then(data => {
              cacheDados.current.academias = data;
              return data;
            }),
        
        // Verificar cache para modalidades
        cacheDados.current.modalidades && 
        cacheDados.current.timestamp && 
        (agora - cacheDados.current.timestamp) < CACHE_DURATION
          ? Promise.resolve(cacheDados.current.modalidades)
          : connectService.getModalidades().then(data => {
              cacheDados.current.modalidades = data;
              return data;
            })
      ]);

      return { academiasData, modalidadesData };
    } catch (error) {
      console.error('❌ Erro ao carregar dados iniciais:', error);
      throw error;
    }
  }, []);

  // ⭐⭐ DETECTAR LOCALIZAÇÃO otimizada
  const detectarLocalizacao = useCallback(async (tipo = 'geolocalizacao') => {
    try {
      console.log(`📍 Detectando localização via: ${tipo}`);
      
      let localizacaoData = null;

      if (tipo === 'geolocalizacao') {
        localizacaoData = await connectService.obterCoordenadasUsuario(usuario);
      } else if (tipo === 'endereco_cadastrado') {
        localizacaoData = await connectService.obterCoordenadasFallback(usuario);
      } else if (tipo === 'localizacao_digitada' && filtros.localizacao) {
        const resultado = await geocodificarComCache(filtros.localizacao);
        if (resultado) {
          localizacaoData = {
            latitude: resultado.latitude,
            longitude: resultado.longitude,
            tipo: 'localizacao_digitada',
            descricao: `Localização: ${resultado.endereco_formatado}`,
            precisao: resultado.precisao || 'media'
          };
        }
      }

      if (localizacaoData?.latitude && localizacaoData?.longitude) {
        console.log('✅ Localização obtida:', localizacaoData);
        setLocalizacaoUsuario(localizacaoData);
        setFiltros(prev => ({
          ...prev,
          latitude: localizacaoData.latitude,
          longitude: localizacaoData.longitude,
          ...(tipo !== 'localizacao_digitada' && { localizacao: '' })
        }));
        setTipoLocalizacao(tipo);
        
        // Recalcular distâncias quando a localização muda
        if (dados.length > 0) {
          calcularDistanciasParaDados(dados, localizacaoData);
        }
      } else {
        console.warn('⚠️ Não foi possível obter localização');
        alert('Não foi possível obter a localização. Tente outro método.');
      }
      
    } catch (error) {
      console.error('❌ Erro ao detectar localização:', error);
      alert('Erro ao detectar localização. Tente novamente.');
    }
  }, [filtros.localizacao, dados, geocodificarComCache, usuario]);

  // ⭐⭐ CALCULAR DISTÂNCIAS para todos os dados com cache
  const calcularDistanciasParaDados = useCallback((dadosArray, localizacao) => {
    if (!localizacao?.latitude || !localizacao?.longitude) {
      console.log('📍 Sem localização para calcular distâncias');
      setDadosComDistancia(dadosArray);
      return;
    }

    console.log('📏 Calculando distâncias para', dadosArray.length, 'itens');
    
    const dadosComDistanciaCalculada = dadosArray.map(item => {
      // Verificar se o item tem coordenadas
      if (!item.latitude || !item.longitude) {
        return { ...item, distancia_km: null, precisao_distancia: null };
      }

      // Calcular distância (usando cache)
      const distancia = calcularDistancia(
        localizacao.latitude,
        localizacao.longitude,
        item.latitude,
        item.longitude
      );

      // Determinar precisão baseada na fonte da localização
      let precisao = 'baixa';
      if (localizacao.precisao === 'alta' || tipoLocalizacao === 'geolocalizacao') {
        precisao = item.precisao_coordenadas === 'exata' ? 'alta' : 'media';
      } else if (localizacao.precisao === 'media' || tipoLocalizacao === 'endereco_cadastrado') {
        precisao = 'media';
      }

      return {
        ...item,
        distancia_km: distancia,
        precisao_distancia: precisao
      };
    });

    setDadosComDistancia(dadosComDistanciaCalculada);
  }, [tipoLocalizacao, calcularDistancia]);

  // ⭐⭐ CARREGAR DADOS PRINCIPAL - MUITO MAIS RÁPIDO
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function fetchData() {
      if (!isMounted) return;
      
      setLoading(true);
      try {
        console.log('🔄 Buscando dados com filtros:', filtros);
        
        // ⭐⭐ CARREGAMENTO PARALELO OTIMIZADO
        const [dadosData, dadosIniciais] = await Promise.all([
          carregarDadosComCache(filtros, isPersonal),
          carregarDadosIniciais()
        ]);
        
        if (!isMounted) return;

        console.log('✅ Dados carregados:', {
          dados: dadosData?.length || 0,
          academias: dadosIniciais.academiasData?.length || 0, 
          modalidades: dadosIniciais.modalidadesData?.length || 0
        });

        // Remover duplicatas de forma mais eficiente
        const dadosUnicos = Array.isArray(dadosData) 
          ? dadosData.filter((item, index, array) => 
                array.findIndex(i => 
                    (isPersonal ? i.idAluno === item.idAluno : i.idPersonal === item.idPersonal)
                ) === index
            )
          : [];

        setDados(dadosUnicos);
        setAcademias(dadosIniciais.academiasData || []);
        setModalidades(dadosIniciais.modalidadesData || []);

        // Calcular distâncias se tivermos localização
        if (localizacaoUsuario && dadosUnicos.length > 0) {
          calcularDistanciasParaDados(dadosUnicos, localizacaoUsuario);
        } else {
          setDadosComDistancia(dadosUnicos);
        }
        
      } catch (err) {
        if (err.name === 'AbortError') {
          console.log('✅ Requisição cancelada');
          return;
        }
        console.error("❌ Erro ao carregar dados:", err);
        if (isMounted) {
          setDados([]);
          setDadosComDistancia([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    
    // ⭐⭐ DEBOUNCE para busca - evita múltiplas requisições rápidas
    const timeoutId = setTimeout(fetchData, 300);
    
    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [filtros, isPersonal, localizacaoUsuario, calcularDistanciasParaDados, carregarDadosComCache, carregarDadosIniciais]);

  // ⭐⭐ ATUALIZAR DISTÂNCIAS quando localização mudar
  useEffect(() => {
    if (localizacaoUsuario && dados.length > 0) {
      console.log('🔄 Atualizando distâncias com nova localização');
      calcularDistanciasParaDados(dados, localizacaoUsuario);
    }
  }, [localizacaoUsuario, dados, calcularDistanciasParaDados]);

  // Buscar endereço por CEP
  const buscarEnderecoPorCEP = useCallback(async (cep) => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        handleFiltroChange('localizacao', `${data.localidade}, ${data.uf}`);
        // Disparar detecção de localização após um breve delay
        setTimeout(() => detectarLocalizacao('localizacao_digitada'), 100);
      } else {
        alert("CEP não encontrado.");
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      alert("Erro ao buscar endereço.");
    }
  }, [handleFiltroChange, detectarLocalizacao]);

  // Componente de input com debounce
  const FiltroInput = useCallback(({ label, campo, tipo = 'text', placeholder, onBlur }) => (
    <div className="filtroGroup">
      {label && <label>{label}</label>}
      <input
        type={tipo}
        placeholder={placeholder}
        value={filtros[campo] || ''}
        onChange={(e) => handleFiltroChange(campo, e.target.value)}
        onBlur={onBlur}
      />
    </div>
  ), [filtros, handleFiltroChange]);

  // Enviar convite
  const enviarConvite = async () => {
    if (!usuarioSelecionado || !mensagem.trim()) {
      alert("Por favor, escreva uma mensagem personalizada.");
      return;
    }

    const dadosConvite = {
      id_remetente: usuario.id,
      tipo_remetente: usuario.tipo,
      id_destinatario: isPersonal ? usuarioSelecionado.idAluno : usuarioSelecionado.idPersonal,
      tipo_destinatario: isPersonal ? 'aluno' : 'personal',
      mensagem: mensagem.trim()
    };

    try {
      await connectService.enviarConvite(dadosConvite);
      alert("Convite enviado com sucesso!");
      setShowModal(false);
      setMensagem("");
      setUsuarioSelecionado(null);

      setDadosComDistancia(prev => 
        prev.map(item => 
          (isPersonal ? item.idAluno === usuarioSelecionado.idAluno : item.idPersonal === usuarioSelecionado.idPersonal)
            ? { ...item, convitePendente: true }
            : item
        )
      );
    } catch (err) {
      console.error("Erro ao enviar convite:", err);
      alert(err.response?.data?.error || "Erro ao enviar convite");
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  }, [searchTimeout]);

  const modalidadesOptions = modalidades.map(m => m.nome);
  const dadosParaExibir = dadosComDistancia.length > 0 ? dadosComDistancia : dados;

  return (
    <div className="ConectarPersonal">
      <div className="containerPS">
        <div className="SC1">
          <div className="tituloSection">
            <h1 className="Titulo">{isPersonal ? "Encontre Alunos" : "Conecte-se a um Personal"}</h1>
            <p>{isPersonal 
              ? "Encontre alunos ideais para seu método de trabalho" 
              : "Encontre o personal trainer ideal para seus objetivos"}</p>
          </div>

          {/* Filtros */}
          <div className="filtrosSection">
            <div className="filtrosHeader">
              <Filter size={20} />
              <h3>Filtros</h3>
            </div>

            <div className="filtrosGrid">
              {/* Filtros básicos */}
              <div className="filtroGroup">
                <label>Academia</label>
                <select 
                  value={filtros.academia_id}
                  onChange={(e) => handleFiltroChange('academia_id', e.target.value)}
                >
                  <option value="">Todas as academias</option>
                  {academias.map(academia => (
                    <option key={academia.idAcademia} value={academia.idAcademia}>
                      {academia.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filtroGroup">
                <label>Gênero</label>
                <select 
                  value={filtros.genero}
                  onChange={(e) => handleFiltroChange('genero', e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              {!isPersonal && (
                <div className="filtroGroup">
                  <label>Tipo CREF</label>
                  <select 
                    value={filtros.cref_tipo}
                    onChange={(e) => handleFiltroChange('cref_tipo', e.target.value)}
                  >
                    <option value="">Todos</option>
                    <option value="G">Graduado (G)</option>
                    <option value="P">Provisionado (P)</option>
                  </select>
                </div>
              )}

              {isPersonal && (
                <>
                  <div className="filtroGroup">
                    <label>Idade Mínima</label>
                    <input
                      type="number"
                      placeholder="Ex: 18"
                      value={filtros.idade_min}
                      onChange={(e) => handleFiltroChange('idade_min', e.target.value)}
                    />
                  </div>

                  <div className="filtroGroup">
                    <label>Idade Máxima</label>
                    <input
                      type="number"
                      placeholder="Ex: 60"
                      value={filtros.idade_max}
                      onChange={(e) => handleFiltroChange('idade_max', e.target.value)}
                    />
                  </div>

                  <FiltroInput
                    label="Meta"
                    campo="meta"
                    placeholder="Ex: Ganhar massa"
                  />
                </>
              )}
              
              
              {/* Seção de Localização */}
              <div className="localizacaoSection">
                <div className="localizacaoHeader">
                  <Navigation size={20} />
                  <h3>Como calcular distâncias?</h3>
                </div>
                
                <div className="opcoesLocalizacao">
                  <button 
                    className={`btnLocalizacaoOpcao ${tipoLocalizacao === 'geolocalizacao' ? 'ativo' : ''}`}
                    onClick={() => detectarLocalizacao('geolocalizacao')}
                  >
                    <Navigation size={16} />
                    <span>Usar GPS</span>
                    <small>Mais preciso</small>
                  </button>
                  
                  <button 
                    className={`btnLocalizacaoOpcao ${tipoLocalizacao === 'endereco_cadastrado' ? 'ativo' : ''}`}
                    onClick={() => detectarLocalizacao('endereco_cadastrado')}
                  >
                    <MapPin size={16} />
                    <span>Meu endereço</span>
                    <small>Cadastrado no perfil</small>
                  </button>
                  
                  <div className="localizacaoDigitada">
                    <FiltroInput
                      campo="localizacao"
                      placeholder="Digite cidade, estado ou CEP"
                      onBlur={(e) => {
                        const valor = e.target.value;
                        // Verificar se é CEP
                        if (valor.replace(/\D/g, '').length === 8) {
                          buscarEnderecoPorCEP(valor);
                        } else if (valor.trim()) {
                          detectarLocalizacao('localizacao_digitada');
                        }
                      }}
                    />
                    <small>Pressione Enter ou mude do campo</small>
                  </div>
                </div>
              </div>
              <div>
                {localizacaoUsuario && (
                  <div className="infoLocalizacao">
                    <MapPin size={16} />
                    <span>
                      {localizacaoUsuario.descricao}
                      {tipoLocalizacao === 'geolocalizacao' && ' (GPS - Mais preciso)'}
                      {tipoLocalizacao === 'endereco_cadastrado' && ' (Endereço cadastrado - Menos preciso)'}
                      {tipoLocalizacao === 'localizacao_digitada' && ' (Localização digitada)'}
                    </span>
                  </div>
                )}
              </div>

              <div className="filtroGroup">
                <label>Raio de busca</label>
                <select 
                  value={filtros.raio_km}
                  onChange={(e) => handleFiltroChange('raio_km', e.target.value)}
                >
                  <option value="5">5 km</option>
                  <option value="10">10 km</option>
                  <option value="25">25 km</option>
                  <option value="50">50 km</option>
                  <option value="100">100 km</option>
                  <option value="0">Todo Brasil</option>
                </select>
              </div>

              <div className="filtroGroup">
                <label>Treinos Adaptados</label>
                <select 
                  value={filtros.treinosAdaptados}
                  onChange={(e) => handleFiltroChange('treinosAdaptados', e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="true">Com treinos adaptados</option>
                  <option value="false">Sem treinos adaptados</option>
                </select>
              </div>
            </div>

            {/* Modalidades */}
            <div className="filtroGroup fullWidth">
              <label>Modalidades</label>
              <div className="modalidadesGrid">
                {modalidadesOptions.map(modalidade => (
                  <label key={modalidade} className="checkboxLabel">
                    <input
                      type="checkbox"
                      checked={filtros.modalidades.includes(modalidade)}
                      onChange={(e) => {
                        const newModalidades = e.target.checked
                          ? [...filtros.modalidades, modalidade]
                          : filtros.modalidades.filter(m => m !== modalidade);
                        handleFiltroChange('modalidades', newModalidades);
                      }}
                    />
                    {modalidade}
                  </label>
                ))}
              </div>
            </div>
              
            <div className="filtrosAtivosInfo">
              <span className="filtrosContador">
                {Object.keys(filtros).filter(key => {
                  const value = filtros[key];
                  if (key === 'modalidades') return value.length > 0;
                  if (key === 'raio_km') return value !== 50;
                  if (key === 'latitude' || key === 'longitude') return false; // Ignorar coordenadas
                  return value !== '' && value !== null && value !== undefined;
                }).length} Filtros ativos
              </span>

              {/* Botão para limpar filtros */}
              <button 
                className="btnLimparFiltros"
                onClick={limparFiltros}
                title="Limpar todos os filtros"
              >
                Limpar
              </button>
            </div>
          </div>

          {/* Lista de Usuários */}
          <div className="personaisSection">
            {loading ? (
              <div className="loading">Carregando {isPersonal ? 'alunos' : 'personais'}...</div>
            ) : dadosParaExibir.length === 0 ? (
              <div className="emptyState">
                <User size={48} />
                <p>Nenhum {isPersonal ? 'aluno' : 'personal'} encontrado com os filtros selecionados.</p>
                {localizacaoUsuario && (
                  <p className="info-text">
                    💡 Dica: Tente aumentar o raio de busca ou usar uma localização diferente.
                  </p>
                )}
              </div>
            ) : (
              <div className="personaisGrid">
                {dadosParaExibir.map(item => (
                  <div key={isPersonal ? item.idAluno : item.idPersonal} className="personalCard">
                    {/* DISTÂNCIA */}
                    {item.distancia_km !== null && item.distancia_km !== undefined && (
                      <div className="distanciaBadge">
                        <MapPin size={14} />
                        <span>{item.distancia_km} km</span>
                        {item.precisao_distancia && (
                          <span className="precisaoInfo" title={`Precisão: ${item.precisao_distancia}`}>
                            {item.precisao_distancia === 'alta' ? '📍' : 
                             item.precisao_distancia === 'media' ? '📌' : '🏢'}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Resto do card permanece igual */}
                    <div className="personalHeader">
                      <img
                        src={item.foto_perfil || "/assets/images/profilefoto.png"}
                        alt={item.nome}
                        className="personalFoto"
                      />
                      <div className="personalInfo">
                        <h3>{item.nome}</h3>
                        
                        {!isPersonal && (
                          <>
                            <p className="personalCREF">{item.cref}</p>
                            {item.sobre && <p className="personalAcademia">{item.sobre}</p>}
                          </>
                        )}
                        
                        {isPersonal && item.meta && (
                          <p className="personalMeta"><strong>Meta:</strong> {item.meta}</p>
                        )}
                        
                        <p className="personalAcademia">
                          {item.cidade && `${item.cidade}, ${item.estado}`}
                          {item.nomeAcademia && ` • ${item.nomeAcademia}`}
                        </p>

                        <div className={isPersonal ? "infoAluno" : "infoPersonal"}>
                          {isPersonal ? (
                            <>
                              {item.idade && <div className="infoAlunoItem"><strong>Idade:</strong> {item.idade} anos</div>}
                              {item.altura && <div className="infoAlunoItem"><strong>Altura:</strong> {item.altura}cm</div>}
                              {item.peso && <div className="infoAlunoItem"><strong>Peso:</strong> {item.peso}kg</div>}
                              {item.treinoTipo && <div className="infoAlunoItem"><strong>Nível:</strong> {item.treinoTipo}</div>}
                            </>
                          ) : (
                            <>
                              {item.idade && <div className="infoPersonalItem"><strong>Idade:</strong> {item.idade} anos</div>}
                              {item.cref_tipo && (
                                <div className="infoPersonalItem">
                                  <strong>Categoria:</strong> {item.cref_tipo === 'G' ? 'Graduado' : 'Provisionado'}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="personalDetails">
                      <div className="detalhesColuna">
                        <div className="detalhesItem">
                          <strong>Modalidades</strong>
                          {item.modalidades && item.modalidades.length > 0 ? (
                            <div className="modalidadesList">
                              {item.modalidades.map((modalidade, index) => (
                                <span key={index}>{modalidade}</span>
                              ))}
                            </div>
                          ) : (
                            <span>Não informado</span>
                          )}
                        </div>
                      </div>

                      <div className="detalhesColuna">
                        {!isPersonal && item.treinos_count !== undefined && (
                          <div className="detalhesItem">
                            <strong>Treinos Criados</strong>
                            <span className="treinosInfo">{item.treinos_count} treinos</span>
                          </div>
                        )}
                        
                        {item.treinosAdaptados && (
                          <div className="detalhesItem">
                            <strong>Especialidade</strong>
                            <span className="adaptadoInfo">
                              <strong>✓</strong> Treinos Adaptados
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="personalActions">
                      {item.convitePendente ? (
                        <button className="btnConviteEnviado" disabled>Convite Enviado</button>
                      ) : (
                        <button
                          className="btnConectar"
                          onClick={() => {
                            setUsuarioSelecionado(item);
                            setShowModal(true);
                          }}
                        >
                          {isPersonal ? 'Convidar Aluno' : 'Conectar com Personal'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Painel direito */}
        <div className="SC2">
          <div className="infoCard">
            <h3>💡 Como funciona?</h3>
            <ul>
              <li>{isPersonal ? 'Encontre alunos qualificados' : 'Encontre personais qualificados'}</li>
              <li>Filtre por especialidade e localização</li>
              <li>Envie convites personalizados</li>
              <li>Aguarde a confirmação</li>
            </ul>
          </div>

          <div className="statsCard">
            <h3>📊 Estatísticas</h3>
            <div className="statItem">
              <strong>{dadosParaExibir.length}</strong>
              <span>{isPersonal ? 'Alunos' : 'Personais'} disponíveis</span>
            </div>
            {!isPersonal && (
              <div className="statItem">
                <strong>{dadosParaExibir.filter(p => p.cref_tipo === 'G').length}</strong>
                <span>Graduados (CREF-G)</span>
              </div>
            )}
            <div className="statItem">
              <strong>{dadosParaExibir.filter(p => p.treinosAdaptados).length}</strong>
              <span>Com treinos adaptados</span>
            </div>
            {localizacaoUsuario && (
              <div className="statItem">
                <strong>
                  {dadosParaExibir.filter(p => p.distancia_km !== null && p.distancia_km <= parseInt(filtros.raio_km)).length}
                </strong>
                <span>Dentro do raio de {filtros.raio_km}km</span>
              </div>
            )}
          </div>

          {localizacaoUsuario && (
            <div className="localizacaoCard">
              <h3>📍 Sua Localização</h3>
              <p>{localizacaoUsuario.descricao}</p>
              <small>
                Precisão: {tipoLocalizacao === 'geolocalizacao' ? 'Alta (GPS)' : 
                         tipoLocalizacao === 'endereco_cadastrado' ? 'Média' : 'Variável'}
              </small>
              <button 
                onClick={() => detectarLocalizacao(tipoLocalizacao)}
                className="btnAtualizarLocalizacao"
              >
                Atualizar Localização
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && usuarioSelecionado && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Enviar Convite</h2>
            <p>Envie uma mensagem para <strong>{usuarioSelecionado.nome}</strong></p>
            
            <div className="mensagemInput">
              <textarea
                placeholder={`Escreva uma mensagem personalizada explicando por que você gostaria de se conectar com ${usuarioSelecionado.nome}...`}
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                rows={6}
                maxLength={500}
              />
              <div className="contadorCaracteres">{mensagem.length}/500 caracteres</div>
            </div>

            <div className="modal-actions">
              <button 
                onClick={() => {
                  setShowModal(false);
                  setUsuarioSelecionado(null);
                  setMensagem("");
                }}
                className="btnCancelar"
              >
                Cancelar
              </button>
              <button 
                onClick={enviarConvite}
                className="btnEnviar"
                disabled={!mensagem.trim()}
              >
                Enviar Convite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ConectarPersonalPage;