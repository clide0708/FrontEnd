import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cadastrarAluno, cadastrarPersonal, verificarEmail, verificarCpf, verificarRg } from "../../services/Auth/cadastro";

export default function CadastroPage() {
  const navigate = useNavigate();
  const [isPersonal, setIsPersonal] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    cpf: "",
    rg: "",
    senha: "",
    numTel: "",
    cref_numero: "",
    cref_categoria: "",
    cref_regional: ""
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // limpa erro ao digitar
  };

  const validateFields = async () => {
    const newErrors = {};

    // campos obrigatórios
    if (!form.nome) newErrors.nome = "Nome é obrigatório";
    if (!form.cpf) newErrors.cpf = "CPF é obrigatório";
    if (!form.rg) newErrors.rg = "RG é obrigatório";
    if (!form.email) newErrors.email = "Email é obrigatório";
    if (!form.senha) newErrors.senha = "Senha é obrigatória";
    if (!form.numTel) newErrors.numTel = "Telefone é obrigatório";

    // campos CREF para Personal
    if (isPersonal) {
      if (!form.cref_numero) newErrors.cref_numero = "Número CREF é obrigatório";
      if (!form.cref_categoria) newErrors.cref_categoria = "Categoria CREF é obrigatória";
      if (!form.cref_regional) newErrors.cref_regional = "Regional CREF é obrigatória";
    }

    // validações básicas
    if (form.cpf && form.cpf.length !== 11) newErrors.cpf = "CPF deve ter 11 dígitos";
    if (form.numTel && form.numTel.length < 10) newErrors.numTel = "Telefone deve ter pelo menos 10 dígitos";
    if (form.senha && form.senha.length < 6) newErrors.senha = "Senha deve ter no mínimo 6 caracteres";
    if (form.rg && !/^[a-zA-Z0-9]{7,12}$/.test(form.rg)) newErrors.rg = "RG deve ter 7-12 caracteres e pode conter letras e números";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return false;

    // verificação de duplicados via API
    try {
      const emailRes = await verificarEmail({ email: form.email });
      if (!emailRes.disponivel) newErrors.email = "Email já cadastrado";

      const cpfRes = await verificarCpf({ cpf: form.cpf });
      if (!cpfRes.disponivel) newErrors.cpf = "CPF já cadastrado";

      const rgRes = await verificarRg({ rg: form.rg });
      if (!rgRes.disponivel) newErrors.rg = "RG já cadastrado";
    } catch (err) {
      console.error("Erro ao verificar duplicados:", err);
      alert("Erro ao validar duplicados, tente novamente");
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = await validateFields();
    if (!isValid) return;

    try {
      // payload base comum
      const basePayload = {
        nome: form.nome.trim(),
        cpf: form.cpf.replace(/\D/g, ''),
        rg: form.rg.trim().toUpperCase(),
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

        console.log("Payload personal:", personalPayload);
        await cadastrarPersonal(personalPayload);
      } else {
        console.log("Payload aluno:", basePayload);
        await cadastrarAluno(basePayload);
      }

      alert("Cadastro realizado com sucesso!");
      navigate("/login");
    } catch (err) {
      console.error("Erro no cadastro:", err);
      if (err.response && err.response.data && err.response.data.error) {
        alert(`Erro ao cadastrar: ${err.response.data.error}`);
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
        />
        {errors.nome && <span style={{ color: "red" }}>{errors.nome}</span>}

        <input
          name="cpf"
          placeholder="CPF"
          value={form.cpf}
          onChange={handleChange}
          maxLength={11}
        />
        {errors.cpf && <span style={{ color: "red" }}>{errors.cpf}</span>}

        <input
          name="rg"
          placeholder="RG"
          value={form.rg}
          onChange={handleChange}
        />
        {errors.rg && <span style={{ color: "red" }}>{errors.rg}</span>}

        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        {errors.email && <span style={{ color: "red" }}>{errors.email}</span>}

        <input
          type="password"
          name="senha"
          placeholder="Senha"
          value={form.senha}
          onChange={handleChange}
        />
        {errors.senha && <span style={{ color: "red" }}>{errors.senha}</span>}

        <input
          name="numTel"
          placeholder="Telefone"
          value={form.numTel}
          onChange={handleChange}
        />
        {errors.numTel && <span style={{ color: "red" }}>{errors.numTel}</span>}

        {isPersonal && (
          <>
            <input
              name="cref_numero"
              placeholder="CREF Número"
              value={form.cref_numero}
              onChange={handleChange}
            />
            {errors.cref_numero && <span style={{ color: "red" }}>{errors.cref_numero}</span>}

            <input
              name="cref_categoria"
              placeholder="CREF Categoria"
              value={form.cref_categoria}
              onChange={handleChange}
            />
            {errors.cref_categoria && <span style={{ color: "red" }}>{errors.cref_categoria}</span>}

            <input
              name="cref_regional"
              placeholder="CREF Regional"
              value={form.cref_regional}
              onChange={handleChange}
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
