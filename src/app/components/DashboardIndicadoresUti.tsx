import { useMemo, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router";
import { BarChart3, RefreshCw } from "lucide-react";
import { mockUTIs } from "../store";
import { useAuth } from "../context/AuthContext";
import { getRegistrosPlantao } from "../data/registrosPlantaoStore";
import { getDataInicioDemonstracao } from "../data/seedDemoPassagens";
import {
  calcularAgregadoPeriodo,
  contarPlantoesPorMes,
  gerarSerieDiaria,
  agregarPorTurno,
  gerarAlertasIndicadores,
  classificarKpi,
} from "../domain/indicadoresUti";
import { solicitarInsightsOllama } from "../integrations/ollamaClient";
import { flagOllamaInsights } from "../integrations/featureFlags";
import { KpiCard } from "./dashboard-uti/KpiCard";
import { TrendChart, type PontoSerie } from "./dashboard-uti/TrendChart";
import { ComparisonChart, type BarraTurno } from "./dashboard-uti/ComparisonChart";
import { AlertPanel } from "./dashboard-uti/AlertPanel";
import type { TurnoPassagem } from "../types";

function subDaysIso(iso: string, days: number): string {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
}

function fmtPct(v: number | null): string {
  if (v === null) return "—";
  return `${(v * 100).toFixed(1)}%`;
}

function fmtMesPt(mes: string): string {
  const [y, m] = mes.split("-").map(Number);
  if (!y || !m) return mes;
  return new Date(y, m - 1, 1).toLocaleDateString("pt-PT", {
    month: "short",
    year: "numeric",
  });
}

export function DashboardIndicadoresUti() {
  const { user, temAcesso } = useAuth();
  const [search, setSearch] = useSearchParams();
  const [tick, setTick] = useState(0);
  const [insightMd, setInsightMd] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightErro, setInsightErro] = useState<string | null>(null);

  const hoje = new Date().toISOString().split("T")[0];
  const perfil = user?.role;
  const defaultInicio =
    perfil === "admin" || perfil === "coordenador" || perfil === "admin_setor"
      ? getDataInicioDemonstracao()
      : subDaysIso(hoje, 13);

  const utiId = search.get("uti") ?? "";
  const dataInicio = search.get("de") ?? defaultInicio;
  const dataFim = search.get("ate") ?? hoje;
  const turnoParam = search.get("turno") as TurnoPassagem | "" | null;
  const turnoFiltro: TurnoPassagem | null =
    turnoParam === "Diurno/Manhã" || turnoParam === "Diurno/Tarde" || turnoParam === "Noturno"
      ? turnoParam
      : null;

  const setFiltro = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(search);
      for (const [k, v] of Object.entries(patch)) {
        if (v === null || v === "") next.delete(k);
        else next.set(k, v);
      }
      setSearch(next, { replace: true });
    },
    [search, setSearch]
  );

  const utisPermitidas = useMemo(() => {
    if (!user) return [];
    if (user.role === "admin") return mockUTIs.filter((u) => u.tipo === "uti");
    return mockUTIs.filter((u) => u.tipo === "uti" && temAcesso(u.id));
  }, [user, temAcesso]);

  const utiEfetiva = utiId || utisPermitidas[0]?.id || "";

  const registros = useMemo(() => {
    void tick;
    return getRegistrosPlantao();
  }, [tick]);

  const agregados = useMemo(
    () =>
      calcularAgregadoPeriodo(registros, {
        unidadeId: utiEfetiva || undefined,
        dataInicio,
        dataFim,
        turno: turnoFiltro,
      }),
    [registros, utiEfetiva, dataInicio, dataFim, turnoFiltro]
  );

  const agregados48h = useMemo(
    () =>
      calcularAgregadoPeriodo(registros, {
        unidadeId: utiEfetiva || undefined,
        dataInicio: subDaysIso(dataFim, 2),
        dataFim,
        turno: turnoFiltro,
      }),
    [registros, utiEfetiva, dataFim, turnoFiltro]
  );

  const alertas = useMemo(
    () => gerarAlertasIndicadores(agregados48h, agregados),
    [agregados48h, agregados]
  );

  const serie: PontoSerie[] = useMemo(() => {
    return gerarSerieDiaria(registros, {
      unidadeId: utiEfetiva || undefined,
      dataInicio,
      dataFim,
      turno: turnoFiltro,
    }).map((p) => ({
      data: p.data,
      taxaUsoVm: p.agregados.taxaUsoVm,
      taxaMobilidade: p.agregados.taxaMobilidade,
    }));
  }, [registros, utiEfetiva, dataInicio, dataFim, turnoFiltro]);

  const barrasTurno: BarraTurno[] = useMemo(() => {
    return agregarPorTurno(registros, {
      unidadeId: utiEfetiva || undefined,
      dataInicio,
      dataFim,
    }).map((x) => ({
      turno: x.turno,
      usoVmPct: x.agregados.taxaUsoVm,
      mobilPct: x.agregados.taxaMobilidade,
    }));
  }, [registros, utiEfetiva, dataInicio, dataFim]);

  const plantoesPorMes = useMemo(
    () =>
      contarPlantoesPorMes(registros, {
        unidadeId: utiEfetiva || undefined,
        dataInicio,
        dataFim,
        turno: turnoFiltro,
      }),
    [registros, utiEfetiva, dataInicio, dataFim, turnoFiltro]
  );

  const mostrarComparacaoTurno =
    perfil === "admin" || perfil === "coordenador" || perfil === "admin_setor";
  const mostrarOllama =
    (perfil === "admin" || perfil === "coordenador") && flagOllamaInsights();

  const kpiUsoVm = classificarKpi(agregados.taxaUsoVm, {
    direcao: "menor_melhor",
    okLimite: 0.35,
    alertaLimite: 0.5,
  });
  const kpiMob = classificarKpi(agregados.taxaMobilidade, {
    direcao: "maior_melhor",
    okLimite: 0.5,
    alertaLimite: 0.35,
  });
  const kpiPav = classificarKpi(agregados.taxaPav, {
    direcao: "maior_melhor",
    okLimite: 0.4,
    alertaLimite: 0.25,
  });
  const kpiDel = classificarKpi(agregados.taxaDelirium, {
    direcao: "menor_melhor",
    okLimite: 0.15,
    alertaLimite: 0.25,
  });

  const handleInsights = async () => {
    setInsightErro(null);
    setInsightLoading(true);
    const res = await solicitarInsightsOllama({
      periodoLabel: `${dataInicio} → ${dataFim}`,
      agregados,
      alertasTexto: alertas.map((a) => a.detalhe),
    });
    setInsightLoading(false);
    if (res.ok) setInsightMd(res.markdown);
    else {
      setInsightMd(null);
      setInsightErro(res.erro);
    }
  };

  if (!user) return null;

  if (!utisPermitidas.length) {
    return (
      <div className="text-slate-600 text-sm p-8">
        Não há UTIs associadas ao seu perfil para indicadores.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-800">
            <BarChart3 className="text-violet-600" size={22} />
            <h1 className="text-lg font-semibold">Indicadores UTI</h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Derivados de passagens estruturadas (VM, bundle, PAV, mobilidade). Perfil:{" "}
            <span className="text-slate-700">{perfil}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => setTick((t) => t + 1)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50"
        >
          <RefreshCw size={14} />
          Atualizar dados
        </button>
      </div>

      <div className="flex flex-wrap gap-3 items-end bg-white rounded-xl border border-slate-200 p-4">
        <div>
          <label className="block text-[11px] text-slate-500 mb-1">Unidade</label>
          <select
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm min-w-[200px]"
            value={utiEfetiva}
            onChange={(e) => setFiltro({ uti: e.target.value })}
          >
            {utisPermitidas.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] text-slate-500 mb-1">De</label>
          <input
            type="date"
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
            value={dataInicio}
            onChange={(e) => setFiltro({ de: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-[11px] text-slate-500 mb-1">Até</label>
          <input
            type="date"
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
            value={dataFim}
            onChange={(e) => setFiltro({ ate: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-[11px] text-slate-500 mb-1">Turno</label>
          <select
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
            value={turnoFiltro ?? ""}
            onChange={(e) =>
              setFiltro({ turno: e.target.value === "" ? null : e.target.value })
            }
          >
            <option value="">Todos</option>
            <option value="Diurno/Manhã">Manhã</option>
            <option value="Diurno/Tarde">Tarde</option>
            <option value="Noturno">Noturno</option>
          </select>
        </div>
        <Link
          to="/utis"
          className="text-sm text-teal-600 hover:text-teal-800 ml-auto self-center"
        >
          Ir para passagens →
        </Link>
      </div>

      {perfil === "fisioterapeuta" && (
        <p className="text-xs text-slate-500 bg-teal-50 border border-teal-100 rounded-lg px-3 py-2">
          Visão resumida da sua UTI — sem comparações sensíveis entre profissionais.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          titulo="Uso de VM"
          valor={fmtPct(agregados.taxaUsoVm)}
          subtitulo={`${agregados.contagem.emVm} leitos em VM / ${agregados.contagem.leitosOcupados} ocupados`}
          variant={kpiUsoVm}
        />
        <KpiCard
          titulo="Mobilidade"
          valor={fmtPct(agregados.taxaMobilidade)}
          subtitulo="Leitos ocupados com mobilização registrada"
          variant={kpiMob}
        />
        {(perfil !== "fisioterapeuta" || agregados.contagem.registosNoPeriodo > 0) && (
          <KpiCard
            titulo="PAV confirmado"
            valor={fmtPct(agregados.taxaPav)}
            subtitulo="Proporção sobre leitos ocupados"
            variant={kpiPav}
          />
        )}
        <KpiCard
          titulo="Delirium"
          valor={fmtPct(agregados.taxaDelirium)}
          subtitulo="Rastreio positivo / ocupados"
          variant={kpiDel}
        />
      </div>

      {(perfil !== "fisioterapeuta" || agregados.taxaConformidadeBundle !== null) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <KpiCard
            titulo="Tempo médio em VM"
            valor={
              agregados.tempoMedioVm != null
                ? `${agregados.tempoMedioVm.toFixed(1)} d`
                : "—"
            }
            subtitulo="Média nos leitos com VM e dias informados"
            variant="ok"
          />
          <KpiCard
            titulo="Extubação acidental"
            valor={fmtPct(agregados.taxaExtubacaoAcidental)}
            subtitulo="Sobre extubações documentadas"
            variant={classificarKpi(agregados.taxaExtubacaoAcidental, {
              direcao: "menor_melhor",
              okLimite: 0.05,
              alertaLimite: 0.08,
            })}
          />
          <KpiCard
            titulo="Bundle VM (média)"
            valor={fmtPct(agregados.taxaConformidadeBundle)}
            subtitulo="Conformidade média nos leitos em VM"
            variant={classificarKpi(agregados.taxaConformidadeBundle, {
              direcao: "maior_melhor",
              okLimite: 0.85,
              alertaLimite: 0.75,
            })}
          />
        </div>
      )}

      {mostrarComparacaoTurno && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-800">
            Indicadores de gestão (sandbox)
          </h3>
          <p className="text-xs text-slate-500">
            Altas hospitalares, saídas da UTI e melhora documentada vêm de campos mock nas passagens de demonstração.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiCard
              titulo="Plantões no período"
              valor={String(agregados.contagem.registosNoPeriodo)}
              subtitulo="Passagens validadas (registos) no filtro atual"
              variant="ok"
            />
            <KpiCard
              titulo="Altas hospitalares"
              valor={`${agregados.contagem.altaHospitalar} · ${fmtPct(agregados.taxaAlta)}`}
              subtitulo="Sobre leitos ocupados no período"
              variant={classificarKpi(agregados.taxaAlta, {
                direcao: "maior_melhor",
                okLimite: 0.06,
                alertaLimite: 0.03,
              })}
            />
            <KpiCard
              titulo="Saídas da UTI"
              valor={`${agregados.contagem.saidaUti} · ${fmtPct(agregados.taxaSaidaUti)}`}
              subtitulo="Transferência para outro setor (mock)"
              variant={classificarKpi(agregados.taxaSaidaUti, {
                direcao: "maior_melhor",
                okLimite: 0.08,
                alertaLimite: 0.04,
              })}
            />
            <KpiCard
              titulo="Melhora documentada"
              valor={`${agregados.contagem.evolucaoMelhora} · ${fmtPct(agregados.taxaMelhora)}`}
              subtitulo="Evolução favorável registada"
              variant={classificarKpi(agregados.taxaMelhora, {
                direcao: "maior_melhor",
                okLimite: 0.1,
                alertaLimite: 0.05,
              })}
            />
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm overflow-x-auto">
            <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2">
              Plantões por mês
            </p>
            {plantoesPorMes.length === 0 ? (
              <p className="text-sm text-slate-500">Sem registos no período filtrado.</p>
            ) : (
              <table className="w-full text-sm text-slate-700">
                <tbody>
                  {plantoesPorMes.map((row) => (
                    <tr key={row.mes} className="border-t border-slate-100 first:border-t-0">
                      <td className="py-1.5 pr-4">{fmtMesPt(row.mes)}</td>
                      <td className="py-1.5 text-right tabular-nums font-medium">{row.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      <TrendChart titulo="Tendência diária (uso VM e mobilidade)" pontos={serie} />

      {mostrarComparacaoTurno && (
        <ComparisonChart
          titulo="Comparativo por turno (período filtrado, todos os turnos)"
          barras={barrasTurno}
        />
      )}

      <AlertPanel alertas={alertas} />

      {mostrarOllama && (
        <div className="rounded-xl border border-violet-200 bg-violet-50/40 p-4 space-y-3">
          <details className="group rounded-lg border border-violet-100 bg-white/60 text-xs text-slate-700 open:bg-white/85">
            <summary className="cursor-pointer list-none px-3 py-2 font-medium text-violet-900 select-none [&::-webkit-details-marker]:hidden flex items-center gap-2">
              <span className="text-violet-600 group-open:rotate-90 transition-transform inline-block">
                ›
              </span>
              Sobre os insights (IA)
            </summary>
            <div className="px-3 pb-3 pt-0 space-y-2 leading-relaxed border-t border-violet-100/80">
              <p>
                Esta função pede ao modelo de linguagem um <strong>resumo em texto</strong> dos indicadores
                e alertas <strong>já calculados neste painel</strong> para o período e filtros que escolheu.
                Serve para poupar tempo na leitura; <strong>não substitui</strong> critérios clínicos,
                protocolos da instituição nem decisão da equipa.
              </p>
              <p>
                O sistema envia apenas agregados numéricos e mensagens de alerta já existentes; o pedido ao
                modelo instrui a <strong>não inventar números</strong>. Mesmo assim, o texto é gerado
                automaticamente: <strong>valide sempre</strong> com os valores dos cartões e gráficos
                acima.
              </p>
              <p className="text-slate-600">
                Requisitos técnicos: serviço Ollama (ou proxy) acessível a partir do browser, URL em{" "}
                <code className="text-[11px] bg-violet-100/80 px-1 rounded">VITE_OLLAMA_URL</code>, e
                funcionalidade ativa com{" "}
                <code className="text-[11px] bg-violet-100/80 px-1 rounded">VITE_FEATURE_OLLAMA_INSIGHTS=true</code>
                .
              </p>
            </div>
          </details>
          <div className="flex flex-wrap items-center gap-2 justify-between">
            <h3 className="text-sm font-medium text-violet-900">Insights (Ollama)</h3>
            <button
              type="button"
              disabled={insightLoading}
              onClick={handleInsights}
              className="px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs hover:bg-violet-700 disabled:opacity-50"
            >
              {insightLoading ? "A gerar…" : "Gerar insights"}
            </button>
          </div>
          {insightErro && <p className="text-xs text-red-700">{insightErro}</p>}
          {insightMd && (
            <div className="prose prose-sm max-w-none text-slate-800 whitespace-pre-wrap bg-white/80 rounded-lg p-3 border border-violet-100">
              {insightMd}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
