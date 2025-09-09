import { Routes, Route } from "react-router-dom";
import PageTransition from "./components/Loading";
import Header from "./components/Header";
import Home from "./containers/Home";
import Alimentacao from "./containers/Alimentacao";
import Personal from "./containers/Personal";
import Profile from "./containers/Perfil";
import Treinos from "./containers/Treinos/index.jsx";
import Treinando from "./containers/Treinos/treinando/treinando.jsx";

export default function App() {
  return (
    <>
      <PageTransition>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} /> {/* rota inicial agora */}
          <Route path="/Alimentacao" element={<Alimentacao />} />
          <Route path="/Personal" element={<Personal />} />
          <Route path="/Perfil" element={<Profile />} />
          <Route path="/Treinos" element={<Treinos />} />
          <Route path="/Treinos/treinando" element={<Treinando />} />
        </Routes>
      </PageTransition>
    </>
  );
}
