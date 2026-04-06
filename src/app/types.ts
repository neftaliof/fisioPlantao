import type {
  RegistoDiarioFormsKey,
  RegistoDiarioFormsValores,
} from "./data/scma001RegistoDiario";

export type { RegistoDiarioFormsKey, RegistoDiarioFormsValores };

// ===== FISIOTERAPEUTA =====
export type Equipe = "adulto" | "pediatrico";

export interface Fisioterapeuta {
  id: string;
  nome: string;
  coren: string;
  telefone: string;
  email: string;
  turno: "Matutino" | "Vespertino" | "Noturno";
  status: "Ativo" | "Inativo";
  foto?: string;
  createdAt: string;
  equipe?: Equipe;
}

// ===== LEITO =====
export interface LeitoDadosPaciente {
  numero: number;
  /** Nome do paciente no leito (identificação na lista e no plantão) */
  pacienteNome: string;
  satO2: string;
  fc: string;
  suporte: string;
  parametros: string;
  sedacao: string;
  complacencia: string;
  /** Hemograma (SPData) — campos estruturados */
  hemoglobina: string;
  hematocrito: string;
  leucocitos: string;
  plaquetas: string;
  /** Gasometria arterial — parâmetros principais (ref. clínica usual) */
  gasoPh: string;
  gasoPaco2: string;
  gasoPao2: string;
  gasoHco3: string;
  gasoBe: string;
  gasoSao2: string;
  /** Transcrição / observações livres a partir do SPData */
  exameHemogramaSpdata: string;
  /** Transcrição / observações livres a partir do SPData */
  exameGasometriaArterialSpdata: string;
  estadoGeral: string;
  obs: string;
}

// ===== CONTROLE DIÁRIO (SCMA.FIS.FOR.008) =====
export interface LeitoControleDiario {
  numero: number;
  da: string;
  paciente: string;
  patologia: string;
  vm: boolean;
  masc: boolean;
  tenda: boolean;
  cn: boolean;
  aa: boolean;
  m: boolean;
  v: boolean;
  n: boolean;
}

export interface Ocorrencia {
  leito: string;
  hora: string;
  ocorrido: string;
}

export interface ControleDiario {
  id: string;
  data: string;
  leitos: LeitoControleDiario[];
  plantonistas: {
    matutino: { nome: string; atendimentos: string };
    vespertino: { nome: string; atendimentos: string };
    noturno: { nome: string; atendimentos: string };
  };
  transferencias: string;
  obitos: string;
  ocorrencias: Ocorrencia[];
  createdAt: string;
}

// ===== CADASTRO (bases reutilizáveis no plantão) =====
export interface PacienteCadastrado {
  id: string;
  nome: string;
  /** Alinhado à chave da ficha FOR.017 (nome + data de nascimento). */
  dataNascimento: string;
  prontuario: string;
  observacao: string;
  createdAt: string;
  /** Preenchido quando o cadastro veio de «Concluir admissão» na Página 4. */
  admissaoConcluidaEm?: string;
}

export interface LeitoCadastrado {
  id: string;
  utiId: string;
  numero: number;
  /** Texto curto ex.: "Box ventral" */
  rotulo: string;
  ativo: boolean;
  createdAt: string;
}

// ===== PLANTÃO DADOS PACIENTE =====
export interface PlantaoDadosPaciente {
  id: string;
  data: string;
  turno: "Matutino" | "Vespertino" | "Noturno";
  fisioterapeutaId: string;
  leitos: LeitoDadosPaciente[];
  createdAt: string;
}

export type Turno = "Matutino" | "Vespertino" | "Noturno";

// ===== UTI =====
export interface UTI {
  id: string;
  nome: string;
  nomeAbrev: string;
  totalLeitos: number;
  ativa: boolean;
  localizacao?: string;
  equipe: Equipe | "enfermaria";
  tipo: "uti" | "enfermaria";
  cor: string; // tailwind color class base
}

// ===== PASSAGEM DE PLANTÃO =====
export type TurnoPassagem = "Diurno/Manhã" | "Diurno/Tarde" | "Noturno";
export type StatusPassagem = "rascunho" | "enviada" | "validada";

export interface LeitoPassagem {
  numero: number;
  vago: boolean;
  pacienteNome: string;
  pacienteIdade?: number;
  dataAdmissao: string;
  diagnostico: string;
  comorbidades: string;
  historicoAdmissao: string;
  statusFuncional: string;
  cntQualiFisioDf: string;
  avaliacaoFuncional: string;
  reavaliacaoFuncional: string;
  tipoRespiracao: string;
  iot?: string;
  parametrosVentilatorios?: string;
  anamneseConduta: string;
  flags: string[]; // "ALTA", "PALIATIVO", "PCR", "AGUARDANDO LEITO", "ISOLAMENTO"
  /** Indicadores estruturados (passagem inteligente) — sem texto livre para KPIs */
  pacienteEmVm: boolean;
  /** Dias em VM; relevante se pacienteEmVm */
  tempoVmDias?: number;
  extubado: boolean;
  extubacaoAcidental: boolean;
  reintubacao48h: boolean;
  delirium: boolean;
  mobilizado: boolean;
  pavConfirmado: boolean;
  bundleCabeceiraElevada: boolean;
  bundleHigieneOral: boolean;
  bundleAspiracao: boolean;
  bundleSedacaoControlada: boolean;
  /** Alta hospitalar documentada neste registo de leito */
  altaHospitalar: boolean;
  /** Saída da UTI para outro setor / unidade */
  saidaUti: boolean;
  /** Evolução favorável / melhora funcional registrada */
  evolucaoMelhora: boolean;
}

