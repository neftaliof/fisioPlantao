/** Medidas preventivas do bundle PAV — SCMA.SCIH.FOR.021 */
export const MEDIDAS_PAV_BUNDLE: { id: string; texto: string }[] = [
  {
    id: "extubacao",
    texto: "Avaliado possibilidade de extubação",
  },
  {
    id: "sedacao",
    texto: "Evitado sedação profunda",
  },
  {
    id: "troca_vm",
    texto:
      "Mantido troca do sistema de ventilação mecânica conforme recomendações",
  },
  {
    id: "cabeceira",
    texto: "Mantido cabeceira elevada de 30–45°",
  },
  {
    id: "higiene_oral",
    texto: "Realizado higiene oral diariamente",
  },
  {
    id: "cuff",
    texto: "Mantida a pressão do cuff / balonete (entre 25 e 30 cmH₂O)",
  },
];

/** Número de tabelas repetidas na página 1 do impresso */
export const PAV_BLOCOS_POR_PAGINA = 7;
