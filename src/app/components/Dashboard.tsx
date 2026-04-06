import { useMemo } from "react";
import { useNavigate } from "react-router";
import {
  Users,
  BedDouble,
  Activity,
  AlertTriangle,
  ArrowUpRight,
  ClipboardList,
  Stethoscope,
  Clock,
  MapPin,
  Plus,
  Target,
  Database,
} from "lucide-react";
import { mockControleDiario, mockUTIs } from "../store";
import { getFisioterapeutasLista } from "../data/fisioterapeutasCadastroStore";
import { UserAvatar } from "./UserAvatar";
import { useAuth } from "../context/AuthContext";
import { usePlantaoUti } from "../hooks/usePlantaoUti";
import { aplicarDadosDemonstracao, getSnapshotPassagem } from "../data/passagensStore";
import { getDemoPeriodoResumo } from "../data/seedDemoPassagens";
import { flagPainelDemoSeed } from "../integrations/featureFlags";
import type { StatusPassagem } from "../types";

const cards = [
  {
    label: "Fisioterapeutas Ativos",
    value: "4",
    icon: <Users size={20} className="text-teal-600" />,
    bg: "bg-teal-50",
    border: "border-teal-200",
    sub: "1 inativo",
  },
  {
    label: "Leitos Ocupados",
    value: "7 / 10",
    icon: <BedDouble size={20} className="text-blue-600" />,
    bg: "bg-blue-50",
    border: "border-blue-200",
    sub: "3 disponíveis",
  },
  {
    label: "Pacientes em VM",
    value: "3",
    icon: <Activity size={20} className="text-purple-600" />,
    bg: "bg-purple-50",
    border: "border-purple-200",
    sub: "Ventilação Mecânica",
  },
  {
    label: "Ocorrências Hoje",
    value: "2",
    icon: <AlertTriangle size={20} className="text-amber-600" />,
    bg: "bg-amber-50",
    border: "border-amber-200",
    sub: "Registradas hoje",
  },
];

const turnoColors: Record<string, string> = {
  Matutino: "bg-amber-100 text-amber-800",
  Vespertino: "bg-blue-100 text-blue-800",
  Noturno: "bg-indigo-100 text-indigo-800",
};

const turnoIcons: Record<string, string> = {
  Matutino: "🌅",
  Vespertino: "🌤️",
  Noturno: "🌙",
};

