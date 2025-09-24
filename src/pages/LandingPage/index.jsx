import "./style.css"
import { useNavigate } from "react-router-dom";

export default function LandingPage() {

    const navigate = useNavigate();

    return (
        <div className="LP">
            <section className="Inicio">
                <h1>Teste</h1>
                <button
                    onClick={() =>
                        navigate("/login",)}
                >Entrar
                </button>

            </section>

            <section className="Sobre">

            </section>

            <section className="QmSomos">

            </section>

            <section className="Footer">

            </section>
        </div >
    )
}