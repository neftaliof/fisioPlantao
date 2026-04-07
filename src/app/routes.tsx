import { createBrowserRouter, Navigate } from "react-router";
import { AuthRoot } from "./components/AuthRoot";
import { Layout } from "./components/Layout";
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import { Fisioterapeutas } from "./components/Fisioterapeutas";
import { FormDadosPaciente } from "./components/FormDadosPaciente";
import { FormControleDiario } from "./components/FormControleDiario";
import { FormScmaFisFor001 } from "./components/FormScmaFisFor001";
import { FormBundlePav021 } from "./components/FormBundlePav021";
import { FormPagina4ColetaFisio } from "./components/FormPagina4ColetaFisio";
import { AdminCadastroMetas } from "./components/AdminCadastroMetas";
import { AvaliacaoReabilitacao } from "./components/AvaliacaoReabilitacao";
import { Plantoes } from "./components/Plantoes";
import { UTIs } from "./components/UTIs";
import { UTIDetalhe } from "./components/UTIDetalhe";
import { PassagemForm } from "./components/PassagemForm";
import { PassagemView } from "./components/PassagemView";
import { DashboardIndicadoresUti } from "./components/DashboardIndicadoresUti";
import { CadastroHub } from "./components/cadastro/CadastroHub";
import { CadastroLeitos } from "./components/cadastro/CadastroLeitos";

export const router = createBrowserRouter([
  {
    Component: AuthRoot,
    children: [
      { path: "/login", Component: Login },
      {
        path: "/",
        Component: Layout,
        children: [
          { index: true, Component: Dashboard },
          { path: "dashboard", Component: Dashboard },
          { path: "plantao/dados-leito", Component: FormDadosPaciente },
          { path: "cadastro", Component: CadastroHub },
          { path: "cadastro/pacientes", Component: FormPagina4ColetaFisio },
          { path: "cadastro/leitos", Component: CadastroLeitos },
          { path: "cadastro/fisioterapeutas", Component: Fisioterapeutas },
          { path: "indicadores-uti", Component: DashboardIndicadoresUti },
          { path: "fisioterapeutas", element: <Navigate to="/cadastro/fisioterapeutas" replace /> },
          {
            path: "formularios/dados-paciente",
            element: <Navigate to="/" replace />,
          },
          { path: "formularios/controle-diario", Component: FormControleDiario },
          { path: "formularios/evolucao", Component: FormScmaFisFor001 },
          { path: "formularios/bundle-pav", Component: FormBundlePav021 },
          {
            path: "formularios/pagina-4",
            element: <Navigate to="/cadastro/pacientes" replace />,
          },
          {
            path: "formularios/avaliacao-reabilitacao",
            Component: AvaliacaoReabilitacao,
          },
          { path: "admin/metas", Component: AdminCadastroMetas },
          {
            path: "formularios/folha-3",
            element: <Navigate to="/formularios/evolucao" replace />,
          },
          { path: "plantoes", Component: Plantoes },
          // UTIs e passagens
          { path: "utis", Component: UTIs },
          { path: "utis/:utiId", Component: UTIDetalhe },
          { path: "utis/:utiId/nova-passagem", Component: PassagemForm },
          { path: "utis/:utiId/passagem/:passagemId", Component: PassagemView },
          { path: "utis/:utiId/passagem/:passagemId/editar", Component: PassagemForm },
          { path: "*", element: <Navigate to="/" replace /> },
        ],
      },
    ],
  },
]);