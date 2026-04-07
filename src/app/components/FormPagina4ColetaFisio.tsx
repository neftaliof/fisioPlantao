import { useState, useCallback, type ChangeEvent } from "react";
import {
  Save,
  RotateCcw,
  CheckCircle2,
  ClipboardList,
  UserRound,
  Activity,
  Stethoscope,
  Lock,
  UserCheck,
  FlaskConical,
} from "lucide-react";
import type {
  ColetaDadosFisioPagina4,
  FuncionalidadeLinhaPag4,
  MetaTerapeutica017,
  PrescricaoExercicio017,
  TriSimNao,
} from "../types";
import { useAuth } from "../context/AuthContext";
import {
  emptyColetaPagina4,
  chavePacientePagina4,
  salvarFichaPacientePagina4,
  mergeColetaPagina4,
} from "../data/pagina4Store";
import { upsertPacienteAdmissaoPagina4 } from "../data/pacientesCadastroStore";
import {
  CNT_QUALI_FISIO_ITENS,
  COMPLICACOES_PAG4,
  TEXTO_REF_DINAMOMETRIA,
  TEXTO_REF_PIMAX_PEMAX,
} from "../data/pagina4Constants";

const inputCls =
  "w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400";
const selectCls = `${inputCls} bg-white cursor-pointer`;
const labelCls = "text-xs font-medium text-slate-600 block mb-1";
const boxCls =
  "w-full min-w-0 space-y-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5";
const h2Cls = "text-sm font-semibold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2";

const pag4CardShellCls =
  "w-full overflow-hidden rounded-xl border border-emerald-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_16px_rgba(0,0,0,0.06)]";
const pag4SectionTitleCls =
  "mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400";
const pag4ClinicalLabelCls =
  "mb-1 block text-[11px] font-medium uppercase tracking-[0.06em] text-teal-900/75";
const pag4HeaderInputCls =
  "block w-[6rem] rounded-lg border border-white/40 bg-white/10 px-2 py-1.5 text-center text-sm font-medium text-white outline-none transition placeholder:text-white/45 focus:border-white focus:ring-2 focus:ring-white/35 disabled:cursor-not-allowed disabled:opacity-50 sm:w-24";
const pag4BodyInputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-800 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/25 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60";
const pag4BodySelectCls = `${pag4BodyInputCls} cursor-pointer`;

const HORAS_00_A_24 = Array.from({ length: 25 }, (_, i) => String(i).padStart(2, "0"));
const MINUTOS_00_A_59 = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
const IDADES_1_A_150 = Array.from({ length: 150 }, (_, i) => String(i + 1));

function parseHoraAdmissao(horaAdmissao: string): { h: string; m: string } {
  const raw = horaAdmissao?.trim();
  if (!raw) return { h: "", m: "" };
  const m = raw.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return { h: "", m: "" };
  let h = parseInt(m[1], 10);
  if (Number.isNaN(h)) return { h: "", m: "" };
  h = Math.min(24, Math.max(0, h));
  let min = parseInt(m[2], 10);
  if (Number.isNaN(min)) min = 0;
  min = Math.min(59, Math.max(0, min));
  if (h === 24) min = 0;
  return { h: String(h).padStart(2, "0"), m: String(min).padStart(2, "0") };
}

function joinHoraAdmissao(h: string, m: string): string {
  if (!h) return "";
  const hn = parseInt(h, 10);
  if (Number.isNaN(hn)) return "";
  if (hn === 24) return "24:00";
  const mm = (m || "00").padStart(2, "0");
  return `${String(hn).padStart(2, "0")}:${mm}`;
}

function sexoSelectValue(sexo: string): "" | "M" | "F" {
  const s = sexo.trim().toUpperCase();
  if (s === "M" || s === "MAS" || s.startsWith("MASC")) return "M";
  if (s === "F" || s.startsWith("FEM")) return "F";
  return s === "M" || s === "F" ? s : "";
}

function idadeSelectValue(idade: string): string {
  const n = parseInt(idade.trim(), 10);
  return !Number.isNaN(n) && n >= 1 && n <= 150 ? String(n) : "";
}

