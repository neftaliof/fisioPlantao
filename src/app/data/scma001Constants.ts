/** Códigos do cabeçalho SCMA.FIS.FOR.001 */
export const CODIGOS_PROCEDIMENTO_SCMA001 = [
  "03.02.04.001-3",
  "03.02.06.002-2",
  "03.02.02.001-2",
  "03.02.02.002-0",
  "03.02.02.003-9",
  "03.02.04.003-0",
  "03.02.04.004-8",
  "03.02.06.005-7",
] as const;

export const OPCOES_ATIVIDADE_MOTORA = [
  { id: "ativo", label: "Ativo" },
  { id: "reativo", label: "Reativo" },
  { id: "nao_reativo", label: "Não reativo" },
  { id: "nao_responsivo", label: "Não responsivo" },
] as const;

export const OPCOES_TONUS = [
  { id: "hipotonico", label: "Hipotônico" },
  { id: "hipertonico", label: "Hipertônico" },
  { id: "normotonico", label: "Normotônico" },
] as const;

export const OPCOES_NIVEL_CONSCIENCIA = [
  { id: "acordado", label: "Acordado" },
  { id: "lucido", label: "Lúcido" },
  { id: "confuso", label: "Confuso" },
  { id: "sonolento", label: "Sonolento" },
  { id: "sedado", label: "Sedado" },
  { id: "comatoso", label: "Comatoso" },
] as const;

export const OPCOES_PADRAO_RESP = [
  { id: "toracico", label: "Torácico" },
  { id: "abdominal", label: "Abdominal" },
  { id: "toraco_abdominal", label: "Tóraco-abdominal" },
] as const;

export const OPCOES_CONDUTA_RESPIRATORIA = [
  { id: "mecanica_resp", label: "Determinação da mecânica respiratória" },
  { id: "aspiracao", label: "Aspiração TOT / TQT / VAS" },
  { id: "acel_fluxo_exp", label: "Aceleração do fluxo expiratório" },
  { id: "estimulo_tosse", label: "Manobra de estímulo de tosse / Huffing" },
  { id: "bloqueio_toracico", label: "Bloqueio torácico / Compressão-descompressão" },
  { id: "bag_squeezing", label: "Bag squeezing / Empilhamento com Ambú" },
  { id: "vibro_drenagem", label: "Vibrocompressão / Drenagem postural" },
  { id: "drenagem_autogena", label: "Drenagem autógena / Estímulo diafragma" },
  { id: "ex_resp", label: "Exercício respiratório padrão/associado" },
  { id: "assist_vent", label: "Assistência ventilatória" },
  { id: "gasometria", label: "Correção de gasometria" },
  { id: "tit_peep", label: "Titulação de PEEP (valor ao lado)" },
] as const;

export const OPCOES_SECRECAO_CARAC = [
  { id: "leve", label: "Leve" },
  { id: "moderada", label: "Moderada" },
  { id: "intensa", label: "Intensa" },
  { id: "espessa", label: "Espessa" },
  { id: "sialorreia", label: "Sialorréia" },
  { id: "mucoide", label: "Mucoide" },
  { id: "mucopurulenta", label: "Mucopurulenta" },
  { id: "hemoptise", label: "Hemoptise" },
] as const;

export const OPCOES_CONDUTA_MOTORA = [
  { id: "posicionamento", label: "Posicionamento no leito" },
  { id: "bomba_tibio", label: "Bomba tíbio-társica" },
  { id: "cinesio", label: "Cinesioterapia" },
  { id: "equilibrio", label: "Equilíbrio postural" },
  { id: "deambulacao", label: "Deambulação" },
  { id: "mob_articular", label: "Mobilização articular" },
  { id: "ortostatismo", label: "Ortostatismo" },
  { id: "marcha_estacionaria", label: "Marcha estacionária" },
] as const;

export const OPCOES_ALONGAMENTO = [
  { id: "MIE", label: "MIE" },
  { id: "MID", label: "MID" },
  { id: "MSE", label: "MSE" },
  { id: "MSD", label: "MSD" },
] as const;

export const OPCOES_EX_ATIVOS = [
  { id: "MMSS", label: "MMSS" },
  { id: "MMII", label: "MMII" },
] as const;

/** Setores do registo diário (alinhado aos setores do sistema / Microsoft Forms) */
export const OPCOES_SETOR_ATUACAO_MSFORMS: { value: string; label: string }[] = [
  { value: "", label: "Selecionar sua resposta" },
  { value: "uti-01", label: "UTI Adulto 01" },
  { value: "uti-02", label: "UTI Adulto 02" },
  { value: "uti-neo", label: "UTI Neo Natal" },
  { value: "uti-ped", label: "UTI Pediátrica" },
  { value: "enfermaria", label: "Enfermaria" },
];
