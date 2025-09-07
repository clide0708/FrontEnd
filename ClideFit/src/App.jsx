import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./containers/Home";
import Alimentacao from "./containers/Alimentação";
import Personal from "./containers/Personal";

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/Inicio" element={<Home />} />
        <Route path="/Alimentacao" element={<Alimentacao />} />
        <Route path="/Personal" element={<Personal />} />
      </Routes>
    </>
  );
}
