import type {
  ColetaDadosFisioPagina4,
  DestinoPacienteSaida,
  FuncionalidadeLinhaPag4,
  MetaTerapeutica017,
  PrescricaoExercicio017,
  TriSimNao,
} from "../types";

const PACIENTES_KEY = "fisioplantao_pagina4_por_paciente";
const PAC_VERSION_KEY = "fisioplantao_pagina4_pac_version";
const PAC_VERSION = "v2";

const emptyLinhaFunc = (): FuncionalidadeLinhaPag4 => ({
  independencia: "",
  limitacao: "",
});

const emptyMeta = (): MetaTerapeutica017 => ({ texto: "", ateData: "" });

const emptyPresc = (): PrescricaoExercicio017 => ({
  comCarga: false,
  cargaKg: "",
  semCarga: false,
  series: "",
  repeticoes: "",
});

function asTri(v: unknown): TriSimNao {
  return v === "nao" || v === "sim" ? v : "";
}

type LegacyPagina4Destino = Partial<ColetaDadosFisioPagina4> & {
  destinoAlta?: boolean;
  destinoTransferencia?: boolean;
  destinoObito?: boolean;
};

function parseDestinoTipo(p: LegacyPagina4Destino): DestinoPacienteSaida {
  const t = p.destinoTipo;
  if (t === "alta" || t === "transferencia" || t === "obito") return t;
  if (p.destinoObito === true) return "obito";
  if (p.destinoTransferencia === true) return "transferencia";
  if (p.destinoAlta === true) return "alta";
  return "";
}

/** Chave única por paciente (nome normalizado + data de nascimento). */
export function chavePacientePagina4(paciente: string, dataNascimento: string): string | null {
  const n = paciente.trim().toLowerCase().replace(/\s+/g, " ");
  const d = dataNascimento.trim();
  if (!n || !d) return null;
  return `${n}|${d}`;
}

