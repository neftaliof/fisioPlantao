import type { IndicadoresLeitoPassagem, TurnoPassagem } from "../types";

export interface FiltroIndicadores {
  unidadeId?: string;
  dataInicio?: string;
  dataFim?: string;
  turno?: TurnoPassagem | null;
}

export interface RegistoPlantaoNormalizado {
  id: string;
  passagemId: string;
  unidadeId: string;
  data: string;
  turno: TurnoPassagem;
  status: string;
  leitos: IndicadoresLeitoPassagem[];
}

export interface IndicadoresAgregados {
  taxaExtubacaoAcidental: number | null;
  taxaMobilidade: number | null;
  tempoMedioVm: number | null;
  taxaFalhaExtubacao: number | null;
  taxaUsoVm: number | null;
  taxaPav: number | null;
  taxaDelirium: number | null;
  taxaConformidadeBundle: number | null;
  taxaAlta: number | null;
  taxaSaidaUti: number | null;
  taxaMelhora: number | null;
  contagem: {
    leitosOcupados: number;
    emVm: number;
    extubados: number;
    extubacaoAcidental: number;
    reintubacao48h: number;
    mobilizados: number;
    pavConfirmado: number;
    delirium: number;
    registosNoPeriodo: number;
    altaHospitalar: number;
    saidaUti: number;
    evolucaoMelhora: number;
  };
}

export const TURNOS_PASSAGEM: TurnoPassagem[] = [
  "Diurno/Manhã",
  "Diurno/Tarde",
  "Noturno",
];

function leitosOcupadosLista(leitos: IndicadoresLeitoPassagem[]) {
  return leitos.filter((l) => !l.vago);
}

const ratio = (num: number, den: number): number | null =>
  den === 0 ? null : num / den;

export function filtrarRegistrosIndicadores(
  registos: RegistoPlantaoNormalizado[],
  filtro: FiltroIndicadores
): RegistoPlantaoNormalizado[] {
  return registos.filter((r) => {
    if (filtro.unidadeId && r.unidadeId !== filtro.unidadeId) return false;
    if (filtro.turno && r.turno !== filtro.turno) return false;
    if (filtro.dataInicio && r.data < filtro.dataInicio) return false;
    if (filtro.dataFim && r.data > filtro.dataFim) return false;
    return true;
  });
}

/** Contagem de passagens (plantões) por mês calendário `YYYY-MM`, após o mesmo filtro dos indicadores. */
export function contarPlantoesPorMes(
  registos: RegistoPlantaoNormalizado[],
  filtro: FiltroIndicadores
): { mes: string; total: number }[] {
  const filtrados = filtrarRegistrosIndicadores(registos, filtro);
  const map = new Map<string, number>();
  for (const r of filtrados) {
    const mes = r.data.slice(0, 7);
    map.set(mes, (map.get(mes) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mes, total]) => ({ mes, total }));
}

/** Agrega KPIs a partir de registos já filtrados (evita re-filtrar). */
export function agregarIndicadoresRegistros(
  filtrados: RegistoPlantaoNormalizado[]
): IndicadoresAgregados {
  let leitosOcup = 0;
  let emVm = 0;
  let sumTempoVm = 0;
  let countTempoVm = 0;
  let extubados = 0;
  let extAcc = 0;
  let reintub = 0;
  let mobilizados = 0;
  let pav = 0;
  let delirium = 0;
  let sumBundleFrac = 0;
  let countBundleVm = 0;
  let altaHospitalar = 0;
  let saidaUti = 0;
  let evolucaoMelhora = 0;

  for (const r of filtrados) {
    for (const l of leitosOcupadosLista(r.leitos)) {
      leitosOcup++;
      if (l.pacienteEmVm) {
        emVm++;
        if (l.tempoVmDias !== undefined) {
          sumTempoVm += l.tempoVmDias;
          countTempoVm++;
        }
        const bundleHits =
          (l.bundleCabeceiraElevada ? 1 : 0) +
          (l.bundleHigieneOral ? 1 : 0) +
          (l.bundleAspiracao ? 1 : 0) +
          (l.bundleSedacaoControlada ? 1 : 0);
        sumBundleFrac += bundleHits / 4;
        countBundleVm++;
      }
      if (l.extubado) {
        extubados++;
        if (l.extubacaoAcidental) extAcc++;
      }
      if (l.reintubacao48h) reintub++;
      if (l.mobilizado) mobilizados++;
      if (l.pavConfirmado) pav++;
      if (l.delirium) delirium++;
      if (l.altaHospitalar) altaHospitalar++;
      if (l.saidaUti) saidaUti++;
      if (l.evolucaoMelhora) evolucaoMelhora++;
    }
  }

  return {
    taxaExtubacaoAcidental: ratio(extAcc, extubados),
    taxaMobilidade: ratio(mobilizados, leitosOcup),
    tempoMedioVm: countTempoVm === 0 ? null : sumTempoVm / countTempoVm,
    taxaFalhaExtubacao: ratio(reintub, extubados),
    taxaUsoVm: ratio(emVm, leitosOcup),
    taxaPav: ratio(pav, leitosOcup),
    taxaDelirium: ratio(delirium, leitosOcup),
    taxaConformidadeBundle:
      countBundleVm === 0 ? null : sumBundleFrac / countBundleVm,
    taxaAlta: ratio(altaHospitalar, leitosOcup),
    taxaSaidaUti: ratio(saidaUti, leitosOcup),
    taxaMelhora: ratio(evolucaoMelhora, leitosOcup),
    contagem: {
      leitosOcupados: leitosOcup,
      emVm,
      extubados,
      extubacaoAcidental: extAcc,
      reintubacao48h: reintub,
      mobilizados,
      pavConfirmado: pav,
      delirium,
      registosNoPeriodo: filtrados.length,
      altaHospitalar,
      saidaUti,
      evolucaoMelhora,
    },
  };
}

