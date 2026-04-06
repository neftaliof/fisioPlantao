import type { PassagemPlantao } from "../types";
import {
  calcularAgregadoPeriodo,
  type RegistoPlantaoNormalizado,
} from "../domain/indicadoresUti";
import { normalizeLeitoPassagem } from "./passagemLeitoMerge";

const REGISTROS_KEY = "fisioplantao_registros_plantao";
const DIARIOS_KEY = "fisioplantao_indicadores_diarios";

function pickIndicadoresLeito(p: PassagemPlantao["leitos"][number]) {
  const n = normalizeLeitoPassagem(p);
  return {
    numero: n.numero,
    vago: n.vago,
    pacienteEmVm: n.pacienteEmVm,
    tempoVmDias: n.tempoVmDias,
    extubado: n.extubado,
    extubacaoAcidental: n.extubacaoAcidental,
    reintubacao48h: n.reintubacao48h,
    delirium: n.delirium,
    mobilizado: n.mobilizado,
    pavConfirmado: n.pavConfirmado,
    bundleCabeceiraElevada: n.bundleCabeceiraElevada,
    bundleHigieneOral: n.bundleHigieneOral,
    bundleAspiracao: n.bundleAspiracao,
    bundleSedacaoControlada: n.bundleSedacaoControlada,
    altaHospitalar: n.altaHospitalar,
    saidaUti: n.saidaUti,
    evolucaoMelhora: n.evolucaoMelhora,
  };
}

export function passagemParaRegistroNormalizado(p: PassagemPlantao): RegistoPlantaoNormalizado {
  return {
    id: `reg-${p.id}`,
    passagemId: p.id,
    unidadeId: p.utiId,
    data: p.data,
    turno: p.turno,
    status: p.status,
    leitos: p.leitos.map(pickIndicadoresLeito),
  };
}

export function getRegistrosPlantao(): RegistoPlantaoNormalizado[] {
  try {
    const raw = localStorage.getItem(REGISTROS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RegistoPlantaoNormalizado[];
  } catch {
    return [];
  }
}

function saveRegistros(rows: RegistoPlantaoNormalizado[]) {
  try {
    localStorage.setItem(REGISTROS_KEY, JSON.stringify(rows));
  } catch {
    /* ignore */
  }
}

type IndicadoresDiarioRow = {
  data: string;
  unidadeId: string;
  agregados: ReturnType<typeof calcularAgregadoPeriodo>;
  atualizadoEm: string;
};

function diarioStorageKey(data: string, unidadeId: string) {
  return `${data}|${unidadeId}`;
}

export function getIndicadoresDiariosMap(): Record<string, IndicadoresDiarioRow> {
  try {
    const raw = localStorage.getItem(DIARIOS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, IndicadoresDiarioRow>;
  } catch {
    return {};
  }
}

function saveIndicadoresDiariosMap(m: Record<string, IndicadoresDiarioRow>) {
  try {
    localStorage.setItem(DIARIOS_KEY, JSON.stringify(m));
  } catch {
    /* ignore */
  }
}

export function recomputeIndicadoresDiarios(data: string, unidadeId: string): void {
  const registros = getRegistrosPlantao();
  const agregados = calcularAgregadoPeriodo(registros, {
    unidadeId,
    dataInicio: data,
    dataFim: data,
  });
  const map = getIndicadoresDiariosMap();
  map[diarioStorageKey(data, unidadeId)] = {
    data,
    unidadeId,
    agregados,
    atualizadoEm: new Date().toISOString(),
  };
  saveIndicadoresDiariosMap(map);
}

/** Upsert do registo normalizado e recálculo do agregado diário (Fase A localStorage). */
export function persistRegistroEIndicadores(passagem: PassagemPlantao): void {
  const row = passagemParaRegistroNormalizado(passagem);
  const lista = getRegistrosPlantao();
  const idx = lista.findIndex((r) => r.passagemId === row.passagemId);
  const next =
    idx === -1 ? [...lista, row] : lista.map((r, i) => (i === idx ? row : r));
  saveRegistros(next);
  recomputeIndicadoresDiarios(row.data, row.unidadeId);
}

/** Reconstrói registros e agregados diários a partir de todas as passagens (ex.: migração de versão). */
export function rebuildRegistrosFromPassagens(passagens: PassagemPlantao[]): void {
  const rows = passagens.map(passagemParaRegistroNormalizado);
  saveRegistros(rows);
  const seen = new Set<string>();
  const map: Record<string, IndicadoresDiarioRow> = {};
  const agora = new Date().toISOString();
  for (const r of rows) {
    const k = diarioStorageKey(r.data, r.unidadeId);
    if (seen.has(k)) continue;
    seen.add(k);
    map[k] = {
      data: r.data,
      unidadeId: r.unidadeId,
      agregados: calcularAgregadoPeriodo(rows, {
        unidadeId: r.unidadeId,
        dataInicio: r.data,
        dataFim: r.data,
      }),
      atualizadoEm: agora,
    };
  }
  saveIndicadoresDiariosMap(map);
}

export function listarSerieDiariaLocal(
  unidadeId: string,
  dataInicio: string,
  dataFim: string
): { data: string; agregados: ReturnType<typeof calcularAgregadoPeriodo> }[] {
  const map = getIndicadoresDiariosMap();
  const out: { data: string; agregados: ReturnType<typeof calcularAgregadoPeriodo> }[] = [];
  let cur = dataInicio;
  const end = dataFim;
  while (cur <= end) {
    const k = diarioStorageKey(cur, unidadeId);
    const row = map[k];
    if (row) {
      out.push({ data: cur, agregados: row.agregados });
    } else {
      const registros = getRegistrosPlantao();
      out.push({
        data: cur,
        agregados: calcularAgregadoPeriodo(registros, {
          unidadeId,
          dataInicio: cur,
          dataFim: cur,
        }),
      });
    }
    const d = new Date(cur + "T12:00:00");
    d.setDate(d.getDate() + 1);
    cur = d.toISOString().split("T")[0];
  }
  return out;
}
