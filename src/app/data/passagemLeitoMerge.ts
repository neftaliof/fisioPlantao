import type { LeitoPassagem } from "../types";

/** Valores por defeito para novos leitos / campos em falta no JSON legado */
export const indicadoresLeitoVazio: Pick<
  LeitoPassagem,
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
> = {
  pacienteEmVm: false,
  tempoVmDias: undefined,
  extubado: false,
  extubacaoAcidental: false,
  reintubacao48h: false,
  delirium: false,
  mobilizado: false,
  pavConfirmado: false,
  bundleCabeceiraElevada: false,
  bundleHigieneOral: false,
  bundleAspiracao: false,
  bundleSedacaoControlada: false,
  altaHospitalar: false,
  saidaUti: false,
  evolucaoMelhora: false,
};

export function normalizeLeitoPassagem(leito: LeitoPassagem): LeitoPassagem {
  const raw = leito as Record<string, unknown>;
  const inferredVm =
    !leito.vago && String(leito.tipoRespiracao ?? "").startsWith("VM");
  const rawVm = raw.pacienteEmVm;
  const pacienteEmVm =
    typeof rawVm === "boolean" ? (leito.vago ? false : rawVm) : inferredVm;

  const tempoRaw = raw.tempoVmDias;
  const tempoVmDias =
    typeof tempoRaw === "number" && Number.isFinite(tempoRaw) && tempoRaw >= 0
      ? tempoRaw
      : undefined;

  const bool = (k: keyof LeitoPassagem) =>
    typeof raw[k as string] === "boolean" ? (raw[k as string] as boolean) : false;

  const base: LeitoPassagem = {
    ...leito,
    flags: Array.isArray(leito.flags) ? leito.flags : [],
    pacienteEmVm: leito.vago ? false : pacienteEmVm,
    tempoVmDias: leito.vago || !pacienteEmVm ? undefined : tempoVmDias,
    extubado: leito.vago ? false : bool("extubado"),
    extubacaoAcidental: leito.vago ? false : bool("extubacaoAcidental"),
    reintubacao48h: leito.vago ? false : bool("reintubacao48h"),
    delirium: leito.vago ? false : bool("delirium"),
    mobilizado: leito.vago ? false : bool("mobilizado"),
    pavConfirmado: leito.vago ? false : bool("pavConfirmado"),
    bundleCabeceiraElevada: leito.vago ? false : bool("bundleCabeceiraElevada"),
    bundleHigieneOral: leito.vago ? false : bool("bundleHigieneOral"),
    bundleAspiracao: leito.vago ? false : bool("bundleAspiracao"),
    bundleSedacaoControlada: leito.vago ? false : bool("bundleSedacaoControlada"),
    altaHospitalar: leito.vago ? false : bool("altaHospitalar"),
    saidaUti: leito.vago ? false : bool("saidaUti"),
    evolucaoMelhora: leito.vago ? false : bool("evolucaoMelhora"),
  };

  return base;
}
