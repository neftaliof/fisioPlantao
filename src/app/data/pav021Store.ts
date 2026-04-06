import type { BundlePav021, PavBundleBloco021, PavCompliance } from "../types";
import { MEDIDAS_PAV_BUNDLE, PAV_BLOCOS_POR_PAGINA } from "./pav021Constants";

const STORAGE_KEY = "fisioplantao_pav021_rascunho";
const VERSION_KEY = "fisioplantao_pav021_version";
const STORAGE_VERSION = "v1";

const emptyMedidas = (): PavCompliance[] =>
  MEDIDAS_PAV_BUNDLE.map(() => "");

function novoBloco(userNome: string, suffix: number): PavBundleBloco021 {
  return {
    id: `pav021-bloco-${suffix}-${Date.now()}`,
    medidas: emptyMedidas(),
    dataAplicacao: "",
    profissionalNome: userNome,
    turno: "",
  };
}

function emptyBundle(userId: string, userNome: string): BundlePav021 {
  const now = new Date().toISOString();
  return {
    id: `pav021-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
    preenchidoPorId: userId,
    preenchidoPorNome: userNome,
    paciente: "",
    leito: "",
    setor: "",
    blocos: Array.from({ length: PAV_BLOCOS_POR_PAGINA }, (_, i) =>
      novoBloco(userNome, i)
    ),
  };
}

function normalizarBloco(
  b: Partial<PavBundleBloco021> | undefined,
  userNome: string,
  idx: number
): PavBundleBloco021 {
  const base = novoBloco(userNome, idx);
  if (!b) return base;
  const med = Array.isArray(b.medidas) ? b.medidas : [];
  const medidas = MEDIDAS_PAV_BUNDLE.map(
    (_, i) => (med[i] === "C" || med[i] === "NC" || med[i] === "NA" ? med[i] : "") as PavCompliance
  );
  return {
    ...base,
    ...b,
    id: typeof b.id === "string" && b.id ? b.id : base.id,
    medidas,
    dataAplicacao: typeof b.dataAplicacao === "string" ? b.dataAplicacao : "",
    profissionalNome:
      typeof b.profissionalNome === "string" && b.profissionalNome
        ? b.profissionalNome
        : userNome,
    turno:
      b.turno === "Matutino" || b.turno === "Vespertino" || b.turno === "Noturno"
        ? b.turno
        : "",
  };
}

export function loadPav021Rascunho(): BundlePav021 | null {
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
    const parsed = JSON.parse(raw) as Partial<BundlePav021>;
    const uid = parsed.preenchidoPorId ?? "anon";
    const unome = parsed.preenchidoPorNome ?? "Usuário";
    const base = emptyBundle(uid, unome);
    const blocosRaw = Array.isArray(parsed.blocos) ? parsed.blocos : [];
    const blocos: PavBundleBloco021[] = [];
    for (let i = 0; i < PAV_BLOCOS_POR_PAGINA; i++) {
      blocos.push(normalizarBloco(blocosRaw[i], unome, i));
    }
    return {
      ...base,
      ...parsed,
      id: typeof parsed.id === "string" ? parsed.id : base.id,
      createdAt: typeof parsed.createdAt === "string" ? parsed.createdAt : base.createdAt,
      preenchidoPorId: uid,
      preenchidoPorNome: unome,
      paciente: typeof parsed.paciente === "string" ? parsed.paciente : "",
      leito: typeof parsed.leito === "string" ? parsed.leito : "",
      setor: typeof parsed.setor === "string" ? parsed.setor : "",
      blocos,
    };
  } catch {
    return null;
  }
}

export function savePav021Rascunho(data: BundlePav021): void {
  try {
    const next = { ...data, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    localStorage.setItem(VERSION_KEY, STORAGE_VERSION);
  } catch {
    /* ignore */
  }
}

export function clearPav021Rascunho(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function getOrCreatePav021Rascunho(
  userId: string,
  userNome: string
): BundlePav021 {
  const existing = loadPav021Rascunho();
  if (existing && existing.preenchidoPorId === userId) {
    return existing;
  }
  return emptyBundle(userId, userNome);
}

export { emptyBundle as emptyPav021Bundle };
