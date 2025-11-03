import { useState, useEffect } from "react";
import { FileText, Building } from "lucide-react";

const EtapaCREF = ({ dados, onChange }) => {
const [academias, setAcademias] = useState([]);
const [carregandoAcademias, setCarregandoAcademias] = useState(false);

    useEffect(() => {
        carregarAcademias();
    }, []);

    const carregarAcademias = async () => {
        setCarregandoAcademias(true);
        try {
            // CORRIGIDO: Remove /api/ da URL
            const response = await fetch(`${import.meta.env.VITE_API_URL}academias-ativas`);
            const data = await response.json();
            if (data.success) {
                setAcademias(data.data);
            }
        } catch (error) {
            console.error('Erro ao carregar academias:', error);
        } finally {
            setCarregandoAcademias(false);
        }
    };

    const formatarCREF = (valor) => {
        return valor.replace(/\D/g, '').slice(0, 9);
    };

    const handleCREFNumeroChange = (e) => {
        const valorFormatado = formatarCREF(e.target.value);
        onChange({ cref_numero: valorFormatado });
    };

    return (
        <div className="etapa-cref">
            <h2>Registro Profissional</h2>
            <p>Informe seus dados do CREF e academia</p>

            <div className="form-grid">
                {/* Número do CREF */}
                <div className="input-group">
                    <label>
                        <FileText size={16} />
                        Número CREF *
                    </label>
                    <input
                        type="text"
                        placeholder="Apenas números"
                        value={dados.cref_numero}
                        onChange={handleCREFNumeroChange}
                        maxLength={9}
                        required
                    />
                    <small>Digite apenas números (6-9 dígitos)</small>
                </div>

                {/* Categoria CREF */}
                <div className="input-group">
                    <label>Categoria CREF *</label>
                    <select
                        value={dados.cref_categoria}
                        onChange={(e) => onChange({ cref_categoria: e.target.value })}
                        required
                    >
                        <option value="">Selecione</option>
                        <option value="A">A - Profissional de Educação Física</option>
                        <option value="B">B - Técnico Desportivo</option>
                        <option value="C">C - Estagiário</option>
                        <option value="D">D - Outras Categorias</option>
                    </select>
                </div>

                {/* Regional CREF */}
                <div className="input-group">
                    <label>Regional CREF *</label>
                    <select
                        value={dados.cref_regional}
                        onChange={(e) => onChange({ cref_regional: e.target.value })}
                        required
                    >
                        <option value="">Selecione a regional</option>
                        <option value="SP">SP - São Paulo</option>
                        <option value="RJ">RJ - Rio de Janeiro</option>
                        <option value="MG">MG - Minas Gerais</option>
                        <option value="RS">RS - Rio Grande do Sul</option>
                        <option value="PR">PR - Paraná</option>
                        <option value="SC">SC - Santa Catarina</option>
                        <option value="BA">BA - Bahia</option>
                        <option value="DF">DF - Distrito Federal</option>
                        <option value="ES">ES - Espírito Santo</option>
                        <option value="GO">GO - Goiás</option>
                        <option value="PE">PE - Pernambuco</option>
                        <option value="CE">CE - Ceará</option>
                        <option value="PA">PA - Pará</option>
                        <option value="MA">MA - Maranhão</option>
                        <option value="AM">AM - Amazonas</option>
                        <option value="OUT">OUT - Outra Regional</option>
                    </select>
                </div>

                {/* Academia */}
                <div className="input-group full-width">
                    <label>
                        <Building size={16} />
                        Academia (Opcional)
                    </label>
                    <select
                        value={dados.idAcademia}
                        onChange={(e) => onChange({ idAcademia: e.target.value })}
                    >
                        <option value="">Selecione uma academia (opcional)</option>
                        {carregandoAcademias ? (
                        <option value="">Carregando academias...</option>
                        ) : (
                        academias.map(academia => (
                            <option key={academia.idAcademia} value={academia.idAcademia}>
                            {academia.nome} - {academia.endereco}
                            </option>
                        ))
                        )}
                    </select>
                    <small>Você pode vincular-se a uma academia posteriormente</small>
                </div>
            </div>

            <div className="info-cref">
                <h4>Informações sobre o CREF:</h4>
                <ul>
                <li>O CREF é obrigatório para atuar como Personal Trainer</li>
                <li>Verifique se os dados estão corretos com seu conselho regional</li>
                <li>O número do CREF contém apenas dígitos</li>
                <li>A categoria define seu tipo de atuação profissional</li>
                </ul>
            </div>
        </div>
    );
};

export default EtapaCREF;