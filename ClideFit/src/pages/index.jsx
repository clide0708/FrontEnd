// src/pages/index.ts

// Importe todos os seus componentes de página aqui
import { default as LandingPage } from "./LandingPage";
import { default as HomePage } from "./Home";
import { default as AlimentacaoPage } from "./Alimentacao";
import { default as PersonalPage } from "./Personal";
import { default as PerfilPage } from "./Perfil";
import { default as TreinosPage } from "./Treinos";
import { default as TreinandoPage } from "./Treinos";

// Componentes simples para páginas de erro/manutenção
const PaginaNaoEncontrada = () => <div>404 - Página Não Encontrada</div>;
const TelaEmManutencao = () => <div>Em Manutenção</div>;
const TelaErro = () => <div>Ocorreu um erro!</div>;

// Exporte-os em um objeto para fácil acesso
export const Paginas = {
    LandingPage,
    HomePage,
    AlimentacaoPage,
    PersonalPage,
    PerfilPage,
    TreinosPage,
    TreinandoPage,
    PaginaNaoEncontrada,
    TelaEmManutencao,
    TelaErro,
    // Adicione outras páginas conforme necessário
};