export function calcularAgregadoPeriodo(
  registos: RegistoPlantaoNormalizado[],
  filtro: FiltroIndicadores
): IndicadoresAgregados {
  const filtrados = filtrarRegistrosIndicadores(registos, filtro);
  return agregarIndicadoresRegistros(filtrados);
}

function addDaysIso(isoDate: string, days: number): string {
  const d = new Date(isoDate + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export function gerarSerieDiaria(
  registos: RegistoPlantaoNormalizado[],
  filtroBase: Omit<FiltroIndicadores, "dataInicio" | "dataFim"> & {
    dataInicio: string;
    dataFim: string;
  }
): { data: string; agregados: IndicadoresAgregados }[] {
  const { dataInicio, dataFim, ...rest } = filtroBase;
  const noParticaoDia = filtrarRegistrosIndicadores(registos, {
    ...rest,
    dataInicio,
    dataFim,
  });
  const porData = new Map<string, RegistoPlantaoNormalizado[]>();
  for (const r of noParticaoDia) {
    const lista = porData.get(r.data);
    if (lista) lista.push(r);
    else porData.set(r.data, [r]);
  }
  const out: { data: string; agregados: IndicadoresAgregados }[] = [];
  let cur = dataInicio;
  const end = dataFim;
  while (cur <= end) {
    out.push({
      data: cur,
      agregados: agregarIndicadoresRegistros(porData.get(cur) ?? []),
    });
    cur = addDaysIso(cur, 1);
  }
  return out;
}

export function agregarPorTurno(
  registos: RegistoPlantaoNormalizado[],
  baseFiltro: FiltroIndicadores
): { turno: TurnoPassagem; agregados: IndicadoresAgregados }[] {
  return TURNOS_PASSAGEM.map((turno) => ({
    turno,
    agregados: calcularAgregadoPeriodo(registos, { ...baseFiltro, turno }),
  }));
}

export type KpiVariant = "ok" | "alerta" | "critico";

export type DirecaoKpi = "menor_melhor" | "maior_melhor";

/** Limites em escala 0–1 (taxas). maior_melhor: ok ≥ okLimite; alerta ≥ alertaLimite. menor_melhor: ok ≤ okLimite; alerta ≤ alertaLimite. */
export function classificarKpi(
  valor: number | null,
  opts: { direcao: DirecaoKpi; okLimite: number; alertaLimite: number }
): KpiVariant {
  if (valor === null) return "ok";
  if (opts.direcao === "menor_melhor") {
    if (valor <= opts.okLimite) return "ok";
    if (valor <= opts.alertaLimite) return "alerta";
    return "critico";
  }
  if (valor >= opts.okLimite) return "ok";
  if (valor >= opts.alertaLimite) return "alerta";
  return "critico";
}

export interface AlertaIndicador {
  id: string;
  titulo: string;
  detalhe: string;
  severidade: KpiVariant;
}

export function gerarAlertasIndicadores(
  agregados48h: IndicadoresAgregados,
  agregadosRef: IndicadoresAgregados
): AlertaIndicador[] {
  const alertas: AlertaIndicador[] = [];

  const falha = agregados48h.taxaFalhaExtubacao;
  if (falha !== null && falha > 0.15) {
    alertas.push({
      id: "falha-extubacao",
      titulo: "Falha de extubação (48h)",
      detalhe: `Taxa ${(falha * 100).toFixed(1)}% acima do limiar de 15% no período recente.`,
      severidade: classificarKpi(falha, {
        direcao: "menor_melhor",
        okLimite: 0.1,
        alertaLimite: 0.15,
      }),
    });
  }

  const extAcc = agregados48h.taxaExtubacaoAcidental;
  if (extAcc !== null && extAcc > 0.08) {
    alertas.push({
      id: "extubacao-acidental",
      titulo: "Extubação acidental",
      detalhe: `Taxa ${(extAcc * 100).toFixed(1)}% sobre extubações documentadas.`,
      severidade: classificarKpi(extAcc, {
        direcao: "menor_melhor",
        okLimite: 0.05,
        alertaLimite: 0.08,
      }),
    });
  }

  const bundle = agregadosRef.taxaConformidadeBundle;
  if (bundle !== null && bundle < 0.75) {
    alertas.push({
      id: "bundle-vm",
      titulo: "Bundle VM (conformidade média)",
      detalhe: `Conformidade média do bundle em leitos em VM: ${(bundle * 100).toFixed(0)}%.`,
      severidade: classificarKpi(bundle, {
        direcao: "maior_melhor",
        okLimite: 0.85,
        alertaLimite: 0.75,
      }),
    });
  }

  return alertas;
}
