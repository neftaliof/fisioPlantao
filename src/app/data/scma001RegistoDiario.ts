/** Perguntas 6–33 do registo diário (ex-Microsoft Forms) — rótulos e ordem únicos. */

export const REGISTO_DIARIO_FORMS_SECOES = [
  {
    titulo: "UTI / procedimentos",
    itens: [
      { key: "tomografia", num: 6, label: "Tomografia" },
      {
        key: "respVm",
        num: 7,
        label: "Tipo de respiração — Ventilação mecânica (VM)",
      },
      { key: "safInsercaoTroca", num: 8, label: "SAF — Inserção/Troca" },
      {
        key: "respEspontanea",
        num: 9,
        label: "Tipo de respiração — Espontânea",
      },
      { key: "bundlePav", num: 10, label: "Bundle de PAV" },
    ],
  },
  {
    titulo: "Tipos de respiração",
    itens: [
      { key: "arAmbiente", num: 11, label: "Ar ambiente" },
      { key: "cateterNasal", num: 12, label: "Catéter nasal" },
      { key: "mascaraReservatorio", num: 13, label: "Máscara de reservatório" },
      { key: "mascaraVenturi", num: 14, label: "Máscara de Venturi" },
      { key: "tqtTenda", num: 15, label: "TQT/Tenda" },
      { key: "tqtArAmbiente", num: 16, label: "TQT/Ar ambiente" },
      { key: "hmeFInsercaoTroca", num: 17, label: "HME-F — Inserção/Troca" },
    ],
  },
  {
    titulo: "Oxigenoterapia",
    itens: [
      { key: "o2Vni", num: 18, label: "VNI" },
      { key: "o2Insercao", num: 19, label: "Inserção" },
      { key: "o2Retirada", num: 20, label: "Retirada" },
    ],
  },
  {
    titulo: "Fisioterapia motora",
    itens: [
      { key: "motorNivel1", num: 21, label: "Nível 1 — Restrito ao leito" },
      { key: "motorNivel2", num: 22, label: "Nível 2 — CNT no leito" },
      {
        key: "motorNivel3",
        num: 23,
        label: "Nível 3 — Sedação à beira-leito",
      },
      {
        key: "motorNivel4",
        num: 24,
        label: "Nível 4 — Transferência para poltrona",
      },
      { key: "motorNivel5", num: 25, label: "Nível 5 — Ortostatismo" },
      {
        key: "motorNivel6",
        num: 26,
        label: "Nível 6 — Deambulação >10 passos",
      },
      {
        key: "motorNivel7",
        num: 27,
        label: "Nível 7 — Deambulação >25 metros",
      },
      {
        key: "motorNivel8",
        num: 28,
        label: "Nível 8 — Deambulação >100 metros",
      },
      { key: "exerciciosResistidos", num: 29, label: "Exercícios resistidos" },
      { key: "pranchaOrtostatica", num: 30, label: "Prancha ortostática" },
    ],
  },
  {
    titulo: "Produtividade geral — Estabilização",
    itens: [
      { key: "estabVni", num: 31, label: "Estabilização — VNI" },
      { key: "estabIntubacao", num: 32, label: "Estabilização — Intubação" },
      { key: "estabPcr", num: 33, label: "Estabilização — PCR" },
    ],
  },
] as const;

type Secoes = typeof REGISTO_DIARIO_FORMS_SECOES;

export type RegistoDiarioFormsKey = Secoes[number]["itens"][number]["key"];

export type RegistoDiarioFormsValores = Record<RegistoDiarioFormsKey, string>;

export function emptyRegistoDiarioForms(): RegistoDiarioFormsValores {
  const o = {} as Record<RegistoDiarioFormsKey, string>;
  for (const sec of REGISTO_DIARIO_FORMS_SECOES) {
    for (const it of sec.itens) {
      o[it.key] = "";
    }
  }
  return o as RegistoDiarioFormsValores;
}

export function mergeRegistoDiarioForms(partial: unknown): RegistoDiarioFormsValores {
  const base = emptyRegistoDiarioForms();
  if (!partial || typeof partial !== "object") return base;
  const p = partial as Record<string, unknown>;
  for (const k of Object.keys(base) as RegistoDiarioFormsKey[]) {
    const v = p[k];
    base[k] = typeof v === "string" ? v : "";
  }
  return base;
}
