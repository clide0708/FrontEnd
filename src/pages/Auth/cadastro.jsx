import { useState } from "react";
import { User, Dumbbell, Building } from "lucide-react";
import CadastroMultiEtapas from "../../components/CadastroMultiEtapas";
import "./style.css";

export default function CadastroPage() {
  const [userType, setUserType] = useState("aluno");

  const userTypes = [
    { 
      id: "aluno", 
      label: "Aluno", 
      icon: User, 
      color: "#368DD9",
      description: "Quero treinar e evoluir"
    },
    { 
      id: "personal", 
      label: "Personal Trainer", 
      icon: Dumbbell, 
      color: "#4CAF50",
      description: "Quero treinar alunos"
    },
    { 
      id: "academia", 
      label: "Academia", 
      icon: Building, 
      color: "#FF6B35",
      description: "Quero gerenciar minha academia"
    }
  ];

  return (
    <div className="cadastroCC">
      <div className="animated-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
      </div>

      <div className="topppp-global">
        <div className="logo-container">
          <h2>CLIDE Fit</h2>
        </div>
      </div>

      {/* Componente de Cadastro Multi-Etapas com seletor integrado */}
      <CadastroMultiEtapas tipoUsuario={userType} />
    </div>
  );
}