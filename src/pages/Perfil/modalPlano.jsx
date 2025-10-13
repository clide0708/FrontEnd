import { useState } from "react";
import "./style.css";

export default function PlanModal({
  personal,
  currentPlan,
  onClose,
  onRemovePersonal,
  onChoosePlan,
}) {
  const [confirmingRemove, setConfirmingRemove] = useState(false);

  const plans = [
    {
      name: "Plano Simples",
      price: "R$ 24,90",
      benefits: [
        "✔ Acesso a todos os treinos já cadastrados da plataforma",
        "✔ Treinos personalizados",
        "✔ 3 usos da IA de Alimentação por dia",
        "✔ Avaliação mensal com profissional",
        "✔ Planejamento trimestral",
      ],
    },
    {
      name: "Plano Intermediário",
      price: "R$ 34,90",
      benefits: [
        "✔ Acesso a todos os treinos já cadastrados da plataforma",
        "✔ Sem anúncios",
        "✔ Treinos personalizados",
        "✔ 6 usos da IA de Alimentação por dia",
        "✔ Avaliação quinzenal com profissional",
        "✔ Planejamento mensal",
      ],
    },
    {
      name: "Plano Premium",
      price: "R$ 49,90",
      benefits: [
        "✔ Acesso a todos os treinos já cadastrados da plataforma",
        "✔ Sem anúncios",
        "✔ Treinos totalmente personalizados",
        "✔ 10 usos da IA de Alimentação por dia",
        "✔ Avaliação semanal com profissional",
        "✔ Planejamento semanal",
        "✔ Acesso a conteúdo exclusivo",
      ],
    },
    {
      name: "Plano Premium +",
      price: "R$ 59,90",
      benefits: [
        "✔ Acesso a todos os treinos já cadastrados da plataforma",
        "✔ Sem anúncios",
        "✔ Treinos totalmente personalizados",
        "✔ Usos ilimitados da IA de Alimentação",
        "✔ Avaliação semanal com profissional",
        "✔ Planejamento semanal",
        "✔ Acesso a conteúdo exclusivo",
        "✔ Suporte 24h com profissionais",
      ],
    },
  ];

  return (
    <div className="modalPlano modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <div className="personal-row">
            <h2>
              Seu Personal: <span>{personal || "Gustavo Dandalo"}</span>
            </h2>
            <a href="#" className="modalrmvps-btn">
              Remover Personal
            </a>
          </div>
          <div className="modal-actions">
            <button className="modal-btn close" onClick={onClose}>
              X
            </button>
          </div>
        </div>

        <div className="plans-grid">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`plan-card ${
                currentPlan === plan.name ? "active" : ""
              }`}
            >
              <h3>{plan.name}</h3>
              <p className="price">
                {plan.price} <small>/ mês</small>
              </p>
              <ul>
                {plan.benefits.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
              {currentPlan === plan.name ? (
                <button className="modal-btn disabled" disabled>
                  Plano Ativo
                </button>
              ) : (
                <button
                  className="modalplas-btn"
                  onClick={() => onChoosePlan(plan.name)}
                >
                  Assinar Plano
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
