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

// esse daqui vai criar um layout para o usuário logado
const AuthenticatedLayout = () => (
  <PageTransition>
    <Header />
    <Outlet />
  </PageTransition>
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
          //login.jsx
        ],
      },
      {
        element: <PrivateRoute />, // só quem tá logado
        children: [
          {
            path: "/", // raiz
            loader: async () => redirect("/Home"), // redireciona raiz pra home
          },
          {
            element: <AuthenticatedLayout />,
            children: [
              {
                path: "/Home",
                element: <Paginas.HomePage />,
              },
              {
                path: "/Alimentacao",
                element: <Paginas.AlimentacaoPage />,
              },
              {
                path: "/Personal",
                element: <Paginas.PersonalPage />,
              },
              {
                path: "/Perfil",
                element: <Paginas.PerfilPage />,
              },
              {
                path: "/Treinos",
                element: <Paginas.TreinosPage />,
              },
              {
                path: "/Treinos/treinando",
                element: <Paginas.TreinandoPage />,
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
