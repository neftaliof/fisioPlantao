import { useState, useCallback } from "react";
import {
  Save,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { BundlePav021, PavBundleBloco021, PavCompliance, Turno } from "../types";
import { useAuth } from "../context/AuthContext";
import { LogoSantaCasa } from "./LogoSantaCasa";
import {
  getOrCreatePav021Rascunho,
  savePav021Rascunho,
  clearPav021Rascunho,
  emptyPav021Bundle,
} from "../data/pav021Store";
import { MEDIDAS_PAV_BUNDLE, PAV_BLOCOS_POR_PAGINA } from "../data/pav021Constants";

const inputCls =
  "w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400";
const labelCls = "text-xs font-medium text-slate-600 block mb-1";

function blocoTemConteudo(b: PavBundleBloco021): boolean {
  const med = b.medidas.some((x) => x === "C" || x === "NC" || x === "NA");
  return med || Boolean(b.dataAplicacao.trim()) || Boolean(b.turno);
}

function setMedidaCompliance(
  blocos: PavBundleBloco021[],
  blocoIndex: number,
  medidaIndex: number,
  valor: PavCompliance
): PavBundleBloco021[] {
  return blocos.map((b, bi) => {
    if (bi !== blocoIndex) return b;
    const medidas = [...b.medidas];
    medidas[medidaIndex] = valor;
    return { ...b, medidas };
  });
}

export function FormBundlePav021() {
  const { user } = useAuth();
  const uid = user?.id ?? "anon";
  const unome = user?.nome ?? "Usuário";

  const [form, setForm] = useState<BundlePav021>(() =>
    getOrCreatePav021Rascunho(uid, unome)
  );
  const [indiceRegisto, setIndiceRegisto] = useState(0);
  const [salvo, setSalvo] = useState(false);

  const totalRegistos = form.blocos.length;
  const bi = Math.min(indiceRegisto, Math.max(0, totalRegistos - 1));
  const blocoAtivo = form.blocos[bi] ?? form.blocos[0];

  const patch = useCallback((p: Partial<BundlePav021>) => {
    setForm((prev) => ({ ...prev, ...p }));
  }, []);

  const patchBloco = useCallback(
    (index: number, p: Partial<PavBundleBloco021>) => {
      setForm((prev) => ({
        ...prev,
        blocos: prev.blocos.map((b, i) => (i === index ? { ...b, ...p } : b)),
      }));
    },
    []
  );

  const setMedida = useCallback(
    (blocoIndex: number, medidaIndex: number, valor: PavCompliance) => {
      setForm((prev) => ({
        ...prev,
        blocos: setMedidaCompliance(prev.blocos, blocoIndex, medidaIndex, valor),
      }));
    },
    []
  );

  const salvar = () => {
    savePav021Rascunho({
      ...form,
      preenchidoPorId: uid,
      preenchidoPorNome: unome,
    });
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2500);
  };

  const limpar = () => {
    clearPav021Rascunho();
    setIndiceRegisto(0);
    setForm(emptyPav021Bundle(uid, unome));
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-start gap-4 lg:gap-8">
          <div className="flex-shrink-0">
            <LogoSantaCasa variant="color" size={100} />
          </div>
          <div className="flex-1 min-w-0 text-center lg:text-left">
            <p className="text-xs uppercase tracking-wide text-teal-700 font-semibold">
              SCMA.SCIH.FOR.021
            </p>
            <h1 className="text-lg sm:text-xl font-semibold text-slate-800">
              Bundle de prevenção de PAV
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Santa Casa de Misericórdia de Anápolis — pneumonia associada à ventilação mecânica
            </p>
          </div>
          <div className="text-xs text-slate-500 space-y-0.5 lg:text-right flex-shrink-0">
            <p>Elaboração: 06/03/2024</p>
            <p>Versão: 1</p>
            <p>Página 1 de 2</p>
            <p>Próxima revisão: 06/03/2027</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={limpar}
            className="inline-flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50"
          >
            <RotateCcw size={14} />
            Limpar
          </button>
          <button
            type="button"
            onClick={salvar}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700"
          >
            {salvo ? <CheckCircle2 size={14} /> : <Save size={14} />}
            {salvo ? "Rascunho salvo" : "Salvar rascunho"}
          </button>
        </div>
      </div>

      <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-2">
          <ShieldCheck className="text-amber-800 flex-shrink-0 mt-0.5" size={18} />
          <div className="text-xs sm:text-sm text-amber-950 space-y-1">
            <p className="font-semibold">Legenda</p>
            <p>
              <strong>C</strong> — Conforme &nbsp;|&nbsp; <strong>NC</strong> — Não conforme &nbsp;|&nbsp;{" "}
              <strong>NA</strong> — Não se aplica
            </p>
            <p className="text-amber-900/90">
              O impresso prevê {PAV_BLOCOS_POR_PAGINA} registos (ex.: por plantão ou momento de
              verificação). Use o seletor para alternar — só um registo aparece de cada vez.
              Preencha a data e o turno quando aplicável.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-800">Identificação</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className={labelCls}>Paciente</label>
            <input
              className={inputCls}
              value={form.paciente}
              onChange={(e) => patch({ paciente: e.target.value })}
            />
          </div>
          <div>
            <label className={labelCls}>Leito</label>
            <input
              className={inputCls}
              value={form.leito}
              onChange={(e) => patch({ leito: e.target.value })}
            />
          </div>
          <div className="sm:col-span-3">
            <label className={labelCls}>Setor / UTI</label>
            <input
              className={inputCls}
              value={form.setor}
              onChange={(e) => patch({ setor: e.target.value })}
              placeholder="Ex.: UTI Adulto"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-semibold text-slate-800">Checklist por registo</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={bi <= 0}
              onClick={() => setIndiceRegisto((i) => Math.max(0, i - 1))}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Anterior</span>
            </button>
            <span className="min-w-[8.5rem] text-center text-sm font-semibold text-slate-800">
              Registo {bi + 1} de {totalRegistos}
            </span>
            <button
              type="button"
              disabled={bi >= totalRegistos - 1}
              onClick={() => setIndiceRegisto((i) => Math.min(totalRegistos - 1, i + 1))}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40"
            >
              <span className="hidden sm:inline">Próximo</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="sm:hidden">
          <label className={labelCls}>Ir para registo</label>
          <select
            className={inputCls}
            value={bi}
            onChange={(e) => setIndiceRegisto(Number(e.target.value))}
          >
            {form.blocos.map((b, i) => (
              <option key={b.id} value={i}>
                Registo {i + 1}
                {blocoTemConteudo(b) ? " (com dados)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="hidden flex-wrap justify-center gap-1.5 sm:flex">
          {form.blocos.map((b, i) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setIndiceRegisto(i)}
              title={`Registo ${i + 1}${blocoTemConteudo(b) ? " — com dados" : ""}`}
              className={`inline-flex min-w-[2.25rem] items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
                i === bi
                  ? "bg-teal-600 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {blocoTemConteudo(b) && (
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${i === bi ? "bg-white" : "bg-teal-500"}`}
                  aria-hidden
                />
              )}
              {i + 1}
            </button>
          ))}
        </div>

        <div
          key={blocoAtivo.id}
          className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2">
            <span className="text-sm font-semibold text-slate-800">
              Medidas — registo {bi + 1}
            </span>
          </div>

          <div className="flex flex-col gap-4 p-3 sm:p-4 lg:flex-row">
            <div className="min-w-0 flex-1 overflow-x-auto">
              <table className="w-full min-w-[320px] border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100">
                    <th className="w-[55%] px-2 py-2 text-left font-semibold text-slate-700 sm:w-auto">
                      Medida preventiva adotada
                    </th>
                    <th className="w-12 px-1 py-2 text-center font-semibold text-slate-700 sm:w-16">
                      C
                    </th>
                    <th className="w-12 px-1 py-2 text-center font-semibold text-slate-700 sm:w-16">
                      NC
                    </th>
                    <th className="w-12 px-1 py-2 text-center font-semibold text-slate-700 sm:w-16">
                      NA
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {MEDIDAS_PAV_BUNDLE.map((m, mi) => {
                    const v = blocoAtivo.medidas[mi] ?? "";
                    const name = `pav021-r${bi}-m${mi}`;
                    return (
                      <tr
                        key={m.id}
                        className="border-b border-slate-100 align-middle last:border-0"
                      >
                        <td className="px-2 py-2.5 leading-snug text-slate-800">{m.texto}</td>
                        <td className="px-1 py-2 text-center">
                          <input
                            type="radio"
                            name={name}
                            title="Conforme"
                            checked={v === "C"}
                            onChange={() => setMedida(bi, mi, "C")}
                            className="text-teal-600 focus:ring-teal-500"
                          />
                        </td>
                        <td className="px-1 py-2 text-center">
                          <input
                            type="radio"
                            name={name}
                            title="Não conforme"
                            checked={v === "NC"}
                            onChange={() => setMedida(bi, mi, "NC")}
                            className="text-teal-600 focus:ring-teal-500"
                          />
                        </td>
                        <td className="px-1 py-2 text-center">
                          <input
                            type="radio"
                            name={name}
                            title="Não se aplica"
                            checked={v === "NA"}
                            onChange={() => setMedida(bi, mi, "NA")}
                            className="text-teal-600 focus:ring-teal-500"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex shrink-0 flex-col gap-3 border-t border-slate-200 pt-3 lg:w-44 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
              <div>
                <label className={labelCls}>Data de aplicação</label>
                <input
                  type="date"
                  className={inputCls}
                  value={blocoAtivo.dataAplicacao}
                  onChange={(e) => patchBloco(bi, { dataAplicacao: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls}>Turno</label>
                <select
                  className={inputCls}
                  value={blocoAtivo.turno}
                  onChange={(e) =>
                    patchBloco(bi, { turno: e.target.value as Turno | "" })
                  }
                >
                  <option value="">—</option>
                  <option value="Matutino">Matutino</option>
                  <option value="Vespertino">Vespertino</option>
                  <option value="Noturno">Noturno</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Assinatura / carimbo (digital)</label>
                <input
                  className={inputCls}
                  value={blocoAtivo.profissionalNome}
                  onChange={(e) => patchBloco(bi, { profissionalNome: e.target.value })}
                  placeholder={unome}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <p className="text-xs text-slate-600 text-center leading-relaxed max-w-2xl mx-auto">
          Documento elaborado para apoio à prevenção de PAV. Registos sujeitos às normas da
          Comissão de Controle de Infecção Hospitalar e da Qualidade assistencial.
        </p>
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full min-w-[480px] text-xs border-collapse table-fixed">
            <tbody>
              <tr>
                <th
                  scope="row"
                  className="border border-slate-300 bg-slate-100 px-2 py-2 text-left font-semibold text-slate-800 w-[22%]"
                >
                  Elaboração
                </th>
                <td className="border border-slate-300 px-2 py-2 text-slate-700">
                  CCIH / Fisioterapia
                </td>
                <th
                  scope="row"
                  className="border border-slate-300 bg-slate-100 px-2 py-2 text-left font-semibold text-slate-800 w-[22%]"
                >
                  Revisão
                </th>
                <td className="border border-slate-300 px-2 py-2 text-slate-700">
                  Qualidade / SCIH
                </td>
              </tr>
              <tr>
                <th
                  scope="row"
                  className="border border-slate-300 bg-slate-100 px-2 py-2 text-left font-semibold text-slate-800"
                >
                  Aprovação
                </th>
                <td className="border border-slate-300 px-2 py-2 text-slate-700">
                  Diretoria assistencial
                </td>
                <th
                  scope="row"
                  className="border border-slate-300 bg-slate-100 px-2 py-2 text-left font-semibold text-slate-800"
                >
                  Vigência
                </th>
                <td className="border border-slate-300 px-2 py-2 text-slate-700">
                  Conforme rodapé do impresso
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-2 pb-8">
        <button
          type="button"
          onClick={limpar}
          className="inline-flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50"
        >
          <RotateCcw size={14} />
          Limpar formulário
        </button>
        <button
          type="button"
          onClick={salvar}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700"
        >
          <Save size={14} />
          Salvar rascunho
        </button>
      </div>
    </div>
  );
}
