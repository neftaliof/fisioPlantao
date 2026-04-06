import { describe, it, expect } from "vitest";
import {
  calcularAgregadoPeriodo,
  classificarKpi,
  contarPlantoesPorMes,
  gerarSerieDiaria,
  type RegistoPlantaoNormalizado,
} from "./indicadoresUti";

const leitoBase = {
  numero: 1,
  vago: false,
  pacienteEmVm: false,
  tempoVmDias: undefined as number | undefined,
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

function reg(
  overrides: Partial<RegistoPlantaoNormalizado> & {
    leitos?: RegistoPlantaoNormalizado["leitos"];
  }
): RegistoPlantaoNormalizado {
  return {
    id: "r1",
    passagemId: "p1",
    unidadeId: "uti-01",
    data: "2026-04-01",
    turno: "Diurno/Manhã",
    status: "validada",
    leitos: [],
    ...overrides,
  };
}

describe("calcularAgregadoPeriodo", () => {
  it("retorna nulls quando não há denominadores", () => {
    const a = calcularAgregadoPeriodo([], { unidadeId: "uti-01" });
    expect(a.taxaUsoVm).toBeNull();
    expect(a.taxaMobilidade).toBeNull();
    expect(a.tempoMedioVm).toBeNull();
    expect(a.contagem.leitosOcupados).toBe(0);
  });

  it("calcula taxas e tempo médio em VM sem dividir por zero", () => {
    const registos: RegistoPlantaoNormalizado[] = [
      reg({
        leitos: [
          {
            ...leitoBase,
            pacienteEmVm: true,
            tempoVmDias: 2,
            mobilizado: true,
            bundleCabeceiraElevada: true,
            bundleHigieneOral: true,
            bundleAspiracao: false,
            bundleSedacaoControlada: false,
          },
          {
            ...leitoBase,
            numero: 2,
            pacienteEmVm: true,
            tempoVmDias: 4,
            extubado: true,
            extubacaoAcidental: true,
            reintubacao48h: true,
          },
        ],
      }),
    ];
    const a = calcularAgregadoPeriodo(registos, { unidadeId: "uti-01" });
    expect(a.contagem.leitosOcupados).toBe(2);
    expect(a.contagem.emVm).toBe(2);
    expect(a.tempoMedioVm).toBe(3);
    expect(a.taxaUsoVm).toBe(1);
    expect(a.taxaMobilidade).toBe(0.5);
    expect(a.taxaExtubacaoAcidental).toBe(1);
    expect(a.taxaFalhaExtubacao).toBe(1);
    expect(a.taxaConformidadeBundle).toBe(0.25);
  });

  it("conta altas, saídas UTI e melhora sobre leitos ocupados", () => {
    const registos: RegistoPlantaoNormalizado[] = [
      reg({
        leitos: [
          { ...leitoBase, altaHospitalar: true, saidaUti: true, evolucaoMelhora: true },
          { ...leitoBase, numero: 2, altaHospitalar: false, saidaUti: true },
        ],
      }),
    ];
    const a = calcularAgregadoPeriodo(registos, { unidadeId: "uti-01" });
    expect(a.contagem.altaHospitalar).toBe(1);
    expect(a.contagem.saidaUti).toBe(2);
    expect(a.contagem.evolucaoMelhora).toBe(1);
    expect(a.taxaAlta).toBe(0.5);
    expect(a.taxaSaidaUti).toBe(1);
    expect(a.taxaMelhora).toBe(0.5);
  });

  it("ignora leitos vagos no denominador", () => {
    const registos = [
      reg({
        leitos: [{ ...leitoBase, vago: true, pacienteEmVm: true }],
      }),
    ];
    const a = calcularAgregadoPeriodo(registos, {});
    expect(a.contagem.leitosOcupados).toBe(0);
    expect(a.taxaUsoVm).toBeNull();
  });
});

describe("classificarKpi", () => {
  it("classifica menor_melhor", () => {
    expect(
      classificarKpi(0.04, { direcao: "menor_melhor", okLimite: 0.05, alertaLimite: 0.08 })
    ).toBe("ok");
    expect(
      classificarKpi(0.06, { direcao: "menor_melhor", okLimite: 0.05, alertaLimite: 0.08 })
    ).toBe("alerta");
    expect(
      classificarKpi(0.2, { direcao: "menor_melhor", okLimite: 0.05, alertaLimite: 0.08 })
    ).toBe("critico");
  });

  it("classifica maior_melhor", () => {
    expect(
      classificarKpi(0.9, { direcao: "maior_melhor", okLimite: 0.85, alertaLimite: 0.75 })
    ).toBe("ok");
    expect(
      classificarKpi(0.8, { direcao: "maior_melhor", okLimite: 0.85, alertaLimite: 0.75 })
    ).toBe("alerta");
    expect(
      classificarKpi(0.5, { direcao: "maior_melhor", okLimite: 0.85, alertaLimite: 0.75 })
    ).toBe("critico");
  });
});

describe("contarPlantoesPorMes", () => {
  it("agrupa passagens por YYYY-MM no período", () => {
    const registos: RegistoPlantaoNormalizado[] = [
      reg({ data: "2026-04-01" }),
      reg({ id: "r2", passagemId: "p2", data: "2026-04-15" }),
      reg({ id: "r3", passagemId: "p3", data: "2026-05-02" }),
    ];
    const porMes = contarPlantoesPorMes(registos, {
      unidadeId: "uti-01",
      dataInicio: "2026-04-01",
      dataFim: "2026-05-31",
    });
    expect(porMes).toEqual([
      { mes: "2026-04", total: 2 },
      { mes: "2026-05", total: 1 },
    ]);
  });
});

describe("gerarSerieDiaria", () => {
  it("inclui todos os dias do intervalo", () => {
    const serie = gerarSerieDiaria([], {
      unidadeId: "uti-01",
      dataInicio: "2026-04-01",
      dataFim: "2026-04-03",
    });
    expect(serie.map((s) => s.data)).toEqual(["2026-04-01", "2026-04-02", "2026-04-03"]);
  });
});
