import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cadastrarAluno, cadastrarPersonal, verificarEmail, verificarCpf } from "../../services/Auth/cadastro";

export default function CadastroPage() {
  const navigate = useNavigate();
  const [isPersonal, setIsPersonal] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    cpf: "",
    senha: "",
    rg: "",
    numTel: "",
    cref_numero: "",
    cref_categoria: "",
    cref_regional: ""
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // máscara CPF
    if (name === "cpf") {
      formattedValue = value
        .replace(/\D/g, "")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }

    // máscara telefone
    if (name === "numTel") {
      formattedValue = value
        .replace(/\D/g, "")
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d{4})$/, "$1-$2");
    }

    // CREF número só números
    if (name === "cref_numero") {
      formattedValue = value.replace(/\D/g, "").substring(0, 9);
    }

    // categoria e regional sempre maiúsculo
    if (name === "cref_categoria") formattedValue = value.toUpperCase().substring(0, 1);
    if (name === "cref_regional") formattedValue = value.toUpperCase().substring(0, 5);

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
          if (numericCpf.length !== 11) newErrors.cpf = "CPF deve ter 11 dígitos";
          else {
            const res = await verificarCpf({ cpf: numericCpf });
            if (!res.disponivel) newErrors.cpf = "CPF já cadastrado";
            else delete newErrors.cpf;
          }
        }

        if (isPersonal && name === "cref_numero") {
          if (!/^\d{6,9}$/.test(value.replace(/\D/g, ''))) newErrors.cref_numero = "Número CREF inválido (6-9 dígitos)";
          else delete newErrors.cref_numero;
        }

        if (isPersonal && name === "cref_categoria") {
          if (!/^[A-Z]{1}$/.test(value.trim())) newErrors.cref_categoria = "Categoria CREF inválida (1 letra)";
          else delete newErrors.cref_categoria;
        }

        if (isPersonal && name === "cref_regional") {
          if (!/^[A-Z]{2,5}$/.test(value.trim())) newErrors.cref_regional = "Regional CREF inválida (2-5 letras)";
          else delete newErrors.cref_regional;
        }
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        newErrors[name] = "Erro ao validar";
      }
    }

    setErrors(newErrors);
  };

  const validateFields = async () => {
    const newErrors = {};
    if (!form.nome) newErrors.nome = "Nome é obrigatório";
    if (!form.cpf) newErrors.cpf = "CPF é obrigatório";
    if (!form.rg) newErrors.rg = "RG é obrigatório";
    if (!form.email) newErrors.email = "Email é obrigatório";
    if (!form.senha) newErrors.senha = "Senha é obrigatória";
    if (!form.numTel) newErrors.numTel = "Telefone é obrigatório";

    if (isPersonal) {
      if (!form.cref_numero) newErrors.cref_numero = "Número CREF é obrigatório";
      if (!form.cref_categoria) newErrors.cref_categoria = "Categoria CREF é obrigatória";
      if (!form.cref_regional) newErrors.cref_regional = "Regional CREF é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = await validateFields();
    if (!isValid) return;

    try {
      const basePayload = {
        nome: form.nome.trim(),
        cpf: form.cpf.replace(/\D/g, ''),
        rg: form.rg.trim(),
        email: form.email.trim(),
        senha: form.senha,
        numTel: form.numTel.replace(/\D/g, '')
      };

      if (isPersonal) {
        const personalPayload = {
          ...basePayload,
          cref_numero: form.cref_numero.replace(/\D/g, ''),
          cref_categoria: form.cref_categoria.trim().toUpperCase().charAt(0),
          cref_regional: form.cref_regional.trim().toUpperCase().substring(0, 5)
        };
        await cadastrarPersonal(personalPayload);
      } else {
        await cadastrarAluno(basePayload);
      }

      alert("Cadastro realizado com sucesso!");
      navigate("/login");
    } catch (err) {
      console.error("Erro no cadastro:", err);
      if (err.response && err.response.data && err.response.data.error) {
        const backendError = err.response.data.error.toLowerCase();
        const newErrors = { ...errors };

        if (backendError.includes("email")) newErrors.email = err.response.data.error;
        else if (backendError.includes("cpf")) newErrors.cpf = err.response.data.error;
        else if (backendError.includes("cref")) newErrors.cref_numero = err.response.data.error;
        else alert(`Erro ao cadastrar: ${err.response.data.error}`);

        setErrors(newErrors);
      } else {
        alert("Erro ao cadastrar, confira os dados!");
      }
    }
  };

  return (
    <div>
      <h1>Cadastro</h1>

      <label>
        <input
          type="checkbox"
          checked={isPersonal}
          onChange={(e) => setIsPersonal(e.target.checked)}
        />
        Conta Personal
      </label>

      <form onSubmit={handleSubmit}>
        <input
          name="nome"
          placeholder="Nome"
          value={form.nome}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {errors.nome && <span style={{ color: "red" }}>{errors.nome}</span>}

        <input
          name="cpf"
          placeholder="CPF"
          value={form.cpf}
          onChange={handleChange}
          onBlur={handleBlur}
          maxLength={14}
        />
        {errors.cpf && <span style={{ color: "red" }}>{errors.cpf}</span>}

        <input
          name="rg"
          placeholder="RG"
          value={form.rg}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {errors.rg && <span style={{ color: "red" }}>{errors.rg}</span>}

        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {errors.email && <span style={{ color: "red" }}>{errors.email}</span>}

        <input
          type="password"
          name="senha"
          placeholder="Senha"
          value={form.senha}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {errors.senha && <span style={{ color: "red" }}>{errors.senha}</span>}

        <input
          name="numTel"
          placeholder="Telefone"
          value={form.numTel}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {errors.numTel && <span style={{ color: "red" }}>{errors.numTel}</span>}

        {isPersonal && (
          <>
            <input
              name="cref_numero"
              placeholder="CREF Número"
              value={form.cref_numero}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.cref_numero && <span style={{ color: "red" }}>{errors.cref_numero}</span>}

            <input
              name="cref_categoria"
              placeholder="CREF Categoria"
              value={form.cref_categoria}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.cref_categoria && <span style={{ color: "red" }}>{errors.cref_categoria}</span>}

            <input
              name="cref_regional"
              placeholder="CREF Regional"
              value={form.cref_regional}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.cref_regional && <span style={{ color: "red" }}>{errors.cref_regional}</span>}
          </>
        )}

        <button type="submit">Cadastrar</button>
      </form>

      <button onClick={() => navigate("/login")}>Já tenho conta</button>
    </div>
  );
}
