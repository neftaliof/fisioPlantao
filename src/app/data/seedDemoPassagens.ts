/**
 * Seed de passagens para demonstração e testes de indicadores.
 *
 * Intervalo: 1 de novembro até hoje (regra: nov = mês 10 em JS — se hoje for antes de nov,
 * usa 1/nov do ano anterior; senão 1/nov do ano atual).
 * Unidades: uti-01, uti-02. Turnos: manhã, tarde, noturno (uma passagem validada por combinação).
 * Migração do passagensStore regera estes dados ao subir STORAGE_VERSION.
 */
import type { LeitoPassagem, PassagemPlantao, TurnoPassagem } from "../types";
import { indicadoresLeitoVazio, normalizeLeitoPassagem } from "./passagemLeitoMerge";

/** Legado: número de dias do antigo demo (14). O gerador atual usa nov→hoje. */
export const DEMO_DIAS = 14;

const DEMO_UTIS = ["uti-01", "uti-02"] as const;

const TURNOS: TurnoPassagem[] = ["Diurno/Manhã", "Diurno/Tarde", "Noturno"];

const PLANTONISTAS = [
  { id: "katiuscia", nome: "Katiuscia" },
  { id: "helen", nome: "Helen Araújo" },
  { id: "bruna", nome: "Bruna Martins" },
  { id: "felipe", nome: "Felipe" },
  { id: "marissa", nome: "Marissa Campos" },
];