/** Subconjunto exportável para funções puras de indicadores */
export type IndicadoresLeitoPassagem = Pick<
  LeitoPassagem,
  | "numero"
  | "vago"
  | "pacienteEmVm"
  | "tempoVmDias"
  | "extubado"
  | "extubacaoAcidental"
  | "reintubacao48h"
  | "delirium"
  | "mobilizado"
  | "pavConfirmado"
  | "bundleCabeceiraElevada"
  | "bundleHigieneOral"
  | "bundleAspiracao"
  | "bundleSedacaoControlada"
  | "altaHospitalar"
  | "saidaUti"
  | "evolucaoMelhora"
>;

export interface PassagemPlantao {
  id: string;
  utiId: string;
  versao: number;
  passagemAnteriorId?: string;
  data: string;
  turno: TurnoPassagem;
  fisioterapeutaId: string;
  fisioterapeutaNome: string;
  preenchidoPorId: string;
  preenchidoPorNome: string;
  status: StatusPassagem;
  validadoPor?: string;
  validadoEm?: string;
  observacoesGerais?: string;
  leitos: LeitoPassagem[];
  createdAt: string;
  enviadaEm?: string;
}

// ===== SCMA.FIS.FOR.001 — Evolução / Serviço de Fisioterapia =====
export type LocalAtendimento001 = "uti_adulto" | "enfermarias";

export interface AvaliacaoFisioterapia001 {
  id: string;
  createdAt: string;
  updatedAt: string;
  preenchidoPorId: string;
  preenchidoPorNome: string;
  /** Cabeçalho identificação */
  local: LocalAtendimento001 | "";
  paciente: string;
  leito: string;
  folhaNumero: string;
  codigosProcedimento: string[];
  /** Um registo por plantão — até três por dia (Matutino, Vespertino, Noturno) */
  turnoPlantao: Turno | "";
  /** Registo diário (ex.: Microsoft Forms) — setor de atuação; sincronizado com «Local» quando vazio */
  setorAtuacao: string;
  /** Pergunta 5+: número de atendimentos no setor */
  atendimentosNoSetor: string;
  /** Perguntas 6–33 do registo diário (texto livre) */
  registoDiarioForms: RegistoDiarioFormsValores;
  /** Notas adicionais / texto livre; preserva rascunhos antigos */
  registoDiarioComplemento: string;
  /** Avaliação clínica */
  data: string;
  hora: string;
  diagnostico: string;
  prioridade: "" | "vermelho" | "amarelo";
  atividadeMotora: string[];
  tonus: string[];
  nivelConsciencia: string[];
  escalaGlasgow: string;
  escalaRass: string;
  padraoRespiratorio: string[];
  auscultaInicial: string;
  auscultaFinal: string;
  diasVMI: string;
  fc: string;
  frp: string;
  spo2: string;
  ventilador: string;
  modoVentilador: string;
  vc: string;
  fluxo: string;
  fio2: string;
  peep: string;
  pc: string;
  ps: string;
  frVent: string;
  sens: string;
  ti: string;
  ie: string;
  cuff: string;
  tuboTipo: string;
  tuboNum: string;
  tuboAltura: string;
  tuboFixacao: string;
  venturiPct: string;
  venturiArL: string;
  venturiO2L: string;
  tendaIntermitente: string;
  cateterNasalO2: string;
  o2Lmin: string;
  balancoHidrico: string;
  vt: string;
  volIdeal: string;
  resistViasAereas: string;
  deltaP: string;
  frAjustada: string;
  tentativaPSV: string;
  tre: string;
  relacaoPF: string;
  condutaRespiratoria: string[];
  peepTitulacao: string;
  secrecaoPulmonar: "" | "presente" | "ausente";
  secrecaoCaracteristicas: string[];
  condutaMotora: string[];
  pacienteSentado: "" | "no_leito" | "fora_leito";
  alongamento: string[];
  exerciciosAtivos: string[];
  observacoes: string;
}

// ===== SCMA.SCIH.FOR.021 — Bundle de prevenção de PAV =====
export type PavCompliance = "" | "C" | "NC" | "NA";

export interface PavBundleBloco021 {
  id: string;
  /** Uma entrada por medida preventiva (6 itens), na ordem do protocolo */
  medidas: PavCompliance[];
  dataAplicacao: string;
  /** Nome para assinatura / carimbo (digital) */
  profissionalNome: string;
  turno: Turno | "";
}

