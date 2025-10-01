import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  redirect,
} from "react-router-dom";
import { Paginas } from "../pages/ltPages";
import { PrivateRoute, PublicRoute } from "../utils/VerRoute";
import Header from "../components/Header";
import PageTransition from "../components/Loading";
import BGanm from "../components/BG";
import "./style.css";

// esse daqui vai criar um layout para o usuário logado
const AuthenticatedLayout = () => (
  <>
    <Header /> {/* Header sempre visível */}
    <div className="page-content">
      <Outlet /> {/* cada página decide se usa PageTransition */}
    </div>
  </>
);

const routes = createBrowserRouter([
  {
    element: <Outlet />, // layout base / tela
    errorElement: <Paginas.TelaErro />,
    children: [
      {
        path: "/manutencao",
        element: <Paginas.TelaEmManutencao />,
      },
      {
        path: "*", // catch-all para rotas não encontradas
        element: <Paginas.PaginaNaoEncontrada />,
      },
      {
        element: <PublicRoute />, // só quem não tá logado
        children: [
          {
            path: "/", // raiz
            element: <Paginas.LandingPage />,
          },

          {
            path: "/login",
            element: <Paginas.Login />,
          },
          {
            path: "/cadastro",
            element: <Paginas.Cadastro />,
          },
        ],
      },
      {
        element: <PrivateRoute />, // só quem tá logado
        children: [
          {
            path: "/", // raiz
            loader: async () => redirect("/home"), // redireciona raiz pra home
          },
          {
            element: <AuthenticatedLayout />,
            children: [
              {
                path: "/home",
                element: (
                  <BGanm>
                    <Paginas.HomePage />
                  </BGanm>
                ),
              },
              {
                path: "/alimentacao",
                element: (
                  <PageTransition>
                    <Paginas.AlimentacaoPage />
                  </PageTransition>
                ),
              },
              {
                path: "/personal",
                element: (
                  <PageTransition>
                    <Paginas.PersonalPage />
                  </PageTransition>
                ),
              },
              {
                path: "/perfil",
                element: (
                  <BGanm>
                    <Paginas.PerfilPage />
                  </BGanm>
                ),
              },
              {
                path: "/treinos",
                element: (
                  <PageTransition>
                    <Paginas.TreinosPage />
                  </PageTransition>
                ),
              },
              {
                path: "/treinos/treinando",
                element: (
                  <BGanm>
                    <Paginas.TreinandoPage />
                  </BGanm>
                ),
              },
            ],
          },
        ],
      },
    ],
  },
]);

const AppRoutes = () => {
  return <RouterProvider router={routes} />;
};

export default AppRoutes;
