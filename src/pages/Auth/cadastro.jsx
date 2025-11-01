import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  cadastrarAluno,
  cadastrarPersonal,
  verificarEmail,
  verificarCpf,
} from "../../services/Auth/cadastro";
import { Eye, EyeOff } from "lucide-react";
import "./style.css";
import { color } from "framer-motion";

export default function CadastroPage() {
  const navigate = useNavigate();
  const [isPersonal, setIsPersonal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [academias, setAcademias] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    nome: "",
    email: "",
    cpf: "",
    senha: "",
    confirmarSenha: "",
    rg: "",
    numTel: "",
    cref_numero: "",
    cref_categoria: "",
    cref_regional: "",
    idAcademia: ""
  });
  
  const [errors, setErrors] = useState({});

  // Carregar academias para o select
  useEffect(() => {
    const carregarAcademias = async () => {
      try {
        const response = await fetch('/api/academias-ativas');
        const data = await response.json();
        if (data.success) {
          setAcademias(data.data || []);
        }
      } catch (error) {
        console.error('Erro ao carregar academias:', error);
      }
    };
    
    if (isPersonal) {
      carregarAcademias();
    }
  }, [isPersonal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "cpf") {
      formattedValue = value
        .replace(/\D/g, "")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }

    if (name === "numTel") {
      formattedValue = value
        .replace(/\D/g, "")
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d{4})$/, "$1-$2");
    }

    if (name === "cref_numero")
      formattedValue = value.replace(/\D/g, "").substring(0, 9);
    if (name === "cref_categoria")
      formattedValue = value.toUpperCase().substring(0, 1);
    if (name === "cref_regional")
      formattedValue = value.toUpperCase().substring(0, 5);

    setForm({ ...form, [name]: formattedValue });
    setErrors({ ...errors, [name]: "" });
  };

  const handleBlur = async (e) => {
    const { name, value } = e.target;
    let newErrors = { ...errors };

    if (!value.trim()) {
      newErrors[name] = "Campo obrigatório";
    } else {
      try {
        if (name === "email") {
          const res = await verificarEmail({ email: value });
          if (!res.disponivel) newErrors.email = "Email já cadastrado";
          else delete newErrors.email;
        }

        if (name === "cpf") {
          const numericCpf = value.replace(/\D/g, "");
          if (numericCpf.length !== 11)
            newErrors.cpf = "CPF deve ter 11 dígitos";
          else {
            const res = await verificarCpf({ cpf: numericCpf });
            if (!res.disponivel) newErrors.cpf = "CPF já cadastrado";
            else delete newErrors.cpf;
          }
        }

        if (isPersonal && name === "cref_numero") {
          if (!/^\d{6,9}$/.test(value.replace(/\D/g, "")))
            newErrors.cref_numero = "Número CREF inválido (6-9 dígitos)";
          else delete newErrors.cref_numero;
        }

        if (isPersonal && name === "cref_categoria") {
          if (!/^[A-Z]{1}$/.test(value.trim()))
            newErrors.cref_categoria = "Categoria CREF inválida (1 letra)";
          else delete newErrors.cref_categoria;
        }

        if (isPersonal && name === "cref_regional") {
          if (!/^[A-Z]{2,5}$/.test(value.trim()))
            newErrors.cref_regional = "Regional CREF inválida (2-5 letras)";
          else delete newErrors.cref_regional;
        }

        // Validação de senha
        if (name === "senha") {
          if (value.length < 6) {
            newErrors.senha = "Senha deve ter pelo menos 6 caracteres";
          } else {
            delete newErrors.senha;
          }
        }

        // Validação de confirmação de senha
        if (name === "confirmarSenha" && value !== form.senha) {
          newErrors.confirmarSenha = "As senhas não coincidem";
        } else if (name === "confirmarSenha" && value === form.senha) {
          delete newErrors.confirmarSenha;
        }

      } catch (err) {
        newErrors[name] = "Erro ao validar";
      }
    }

    setErrors(newErrors);
  };

  const validateFields = async () => {
    const newErrors = {};
    
    // Validações básicas
    if (!form.nome.trim()) newErrors.nome = "Nome é obrigatório";
    if (!form.cpf.replace(/\D/g, "")) newErrors.cpf = "CPF é obrigatório";
    if (!form.rg.trim()) newErrors.rg = "RG é obrigatório";
    if (!form.email.trim()) newErrors.email = "Email é obrigatório";
    if (!form.senha) newErrors.senha = "Senha é obrigatória";
    if (!form.confirmarSenha) newErrors.confirmarSenha = "Confirme sua senha";
    if (!form.numTel.replace(/\D/g, "")) newErrors.numTel = "Telefone é obrigatório";

    // Validação de senha
    if (form.senha && form.senha.length < 6) {
      newErrors.senha = "Senha deve ter pelo menos 6 caracteres";
    }

    // Validação de confirmação de senha
    if (form.senha && form.confirmarSenha && form.senha !== form.confirmarSenha) {
      newErrors.confirmarSenha = "As senhas não coincidem";
    }

    // Validações específicas do personal
    if (isPersonal) {
      if (!form.cref_numero.replace(/\D/g, ""))
        newErrors.cref_numero = "Número CREF é obrigatório";
      if (!form.cref_categoria.trim())
        newErrors.cref_categoria = "Categoria CREF é obrigatória";
      if (!form.cref_regional.trim())
        newErrors.cref_regional = "Regional CREF é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const isValid = await validateFields();
    if (!isValid) {
      setLoading(false);
      return;
    }

    try {
      const basePayload = {
        nome: form.nome.trim(),
        cpf: form.cpf.replace(/\D/g, ""),
        rg: form.rg.trim(),
        email: form.email.trim(),
        senha: form.senha,
        numTel: form.numTel.replace(/\D/g, ""),
      };

      if (isPersonal) {
        const personalPayload = {
          ...basePayload,
          cref_numero: form.cref_numero.replace(/\D/g, ""),
          cref_categoria: form.cref_categoria.trim().toUpperCase().charAt(0),
          cref_regional: form.cref_regional.trim().toUpperCase().substring(0, 5),
          idAcademia: form.idAcademia || null
        };
        await cadastrarPersonal(personalPayload);
      } else {
        await cadastrarAluno(basePayload);
      }

      navigate("/login", { 
        state: { message: "Cadastro realizado com sucesso! Faça login para continuar." } 
      });
    } catch (err) {
      console.error("Erro no cadastro:", err);
      if (err.response && err.response.data && err.response.data.error) {
        const backendError = err.response.data.error.toLowerCase();
        const newErrors = { ...errors };

        if (backendError.includes("email"))
          newErrors.email = err.response.data.error;
        else if (backendError.includes("cpf"))
          newErrors.cpf = err.response.data.error;
        else if (backendError.includes("cref"))
          newErrors.cref_numero = err.response.data.error;
        else if (backendError.includes("academia"))
          newErrors.idAcademia = err.response.data.error;
        else alert(`Erro ao cadastrar: ${err.response.data.error}`);

        setErrors(newErrors);
      } else {
        alert("Erro ao cadastrar, confira os dados!");
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="cadastroCC">
      <div className="cntrcds">
        <div className="topppp-global">
          <h2>CLIDE Fit</h2>
        </div>
        <div className="cad-container">
          <h2>Cadastro</h2>

          <label className="cad-checkbox-label">
            <input
              type="checkbox"
              checked={isPersonal}
              onChange={(e) => setIsPersonal(e.target.checked)}
            />
            Conta Personal
          </label>

          <br />
          <h3 style={{color: "white"}}>Dados Pessoais</h3>
          <br />

          <form onSubmit={handleSubmit}>
            <input
              className="cad-input"
              name="nome"
              placeholder="Nome completo"
              value={form.nome}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.nome && <span className="cad-error">{errors.nome}</span>}

            <input
              className="cad-input"
              name="cpf"
              placeholder="CPF"
              value={form.cpf}
              onChange={handleChange}
              onBlur={handleBlur}
              maxLength={14}
            />
            {errors.cpf && <span className="cad-error">{errors.cpf}</span>}

            <input
              className="cad-input"
              name="rg"
              placeholder="RG"
              value={form.rg}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.rg && <span className="cad-error">{errors.rg}</span>}

            <input
              className="cad-input"
              name="numTel"
              placeholder="Telefone"
              value={form.numTel}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.numTel && (
              <span className="cad-error">{errors.numTel}</span>
            )}

            <br />
            <h3 style={{color: "white"}}>Informações de login</h3>
            <br />

            <input
              className="cad-input"
              name="email"
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.email && <span className="cad-error">{errors.email}</span>}

            <div className="password-input-container">
              <input
                className="cad-input password-input"
                type={showPassword ? "text" : "password"}
                name="senha"
                placeholder="Senha (mínimo 6 caracteres)"
                value={form.senha}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.senha && <span className="cad-error">{errors.senha}</span>}

            <div className="password-input-container">
              <input
                className="cad-input password-input"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmarSenha"
                placeholder="Confirmar senha"
                value={form.confirmarSenha}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={toggleConfirmPasswordVisibility}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmarSenha && <span className="cad-error">{errors.confirmarSenha}</span>}

            {isPersonal && (
              <>
                <h3 style={{color: "white"}}>Informações CREF</h3>
                <br />

                <input
                  className="cad-input"
                  name="cref_numero"
                  placeholder="CREF Número (apenas números)"
                  value={form.cref_numero}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.cref_numero && (
                  <span className="cad-error">{errors.cref_numero}</span>
                )}

                <input
                  className="cad-input"
                  name="cref_categoria"
                  placeholder="CREF Categoria (G ou P)"
                  value={form.cref_categoria}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength={1}
                />
                {errors.cref_categoria && (
                  <span className="cad-error">{errors.cref_categoria}</span>
                )}

                <input
                  className="cad-input"
                  name="cref_regional"
                  placeholder="CREF Regional (ex: SP, RJ)"
                  value={form.cref_regional}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength={5}
                />
                {errors.cref_regional && (
                  <span className="cad-error">{errors.cref_regional}</span>
                )}

                <br />
                <h3 style={{color: "white"}}>Selecione uma academia (Opcional)</h3>
                <br />

                <select
                  className="cad-input"
                  name="idAcademia"
                  value={form.idAcademia}
                  onChange={handleChange}
                >
                  <option value="">Selecione uma academia (opcional)</option>
                  {academias.map(academia => (
                    <option key={academia.idAcademia} value={academia.idAcademia}>
                      {academia.nome} - {academia.endereco}
                    </option>
                  ))}
                </select>
                {errors.idAcademia && (
                  <span className="cad-error">{errors.idAcademia}</span>
                )}
              </>
            )}

            <button 
              type="submit" 
              className="cad-button"
              disabled={loading}
            >
              {loading ? "Cadastrando..." : "Cadastrar"}
            </button>
          </form>

          <button
            className="cad-link-button"
            onClick={() => navigate("/login")}
          >
            Já tenho conta
          </button>
          <button
            className="cad-link-button"
            onClick={() => navigate("/home")}
          >
            Voltar para início
          </button>
        </div>
      </div>
    </div>
  );
}