function addDays(iso: string, n: number): string {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

/** Primeiro dia do demo: 1 de novembro do ano “correto” face a `now`. */
export function getDataInicioDemonstracao(now: Date = new Date()): string {
  const y = now.getMonth() >= 10 ? now.getFullYear() : now.getFullYear() - 1;
  return `${y}-11-01`;
}

function listarDatasInclusive(inicio: string, fim: string): string[] {
  const out: string[] = [];
  let cur = inicio;
  while (cur <= fim) {
    out.push(cur);
    cur = addDays(cur, 1);
  }
  return out;
}

function slugTurn(t: TurnoPassagem): string {
  if (t === "Diurno/Manhã") return "manha";
  if (t === "Diurno/Tarde") return "tarde";
  return "noturno";
}

function mix(seed: number): number {
  return (Math.imul(seed, 1103515245) + 12345) >>> 0;
}

function hashLeito(data: string, utiId: string, turnIdx: number, numero: number): number {
  let h = mix(numero + turnIdx * 17 + utiId.length * 3);
  for (let i = 0; i < data.length; i++) h = mix(h + data.charCodeAt(i));
  for (let i = 0; i < utiId.length; i++) h = mix(h + utiId.charCodeAt(i));
  return h;
}

function leitoVago(n: number): LeitoPassagem {
  return normalizeLeitoPassagem({
    numero: n,
    vago: true,
    pacienteNome: "",
    dataAdmissao: "",
    diagnostico: "",
    comorbidades: "",
    historicoAdmissao: "",
    statusFuncional: "",
    cntQualiFisioDf: "",
    avaliacaoFuncional: "",
    reavaliacaoFuncional: "",
    tipoRespiracao: "",
    anamneseConduta: "",
    flags: [],
    ...indicadoresLeitoVazio,
  } as LeitoPassagem);
}

function leitoOcupado(
  n: number,
  data: string,
  utiId: string,
  turnIdx: number,
  spikeRecent: boolean
): LeitoPassagem {
  const hFull = hashLeito(data, utiId, turnIdx, n);
  const r = hFull % 1000;
  if (r % 10 < 2) {
    return leitoVago(n);
  }

  const pacienteEmVm = r % 100 < 40;
  const tipoRespiracao = pacienteEmVm
    ? r % 2 === 0
      ? "VM/TOT/VCV"
      : "VM/TOT/PSV"
    : r % 5 === 0
      ? "VNI"
      : r % 5 === 1
        ? "O2/CN"
        : "RE/AA";

  let extubado = false;
  let extubacaoAcidental = false;
  let reintubacao48h = false;
  if (pacienteEmVm && r % 5 === 0) {
    extubado = true;
    if (spikeRecent) {
      extubacaoAcidental = r % 4 === 0;
      reintubacao48h = r % 3 === 0;
    }
  }
  if (spikeRecent && !pacienteEmVm && n === 4 && r % 2 === 0) {
    extubado = true;
    reintubacao48h = true;
  }

  const mobilizado = pacienteEmVm ? r % 3 !== 0 : r % 2 === 0;
  const delirium = r % 12 === 0;
  const pavConfirmado = r % 7 === 0 || r % 7 === 2;
  const bundleLow = spikeRecent && utiId === "uti-01" && r % 9 === 0;

  const altaHospitalar = hFull % 19 === 0;
  const saidaUti = hFull % 16 === 1;
  const evolucaoMelhora = hFull % 13 === 2;

  return normalizeLeitoPassagem({
    numero: n,
    vago: false,
    pacienteNome: `Paciente demo · leito ${n}`,
    pacienteIdade: 35 + (r % 50),
    dataAdmissao: data.split("-").reverse().join("/"),
    diagnostico: "Caso demonstração",
    comorbidades: r % 4 === 0 ? "HAS" : "",
    historicoAdmissao: "",
    statusFuncional: "",
    cntQualiFisioDf: String(1 + (r % 8)),
    avaliacaoFuncional: "",
    reavaliacaoFuncional: "",
    tipoRespiracao,
    iot: pacienteEmVm ? "IOT demo" : "",
    parametrosVentilatorios: pacienteEmVm ? "VC/PS FR PEEP FiO2" : "",
    anamneseConduta: "Evolução e conduta de fisioterapia (dados de demonstração).",
    flags: [],
    ...indicadoresLeitoVazio,
    pacienteEmVm,
    tempoVmDias: pacienteEmVm ? 1 + ((r >> 2) % 10) : undefined,
    extubado,
    extubacaoAcidental,
    reintubacao48h,
    delirium,
    mobilizado,
    pavConfirmado,
    bundleCabeceiraElevada: bundleLow ? r % 2 === 0 : r % 4 !== 0,
    bundleHigieneOral: bundleLow ? false : r % 3 !== 0,
    bundleAspiracao: bundleLow ? r % 3 === 0 : true,
    bundleSedacaoControlada: bundleLow ? false : r % 5 !== 0,
    altaHospitalar,
    saidaUti,
    evolucaoMelhora,
  } as LeitoPassagem);
}

function buildLeitos(
  data: string,
  utiId: string,
  turnIdx: number,
  spikeRecent: boolean
): LeitoPassagem[] {
  return Array.from({ length: 10 }, (_, i) =>
    leitoOcupado(i + 1, data, utiId, turnIdx, spikeRecent)
  );
}

/**
 * Gera passagens validadas para UTI 01 e 02, três turnos por dia, de 1/nov até hoje (inclusivo).
 * Picos nos últimos 3 dias para alertas do dashboard.
 */
export function gerarPassagensDemonstracao(now: Date = new Date()): PassagemPlantao[] {
  const hoje = now.toISOString().split("T")[0];
  const inicio = getDataInicioDemonstracao(now);
  const datas = listarDatasInclusive(inicio, hoje);
  const last3 = new Set(datas.slice(-3));
  const out: PassagemPlantao[] = [];

  for (let dayIndex = 0; dayIndex < datas.length; dayIndex++) {
    const data = datas[dayIndex]!;
    const spike = last3.has(data);
    for (const utiId of DEMO_UTIS) {
      TURNOS.forEach((turno, turnIdx) => {
        const pi =
          (dayIndex + turnIdx + (utiId === "uti-02" ? 2 : 0)) % PLANTONISTAS.length;
        const p = PLANTONISTAS[pi];
        const hour = turnIdx === 0 ? 8 : turnIdx === 1 ? 15 : 22;
        out.push({
          id: `demo-${utiId}-${data}-${slugTurn(turno)}`,
          utiId,
          versao: 1,
          data,
          turno,
          fisioterapeutaId: p.id,
          fisioterapeutaNome: p.nome,
          preenchidoPorId: p.id,
          preenchidoPorNome: p.nome,
          status: "validada",
          validadoPor: "Coordenação demo",
          validadoEm: `${data}T${String(hour + 2).padStart(2, "0")}:30:00`,
          leitos: buildLeitos(data, utiId, turnIdx, spike),
          createdAt: `${data}T${String(hour).padStart(2, "0")}:00:00`,
          enviadaEm: `${data}T${String(hour + 1).padStart(2, "0")}:15:00`,
        });
      });
    }
  }
  return out;
}

/** Resumo do intervalo demo (útil para UI admin e documentação). */
export function getDemoPeriodoResumo(now: Date = new Date()): {
  dataFim: string;
  dataInicio: string;
  nota: string;
} {
  const hoje = now.toISOString().split("T")[0];
  const inicio = getDataInicioDemonstracao(now);
  const dias = listarDatasInclusive(inicio, hoje).length;
  const passagensAprox = dias * DEMO_UTIS.length * TURNOS.length;
  return {
    dataFim: hoje,
    dataInicio: inicio,
    nota: `Demonstração (sandbox): ${inicio} a ${hoje} (${dias} dias), UTI Adulto 01 e 02, três turnos/dia (~${passagensAprox} passagens). Inclui altas, saídas UTI e melhora mock para indicadores de gestão. Substitui passagens e indicadores no armazenamento local do navegador.`,
  };
}
