import { createPortal } from "react-dom";
import Treino from "./treinando";

export default function TreinoPortal({ treino, onVoltar }) {
  return createPortal(
    <Treino treino={treino} onVoltar={onVoltar} />,
    document.body
  );
}