function labelStatusPassagem(status: StatusPassagem): string {
  if (status === "rascunho") return "Rascunho";
  if (status === "enviada") return "Aguardando validação";
  return "Validada";
}

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const cd = mockControleDiario[0];
  const ativos = getFisioterapeutasLista().filter((f) => f.status === "Ativo");

  const setoresPlantao = useMemo(() => {
    if (!user) return [];
    if (user.role === "fisioterapeuta") {
      return mockUTIs.filter((u) => user.setoresAcesso.includes(u.id));
    }
    if (user.role === "coordenador" && user.setoresAcesso.length > 1) {
      return mockUTIs.filter((u) => user.setoresAcesso.includes(u.id));
    }
    return [];
  }, [user]);

  const [plantaoUtiId, setPlantaoUtiId] = usePlantaoUti(user?.id, setoresPlantao);
  const mostrarBlocoPlantao = setoresPlantao.length > 0;

  const utiPlantao = useMemo(
    () => setoresPlantao.find((u) => u.id === plantaoUtiId) ?? setoresPlantao[0],
    [setoresPlantao, plantaoUtiId]
  );

  const snapshot = utiPlantao ? getSnapshotPassagem(utiPlantao.id) : null;
  const leitosOcupados = snapshot?.leitos.filter((l) => !l.vago) ?? [];
  const numVagos =
    snapshot && utiPlantao ? utiPlantao.totalLeitos - leitosOcupados.length : utiPlantao?.totalLeitos ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-slate-800">Visão Geral</h1>
        <p className="text-slate-500 text-sm mt-1">
          {mostrarBlocoPlantao && utiPlantao
            ? `${utiPlantao.nome} — Santa Casa de Anápolis`
            : "Santa Casa de Anápolis"}
        </p>
      </div>

      {user?.role === "admin" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <Target className="text-violet-700" size={20} />
                </div>
                <div>
                  <h2 className="text-slate-800 font-medium">Administração</h2>
                  <p className="text-xs text-slate-500 mt-1 max-w-xl">
                    Cadastre as seis metas terapêuticas institucionais (texto e prazo). A equipe consulta
                    em <span className="text-slate-700 font-medium">Formulários → Avaliação de reabilitação</span>, sem
                    editar.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate("/admin/metas")}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors whitespace-nowrap"
              >
                <Target size={16} />
                Cadastrar metas terapêuticas
              </button>
            </div>
          </div>

          {flagPainelDemoSeed() && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Database className="text-slate-600" size={20} />
                  </div>
                  <div>
                    <h2 className="text-slate-800 font-medium">Dados de demonstração</h2>
                    <p className="text-xs text-slate-500 mt-1 max-w-xl">
                      {getDemoPeriodoResumo().nota} Útil para preencher o{" "}
                      <span className="text-slate-700 font-medium">Indicadores UTI</span> com tendências e alertas de
                      teste. Ação irreversível no armazenamento local deste navegador.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const { nota } = getDemoPeriodoResumo();
                    if (
                      !window.confirm(
                        `${nota}\n\nIsto substitui todas as passagens e indicadores guardados neste navegador. Continuar?`
                      )
                    ) {
                      return;
                    }
                    aplicarDadosDemonstracao();
                    window.alert(
                      "Dados de demonstração carregados. Abra Indicadores UTI com o período de 1 de novembro até hoje (ou use as datas por omissão do painel) para ver tendências e KPIs de gestão."
                    );
                  }}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 text-sm font-medium hover:bg-slate-100 transition-colors whitespace-nowrap"
                >
                  <Database size={16} />
                  Carregar dados de demonstração
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {mostrarBlocoPlantao && utiPlantao && (
        <div className="rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50/80 to-white p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-teal-800">
                <MapPin size={18} className="text-teal-600" />
                <h2 className="text-slate-800 text-base font-medium">Plantão neste setor</h2>
              </div>
              <p className="text-xs text-slate-500">
                Escolha a UTI em que você está trabalhando agora para ver os pacientes registrados na última
                passagem.
              </p>
            </div>
            <label className="flex flex-col gap-1 min-w-[min(100%,220px)]">
              <span className="text-xs font-medium text-slate-600">UTI de plantão</span>
              <select
                value={plantaoUtiId}
                onChange={(e) => setPlantaoUtiId(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                {setoresPlantao.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nomeAbrev} — {u.nome}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {snapshot ? (
            <div className="bg-white/90 rounded-lg border border-slate-100 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-slate-500">
                  Base: passagem de{" "}
                  <span className="font-medium text-slate-700">
                    {new Date(snapshot.data + "T00:00:00").toLocaleDateString("pt-BR")}
                  </span>
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full font-medium ${
                    snapshot.status === "validada"
                      ? "bg-emerald-100 text-emerald-800"
                      : snapshot.status === "enviada"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {labelStatusPassagem(snapshot.status)}
                </span>
              </div>

              {leitosOcupados.length === 0 ? (
                <p className="text-sm text-slate-500 py-2">Nenhum paciente ocupando leito neste snapshot.</p>
              ) : (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {leitosOcupados.map((l) => (
                    <li
                      key={l.numero}
                      className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50/80"
                    >
                      <span className="flex-shrink-0 w-8 h-8 rounded-md bg-teal-600 text-white text-xs font-bold flex items-center justify-center">
                        {l.numero < 10 ? `0${l.numero}` : l.numero}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-800 truncate">{l.pacienteNome || "—"}</p>
                        {l.tipoRespiracao ? (
                          <p className="text-xs text-slate-500 mt-0.5">{l.tipoRespiracao}</p>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-xs text-slate-400 pt-1 border-t border-slate-100">
                {numVagos} leito{numVagos !== 1 ? "s" : ""} vago{numVagos !== 1 ? "s" : ""} de{" "}
                {utiPlantao.totalLeitos}
              </p>
            </div>
          ) : (
            <div className="bg-white/90 rounded-lg border border-dashed border-slate-200 p-6 text-center space-y-3">
              <BedDouble size={28} className="mx-auto text-slate-300" />
              <p className="text-sm text-slate-600">Ainda não há passagem registrada nesta UTI.</p>
              <button
                type="button"
                onClick={() => navigate(`/utis/${utiPlantao.id}/nova-passagem`)}
                className="inline-flex items-center gap-2 text-sm font-medium text-teal-700 hover:text-teal-900"
              >
                <Plus size={16} />
                Criar primeira passagem
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate(`/utis/${utiPlantao.id}`)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white text-sm hover:bg-teal-700 transition-colors"
            >
              <ClipboardList size={16} />
              Passagem de plantão nesta UTI
            </button>
            <button
              type="button"
              onClick={() => navigate(`/utis/${utiPlantao.id}/nova-passagem`)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm hover:bg-slate-50 transition-colors"
            >
              <Plus size={16} />
              Nova passagem
            </button>
          </div>
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`rounded-xl border ${card.border} ${card.bg} p-4 flex flex-col gap-3`}
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm">
                {card.icon}
              </div>
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-800">{card.value}</p>
              <p className="text-sm text-slate-600 mt-0.5">{card.label}</p>
              <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Ações rápidas */}
      <div>
        <h2 className="text-slate-700 mb-3">Ações Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-4 bg-white rounded-xl border border-slate-200 p-4 hover:border-teal-400 hover:shadow-md transition-all text-left group"
          >
            <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center group-hover:bg-teal-100 transition-colors">
              <Stethoscope size={20} className="text-teal-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-800">Dados do Paciente</p>
              <p className="text-xs text-slate-400">Registrar sinais vitais por leito</p>
            </div>
            <ArrowUpRight size={16} className="text-slate-400 group-hover:text-teal-500 transition-colors" />
          </button>

          <button
            onClick={() => navigate("/formularios/controle-diario")}
            className="flex items-center gap-4 bg-white rounded-xl border border-slate-200 p-4 hover:border-teal-400 hover:shadow-md transition-all text-left group"
          >
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <ClipboardList size={20} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-800">Controle Diário UTI</p>
              <p className="text-xs text-slate-400">SCMA.FIS.FOR.008</p>
            </div>
            <ArrowUpRight size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
          </button>
        </div>
      </div>

      {/* Turnos do dia + Ocorrências */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Plantonistas */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-700">Plantonistas de Hoje</h2>
            <Clock size={16} className="text-slate-400" />
          </div>
          <div className="space-y-3">
            {[
              {
                turno: "Matutino",
                dados: cd.plantonistas.matutino,
                hora: "07:00 – 13:00",
              },
              {
                turno: "Vespertino",
                dados: cd.plantonistas.vespertino,
                hora: "13:00 – 19:00",
              },
              {
                turno: "Noturno",
                dados: cd.plantonistas.noturno,
                hora: "19:00 – 07:00",
              },
            ].map(({ turno, dados, hora }) => (
              <div
                key={turno}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50"
              >
                <span className="text-lg">{turnoIcons[turno]}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${turnoColors[turno]}`}
                    >
                      {turno}
                    </span>
                    <span className="text-xs text-slate-400">{hora}</span>
                  </div>
                  <p className="text-sm text-slate-700 mt-1 truncate">{dados.nome}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-slate-800">{dados.atendimentos}</p>
                  <p className="text-xs text-slate-400">atend.</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between text-sm">
            <div className="text-slate-500">
              Transferências: <span className="font-medium text-slate-700">{cd.transferencias}</span>
            </div>
            <div className="text-slate-500">
              Óbitos: <span className="font-medium text-slate-700">{cd.obitos}</span>
            </div>
          </div>
        </div>

        {/* Ocorrências */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-700">Ocorrências do Dia</h2>
            <AlertTriangle size={16} className="text-amber-500" />
          </div>
          {cd.ocorrencias.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-slate-400">
              <AlertTriangle size={28} className="mb-2 opacity-30" />
              <p className="text-sm">Nenhuma ocorrência registrada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cd.ocorrencias.map((oc, i) => (
                <div
                  key={i}
                  className="flex gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <BedDouble size={14} className="text-amber-700" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-amber-800">
                        Leito {oc.leito}
                      </span>
                      <span className="text-xs text-slate-400">{oc.hora}</span>
                    </div>
                    <p className="text-sm text-slate-700 mt-0.5">{oc.ocorrido}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fisioterapeutas ativos */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-slate-700">Equipe Ativa</h2>
          <button
            onClick={() => navigate("/cadastro/fisioterapeutas")}
            className="text-xs text-teal-600 hover:underline flex items-center gap-1"
          >
            Ver todos <ArrowUpRight size={12} />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
          {ativos.map((f) => (
            <div
              key={f.id}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-50 text-center"
            >
              <div className="relative">
                <UserAvatar
                  nome={f.nome}
                  foto={f.foto}
                  userId={f.id}
                  size="tile"
                  imgClassName="border-2 border-white shadow-sm"
                  className="border-2 border-white shadow-sm"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white" />
              </div>
              <div className="min-w-0 w-full">
                <p className="text-xs text-slate-800 truncate font-medium">{f.nome.split(" ")[0]}</p>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${turnoColors[f.turno]}`}>
                  {turnoIcons[f.turno]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}