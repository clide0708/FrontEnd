import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { Paginas } from "../pages";
import Header from "../components/Header";
import PageTransition from "../components/Loading";

const MainLayout = () => (
  <PageTransition>
    <Header />
    <Outlet />
  </PageTransition>
);

const routes = createBrowserRouter([
  {
    element: <MainLayout />,
    errorElement: <Paginas.TelaErro />,
    children: [
      { path: "/", element: <Paginas.LandingPage /> },
      { path: "/Home", element: <Paginas.HomePage /> },
      { path: "/Alimentacao", element: <Paginas.AlimentacaoPage /> },
      { path: "/Personal", element: <Paginas.PersonalPage /> },
      { path: "/Perfil", element: <Paginas.PerfilPage /> },
      { path: "/Treinos", element: <Paginas.TreinosPage /> },
      { path: "/Treinos/treinando", element: <Paginas.TreinandoPage /> },
      { path: "/manutencao", element: <Paginas.TelaEmManutencao /> },
      { path: "*", element: <Paginas.PaginaNaoEncontrada /> },
    ],
  },
]);

const AppRoutes = () => <RouterProvider router={routes} />;

export default AppRoutes;