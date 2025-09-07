import { Routes, Route } from "react-router-dom";
import PageTransition from "./components/Loading";
import Header from "./components/Header";
import Home from "./containers/Home";
import Alimentacao from "./containers/Alimentacao/alimentacao";
import Personal from "./containers/Personal";

export default function App() {
  return (
    <>
      <PageTransition>
        <Header />
        <Routes>
          <Route path="/Inicio" element={<Home />} />
          <Route path="/Alimentacao" element={<Alimentacao />} />
          <Route path="/Personal" element={<Personal />} />
        </Routes>
      </PageTransition>
    </>
  );
}
