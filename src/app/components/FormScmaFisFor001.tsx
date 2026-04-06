import { useState, useCallback, useEffect } from "react";
import {
  Save,
  RotateCcw,
  CheckCircle2,
  FileText,
  ClipboardPenLine,
} from "lucide-react";
import type { AvaliacaoFisioterapia001, Turno } from "../types";
import { useAuth } from "../context/AuthContext";
import { LogoSantaCasa } from "./LogoSantaCasa";
import {
  getOrCreateScma001Rascunho,
  saveScma001Rascunho,
  clearScma001Rascunho,
  emptyAvaliacao,
} from "../data/scma001Store";
import {
  CODIGOS_PROCEDIMENTO_SCMA001,
  OPCOES_ATIVIDADE_MOTORA,
  OPCOES_TONUS,
  OPCOES_NIVEL_CONSCIENCIA,
  OPCOES_PADRAO_RESP,
  OPCOES_CONDUTA_RESPIRATORIA,
  OPCOES_SECRECAO_CARAC,
  OPCOES_CONDUTA_MOTORA,
  OPCOES_ALONGAMENTO,
  OPCOES_EX_ATIVOS,
  OPCOES_SETOR_ATUACAO_MSFORMS,
} from "../data/scma001Constants";
import { REGISTO_DIARIO_FORMS_SECOES } from "../data/scma001RegistoDiario";
import { mockFisioterapeutas } from "../store";

const inputCls =
  "w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400";
const labelCls = "text-xs font-medium text-slate-600 block mb-1";
const fieldsetCls = "border border-slate-200 rounded-lg p-3 space-y-2 bg-white/80";
const legendCls = "text-xs font-semibold text-slate-700 px-1";

function toggleId(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

/** Alinha turno do plantão ao cadastro da equipe (login por nome). */
function turnoPadraoDoProfissional(nomeLogin: string): Turno | "" {
  const a = nomeLogin.trim().toLowerCase();
  if (!a) return "";
  const hit = mockFisioterapeutas.find((f) => {
    const b = f.nome.trim().toLowerCase();
    if (a === b) return true;
    const aw = a.split(/\s+/)[0];
    const bw = b.split(/\s+/)[0];
    return aw === bw || a.startsWith(bw) || b.startsWith(aw);
  });
  return (hit?.turno as Turno) ?? "";
}

function setorSugeridoPorLocal(local: AvaliacaoFisioterapia001["local"]): string {
  if (local === "uti_adulto") return "uti-01";
  if (local === "enfermarias") return "enfermaria";
  return "";
}

function ChipCheck({
  checked,
  onChange,
  label,
  accent = "teal",
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  accent?: "teal" | "red" | "blue";
}) {
  const inputAccent =
    accent === "red"
      ? "text-red-600 focus:ring-red-500 border-red-200"
      : accent === "blue"
        ? "text-blue-600 focus:ring-blue-500 border-blue-200"
        : "text-teal-600 focus:ring-teal-400 border-slate-300";
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className={`rounded ${inputAccent}`}
      />
      <span>{label}</span>
    </label>
  );
}

