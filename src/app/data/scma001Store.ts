import type { AvaliacaoFisioterapia001 } from "../types";
import {
  emptyRegistoDiarioForms,
  mergeRegistoDiarioForms,
} from "./scma001RegistoDiario";

const STORAGE_KEY = "fisioplantao_scma001_rascunho";
const VERSION_KEY = "fisioplantao_scma001_version";
const STORAGE_VERSION = "v1";

function emptyAvaliacao(
  userId: string,
  userNome: string
): AvaliacaoFisioterapia001 {
  const now = new Date().toISOString();
  const hoje = now.split("T")[0];
  const hora = now.slice(11, 16);
  return {
    id: `scma001-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
    preenchidoPorId: userId,
    preenchidoPorNome: userNome,
    local: "",
    paciente: "",
    leito: "",
    folhaNumero: "",
    codigosProcedimento: [],
    turnoPlantao: "",
    setorAtuacao: "",
    atendimentosNoSetor: "",
    registoDiarioForms: emptyRegistoDiarioForms(),
    registoDiarioComplemento: "",
    data: hoje,
    hora,
    diagnostico: "",
    prioridade: "",
    atividadeMotora: [],
    tonus: [],
    nivelConsciencia: [],
    escalaGlasgow: "",
    escalaRass: "",
    padraoRespiratorio: [],
    auscultaInicial: "",
    auscultaFinal: "",
    diasVMI: "",
    fc: "",
    frp: "",
    spo2: "",
    ventilador: "",
    modoVentilador: "",
    vc: "",
    fluxo: "",
    fio2: "",
    peep: "",
    pc: "",
    ps: "",
    frVent: "",
    sens: "",
    ti: "",
    ie: "",
    cuff: "",
    tuboTipo: "",
    tuboNum: "",
    tuboAltura: "",
    tuboFixacao: "",
    venturiPct: "",
    venturiArL: "",
    venturiO2L: "",
    tendaIntermitente: "",
    cateterNasalO2: "",
    o2Lmin: "",
    balancoHidrico: "",
    vt: "",
    volIdeal: "",
    resistViasAereas: "",
    deltaP: "",
    frAjustada: "",
    tentativaPSV: "",
    tre: "",
    relacaoPF: "",
    condutaRespiratoria: [],
    peepTitulacao: "",
    secrecaoPulmonar: "",
    secrecaoCaracteristicas: [],
    condutaMotora: [],
    pacienteSentado: "",
    alongamento: [],
    exerciciosAtivos: [],
    observacoes: "",
  };
}

export function loadScma001Rascunho(): AvaliacaoFisioterapia001 | null {
  try {
    if (typeof localStorage === "undefined") return null;
    const ver = localStorage.getItem(VERSION_KEY);
    if (ver !== STORAGE_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(VERSION_KEY, STORAGE_VERSION);
      return null;
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AvaliacaoFisioterapia001>;
    const base = emptyAvaliacao(
      parsed.preenchidoPorId ?? "anon",
      parsed.preenchidoPorNome ?? "Usuário"
    );
    return {
      ...base,
      ...parsed,
      turnoPlantao: parsed.turnoPlantao ?? "",
      setorAtuacao: typeof parsed.setorAtuacao === "string" ? parsed.setorAtuacao : "",
      atendimentosNoSetor:
        typeof parsed.atendimentosNoSetor === "string" ? parsed.atendimentosNoSetor : "",
      registoDiarioComplemento:
        typeof parsed.registoDiarioComplemento === "string"
          ? parsed.registoDiarioComplemento
          : "",
      registoDiarioForms: mergeRegistoDiarioForms(parsed.registoDiarioForms),
      codigosProcedimento: Array.isArray(parsed.codigosProcedimento)
        ? parsed.codigosProcedimento
        : [],
    };
  } catch {
    return null;
  }
}

export function saveScma001Rascunho(data: AvaliacaoFisioterapia001): void {
  try {
    const next = { ...data, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    localStorage.setItem(VERSION_KEY, STORAGE_VERSION);
  } catch {
    /* ignore */
  }
}

export function clearScma001Rascunho(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function getOrCreateScma001Rascunho(
  userId: string,
  userNome: string
): AvaliacaoFisioterapia001 {
  const existing = loadScma001Rascunho();
  if (existing && existing.preenchidoPorId === userId) {
    return existing;
  }
  return emptyAvaliacao(userId, userNome);
}

export { emptyAvaliacao };
