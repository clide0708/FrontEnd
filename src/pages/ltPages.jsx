//aqui é só a listagem das paginas, importa ela, coloca numa constante pra depois fazer a rota

import { default as LandingPage } from "./LandingPage";
import { default as HomePage } from "./Home";
import { default as AlimentacaoPage } from "./Alimentacao";
import { default as PersonalPage } from "./Personal";
import { default as PerfilPage } from "./Perfil";
import { default as TreinosPage } from "./Treinos";
import { default as TreinandoPage } from "./Treinos/treinando/treinando.jsx";
import { default as Login } from "./Auth/login";
import { default as Cadastro } from "./Auth/cadastro";
import { default as RecuperarSenha} from "./Auth/recuperar";
import { default as ConectarPersonalPage} from "./ConectarPersonal/index.jsx";
import { default as PainelControleAcademiaPage } from "./Academia/PainelControle.jsx";

const PaginaNaoEncontrada = () => <div>404 - Página Não Encontrada</div>;
const TelaEmManutencao = () => <div>Em Manutenção</div>;
const TelaErro = () => <div>deu erro kkkkkkkkkkk</div>;

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
    Login,
    Cadastro,
    RecuperarSenha,
    ConectarPersonalPage,
    PainelControleAcademiaPage,
    // adicionar outras quando criar essa merda
};