export function FormScmaFisFor001() {
  const { user } = useAuth();
  const uid = user?.id ?? "anon";
  const unome = user?.nome ?? "Usuário";

  const [form, setForm] = useState<AvaliacaoFisioterapia001>(() =>
    getOrCreateScma001Rascunho(uid, unome)
  );
  const [salvo, setSalvo] = useState(false);

  const patch = useCallback((p: Partial<AvaliacaoFisioterapia001>) => {
    setForm((prev) => ({ ...prev, ...p }));
  }, []);

  useEffect(() => {
    setForm((prev) => {
      if (prev.turnoPlantao) return prev;
      const t = turnoPadraoDoProfissional(unome);
      return t ? { ...prev, turnoPlantao: t } : prev;
    });
  }, [unome]);

  useEffect(() => {
    if (!form.local) return;
    const sug = setorSugeridoPorLocal(form.local);
    if (!sug) return;
    setForm((prev) => {
      if (prev.setorAtuacao) return prev;
      return { ...prev, setorAtuacao: sug };
    });
  }, [form.local]);

  const salvar = () => {
    saveScma001Rascunho({
      ...form,
      preenchidoPorId: uid,
      preenchidoPorNome: unome,
    });
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2500);
  };

  const limpar = () => {
    clearScma001Rascunho();
    setForm(emptyAvaliacao(uid, unome));
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Cabeçalho institucional */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-start gap-4 lg:gap-8">
          <div className="flex-shrink-0">
            <LogoSantaCasa variant="color" size={100} />
          </div>
          <div className="flex-1 min-w-0 text-center lg:text-left">
            <p className="text-xs uppercase tracking-wide text-teal-700 font-semibold">
              Evolução — SCMA.FIS.FOR.001
            </p>
            <h1 className="text-lg sm:text-xl font-semibold text-slate-800">
              Serviço de Fisioterapia
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Santa Casa de Anápolis — registo das condutas realizadas com o paciente.
            </p>
          </div>
          <div className="text-xs text-slate-500 space-y-1 lg:text-right flex-shrink-0 max-w-xs lg:max-w-none lg:ml-auto">
            <p>Data da elaboração: 19/02/2020</p>
            <p className="text-slate-700 font-medium">
              SCMA.FIS.FOR.001 — Página 3 (evolução e condutas por plantão)
            </p>
            <p className="text-slate-500 leading-snug">
              A secção «Identificação» abaixo equivale à folha 1 no impresso; avaliação clínica,
              condutas e rodapé correspondem à página 3 do protocolo.
            </p>
            <p>Próxima revisão: 19/02/2022</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3">
          <p className="text-xs text-slate-500 w-full sm:w-auto sm:flex-1">
            Registo interno — o mesmo fluxo do Microsoft Forms foi integrado abaixo (scroll único).
          </p>
          <div className="flex flex-wrap gap-2">
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
      </div>

      {/* Identificação (pág. 1) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <FileText size={16} className="text-teal-600" />
          Identificação
        </h2>
        <div className="flex flex-wrap gap-6">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="local"
              checked={form.local === "uti_adulto"}
              onChange={() => patch({ local: "uti_adulto" })}
              className="text-teal-600"
            />
            UTI Adulto
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="local"
              checked={form.local === "enfermarias"}
              onChange={() => patch({ local: "enfermarias" })}
              className="text-teal-600"
            />
            Enfermarias
          </label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
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
          <div>
            <label className={labelCls}>Folha nº</label>
            <input
              className={inputCls}
              value={form.folhaNumero}
              onChange={(e) => patch({ folhaNumero: e.target.value })}
            />
          </div>
        </div>
        <fieldset className={fieldsetCls}>
          <legend className={legendCls}>Códigos de procedimento</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {CODIGOS_PROCEDIMENTO_SCMA001.map((cod) => (
              <ChipCheck
                key={cod}
                label={cod}
                checked={form.codigosProcedimento.includes(cod)}
                onChange={() =>
                  patch({
                    codigosProcedimento: toggleId(form.codigosProcedimento, cod),
                  })
                }
              />
            ))}
          </div>
        </fieldset>
      </div>

      {/* Plantão: três vezes ao dia */}
      <div className="bg-amber-50/90 rounded-xl border border-amber-200 p-4 sm:p-5 space-y-3">
        <h2 className="text-sm font-semibold text-amber-950">Plantão e frequência</h2>
        <p className="text-xs text-amber-900/90 leading-relaxed">
          Este registo corresponde a <strong>um plantão</strong>. Cada fisioterapeuta preenche uma evolução por
          turno; ao longo do dia são <strong>três plantões</strong> — portanto, até{" "}
          <strong>três evoluções por paciente por dia</strong> (matutino, vespertino e noturno).
        </p>
        <div className="max-w-xs">
          <label className={labelCls}>Turno / plantão desta evolução</label>
          <select
            value={form.turnoPlantao}
            onChange={(e) => patch({ turnoPlantao: e.target.value as Turno | "" })}
            className={inputCls}
          >
            <option value="">Selecione o plantão…</option>
            <option value="Matutino">Matutino</option>
            <option value="Vespertino">Vespertino</option>
            <option value="Noturno">Noturno</option>
          </select>
        </div>
      </div>

      {/* Registo diário (integração Microsoft Forms — scroll único) */}
      <div className="bg-white rounded-xl border border-teal-100 p-4 sm:p-5 space-y-4 shadow-sm">
        <h2 className="text-sm font-semibold text-teal-900 flex items-center gap-2">
          <ClipboardPenLine size={18} className="text-teal-600 shrink-0" />
          Registo diário
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Mesma ordem do formulário institucional. O <strong>setor</strong> pode ser sugerido pelo
          «Local» em Identificação quando ainda está vazio. A <strong>hora</strong> do atendimento
          regista-se na secção «Evolução e avaliação clínica» (mantém-se ligada à mesma data).
        </p>

        <div className="space-y-4">
          <div>
            <label className={labelCls}>
              1. Nome <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              readOnly
              value={unome}
              className={`${inputCls} bg-slate-50 text-slate-700 cursor-default max-w-xl`}
            />
            <p className="text-[11px] text-red-600 mt-1">Esta pergunta é obrigatória.</p>
          </div>

          <div className="max-w-xs">
            <label className={labelCls}>
              2. Data <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              className={inputCls}
              value={form.data}
              onChange={(e) => patch({ data: e.target.value })}
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Insira a data (formato do calendário do dispositivo; equivalente a dd/MM/aaaa).
            </p>
            <p className="text-[11px] text-red-600 mt-0.5">Esta pergunta é obrigatória.</p>
          </div>

          <fieldset className="border-0 p-0 m-0 min-w-0">
            <legend className={`${labelCls} mb-2`}>
              3. Turno <span className="text-red-600">*</span>
            </legend>
            <div className="flex flex-wrap gap-4">
              {(["Matutino", "Vespertino", "Noturno"] as const).map((t) => (
                <label key={t} className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="registoTurno"
                    checked={form.turnoPlantao === t}
                    onChange={() => patch({ turnoPlantao: t })}
                    className="text-teal-600"
                  />
                  {t}
                </label>
              ))}
            </div>
            <p className="text-[11px] text-red-600 mt-2">Esta pergunta é obrigatória.</p>
          </fieldset>

          <div className="max-w-xl">
            <label className={labelCls}>
              4. Setor de atuação <span className="text-red-600">*</span>
            </label>
            <select
              value={form.setorAtuacao}
              onChange={(e) => patch({ setorAtuacao: e.target.value })}
              className={inputCls}
            >
              {OPCOES_SETOR_ATUACAO_MSFORMS.map(({ value, label }) => (
                <option key={value || "empty"} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              Sugestão automática a partir de «Local» quando o campo ainda está vazio.
            </p>
            <p className="text-[11px] text-red-600 mt-0.5">Esta pergunta é obrigatória.</p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4 space-y-4">
          <div className="max-w-xs">
            <label className={labelCls}>5. Atendimentos no setor (número inteiro ≥ 0)</label>
            <input
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              placeholder="0"
              className={inputCls}
              value={form.atendimentosNoSetor}
              onChange={(e) => {
                const v = e.target.value.trim();
                if (v === "") {
                  patch({ atendimentosNoSetor: "" });
                  return;
                }
                if (!/^\d+$/.test(v)) return;
                patch({ atendimentosNoSetor: v });
              }}
            />
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
            Se não atuou em alguma das UTIs, não responda às perguntas seguintes e avance — todos os
            campos são opcionais.
          </p>

          {REGISTO_DIARIO_FORMS_SECOES.map((sec) => (
            <div key={sec.titulo} className="space-y-2">
              <h4 className="text-[11px] font-semibold uppercase tracking-wide text-teal-800">
                {sec.titulo}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-3">
                {sec.itens.map((it) => (
                  <div key={it.key} className="min-w-0">
                    <label className={labelCls}>
                      {it.num}. {it.label}
                    </label>
                    <input
                      type="text"
                      className={inputCls}
                      value={form.registoDiarioForms[it.key]}
                      onChange={(e) =>
                        patch({
                          registoDiarioForms: {
                            ...form.registoDiarioForms,
                            [it.key]: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div>
            <label className={labelCls}>Notas adicionais</label>
            <textarea
              className={`${inputCls} min-h-[88px] resize-y`}
              rows={3}
              placeholder="Observações extra ou texto legado de rascunhos antigos…"
              value={form.registoDiarioComplemento}
              onChange={(e) => patch({ registoDiarioComplemento: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Avaliação clínica (pág. 3) */}
      <div className="bg-slate-50/80 rounded-xl border border-slate-200 p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-1">Evolução e avaliação clínica</h2>
        <p className="text-xs text-slate-500 mb-4">
          Bloco a vermelho: condutas e vias aéreas. Bloco a azul: condutas motoras e neuromotoras.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
          {/* Coluna esquerda */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelCls}>Data</label>
                <input
                  type="date"
                  className={inputCls}
                  value={form.data}
                  onChange={(e) => patch({ data: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls}>Hora</label>
                <input
                  type="time"
                  className={inputCls}
                  value={form.hora}
                  onChange={(e) => patch({ hora: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>Diagnóstico</label>
              <textarea
                className={`${inputCls} min-h-[72px] resize-y`}
                value={form.diagnostico}
                onChange={(e) => patch({ diagnostico: e.target.value })}
                rows={3}
              />
            </div>

            <fieldset className={fieldsetCls}>
              <legend className={legendCls}>Prioridade</legend>
              <div className="flex flex-wrap gap-4">
                <label className="inline-flex items-center gap-2 text-xs">
                  <input
                    type="radio"
                    name="prioridade"
                    checked={form.prioridade === "vermelho"}
                    onChange={() => patch({ prioridade: "vermelho" })}
                    className="text-teal-600"
                  />
                  Vermelho
                </label>
                <label className="inline-flex items-center gap-2 text-xs">
                  <input
                    type="radio"
                    name="prioridade"
                    checked={form.prioridade === "amarelo"}
                    onChange={() => patch({ prioridade: "amarelo" })}
                    className="text-teal-600"
                  />
                  Amarelo
                </label>
              </div>
            </fieldset>

            <fieldset className={fieldsetCls}>
              <legend className={legendCls}>Atividade motora</legend>
              <div className="flex flex-col gap-1.5">
                {OPCOES_ATIVIDADE_MOTORA.map(({ id, label }) => (
                  <ChipCheck
                    key={id}
                    label={label}
                    checked={form.atividadeMotora.includes(id)}
                    onChange={() =>
                      patch({ atividadeMotora: toggleId(form.atividadeMotora, id) })
                    }
                  />
                ))}
              </div>
            </fieldset>

            <fieldset className={fieldsetCls}>
              <legend className={legendCls}>Tônus</legend>
              <div className="flex flex-col gap-1.5">
                {OPCOES_TONUS.map(({ id, label }) => (
                  <ChipCheck
                    key={id}
                    label={label}
                    checked={form.tonus.includes(id)}
                    onChange={() => patch({ tonus: toggleId(form.tonus, id) })}
                  />
                ))}
              </div>
            </fieldset>

            <fieldset className={fieldsetCls}>
              <legend className={legendCls}>Nível de consciência</legend>
              <div className="flex flex-col gap-1.5">
                {OPCOES_NIVEL_CONSCIENCIA.map(({ id, label }) => (
                  <ChipCheck
                    key={id}
                    label={label}
                    checked={form.nivelConsciencia.includes(id)}
                    onChange={() =>
                      patch({ nivelConsciencia: toggleId(form.nivelConsciencia, id) })
                    }
                  />
                ))}
              </div>
            </fieldset>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelCls}>Escala de Glasgow</label>
                <input
                  className={inputCls}
                  value={form.escalaGlasgow}
                  onChange={(e) => patch({ escalaGlasgow: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls}>Escala RASS</label>
                <input
                  className={inputCls}
                  value={form.escalaRass}
                  onChange={(e) => patch({ escalaRass: e.target.value })}
                />
              </div>
            </div>

            <fieldset className={fieldsetCls}>
              <legend className={legendCls}>Padrão respiratório</legend>
              <div className="flex flex-col gap-1.5">
                {OPCOES_PADRAO_RESP.map(({ id, label }) => (
                  <ChipCheck
                    key={id}
                    label={label}
                    checked={form.padraoRespiratorio.includes(id)}
                    onChange={() =>
                      patch({
                        padraoRespiratorio: toggleId(form.padraoRespiratorio, id),
                      })
                    }
                  />
                ))}
              </div>
            </fieldset>

            <div>
              <label className={labelCls}>Ausculta inicial</label>
              <textarea
                className={`${inputCls} min-h-[56px]`}
                value={form.auscultaInicial}
                onChange={(e) => patch({ auscultaInicial: e.target.value })}
                rows={2}
              />
            </div>
            <div>
              <label className={labelCls}>Ausculta final</label>
              <textarea
                className={`${inputCls} min-h-[56px]`}
                value={form.auscultaFinal}
                onChange={(e) => patch({ auscultaFinal: e.target.value })}
                rows={2}
              />
            </div>

            <fieldset className={fieldsetCls}>
              <legend className={legendCls}>Suporte ventilatório</legend>
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2">
                  <label className={labelCls}>Dias de VMI</label>
                  <input
                    className={inputCls}
                    value={form.diasVMI}
                    onChange={(e) => patch({ diasVMI: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelCls}>FC (bpm)</label>
                  <input
                    className={inputCls}
                    value={form.fc}
                    onChange={(e) => patch({ fc: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelCls}>FRp (ipm)</label>
                  <input
                    className={inputCls}
                    value={form.frp}
                    onChange={(e) => patch({ frp: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelCls}>SpO2 (%)</label>
                  <input
                    className={inputCls}
                    value={form.spo2}
                    onChange={(e) => patch({ spo2: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Ventilador</label>
                  <input
                    className={inputCls}
                    value={form.ventilador}
                    onChange={(e) => patch({ ventilador: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Modo</label>
                  <input
                    className={inputCls}
                    value={form.modoVentilador}
                    onChange={(e) => patch({ modoVentilador: e.target.value })}
                  />
                </div>
              </div>
            </fieldset>
          </div>

          {/* Coluna central */}
          <div className="space-y-4">
            <fieldset className={fieldsetCls}>
              <legend className={legendCls}>Parâmetros ventilatórios</legend>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(
                  [
                    ["vc", "VC"],
                    ["fluxo", "Fluxo"],
                    ["fio2", "FiO2 (%)"],
                    ["peep", "PEEP"],
                    ["pc", "PC"],
                    ["ps", "PS"],
                    ["frVent", "FR"],
                    ["sens", "Sens"],
                    ["ti", "Ti"],
                    ["ie", "I:E"],
                    ["cuff", "Cuff"],
                  ] as const
                ).map(([key, lab]) => (
                  <div key={key}>
                    <label className={labelCls}>{lab}</label>
                    <input
                      className={inputCls}
                      value={form[key]}
                      onChange={(e) => patch({ [key]: e.target.value } as Partial<AvaliacaoFisioterapia001>)}
                    />
                  </div>
                ))}
              </div>
            </fieldset>

            <fieldset className={fieldsetCls}>
              <legend className={legendCls}>Tubo</legend>
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2">
                  <label className={labelCls}>Tipo</label>
                  <input
                    className={inputCls}
                    value={form.tuboTipo}
                    onChange={(e) => patch({ tuboTipo: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelCls}>Nº</label>
                  <input
                    className={inputCls}
                    value={form.tuboNum}
                    onChange={(e) => patch({ tuboNum: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelCls}>Altura</label>
                  <input
                    className={inputCls}
                    value={form.tuboAltura}
                    onChange={(e) => patch({ tuboAltura: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Fixação</label>
                  <input
                    className={inputCls}
                    value={form.tuboFixacao}
                    onChange={(e) => patch({ tuboFixacao: e.target.value })}
                  />
                </div>
              </div>
            </fieldset>

            <fieldset className={fieldsetCls}>
              <legend className={legendCls}>Oxigenoterapia</legend>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className={labelCls}>Venturi %</label>
                  <input
                    className={inputCls}
                    value={form.venturiPct}
                    onChange={(e) => patch({ venturiPct: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelCls}>Ar (L)</label>
                  <input
                    className={inputCls}
                    value={form.venturiArL}
                    onChange={(e) => patch({ venturiArL: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelCls}>O2 (L)</label>
                  <input
                    className={inputCls}
                    value={form.venturiO2L}
                    onChange={(e) => patch({ venturiO2L: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2 mt-2">
                <div>
                  <label className={labelCls}>Tenda intermitente</label>
                  <input
                    className={inputCls}
                    value={form.tendaIntermitente}
                    onChange={(e) => patch({ tendaIntermitente: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelCls}>Catéter nasal O2 (L/min)</label>
                  <input
                    className={inputCls}
                    value={form.cateterNasalO2}
                    onChange={(e) => patch({ cateterNasalO2: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelCls}>O2 (L/min)</label>
                  <input
                    className={inputCls}
                    value={form.o2Lmin}
                    onChange={(e) => patch({ o2Lmin: e.target.value })}
                  />
                </div>
              </div>
            </fieldset>

            <fieldset className={fieldsetCls}>
              <legend className={legendCls}>Monitorização / cálculos</legend>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelCls}>Balanço hídrico</label>
                  <input
                    className={inputCls}
                    value={form.balancoHidrico}
                    onChange={(e) => patch({ balancoHidrico: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelCls}>VT</label>
                  <input
                    className={inputCls}
                    value={form.vt}
                    onChange={(e) => patch({ vt: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelCls}>Vol. ideal</label>
                  <input
                    className={inputCls}
                    value={form.volIdeal}
                    onChange={(e) => patch({ volIdeal: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelCls}>Resist. vias aéreas</label>
                  <input
                    className={inputCls}
                    value={form.resistViasAereas}
                    onChange={(e) => patch({ resistViasAereas: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelCls}>ΔP</label>
                  <input
                    className={inputCls}
                    value={form.deltaP}
                    onChange={(e) => patch({ deltaP: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelCls}>FR ajustada</label>
                  <input
                    className={inputCls}
                    value={form.frAjustada}
                    onChange={(e) => patch({ frAjustada: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelCls}>Tentativa PSV</label>
                  <input
                    className={inputCls}
                    value={form.tentativaPSV}
                    onChange={(e) => patch({ tentativaPSV: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelCls}>TRE</label>
                  <input
                    className={inputCls}
                    value={form.tre}
                    onChange={(e) => patch({ tre: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Relação P/F</label>
                  <input
                    className={inputCls}
                    value={form.relacaoPF}
                    onChange={(e) => patch({ relacaoPF: e.target.value })}
                  />
                </div>
              </div>
            </fieldset>

            <div className="rounded-xl border-2 border-red-300/90 bg-red-50/45 p-3 sm:p-4 space-y-3 shadow-sm ring-1 ring-red-200/60">
              <p className="text-[11px] font-bold uppercase tracking-wide text-red-900">
                Condutas respiratórias
              </p>
              <p className="text-[11px] text-red-900/80 leading-snug">
                Intervenções e estado das vias aéreas neste plantão.
              </p>

              <fieldset className={`${fieldsetCls} border-red-200/80`}>
                <legend className={legendCls}>Conduta respiratória</legend>
                <div className="flex flex-col gap-1.5">
                  {OPCOES_CONDUTA_RESPIRATORIA.map(({ id, label }) => (
                    <ChipCheck
                      key={id}
                      label={label}
                      accent="red"
                      checked={form.condutaRespiratoria.includes(id)}
                      onChange={() =>
                        patch({
                          condutaRespiratoria: toggleId(form.condutaRespiratoria, id),
                        })
                      }
                    />
                  ))}
                </div>
                <div className="mt-2">
                  <label className={labelCls}>Titulação de PEEP (valor)</label>
                  <input
                    className={inputCls}
                    value={form.peepTitulacao}
                    onChange={(e) => patch({ peepTitulacao: e.target.value })}
                    placeholder="Valor anotado"
                  />
                </div>
              </fieldset>

              <fieldset className={`${fieldsetCls} border-red-200/80`}>
                <legend className={legendCls}>Secreção pulmonar</legend>
                <div className="flex flex-wrap gap-4 mb-2">
                  <label className="inline-flex items-center gap-2 text-xs">
                    <input
                      type="radio"
                      name="secrecao"
                      checked={form.secrecaoPulmonar === "presente"}
                      onChange={() => patch({ secrecaoPulmonar: "presente" })}
                      className="text-red-600 focus:ring-red-500"
                    />
                    Presente
                  </label>
                  <label className="inline-flex items-center gap-2 text-xs">
                    <input
                      type="radio"
                      name="secrecao"
                      checked={form.secrecaoPulmonar === "ausente"}
                      onChange={() => patch({ secrecaoPulmonar: "ausente" })}
                      className="text-red-600 focus:ring-red-500"
                    />
                    Ausente
                  </label>
                </div>
              </fieldset>

              <fieldset className={`${fieldsetCls} border-red-200/80`}>
                <legend className={legendCls}>Características da secreção</legend>
                <div className="flex flex-col gap-1.5">
                  {OPCOES_SECRECAO_CARAC.map(({ id, label }) => (
                    <ChipCheck
                      key={id}
                      label={label}
                      accent="red"
                      checked={form.secrecaoCaracteristicas.includes(id)}
                      onChange={() =>
                        patch({
                          secrecaoCaracteristicas: toggleId(form.secrecaoCaracteristicas, id),
                        })
                      }
                    />
                  ))}
                </div>
              </fieldset>
            </div>
          </div>

          {/* Coluna direita */}
          <div className="space-y-4">
            <div className="rounded-xl border-2 border-blue-300/90 bg-blue-50/45 p-3 sm:p-4 space-y-3 shadow-sm ring-1 ring-blue-200/60">
              <p className="text-[11px] font-bold uppercase tracking-wide text-blue-900">
                Condutas motoras e neuromotoras
              </p>
              <p className="text-[11px] text-blue-900/80 leading-snug">
                Mobilização, postura e exercícios neste plantão.
              </p>

              <fieldset className={`${fieldsetCls} border-blue-200/80`}>
                <legend className={legendCls}>Conduta motora e neuromotora</legend>
                <div className="flex flex-col gap-1.5">
                  {OPCOES_CONDUTA_MOTORA.map(({ id, label }) => (
                    <ChipCheck
                      key={id}
                      label={label}
                      accent="blue"
                      checked={form.condutaMotora.includes(id)}
                      onChange={() =>
                        patch({ condutaMotora: toggleId(form.condutaMotora, id) })
                      }
                    />
                  ))}
                </div>
                <div className="mt-3 pt-2 border-t border-blue-100">
                  <p className="text-xs font-medium text-blue-900/90 mb-2">Paciente sentado</p>
                  <div className="flex flex-wrap gap-4">
                    <label className="inline-flex items-center gap-2 text-xs">
                      <input
                        type="radio"
                        name="sentado"
                        checked={form.pacienteSentado === "no_leito"}
                        onChange={() => patch({ pacienteSentado: "no_leito" })}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      No leito
                    </label>
                    <label className="inline-flex items-center gap-2 text-xs">
                      <input
                        type="radio"
                        name="sentado"
                        checked={form.pacienteSentado === "fora_leito"}
                        onChange={() => patch({ pacienteSentado: "fora_leito" })}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      Fora do leito
                    </label>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-xs font-medium text-blue-900/90 mb-2">Alongamento</p>
                  <div className="flex flex-wrap gap-3">
                    {OPCOES_ALONGAMENTO.map(({ id, label }) => (
                      <ChipCheck
                        key={id}
                        label={label}
                        accent="blue"
                        checked={form.alongamento.includes(id)}
                        onChange={() =>
                          patch({ alongamento: toggleId(form.alongamento, id) })
                        }
                      />
                    ))}
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-xs font-medium text-blue-900/90 mb-2">Exercícios ativos</p>
                  <div className="flex flex-wrap gap-3">
                    {OPCOES_EX_ATIVOS.map(({ id, label }) => (
                      <ChipCheck
                        key={id}
                        label={label}
                        accent="blue"
                        checked={form.exerciciosAtivos.includes(id)}
                        onChange={() =>
                          patch({
                            exerciciosAtivos: toggleId(form.exerciciosAtivos, id),
                          })
                        }
                      />
                    ))}
                  </div>
                </div>
              </fieldset>
            </div>

            <div>
              <label className={labelCls}>Observações</label>
              <textarea
                className={`${inputCls} min-h-[120px]`}
                value={form.observacoes}
                onChange={(e) => patch({ observacoes: e.target.value })}
                rows={5}
              />
            </div>

            <div className="rounded-lg border border-dashed border-slate-300 p-4 bg-white">
              <p className="text-xs text-slate-500 uppercase tracking-wide">
                Registro do profissional
              </p>
              <p className="text-sm text-slate-800 mt-1">
                Preenchido por: <strong>{unome}</strong>
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Carimbo e assinatura — fisioterapeuta de plantão (digital)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Página 3 — lembretes e rodapé do formulário impresso */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 text-sm text-slate-700 leading-relaxed">
          <p className="font-bold text-slate-900">
            Importante Preencher: Data/Hora (atendimento), dias de VMI, Diagnóstico atualizado.
          </p>
          <p>
            Ao entrar no plantão verifique: Montagem dos circuitos e equipamentos de suporte
            ventilatório, Pacientes instáveis, Posicionamento no Leito, Prontuários, Exames
            Laboratoriais e de Imagem.
          </p>
          <p className="font-bold text-slate-900">Relatar as falhas encontradas.</p>
          <p className="font-bold text-slate-900 text-base tracking-tight">
            Plantão de Qualidade!
          </p>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full min-w-[520px] text-xs sm:text-sm border-collapse table-fixed">
            <tbody>
              <tr>
                <th
                  scope="row"
                  className="border border-slate-300 bg-slate-100 px-3 py-2.5 text-left font-semibold text-slate-800 w-[22%]"
                >
                  Elaboração
                </th>
                <td className="border border-slate-300 px-3 py-2.5 text-slate-700 w-[28%]">
                  Fisioterapia
                </td>
                <th
                  scope="row"
                  className="border border-slate-300 bg-slate-100 px-3 py-2.5 text-left font-semibold text-slate-800 w-[22%]"
                >
                  Homologação
                </th>
                <td className="border border-slate-300 px-3 py-2.5 text-slate-700 w-[28%]">
                  Qualidade
                </td>
              </tr>
              <tr>
                <th
                  scope="row"
                  className="border border-slate-300 bg-slate-100 px-3 py-2.5 text-left font-semibold text-slate-800"
                >
                  Aprovação
                </th>
                <td className="border border-slate-300 px-3 py-2.5 text-slate-700">
                  Diretoria Assistencial
                </td>
                <th
                  scope="row"
                  className="border border-slate-300 bg-slate-100 px-3 py-2.5 text-left font-semibold text-slate-800"
                >
                  Validação
                </th>
                <td className="border border-slate-300 px-3 py-2.5 text-slate-400">—</td>
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