function toggleId(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

function FloatingTextField({
  id,
  label,
  value,
  onChange,
  disabled,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  autoComplete?: string;
}) {
  return (
    <div className="relative min-w-0">
      <input
        id={id}
        type="text"
        placeholder=" "
        autoComplete={autoComplete}
        disabled={disabled}
        value={value}
        onChange={onChange}
        className="peer w-full rounded-lg border border-slate-200 bg-white px-3 pb-2 pt-5 text-sm text-slate-800 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/25 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60"
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-3 top-3.5 z-10 origin-[0] text-sm text-slate-500 transition-all duration-200 peer-focus:top-1.5 peer-focus:scale-[0.72] peer-focus:text-teal-700 peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:scale-[0.72] peer-[:not(:placeholder-shown)]:text-teal-800"
      >
        {label}
      </label>
    </div>
  );
}

function SimNao({
  name,
  value,
  onChange,
}: {
  name: string;
  value: TriSimNao;
  onChange: (v: TriSimNao) => void;
}) {
  return (
    <div className="flex flex-wrap gap-4">
      <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
        <input
          type="radio"
          name={name}
          checked={value === "nao"}
          onChange={() => onChange("nao")}
          className="text-teal-600"
        />
        Não
      </label>
      <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
        <input
          type="radio"
          name={name}
          checked={value === "sim"}
          onChange={() => onChange("sim")}
          className="text-teal-600"
        />
        Sim
      </label>
    </div>
  );
}

export function FormPagina4ColetaFisio() {
  const { user } = useAuth();
  const uid = user?.id ?? "anon";
  const unome = user?.nome ?? "Usuário";

  const [form, setForm] = useState<ColetaDadosFisioPagina4>(() =>
    emptyColetaPagina4(uid, unome)
  );
  const [acaoFeedback, setAcaoFeedback] = useState<null | "rascunho" | "cadastro">(null);

  const chaveAtual = chavePacientePagina4(form.paciente, form.dataNascimento);
  const admissaoBloqueada = form.admissaoConcluida;
  const { h: horaH, m: horaM } = parseHoraAdmissao(form.horaAdmissao);

  const patch = useCallback((p: Partial<ColetaDadosFisioPagina4>) => {
    setForm((prev) => ({ ...prev, ...p }));
  }, []);

  const patchFunc = useCallback(
    (key: "funcHigiene" | "funcLocomocao" | "funcAlimentacao" | "funcVestir", p: Partial<FuncionalidadeLinhaPag4>) => {
      setForm((prev) => ({
        ...prev,
        [key]: { ...prev[key], ...p },
      }));
    },
    []
  );

  const patchMeta = useCallback((i: number, p: Partial<MetaTerapeutica017>) => {
    setForm((prev) => ({
      ...prev,
      metasTerapeuticas: prev.metasTerapeuticas.map((m, j) =>
        j === i ? { ...m, ...p } : m
      ),
    }));
  }, []);

  const patchPresc = useCallback((i: number, p: Partial<PrescricaoExercicio017>) => {
    setForm((prev) => ({
      ...prev,
      prescricaoExercicios: prev.prescricaoExercicios.map((x, j) =>
        j === i ? { ...x, ...p } : x
      ),
    }));
  }, []);

  const persistirFichaAtual = (
    dados: ColetaDadosFisioPagina4
  ): ColetaDadosFisioPagina4 | null => {
    const k = chavePacientePagina4(dados.paciente, dados.dataNascimento);
    if (!k) {
      window.alert(
        "Informe o nome do paciente e a data de nascimento para guardar a ficha."
      );
      return null;
    }
    const merged = mergeColetaPagina4(
      { ...dados, preenchidoPorId: uid, preenchidoPorNome: unome },
      uid,
      unome
    );
    salvarFichaPacientePagina4(k, merged);
    setForm(merged);
    return merged;
  };

  const salvarRascunho = () => {
    if (admissaoBloqueada) return;
    if (!persistirFichaAtual(form)) return;
    setAcaoFeedback("rascunho");
    setTimeout(() => setAcaoFeedback(null), 2500);
  };

  const concluirCadastro = () => {
    if (form.admissaoConcluida) return;
    if (
      !window.confirm(
        "Concluir admissão? Esta ficha (identificação, admissão e avaliação FOR.017) não poderá mais ser alterada. O destino na alta continuará editável depois."
      )
    ) {
      return;
    }
    const now = new Date().toISOString();
    const next: ColetaDadosFisioPagina4 = {
      ...form,
      preenchidoPorId: uid,
      preenchidoPorNome: unome,
      admissaoConcluida: true,
      admissaoConcluidaEm: now,
      admissaoConcluidaPorNome: unome,
    };
    const merged = persistirFichaAtual(next);
    if (!merged) return;
    upsertPacienteAdmissaoPagina4({
      paciente: merged.paciente,
      dataNascimento: merged.dataNascimento,
      internacaoMensalNum: merged.internacaoMensalNum,
      dataAdmissao: merged.dataAdmissao,
      procedencia: merged.procedencia,
      admissaoConcluidaEm: now,
    });
    setAcaoFeedback("cadastro");
    setTimeout(() => setAcaoFeedback(null), 2500);
  };

  const salvarCadastro = () => {
    if (!chaveAtual) return;
    if (admissaoBloqueada) {
      if (!persistirFichaAtual(form)) return;
      setAcaoFeedback("cadastro");
      setTimeout(() => setAcaoFeedback(null), 2500);
      return;
    }
    concluirCadastro();
  };

  const limparDados = () => {
    if (admissaoBloqueada) return;
    if (
      !window.confirm(
        "Limpar todos os dados neste ecrã? A ficha já gravada no armazenamento local do navegador (se existir) não é apagada."
      )
    ) {
      return;
    }
    setForm(emptyColetaPagina4(uid, unome));
  };

  const planoLine = (i: number) => (
    <div key={i}>
      <label className={labelCls}>Item {i + 1}</label>
      <input
        className={inputCls}
        value={form.planoTerapeutico[i] ?? ""}
        onChange={(e) => {
          const next = [...form.planoTerapeutico];
          next[i] = e.target.value;
          patch({ planoTerapeutico: next });
        }}
      />
    </div>
  );

  return (
    <div className="min-h-0 w-full min-w-0 space-y-6 bg-[#f0fdf4] pb-8 text-slate-800">
      <div className={pag4CardShellCls}>
        <div className="flex flex-col gap-4 bg-teal-600 px-6 py-5 sm:flex-row sm:items-center">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-white/40 bg-white/15 text-white"
            role="img"
            aria-label="Sem foto do paciente — avatar genérico"
          >
            <UserRound className="h-7 w-7" strokeWidth={1.5} aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-medium tracking-tight text-white">
              {form.paciente.trim() || "Novo paciente"}
            </p>
            <p className="mt-0.5 text-xs text-white/75">Santa Casa · Fisioplantão · Anápolis</p>
          </div>
          <div className="shrink-0 text-left sm:ml-auto sm:text-right">
            <label
              htmlFor="pag4-internacao-mensal-header"
              className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-white/65"
            >
              Internação mensal nº
            </label>
            <input
              id="pag4-internacao-mensal-header"
              className={`${pag4HeaderInputCls} mt-1`}
              disabled={admissaoBloqueada}
              value={form.internacaoMensalNum}
              onChange={(e) => patch({ internacaoMensalNum: e.target.value })}
              placeholder="—"
            />
          </div>
        </div>

        <div className="space-y-6 px-6 pb-2 pt-6 text-sm md:px-8">
          <section className="min-w-0" aria-labelledby="pag4-sec-ident">
            <h2 id="pag4-sec-ident" className={pag4SectionTitleCls}>
              Identificação
            </h2>
            <FloatingTextField
              id="pag4-header-paciente"
              label="Nome completo do paciente"
              value={form.paciente}
              onChange={(e) => patch({ paciente: e.target.value })}
              disabled={admissaoBloqueada}
              autoComplete="name"
            />
          </section>

          <hr className="border-0 border-t border-slate-200" />

          <section className="min-w-0 space-y-4" aria-labelledby="pag4-sec-datas">
            <h2 id="pag4-sec-datas" className={pag4SectionTitleCls}>
              Datas e admissão
            </h2>
            <div className="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-12">
              <div className="min-w-0 sm:col-span-7">
                <FloatingTextField
                  id="pag4-header-procedencia"
                  label="Procedência / Encaminhamento"
                  value={form.procedencia}
                  onChange={(e) => patch({ procedencia: e.target.value })}
                  disabled={admissaoBloqueada}
                />
              </div>
              <div className="min-w-0 sm:col-span-2">
                <label htmlFor="pag4-header-sexo" className={pag4ClinicalLabelCls}>
                  Sexo
                </label>
                <select
                  id="pag4-header-sexo"
                  className={pag4BodySelectCls}
                  disabled={admissaoBloqueada}
                  value={sexoSelectValue(form.sexo)}
                  onChange={(e) => patch({ sexo: e.target.value })}
                >
                  <option value="">Selecione o sexo</option>
                  <option value="M">M</option>
                  <option value="F">F</option>
                </select>
              </div>
              <div className="min-w-0 sm:col-span-3">
                <label htmlFor="pag4-header-idade" className={pag4ClinicalLabelCls}>
                  Idade
                </label>
                <select
                  id="pag4-header-idade"
                  className={pag4BodySelectCls}
                  disabled={admissaoBloqueada}
                  value={idadeSelectValue(form.idade)}
                  onChange={(e) => patch({ idade: e.target.value })}
                >
                  <option value="">Selecione a idade</option>
                  {IDADES_1_A_150.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div className="min-w-0 sm:col-span-4">
                <label htmlFor="pag4-header-dt-nasc" className={pag4ClinicalLabelCls}>
                  Data de nascimento
                </label>
                <input
                  id="pag4-header-dt-nasc"
                  type="date"
                  className={pag4BodyInputCls}
                  disabled={admissaoBloqueada}
                  value={form.dataNascimento}
                  onChange={(e) => patch({ dataNascimento: e.target.value })}
                />
              </div>
              <div className="min-w-0 sm:col-span-4">
                <label htmlFor="pag4-header-dt-adm" className={pag4ClinicalLabelCls}>
                  Data de admissão
                </label>
                <input
                  id="pag4-header-dt-adm"
                  type="date"
                  className={pag4BodyInputCls}
                  disabled={admissaoBloqueada}
                  value={form.dataAdmissao}
                  onChange={(e) => patch({ dataAdmissao: e.target.value })}
                />
              </div>
              <div className="min-w-0 sm:col-span-4">
                <span className={pag4ClinicalLabelCls}>Hora e min</span>
                <div className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1.5">
                  <select
                    id="pag4-header-hora"
                    aria-label="Hora de admissão"
                    className={`${pag4BodySelectCls} min-w-0 w-full`}
                    disabled={admissaoBloqueada}
                    value={horaH}
                    onChange={(e) => {
                      const nh = e.target.value;
                      if (!nh) {
                        patch({ horaAdmissao: "" });
                        return;
                      }
                      const { m: curM } = parseHoraAdmissao(form.horaAdmissao);
                      patch({
                        horaAdmissao: joinHoraAdmissao(nh, nh === "24" ? "00" : curM || "00"),
                      });
                    }}
                  >
                    <option value="">Selecione a hora</option>
                    {HORAS_00_A_24.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                  <span
                    className="shrink-0 self-center text-sm font-medium text-slate-400"
                    aria-hidden
                  >
                    :
                  </span>
                  <select
                    id="pag4-header-min"
                    aria-label="Minutos de admissão"
                    className={`${pag4BodySelectCls} min-w-0 w-full`}
                    disabled={admissaoBloqueada || !horaH || horaH === "24"}
                    value={!horaH ? "" : horaH === "24" ? "00" : horaM || "00"}
                    onChange={(e) => {
                      const nm = e.target.value;
                      const { h: curH } = parseHoraAdmissao(form.horaAdmissao);
                      if (!curH || nm === "") return;
                      patch({ horaAdmissao: joinHoraAdmissao(curH, nm) });
                    }}
                  >
                    {!horaH ? <option value="">Selecione os minutos</option> : null}
                    {MINUTOS_00_A_59.map((mm) => (
                      <option key={mm} value={mm}>
                        {mm}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200/90 bg-slate-50/60 px-6 py-4 md:px-8">
          <button
            type="button"
            onClick={limparDados}
            disabled={admissaoBloqueada}
            className="inline-flex items-center gap-2 rounded-lg border-0 bg-transparent px-3 py-2 text-sm text-slate-500 transition hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw size={14} />
            Limpar dados
          </button>
          <button
            type="button"
            onClick={salvarRascunho}
            disabled={!chaveAtual || admissaoBloqueada}
            className="inline-flex items-center gap-2 rounded-lg border border-teal-600 bg-white px-3 py-2 text-sm font-medium text-teal-700 shadow-sm transition hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {acaoFeedback === "rascunho" ? <CheckCircle2 size={14} /> : <Save size={14} />}
            {acaoFeedback === "rascunho" ? "Rascunho guardado" : "Salvar rascunho"}
          </button>
          <button
            type="button"
            onClick={salvarCadastro}
            disabled={!chaveAtual}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0d9488] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {acaoFeedback === "cadastro" ? <CheckCircle2 size={14} /> : <UserCheck size={14} />}
            {acaoFeedback === "cadastro" ? "Guardado" : "Salvar cadastro"}
          </button>
        </div>
      </div>

      <div className="w-full min-w-0 space-y-1 rounded-xl border border-emerald-100 bg-white/90 px-4 py-3 text-xs text-slate-700 shadow-sm">
        <p>
          <strong className="text-slate-800">Chave da ficha:</strong> nome do paciente + data de nascimento.
          {chaveAtual ? (
            <span className="text-teal-700 ml-1">
              Ficha identificada — pode usar <strong>Salvar rascunho</strong> ou{" "}
              <strong>Salvar cadastro</strong>.
            </span>
          ) : (
            <span className="text-amber-700 ml-1">
              Preencha nome e data de nascimento para ativar{" "}
              <strong>Salvar rascunho</strong> e <strong>Salvar cadastro</strong>.
            </span>
          )}
        </p>
        {admissaoBloqueada && (
          <p className="flex items-start gap-2 text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <Lock size={14} className="flex-shrink-0 mt-0.5" />
            <span>
              Admissão concluída em{" "}
              {form.admissaoConcluidaEm
                ? new Date(form.admissaoConcluidaEm).toLocaleString("pt-BR")
                : "—"}{" "}
              por {form.admissaoConcluidaPorNome || "—"}. Só o bloco <strong>Destino do paciente</strong> (saída)
              permanece editável.
            </span>
          </p>
        )}
      </div>

      <fieldset
        disabled={admissaoBloqueada}
        className="m-0 w-full min-w-0 space-y-6 border-0 p-0 pb-8 disabled:opacity-[0.68]"
      >
        <legend className="sr-only">
          Dados de admissão e avaliação — bloqueados após conclusão
        </legend>

      {/* Identificação — sem campo «Etiqueta» (descontinuado) */}
      <div className={boxCls}>
        <h2 className={h2Cls}>
          <UserRound size={18} className="text-teal-600" />
          Identificação e convênio
        </h2>
        <div>
          <span className={labelCls}>Convênio</span>
          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.convenioSus}
                onChange={(e) => patch({ convenioSus: e.target.checked })}
                className="rounded text-teal-600"
              />
              SUS
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.convenioUnimed}
                onChange={(e) => patch({ convenioUnimed: e.target.checked })}
                className="rounded text-teal-600"
              />
              Unimed
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.convenioOutro}
                onChange={(e) => patch({ convenioOutro: e.target.checked })}
                className="rounded text-teal-600"
              />
              Outro
            </label>
            {form.convenioOutro && (
              <input
                className={`${inputCls} max-w-xs`}
                placeholder="Especificar"
                value={form.convenioOutroTexto}
                onChange={(e) => patch({ convenioOutroTexto: e.target.value })}
              />
            )}
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
          <h3 className="text-xs font-semibold text-slate-800 flex items-center gap-2">
            <FlaskConical size={16} className="text-teal-600 shrink-0" />
            Exames laboratoriais (SPData)
          </h3>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Consulte os resultados no SPData e transcreva aqui para acompanhamento na ficha. Sem ligação
            automática ao laboratório nesta versão.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Hemograma</label>
              <textarea
                className={`${inputCls} min-h-[100px] resize-y`}
                rows={4}
                placeholder="Ex.: Hb, Ht, leucócitos, plaquetas…"
                value={form.exameHemogramaSpdata}
                onChange={(e) => patch({ exameHemogramaSpdata: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>Gasometria arterial</label>
              <textarea
                className={`${inputCls} min-h-[100px] resize-y`}
                rows={4}
                placeholder="Ex.: pH, pCO₂, pO₂, HCO₃, lactato, BE…"
                value={form.exameGasometriaArterialSpdata}
                onChange={(e) => patch({ exameGasometriaArterialSpdata: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={boxCls}>
        <h2 className={h2Cls}>
          <ClipboardList size={18} className="text-teal-600" />
          Admissão
        </h2>
        <div>
          <span className={labelCls}>Admitido em</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
            {(
              [
                ["admitidoVM", "VM"],
                ["admitidoVNI", "VNI"],
                ["admitidoTendaO2", "Tenda O₂"],
                ["admitidoMascara", "Máscara"],
                ["admitidoCateterNasal", "Catéter nasal"],
                ["admitidoArAmbiente", "Ar ambiente"],
              ] as const
            ).map(([k, lab]) => (
              <label key={k} className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={Boolean(form[k])}
                  onChange={(e) => patch({ [k]: e.target.checked } as Partial<ColetaDadosFisioPagina4>)}
                  className="rounded text-teal-600"
                />
                {lab}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className={labelCls}>Indicação de internação em UTI</label>
          <textarea
            className={`${inputCls} min-h-[64px]`}
            value={form.indicacaoUti}
            onChange={(e) => patch({ indicacaoUti: e.target.value })}
            rows={2}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className={labelCls}>Patologia crônica</span>
            <SimNao
              name="patCr"
              value={form.patologiaCronica}
              onChange={(v) => patch({ patologiaCronica: v })}
            />
            <input
              className={`${inputCls} mt-2`}
              placeholder="Especificar se sim"
              value={form.patologiaCronicaDetalhe}
              onChange={(e) => patch({ patologiaCronicaDetalhe: e.target.value })}
            />
          </div>
          <div>
            <span className={labelCls}>Internação pregressa</span>
            <SimNao
              name="intPreg"
              value={form.internacaoPregressa}
              onChange={(v) => patch({ internacaoPregressa: v })}
            />
            <input
              className={`${inputCls} mt-2`}
              placeholder="Especificar se sim"
              value={form.internacaoPregressaDetalhe}
              onChange={(e) => patch({ internacaoPregressaDetalhe: e.target.value })}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>Peso predito (kg)</label>
            <input
              className={inputCls}
              value={form.pesoPredito}
              onChange={(e) => patch({ pesoPredito: e.target.value })}
            />
          </div>
          <div>
            <label className={labelCls}>Estatura (cm)</label>
            <input
              className={inputCls}
              value={form.estatura}
              onChange={(e) => patch({ estatura: e.target.value })}
            />
          </div>
          <div>
            <label className={labelCls}>Envergadura (cm)</label>
            <input
              className={inputCls}
              value={form.envergadura}
              onChange={(e) => patch({ envergadura: e.target.value })}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <span className={labelCls}>Intercorrências no transporte</span>
            <SimNao
              name="intTrans"
              value={form.intercorrenciasTransporte}
              onChange={(v) => patch({ intercorrenciasTransporte: v })}
            />
          </div>
          <div>
            <span className={labelCls}>Necessidade de reanimação (transporte)</span>
            <SimNao
              name="reanim"
              value={form.reanimacaoTransporte}
              onChange={(v) => patch({ reanimacaoTransporte: v })}
            />
          </div>
          <div>
            <span className={labelCls}>Dependente crônico de O₂</span>
            <SimNao
              name="depO2"
              value={form.dependenteO2}
              onChange={(v) => patch({ dependenteO2: v })}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>PPS (Palliative Performance Scale)</label>
            <input
              className={inputCls}
              value={form.pps}
              onChange={(e) => patch({ pps: e.target.value })}
            />
          </div>
          <div>
            <label className={labelCls}>Reavaliação (PPS)</label>
            <input
              className={inputCls}
              value={form.ppsReavaliacao}
              onChange={(e) => patch({ ppsReavaliacao: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className={labelCls}>Diagnósticos</label>
          <textarea
            className={`${inputCls} min-h-[80px]`}
            value={form.diagnosticos}
            onChange={(e) => patch({ diagnosticos: e.target.value })}
            rows={3}
          />
        </div>
        <div className="border border-slate-100 rounded-lg p-3 space-y-3 bg-slate-50/50">
          <p className="text-xs font-semibold text-slate-700">Dados oncológicos</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className={labelCls}>Realiza acompanhamento</span>
              <SimNao
                name="oncoAc"
                value={form.oncoAcompanhamento}
                onChange={(v) => patch({ oncoAcompanhamento: v })}
              />
            </div>
            <div>
              <label className={labelCls}>Tempo de doença</label>
              <input
                className={inputCls}
                value={form.oncoTempoDoenca}
                onChange={(e) => patch({ oncoTempoDoenca: e.target.value })}
              />
            </div>
          </div>
          <div>
            <span className={labelCls}>Tratamento</span>
            <div className="flex flex-wrap gap-4 mt-1">
              <label className="inline-flex items-center gap-2 text-xs">
                <input
                  type="radio"
                  name="oncoTrat"
                  checked={form.oncoTratamento === "curativo"}
                  onChange={() => patch({ oncoTratamento: "curativo" })}
                  className="text-teal-600"
                />
                Curativo
              </label>
              <label className="inline-flex items-center gap-2 text-xs">
                <input
                  type="radio"
                  name="oncoTrat"
                  checked={form.oncoTratamento === "paliativo"}
                  onChange={() => patch({ oncoTratamento: "paliativo" })}
                  className="text-teal-600"
                />
                Paliativo
              </label>
            </div>
          </div>
          <div>
            <span className={labelCls}>Metástase</span>
            <SimNao
              name="oncoMet"
              value={form.oncoMetastase}
              onChange={(v) => patch({ oncoMetastase: v })}
            />
          </div>
        </div>
      </div>

      <div className={boxCls}>
        <h2 className={h2Cls}>
          <Activity size={18} className="text-teal-600" />
          Avaliação ventilatória
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className={labelCls}>Oxigenoterapia</span>
            <SimNao
              name="oxy"
              value={form.oxigenoterapia}
              onChange={(v) => patch({ oxigenoterapia: v })}
            />
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <label className={labelCls}>Início</label>
                <input
                  type="date"
                  className={inputCls}
                  value={form.oxigenoterapiaInicio}
                  onChange={(e) => patch({ oxigenoterapiaInicio: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls}>Desmame</label>
                <input
                  className={inputCls}
                  value={form.oxigenoterapiaDesmame}
                  onChange={(e) => patch({ oxigenoterapiaDesmame: e.target.value })}
                  placeholder="Data ou observação"
                />
              </div>
            </div>
          </div>
          <div>
            <span className={labelCls}>Ventilação mecânica</span>
            <SimNao
              name="vm"
              value={form.ventilacaoMecanica}
              onChange={(v) => patch({ ventilacaoMecanica: v })}
            />
            <div className="grid grid-cols-1 gap-2 mt-2">
              <div>
                <label className={labelCls}>Data da IOT</label>
                <input
                  type="date"
                  className={inputCls}
                  value={form.vmDataIot}
                  onChange={(e) => patch({ vmDataIot: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls}>Desmame</label>
                <input
                  className={inputCls}
                  value={form.vmDesmame}
                  onChange={(e) => patch({ vmDesmame: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls}>Extubação</label>
                <input
                  className={inputCls}
                  value={form.vmExtubacao}
                  onChange={(e) => patch({ vmExtubacao: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className={labelCls}>VNI</span>
            <SimNao name="vni" value={form.vni} onChange={(v) => patch({ vni: v })} />
            <div className="mt-2">
              <label className={labelCls}>Início</label>
              <input
                type="date"
                className={inputCls}
                value={form.vniInicio}
                onChange={(e) => patch({ vniInicio: e.target.value })}
              />
            </div>
            <div className="mt-2">
              <span className={labelCls}>Intermitente</span>
              <SimNao
                name="vniInt"
                value={form.vniIntermitente}
                onChange={(v) => patch({ vniIntermitente: v })}
              />
            </div>
          </div>
          <div>
            <span className={labelCls}>Tosse</span>
            <div className="flex flex-col gap-2 mt-1">
              {(
                [
                  ["eficaz", "Eficaz"],
                  ["pouco_eficaz", "Pouco eficaz"],
                  ["ineficaz", "Ineficaz"],
                ] as const
              ).map(([val, lab]) => (
                <label key={val} className="inline-flex items-center gap-2 text-xs">
                  <input
                    type="radio"
                    name="tosse"
                    checked={form.tosse === val}
                    onChange={() => patch({ tosse: val })}
                    className="text-teal-600"
                  />
                  {lab}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={boxCls}>
        <h2 className={h2Cls}>
          <Stethoscope size={18} className="text-teal-600" />
          Avaliação de funcionalidade
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm border border-slate-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-slate-100">
                <th className="text-left p-2 border-b border-slate-200">Atividades</th>
                <th className="p-2 border-b border-slate-200 text-center w-28">Independência</th>
                <th className="text-left p-2 border-b border-slate-200">Limitação</th>
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ["funcHigiene", "Higiene pessoal"],
                  ["funcLocomocao", "Locomoção"],
                  ["funcAlimentacao", "Alimentação"],
                  ["funcVestir", "Vestir-se"],
                ] as const
              ).map(([key, titulo]) => {
                const row = form[key];
                return (
                  <tr key={key} className="border-b border-slate-100">
                    <td className="p-2 align-top font-medium text-slate-800">{titulo}</td>
                    <td className="p-2 align-top">
                      <div className="flex justify-center gap-2">
                        <label className="inline-flex flex-col items-center gap-0.5 text-[10px]">
                          <input
                            type="radio"
                            name={`ind-${key}`}
                            checked={row.independencia === "nao"}
                            onChange={() => patchFunc(key, { independencia: "nao" })}
                            className="text-teal-600"
                          />
                          Não
                        </label>
                        <label className="inline-flex flex-col items-center gap-0.5 text-[10px]">
                          <input
                            type="radio"
                            name={`ind-${key}`}
                            checked={row.independencia === "sim"}
                            onChange={() => patchFunc(key, { independencia: "sim" })}
                            className="text-teal-600"
                          />
                          Sim
                        </label>
                      </div>
                    </td>
                    <td className="p-2 align-top">
                      <input
                        className={inputCls}
                        value={row.limitacao}
                        onChange={(e) => patchFunc(key, { limitacao: e.target.value })}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div>
          <label className={labelCls}>Comunicação</label>
          <textarea
            className={`${inputCls} min-h-[56px]`}
            value={form.funcComunicacao}
            onChange={(e) => patch({ funcComunicacao: e.target.value })}
            rows={2}
          />
        </div>
        <div>
          <label className={labelCls}>Observações</label>
          <textarea
            className={`${inputCls} min-h-[56px]`}
            value={form.funcObservacoes}
            onChange={(e) => patch({ funcObservacoes: e.target.value })}
            rows={2}
          />
        </div>
      </div>

      <div className={boxCls}>
        <h2 className={h2Cls}>Complicações</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {COMPLICACOES_PAG4.map((c) => (
            <label key={c.id} className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.complicacoes.includes(c.id)}
                onChange={() =>
                  patch({ complicacoes: toggleId(form.complicacoes, c.id) })
                }
                className="rounded text-teal-600"
              />
              {c.label}
            </label>
          ))}
        </div>
        <div>
          <label className={labelCls}>Observações</label>
          <textarea
            className={`${inputCls} min-h-[64px]`}
            value={form.complicacoesObs}
            onChange={(e) => patch({ complicacoesObs: e.target.value })}
            rows={2}
          />
        </div>
      </div>

      {/* SCMA.FIS.FOR.017 */}
      <div className="rounded-xl border-2 border-teal-200 bg-teal-50/30 p-4 sm:p-5 space-y-4">
        <h2 className="text-sm font-bold text-teal-900 uppercase tracking-wide">
          SCMA.FIS.FOR.017 — Avaliação / reabilitação e atividade funcional
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>1ª avaliação — data</label>
            <input
              type="date"
              className={inputCls}
              value={form.avaliacaoData}
              onChange={(e) => patch({ avaliacaoData: e.target.value })}
            />
          </div>
          <div>
            <label className={labelCls}>Fisioterapeuta</label>
            <input
              className={inputCls}
              value={form.avaliacaoFisioterapeuta}
              onChange={(e) => patch({ avaliacaoFisioterapeuta: e.target.value })}
            />
          </div>
        </div>
        <div>
          <span className={labelCls}>MRC (escala 0–5 por membro, conforme protocolo)</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(
              [
                ["mrcMsd", "MSD"],
                ["mrcMse", "MSE"],
                ["mrcMid", "MID"],
                ["mrcMie", "MIE"],
              ] as const
            ).map(([key, lab]) => (
              <div key={key}>
                <label className={labelCls}>{lab}</label>
                <input
                  className={inputCls}
                  value={form[key]}
                  onChange={(e) =>
                    patch({ [key]: e.target.value } as Partial<ColetaDadosFisioPagina4>)
                  }
                />
              </div>
            ))}
          </div>
          <div className="max-w-xs mt-2">
            <label className={labelCls}>Total</label>
            <input
              className={inputCls}
              value={form.mrcTotal}
              onChange={(e) => patch({ mrcTotal: e.target.value })}
            />
          </div>
        </div>
        <div className="bg-white/80 rounded-lg p-3 border border-teal-100">
          <p className="text-[11px] text-slate-600 leading-relaxed mb-2">{TEXTO_REF_PIMAX_PEMAX}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>PiMáx predito (cmH₂O)</label>
              <input
                className={inputCls}
                value={form.pimaxPredito}
                onChange={(e) => patch({ pimaxPredito: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>PeMáx predito (cmH₂O)</label>
              <input
                className={inputCls}
                value={form.pemaxPredito}
                onChange={(e) => patch({ pemaxPredito: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>PiMáx (cmH₂O)</label>
              <input
                className={inputCls}
                value={form.pimax}
                onChange={(e) => patch({ pimax: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>PeMáx (cmH₂O)</label>
              <input
                className={inputCls}
                value={form.pemax}
                onChange={(e) => patch({ pemax: e.target.value })}
              />
            </div>
          </div>
        </div>
        <div className="bg-white/80 rounded-lg p-3 border border-teal-100">
          <p className="text-[11px] text-slate-600 leading-relaxed mb-2">{TEXTO_REF_DINAMOMETRIA}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Dinamometria MSD (kg)</label>
              <input
                className={inputCls}
                value={form.dinamometriaMsd}
                onChange={(e) => patch({ dinamometriaMsd: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>Dinamometria MSE (kg)</label>
              <input
                className={inputCls}
                value={form.dinamometriaMse}
                onChange={(e) => patch({ dinamometriaMse: e.target.value })}
              />
            </div>
          </div>
        </div>
        <div>
          <span className={labelCls}>
            CNT Quali-Fisio — o que o paciente realiza de forma independente
          </span>
          <div className="flex flex-col gap-1.5 mt-2">
            {CNT_QUALI_FISIO_ITENS.map((item) => (
              <label key={item.id} className="inline-flex items-start gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={form.cntQualiFisio.includes(item.id)}
                  onChange={() =>
                    patch({ cntQualiFisio: toggleId(form.cntQualiFisio, item.id) })
                  }
                  className="rounded text-teal-600 mt-0.5"
                />
                <span>
                  {item.id}. {item.label}
                </span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-xs font-semibold text-slate-800 mb-2">Plano terapêutico singular</h3>
          <div className="space-y-2">{[0, 1, 2, 3].map(planoLine)}</div>
        </div>
        <div>
          <h3 className="text-xs font-semibold text-slate-800 mb-2">Metas terapêuticas</h3>
          <div className="space-y-2">
            {form.metasTerapeuticas.map((meta, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row gap-2 sm:items-end border border-slate-100 rounded-lg p-2 bg-white/60"
              >
                <div className="flex-1">
                  <label className={labelCls}>Meta {i + 1}</label>
                  <input
                    className={inputCls}
                    value={meta.texto}
                    onChange={(e) => patchMeta(i, { texto: e.target.value })}
                  />
                </div>
                <div className="w-full sm:w-40 flex-shrink-0">
                  <label className={labelCls}>Até dia</label>
                  <input
                    type="date"
                    className={inputCls}
                    value={meta.ateData}
                    onChange={(e) => patchMeta(i, { ateData: e.target.value })}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-xs font-semibold text-slate-800 mb-2">
            Prescrição clínica de exercícios
          </h3>
          <div className="space-y-3">
            {form.prescricaoExercicios.map((pr, i) => (
              <div
                key={i}
                className="border border-slate-200 rounded-lg p-3 bg-white/70 space-y-2"
              >
                <p className="text-[11px] font-medium text-slate-600">Exercício {i + 1}</p>
                <div className="flex flex-wrap items-end gap-3">
                  <label className="inline-flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={pr.comCarga}
                      onChange={(e) =>
                        patchPresc(i, {
                          comCarga: e.target.checked,
                          semCarga: e.target.checked ? false : pr.semCarga,
                        })
                      }
                      className="rounded text-teal-600"
                    />
                    Carga
                  </label>
                  <input
                    className={`${inputCls} w-24`}
                    placeholder="kg"
                    value={pr.cargaKg}
                    onChange={(e) => patchPresc(i, { cargaKg: e.target.value })}
                    disabled={!pr.comCarga}
                  />
                  <label className="inline-flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={pr.semCarga}
                      onChange={(e) =>
                        patchPresc(i, {
                          semCarga: e.target.checked,
                          comCarga: e.target.checked ? false : pr.comCarga,
                        })
                      }
                      className="rounded text-teal-600"
                    />
                    Sem carga
                  </label>
                  <div className="w-20">
                    <label className={labelCls}>Séries</label>
                    <input
                      className={inputCls}
                      value={pr.series}
                      onChange={(e) => patchPresc(i, { series: e.target.value })}
                    />
                  </div>
                  <div className="w-24">
                    <label className={labelCls}>Repetições</label>
                    <input
                      className={inputCls}
                      value={pr.repeticoes}
                      onChange={(e) => patchPresc(i, { repeticoes: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className={labelCls}>Data da reavaliação</label>
          <input
            type="date"
            className={`${inputCls} max-w-xs`}
            value={form.dataReavaliacao}
            onChange={(e) => patch({ dataReavaliacao: e.target.value })}
          />
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-center text-[11px] text-slate-600 space-y-1">
        <p className="font-medium text-slate-700">Responsáveis (impresso de referência)</p>
        <p>Adriano Marçal Forato de Andrade · Carlos Eduardo da Trindade Rosa · Nayara Alves de Carvalho Tolentino</p>
      </div>

      </fieldset>

      <div className={`${boxCls} border-teal-200 bg-teal-50/40`}>
        <h2 className={h2Cls}>
          Destino do paciente <span className="text-xs font-normal text-slate-500">(preencher na saída)</span>
        </h2>
        <p className="text-xs text-slate-600 mb-3">
          Na alta do paciente, registe um único desfecho: <strong>alta hospitalar</strong>,{" "}
          <strong>transferência</strong> ou <strong>óbito</strong>.
        </p>
        <div className="flex flex-col gap-2">
          {(
            [
              ["alta", "Alta hospitalar"],
              ["transferencia", "Transferência"],
              ["obito", "Óbito"],
            ] as const
          ).map(([val, lab]) => (
            <label key={val} className="inline-flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="destinoTipo"
                checked={form.destinoTipo === val}
                onChange={() => patch({ destinoTipo: val })}
                className="text-teal-600"
              />
              {lab}
            </label>
          ))}
        </div>
        <div className="mt-3">
          <label className={labelCls}>Detalhes (ex.: unidade de destino, observações)</label>
          <textarea
            className={`${inputCls} min-h-[56px]`}
            value={form.destinoDetalhe}
            onChange={(e) => patch({ destinoDetalhe: e.target.value })}
            rows={2}
            placeholder="Opcional — especialmente útil em transferência"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <div>
            <label className={labelCls}>Data do desfecho / saída</label>
            <input
              type="date"
              className={inputCls}
              value={form.destinoData}
              onChange={(e) => patch({ destinoData: e.target.value })}
            />
          </div>
          <div>
            <label className={labelCls}>Reinternação</label>
            <input
              className={inputCls}
              value={form.destinoReinternacao}
              onChange={(e) => patch({ destinoReinternacao: e.target.value })}
              placeholder="Data ou N/A"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Fisioterapeuta responsável pelo preenchimento</label>
            <input
              className={inputCls}
              value={form.destinoFisioterapeuta}
              onChange={(e) => patch({ destinoFisioterapeuta: e.target.value })}
            />
          </div>
        </div>
      </div>

    </div>
  );
}
