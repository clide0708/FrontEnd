// src/routes/pages.ts

// Este arquivo serve mais como um "índice" conceitual das suas páginas
// Os componentes reais são importados de `src/pages/index.ts`
// e usados em `src/routes/index.tsx`

export const RoutePages = {
    Auth: {
        LoginPage: "LoginPage",
        CadastroPage: "CadastroPage",
    },
    Plataforma: {
        ProjetosPage: {
            Projetos: "Projetos",
            DetalhesProjeto: "DetalhesProjeto",
            EditarProjeto: "EditarProjeto",
            CadastrarProjeto: {
                Etapas: {
                    CadastroGrupo: "CadastroGrupo",
                    CadastroIntegrantes: "CadastroIntegrantes",
                    CadastroProjeto: "CadastroProjeto",
                },
            },
        },
        EmpresasPage: {
            Empresas: "Empresas",
            DetalhesEmpresa: "DetalhesEmpresa",
            EditarEmpresa: "EditarEmpresa",
            ApoiarProjeto: "ApoiarProjeto",
        },
        Perfil: "Perfil",
        EditarPerfil: "EditarPerfil",
        Configuracoes: "Configuracoes",
    },
    LandingPage: "LandingPage",
    PaginaNaoEncontrada: "PaginaNaoEncontrada",
    TelaEmManutencao: "TelaEmManutencao",
    TelaErro: "TelaErro",
};