export interface BundlePav021 {
  id: string;
  createdAt: string;
  updatedAt: string;
  preenchidoPorId: string;
  preenchidoPorNome: string;
  paciente: string;
  leito: string;
  setor: string;
  blocos: PavBundleBloco021[];
}

// ===== Página 4 — Admissão / coleta + SCMA.FIS.FOR.017 (pág. 2 de 3) =====
export type TriSimNao = "" | "nao" | "sim";

export interface FuncionalidadeLinhaPag4 {
  independencia: TriSimNao;
  limitacao: string;
}

export interface MetaTerapeutica017 {
  texto: string;
  ateData: string;
}

/** Metas definidas pela administração (referência institucional — ex.: cadastro da Dolores) */
export interface MetaTerapeuticaInstitucional {
  texto: string;
  ateData: string;
}

export interface MetasTerapeuticasCadastroGlobal {
  updatedAt: string;
  /** Última vez em que as metas foram salvas/revalidadas (admin) — ciclo de 7 dias */
  ultimaRevalidacaoMetas: string;
  atualizadoPorId: string;
  atualizadoPorNome: string;
  metas: MetaTerapeuticaInstitucional[];
}

export interface PrescricaoExercicio017 {
  comCarga: boolean;
  cargaKg: string;
  semCarga: boolean;
  series: string;
  repeticoes: string;
}

/** Destino na alta / saída do paciente (exclusivo) */
export type DestinoPacienteSaida = "" | "alta" | "transferencia" | "obito";

/** Formulário digital unificado: coleta na admissão + avaliação/reabilitação FOR.017 */
export interface ColetaDadosFisioPagina4 {
  id: string;
  createdAt: string;
  updatedAt: string;
  preenchidoPorId: string;
  preenchidoPorNome: string;

  internacaoMensalNum: string;
  paciente: string;
  sexo: string;
  procedencia: string;
  dataNascimento: string;
  idade: string;
  dataAdmissao: string;
  horaAdmissao: string;
  convenioSus: boolean;
  convenioUnimed: boolean;
  convenioOutro: boolean;
  convenioOutroTexto: string;

  /** Transcrição manual a partir do SPData */
  exameHemogramaSpdata: string;
  /** Transcrição manual a partir do SPData */
  exameGasometriaArterialSpdata: string;

  admitidoVM: boolean;
  admitidoVNI: boolean;
  admitidoTendaO2: boolean;
  admitidoMascara: boolean;
  admitidoCateterNasal: boolean;
  admitidoArAmbiente: boolean;
  indicacaoUti: string;
  patologiaCronica: TriSimNao;
  patologiaCronicaDetalhe: string;
  internacaoPregressa: TriSimNao;
  internacaoPregressaDetalhe: string;
  pesoPredito: string;
  estatura: string;
  envergadura: string;
  intercorrenciasTransporte: TriSimNao;
  reanimacaoTransporte: TriSimNao;
  dependenteO2: TriSimNao;
  pps: string;
  ppsReavaliacao: string;
  diagnosticos: string;
  oncoAcompanhamento: TriSimNao;
  oncoTempoDoenca: string;
  oncoTratamento: "" | "curativo" | "paliativo";
  oncoMetastase: TriSimNao;

  oxigenoterapia: TriSimNao;
  oxigenoterapiaInicio: string;
  oxigenoterapiaDesmame: string;
  ventilacaoMecanica: TriSimNao;
  vmDataIot: string;
  vmDesmame: string;
  vmExtubacao: string;
  vni: TriSimNao;
  vniInicio: string;
  vniIntermitente: TriSimNao;
  tosse: "" | "eficaz" | "pouco_eficaz" | "ineficaz";

  funcHigiene: FuncionalidadeLinhaPag4;
  funcLocomocao: FuncionalidadeLinhaPag4;
  funcAlimentacao: FuncionalidadeLinhaPag4;
  funcVestir: FuncionalidadeLinhaPag4;
  funcComunicacao: string;
  funcObservacoes: string;

  complicacoes: string[];
  complicacoesObs: string;

  /** Após true, só o bloco «Destino» permanece editável (preenchido na saída). */
  admissaoConcluida: boolean;
  admissaoConcluidaEm: string;
  admissaoConcluidaPorNome: string;

  /** Um único destino na alta: alta hospitalar, transferência ou óbito */
  destinoTipo: DestinoPacienteSaida;
  destinoDetalhe: string;
  destinoData: string;
  destinoReinternacao: string;
  destinoFisioterapeuta: string;

  /** SCMA.FIS.FOR.017 */
  avaliacaoData: string;
  avaliacaoFisioterapeuta: string;
  mrcMsd: string;
  mrcMse: string;
  mrcMid: string;
  mrcMie: string;
  mrcTotal: string;
  pimaxPredito: string;
  pemaxPredito: string;
  pimax: string;
  pemax: string;
  dinamometriaMsd: string;
  dinamometriaMse: string;
  cntQualiFisio: string[];
  planoTerapeutico: string[];
  metasTerapeuticas: MetaTerapeutica017[];
  prescricaoExercicios: PrescricaoExercicio017[];
  dataReavaliacao: string;
}