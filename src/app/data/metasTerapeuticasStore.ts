import type {
  MetaTerapeuticaInstitucional,
  MetasTerapeuticasCadastroGlobal,
} from "../types";

const STORAGE_KEY = "fisioplantao_metas_terapeuticas_global";
const VERSION_KEY = "fisioplantao_metas_terapeuticas_version";
/** v2: dados iniciais de exemplo (Dolores) quando não há rascunho guardado */
const STORAGE_VERSION = "v2";

/** Metas de exemplo — cadastro institucional simulado pela administração (Dolores) */
export const METAS_PADRAO_SEED: MetaTerapeuticaInstitucional[] = [
  {
    texto:
      "Recuperar força muscular em MMII para transferência ativa da cama para a cadeira com assistência mínima.",
    ateData: "2026-05-20",
  },
  {
    texto:
      "Manter SpO₂ ≥ 92% em sedestação, com suporte de oxigenoterapia conforme prescrição médica.",
    ateData: "2026-05-30",
  },
  {
    texto:
      "Melhorar expansibilidade torácica e ausculta em bases pulmonares com higiene brônquica assistida.",
    ateData: "2026-06-05",
  },
  {
    texto:
      "Realizar marcha estacionária com auxílio, com tolerância hemodinâmica e sem desconforto importante.",
    ateData: "2026-06-12",
  },
  {
    texto:
      "Tolerar cabeceira elevada entre 30° e 45° por períodos progressivos, sem fadiga respiratória significativa.",
    ateData: "2026-06-18",
  },
  {
    texto:
      "Utilizar espirômetro incentivador conforme metas de volume e frequência definidas pelo plano respiratório.",
    ateData: "2026-06-25",
  },
];

function configMetasIniciaisDolores(): MetasTerapeuticasCadastroGlobal {
  const now = new Date().toISOString();
  return {
    updatedAt: now,
    ultimaRevalidacaoMetas: now,
    atualizadoPorId: "dolores",
    atualizadoPorNome: "Dolores",
    metas: normalizarMetas(METAS_PADRAO_SEED),
  };
}

function gravarMetasNoArmazenamento(cfg: MetasTerapeuticasCadastroGlobal): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
    localStorage.setItem(VERSION_KEY, STORAGE_VERSION);
    window.dispatchEvent(new Event("fisioplantao-metas-updated"));
  } catch {
    /* ignore */
  }
}

export const NUM_METAS_INSTITUCIONAIS = 6;

function emptyItem(): MetaTerapeuticaInstitucional {
  return { texto: "", ateData: "" };
}

export function emptyMetasGlobal(): MetasTerapeuticasCadastroGlobal {
  const now = new Date().toISOString();
  return {
    updatedAt: now,
    ultimaRevalidacaoMetas: now,
    atualizadoPorId: "",
    atualizadoPorNome: "",
    metas: Array.from({ length: NUM_METAS_INSTITUCIONAIS }, () => emptyItem()),
  };
}

function normalizarMetas(arr: unknown): MetaTerapeuticaInstitucional[] {
  const base = Array.from({ length: NUM_METAS_INSTITUCIONAIS }, () => emptyItem());
  if (!Array.isArray(arr)) return base;
  return base.map((b, i) => {
    const x = arr[i] as Partial<MetaTerapeuticaInstitucional> | undefined;
    if (!x || typeof x !== "object") return b;
    return {
      texto: typeof x.texto === "string" ? x.texto : "",
      ateData: typeof x.ateData === "string" ? x.ateData : "",
    };
  });
}

export function loadMetasTerapeuticasGlobal(): MetasTerapeuticasCadastroGlobal {
  try {
    if (typeof localStorage === "undefined") return configMetasIniciaisDolores();
    const ver = localStorage.getItem(VERSION_KEY);
    if (ver !== STORAGE_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(VERSION_KEY, STORAGE_VERSION);
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = configMetasIniciaisDolores();
      gravarMetasNoArmazenamento(seeded);
      return seeded;
    }
    const p = JSON.parse(raw) as Partial<MetasTerapeuticasCadastroGlobal>;
    const base = emptyMetasGlobal();
    const updatedAt =
      typeof p.updatedAt === "string" ? p.updatedAt : base.updatedAt;
    const ultimaRev =
      typeof p.ultimaRevalidacaoMetas === "string"
        ? p.ultimaRevalidacaoMetas
        : updatedAt;
    return {
      ...base,
      updatedAt,
      ultimaRevalidacaoMetas: ultimaRev,
      atualizadoPorId:
        typeof p.atualizadoPorId === "string" ? p.atualizadoPorId : "",
      atualizadoPorNome:
        typeof p.atualizadoPorNome === "string" ? p.atualizadoPorNome : "",
      metas: normalizarMetas(p.metas),
    };
  } catch {
    return configMetasIniciaisDolores();
  }
}

export function saveMetasTerapeuticasGlobal(
  data: MetasTerapeuticasCadastroGlobal
): void {
  try {
    const now = new Date().toISOString();
    const next = { ...data, updatedAt: now, ultimaRevalidacaoMetas: now };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    localStorage.setItem(VERSION_KEY, STORAGE_VERSION);
    window.dispatchEvent(new Event("fisioplantao-metas-updated"));
  } catch {
    /* ignore */
  }
}

export function formatDataBR(iso: string): string {
  if (!iso || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return "—";
  const [y, m, d] = iso.split("T")[0].split("-").map(Number);
  if (!y || !m || !d) return "—";
  return new Date(y, m - 1, d).toLocaleDateString("pt-BR");
}

/** Prazo de revalidação das metas institucionais (admin), em dias. */
export const DIAS_REVALIDACAO_METAS_INSTITUCIONAIS = 7;

export function diasDesdeUltimaRevalidacaoMetas(
  cfg: MetasTerapeuticasCadastroGlobal
): number {
  const raw = cfg.ultimaRevalidacaoMetas || cfg.updatedAt;
  const t = Date.parse(raw);
  if (Number.isNaN(t)) return 999;
  return Math.floor((Date.now() - t) / 86_400_000);
}

export function metasInstitucionaisForaDoPrazo(
  cfg: MetasTerapeuticasCadastroGlobal
): boolean {
  return (
    diasDesdeUltimaRevalidacaoMetas(cfg) >= DIAS_REVALIDACAO_METAS_INSTITUCIONAIS
  );
}