function loadMap(): Record<string, ColetaDadosFisioPagina4> {
  try {
    if (typeof localStorage === "undefined") return {};
    if (localStorage.getItem(PAC_VERSION_KEY) !== PAC_VERSION) {
      localStorage.removeItem(PACIENTES_KEY);
      localStorage.setItem(PAC_VERSION_KEY, PAC_VERSION);
      return {};
    }
    const raw = localStorage.getItem(PACIENTES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Record<string, ColetaDadosFisioPagina4>;
  } catch {
    return {};
  }
}

function saveMap(map: Record<string, ColetaDadosFisioPagina4>): void {
  try {
    localStorage.setItem(PACIENTES_KEY, JSON.stringify(map));
    localStorage.setItem(PAC_VERSION_KEY, PAC_VERSION);
  } catch {
    /* ignore */
  }
}

export function carregarFichaPacientePagina4(chave: string): ColetaDadosFisioPagina4 | null {
  const map = loadMap();
  const raw = map[chave];
  if (!raw) return null;
  return mergeColetaPagina4(raw as LegacyPagina4Destino, "anon", "Usuário");
}

export function salvarFichaPacientePagina4(
  chave: string,
  data: ColetaDadosFisioPagina4
): void {
  const map = loadMap();
  map[chave] = { ...data, updatedAt: new Date().toISOString() };
  saveMap(map);
}

export function mergeColetaPagina4(
  p: LegacyPagina4Destino,
  fallbackUserId: string,
  fallbackUserNome: string
): ColetaDadosFisioPagina4 {
  const uid = p.preenchidoPorId ?? fallbackUserId;
  const unome = p.preenchidoPorNome ?? fallbackUserNome;
  const base = emptyColetaPagina4(uid, unome);
  const complic = Array.isArray(p.complicacoes)
    ? p.complicacoes.filter((c): c is string => typeof c === "string")
    : [];
  const cnt = Array.isArray(p.cntQualiFisio)
    ? p.cntQualiFisio.filter((c): c is string => typeof c === "string")
    : [];

  return {
    ...base,
    ...p,
    id: typeof p.id === "string" ? p.id : base.id,
    createdAt: typeof p.createdAt === "string" ? p.createdAt : base.createdAt,
    preenchidoPorId: uid,
    preenchidoPorNome: unome,
    patologiaCronica: asTri(p.patologiaCronica),
    internacaoPregressa: asTri(p.internacaoPregressa),
    intercorrenciasTransporte: asTri(p.intercorrenciasTransporte),
    reanimacaoTransporte: asTri(p.reanimacaoTransporte),
    dependenteO2: asTri(p.dependenteO2),
    oncoAcompanhamento: asTri(p.oncoAcompanhamento),
    oncoMetastase: asTri(p.oncoMetastase),
    oncoTratamento:
      p.oncoTratamento === "curativo" || p.oncoTratamento === "paliativo"
        ? p.oncoTratamento
        : "",
    oxigenoterapia: asTri(p.oxigenoterapia),
    ventilacaoMecanica: asTri(p.ventilacaoMecanica),
    vni: asTri(p.vni),
    vniIntermitente: asTri(p.vniIntermitente),
    tosse:
      p.tosse === "eficaz" || p.tosse === "pouco_eficaz" || p.tosse === "ineficaz"
        ? p.tosse
        : "",
    funcHigiene: normalizaFunc(p.funcHigiene),
    funcLocomocao: normalizaFunc(p.funcLocomocao),
    funcAlimentacao: normalizaFunc(p.funcAlimentacao),
    funcVestir: normalizaFunc(p.funcVestir),
    complicacoes: complic,
    cntQualiFisio: cnt,
    planoTerapeutico: normalizaPlano(p.planoTerapeutico),
    metasTerapeuticas: normalizaMetas(p.metasTerapeuticas),
    prescricaoExercicios: normalizaPresc(p.prescricaoExercicios),
    admissaoConcluida: Boolean(p.admissaoConcluida),
    admissaoConcluidaEm:
      typeof p.admissaoConcluidaEm === "string" ? p.admissaoConcluidaEm : "",
    admissaoConcluidaPorNome:
      typeof p.admissaoConcluidaPorNome === "string" ? p.admissaoConcluidaPorNome : "",
    destinoTipo: parseDestinoTipo(p),
    destinoDetalhe: typeof p.destinoDetalhe === "string" ? p.destinoDetalhe : "",
    destinoData: typeof p.destinoData === "string" ? p.destinoData : "",
    destinoReinternacao:
      typeof p.destinoReinternacao === "string" ? p.destinoReinternacao : "",
    destinoFisioterapeuta:
      typeof p.destinoFisioterapeuta === "string" ? p.destinoFisioterapeuta : unome,
    exameHemogramaSpdata:
      typeof p.exameHemogramaSpdata === "string" ? p.exameHemogramaSpdata : "",
    exameGasometriaArterialSpdata:
      typeof p.exameGasometriaArterialSpdata === "string"
        ? p.exameGasometriaArterialSpdata
        : "",
  };
}

export function emptyColetaPagina4(
  userId: string,
  userNome: string
): ColetaDadosFisioPagina4 {
  const now = new Date().toISOString();
  return {
    id: `pag4-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
    preenchidoPorId: userId,
    preenchidoPorNome: userNome,
    internacaoMensalNum: "",
    paciente: "",
    sexo: "",
    procedencia: "",
    dataNascimento: "",
    idade: "",
    dataAdmissao: "",
    horaAdmissao: "",
    convenioSus: false,
    convenioUnimed: false,
    convenioOutro: false,
    convenioOutroTexto: "",
    exameHemogramaSpdata: "",
    exameGasometriaArterialSpdata: "",
    admitidoVM: false,
    admitidoVNI: false,
    admitidoTendaO2: false,
    admitidoMascara: false,
    admitidoCateterNasal: false,
    admitidoArAmbiente: false,
    indicacaoUti: "",
    patologiaCronica: "",
    patologiaCronicaDetalhe: "",
    internacaoPregressa: "",
    internacaoPregressaDetalhe: "",
    pesoPredito: "",
    estatura: "",
    envergadura: "",
    intercorrenciasTransporte: "",
    reanimacaoTransporte: "",
    dependenteO2: "",
    pps: "",
    ppsReavaliacao: "",
    diagnosticos: "",
    oncoAcompanhamento: "",
    oncoTempoDoenca: "",
    oncoTratamento: "",
    oncoMetastase: "",
    oxigenoterapia: "",
    oxigenoterapiaInicio: "",
    oxigenoterapiaDesmame: "",
    ventilacaoMecanica: "",
    vmDataIot: "",
    vmDesmame: "",
    vmExtubacao: "",
    vni: "",
    vniInicio: "",
    vniIntermitente: "",
    tosse: "",
    funcHigiene: emptyLinhaFunc(),
    funcLocomocao: emptyLinhaFunc(),
    funcAlimentacao: emptyLinhaFunc(),
    funcVestir: emptyLinhaFunc(),
    funcComunicacao: "",
    funcObservacoes: "",
    complicacoes: [],
    complicacoesObs: "",
    admissaoConcluida: false,
    admissaoConcluidaEm: "",
    admissaoConcluidaPorNome: "",
    destinoTipo: "",
    destinoDetalhe: "",
    destinoData: "",
    destinoReinternacao: "",
    destinoFisioterapeuta: userNome,
    avaliacaoData: "",
    avaliacaoFisioterapeuta: userNome,
    mrcMsd: "",
    mrcMse: "",
    mrcMid: "",
    mrcMie: "",
    mrcTotal: "",
    pimaxPredito: "",
    pemaxPredito: "",
    pimax: "",
    pemax: "",
    dinamometriaMsd: "",
    dinamometriaMse: "",
    cntQualiFisio: [],
    planoTerapeutico: ["", "", "", ""],
    metasTerapeuticas: Array.from({ length: 6 }, () => emptyMeta()),
    prescricaoExercicios: Array.from({ length: 7 }, () => emptyPresc()),
    dataReavaliacao: "",
  };
}

function normalizaMetas(arr: unknown): MetaTerapeutica017[] {
  const base = Array.from({ length: 6 }, () => emptyMeta());
  if (!Array.isArray(arr)) return base;
  return base.map((b, i) => {
    const x = arr[i] as Partial<MetaTerapeutica017> | undefined;
    if (!x || typeof x !== "object") return b;
    return {
      texto: typeof x.texto === "string" ? x.texto : "",
      ateData: typeof x.ateData === "string" ? x.ateData : "",
    };
  });
}

function normalizaPresc(arr: unknown): PrescricaoExercicio017[] {
  const base = Array.from({ length: 7 }, () => emptyPresc());
  if (!Array.isArray(arr)) return base;
  return base.map((b, i) => {
    const x = arr[i] as Partial<PrescricaoExercicio017> | undefined;
    if (!x || typeof x !== "object") return b;
    return {
      comCarga: Boolean(x.comCarga),
      cargaKg: typeof x.cargaKg === "string" ? x.cargaKg : "",
      semCarga: Boolean(x.semCarga),
      series: typeof x.series === "string" ? x.series : "",
      repeticoes: typeof x.repeticoes === "string" ? x.repeticoes : "",
    };
  });
}

function normalizaPlano(arr: unknown): string[] {
  const base = ["", "", "", ""];
  if (!Array.isArray(arr)) return base;
  return base.map((_, i) =>
    typeof arr[i] === "string" ? (arr[i] as string) : ""
  );
}

function normalizaFunc(
  x: Partial<FuncionalidadeLinhaPag4> | undefined
): FuncionalidadeLinhaPag4 {
  return {
    independencia: asTri(x?.independencia),
    limitacao: typeof x?.limitacao === "string" ? x.limitacao : "",
  };
}

/** @deprecated Fluxo antigo por rascunho único — mantido vazio para compat. */
export function loadPagina4Rascunho(): ColetaDadosFisioPagina4 | null {
  return null;
}

export function savePagina4Rascunho(_data: ColetaDadosFisioPagina4): void {
  /* usar salvarFichaPacientePagina4 com chave */
}

export function clearPagina4Rascunho(): void {
  /* sem rascunho global */
}

/** @deprecated */
export function getOrCreatePagina4Rascunho(
  userId: string,
  userNome: string
): ColetaDadosFisioPagina4 {
  return emptyColetaPagina4(userId, userNome);
}
