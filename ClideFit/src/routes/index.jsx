// src/routes/index.tsx

import { createBrowserRouter, RouterProvider, Outlet, redirect } from "react-router-dom";
import { Paginas } from "../pages";
import { PrivateRoute, PublicRoute } from "../utils"; // Importa os utilitários de rota
import Header from "../components/Header"; // Importa o Header
import PageTransition from "../components/Loading"; // Importa o PageTransition

// Componente de layout para rotas autenticadas
const AuthenticatedLayout = () => (
    <PageTransition> {/* PageTransition envolve o conteúdo autenticado */}
        <Header />
        <Outlet /> {/* Renderiza o componente da rota aninhada */}
    </PageTransition>
);

const routes = createBrowserRouter([
    {
        element: <Outlet />, // Um Outlet para renderizar as rotas filhas
        errorElement: <Paginas.TelaErro />, // Página de erro global
        children: [
            {
                path: "*", // Catch-all para rotas não encontradas
                element: <Paginas.PaginaNaoEncontrada />,
            },
            {
                path: "/manutencao",
                element: <Paginas.TelaEmManutencao />,
            },
            {
                element: <PublicRoute />, // Rotas acessíveis apenas para não autenticados
                children: [
                    {
                        path: "/",
                        element: <Paginas.LandingPage />, // Sua LandingPage
                    },
                    // Se você tiver páginas de login/cadastro, adicione-as aqui
                    // {
                    //     path: "/login",
                    //     element: <Paginas.Auth.LoginPage />,
                    // },
                    // {
                    //     path: "/cadastro",
                    //     element: <Paginas.Auth.CadastroPage />,
                    // },
                ],
            },
            {
                element: <PrivateRoute />, // Rotas acessíveis apenas para autenticados
                children: [
                    {
                        path: "/", // Redireciona a raiz para /Home se autenticado
                        loader: async () => redirect("/Home"),
                    },
                    {
                        element: <AuthenticatedLayout />, // Layout com Header e PageTransition para rotas autenticadas
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
                            // Adicione outras rotas autenticadas aqui
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