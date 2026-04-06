import { PassagemPlantao } from "../types";
import { normalizeLeitoPassagem } from "./passagemLeitoMerge";
import { gerarPassagensDemonstracao } from "./seedDemoPassagens";
import { persistRegistroEIndicadores, rebuildRegistrosFromPassagens } from "./registrosPlantaoStore";

const STORAGE_KEY = "fisioplantao_passagens";
const STORAGE_VERSION = "v6";
const VERSION_KEY = "fisioplantao_passagens_version";

function normalizePassagemPlantao(p: PassagemPlantao): PassagemPlantao {
  return {
    ...p,
    leitos: (p.leitos ?? []).map((l) => normalizeLeitoPassagem(l)),
  };
}

export function getPassagens(): PassagemPlantao[] {
  try {
    const storedVersion = localStorage.getItem(VERSION_KEY);
    if (storedVersion !== STORAGE_VERSION) {
      const seeded = gerarPassagensDemonstracao().map(normalizePassagemPlantao);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      localStorage.setItem(VERSION_KEY, STORAGE_VERSION);
      rebuildRegistrosFromPassagens(seeded);
      return seeded;
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as PassagemPlantao[];
      return parsed.map(normalizePassagemPlantao);
    }
    const seeded = gerarPassagensDemonstracao().map(normalizePassagemPlantao);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    rebuildRegistrosFromPassagens(seeded);
    return seeded;
  } catch {
    const seeded = gerarPassagensDemonstracao().map(normalizePassagemPlantao);
    rebuildRegistrosFromPassagens(seeded);
    return seeded;
  }
}

export function savePassagens(passagens: PassagemPlantao[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(passagens));
  } catch {
    // ignore
  }
}

export function addPassagem(passagem: PassagemPlantao): PassagemPlantao[] {
  const normalizada = normalizePassagemPlantao(passagem);
  const passagens = getPassagens();
  const updated = [...passagens, normalizada];
  savePassagens(updated);
  persistRegistroEIndicadores(normalizada);
  return updated;
}

function mergePermitido(current: PassagemPlantao, updates: Partial<PassagemPlantao>): boolean {
  if (current.status === "rascunho") return true;

  if (current.status === "enviada") {
    const keys = Object.keys(updates) as (keyof PassagemPlantao)[];
    const permitidas = new Set<keyof PassagemPlantao>(["status", "validadoPor", "validadoEm"]);
    if (!keys.every((k) => permitidas.has(k))) return false;
    if (updates.status !== undefined && updates.status !== "validada") return false;
    return true;
  }

  if (current.status === "validada") {
    return Object.keys(updates).length === 0;
  }

  return true;
}

export function updatePassagem(
  id: string,
  updates: Partial<PassagemPlantao>
): PassagemPlantao[] {
  const passagens = getPassagens();
  const idx = passagens.findIndex((p) => p.id === id);
  if (idx === -1) return passagens;

  const current = passagens[idx];
  if (!mergePermitido(current, updates)) {
    return passagens;
  }

  const next = normalizePassagemPlantao({ ...current, ...updates });
  const updated = [...passagens];
  updated[idx] = next;
  savePassagens(updated);
  persistRegistroEIndicadores(next);
  return updated;
}

export function getPassagensByUTI(utiId: string): PassagemPlantao[] {
  return getPassagens()
    .filter((p) => p.utiId === utiId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Passagem mais recente do setor (qualquer status), para snapshot de leitos no dashboard. */
export function getSnapshotPassagem(utiId: string): PassagemPlantao | null {
  const lista = getPassagensByUTI(utiId);
  return lista[0] ?? null;
}

export function getUltimaPassagemEnviada(utiId: string): PassagemPlantao | null {
  const enviadas = getPassagens().filter(
    (p) => p.utiId === utiId && p.status !== "rascunho"
  );
  if (!enviadas.length) return null;
  return enviadas.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
}

/**
 * Substitui todas as passagens e reconstrói `registros_plantao` + indicadores diários (demo).
 * Destrutivo no localStorage; usar só com confirmação do utilizador (ex. admin).
 */
export function aplicarDadosDemonstracao(): PassagemPlantao[] {
  const seeded = gerarPassagensDemonstracao().map(normalizePassagemPlantao);
  savePassagens(seeded);
  try {
    localStorage.setItem(VERSION_KEY, STORAGE_VERSION);
  } catch {
    /* ignore */
  }
  rebuildRegistrosFromPassagens(seeded);
  return seeded;
}