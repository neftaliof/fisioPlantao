import { Fragment, useState, useEffect, useMemo, type ReactNode } from "react";
import {
  Save,
  Plus,
  Trash2,
  BedDouble,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  CheckCircle2,
  User,
  Wind,
  FlaskConical,
  Stethoscope,
} from "lucide-react";
import { LeitoDadosPaciente, Turno } from "../types";
import { mockUTIs } from "../store";
import { useAuth } from "../context/AuthContext";
import { getNumerosLeitosParaUti } from "../data/leitosCadastroStore";
import { listarPacientesCadastro } from "../data/pacientesCadastroStore";
import { getFisioterapeutasLista } from "../data/fisioterapeutasCadastroStore";

type AbaLeito = "id" | "resp" | "lab" | "estado";

const criarLeito = (numero: number): LeitoDadosPaciente => ({
  numero,
  pacienteNome: "",
  satO2: "",
  fc: "",
  suporte: "",
  parametros: "",
  sedacao: "",
  complacencia: "",
  hemoglobina: "",
  hematocrito: "",
  leucocitos: "",
  plaquetas: "",
  gasoPh: "",
  gasoPaco2: "",
  gasoPao2: "",
  gasoHco3: "",
  gasoBe: "",
  gasoSao2: "",
  exameHemogramaSpdata: "",
  exameGasometriaArterialSpdata: "",
  estadoGeral: "",
  obs: "",
});

const turnoTone: Record<string, string> = {
  Matutino: "text-amber-800/90 bg-amber-400/15",
  Vespertino: "text-sky-800/90 bg-sky-400/15",
  Noturno: "text-violet-800/90 bg-violet-400/15",
};

/** Campos — visual simples, foco suave */
const inField =
  "w-full rounded-xl bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 ring-1 ring-slate-200/70 transition-all hover:ring-slate-300/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/25";
const inArea = `${inField} min-h-[3.25rem] resize-y leading-relaxed`;

function temAlgumExameLab(l: LeitoDadosPaciente): boolean {
  return Boolean(
    l.hemoglobina.trim() ||
      l.hematocrito.trim() ||
      l.leucocitos.trim() ||
      l.plaquetas.trim() ||
      l.gasoPh.trim() ||
      l.gasoPaco2.trim() ||
      l.gasoPao2.trim() ||
      l.gasoHco3.trim() ||
      l.gasoBe.trim() ||
      l.gasoSao2.trim() ||
      l.exameHemogramaSpdata.trim() ||
      l.exameGasometriaArterialSpdata.trim()
  );
}

function temDadosClinicosCore(l: LeitoDadosPaciente): boolean {
  return Boolean(
    l.satO2 ||
      l.fc ||
      l.suporte ||
      l.estadoGeral ||
      temAlgumExameLab(l)
  );
}

type StatusCadastro = "sem_cadastro" | "identificado" | "cadastrado";

function statusCadastroLeito(l: LeitoDadosPaciente): StatusCadastro {
  const nome = l.pacienteNome.trim();
  if (!nome) return "sem_cadastro";
  if (temDadosClinicosCore(l)) return "cadastrado";
  return "identificado";
}

const badgeStatus: Record<StatusCadastro, { label: string; className: string }> = {
  sem_cadastro: {
    label: "Sem cadastro",
    className: "text-slate-500 bg-slate-100/90",
  },
  identificado: {
    label: "Em andamento",
    className: "text-amber-900/90 bg-amber-400/12",
  },
  cadastrado: {
    label: "Cadastrado",
    className: "text-teal-900/90 bg-teal-400/15",
  },
};

function FieldHint({ children }: { children: ReactNode }) {
  return <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{children}</p>;
}

export function FormDadosPaciente() {
  const { user, temAcesso } = useAuth();
  const utisDisponiveis = useMemo(() => {
    const u = mockUTIs.filter((x) => x.tipo === "uti");
    if (!user || user.role === "admin") return u;
    return u.filter((x) => temAcesso(x.id));
  }, [user, temAcesso]);

  const [utiId, setUtiId] = useState("");
  useEffect(() => {
    if (utisDisponiveis.length === 0) return;
    setUtiId((cur) =>
      cur && utisDisponiveis.some((u) => u.id === cur) ? cur : utisDisponiveis[0]!.id
    );
  }, [utisDisponiveis]);

  const hoje = new Date().toISOString().split("T")[0];
  const [data, setData] = useState(hoje);
  const [turno, setTurno] = useState<Turno>("Matutino");
  const [fisioterapeutaId, setFisioterapeutaId] = useState("");
  const [leitos, setLeitos] = useState<LeitoDadosPaciente[]>([]);
  const [expandidos, setExpandidos] = useState<Record<number, boolean>>({});
  const [abaPorLeito, setAbaPorLeito] = useState<Record<number, AbaLeito>>({});
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    if (!utiId) return;
    const nums = getNumerosLeitosParaUti(utiId);
    setLeitos(nums.map((n) => criarLeito(n)));
    setExpandidos({});
    setAbaPorLeito({});
  }, [utiId]);

  const pacientesCadastro = listarPacientesCadastro();

  const toggleLeito = (num: number) => {
    setExpandidos((prev) => ({ ...prev, [num]: !prev[num] }));
  };

  const setAbaLeito = (numero: number, aba: AbaLeito) => {
    setAbaPorLeito((prev) => ({ ...prev, [numero]: aba }));
  };

  const atualizarLeito = (
    numero: number,
    campo: keyof LeitoDadosPaciente,
    valor: string
  ) => {
    setLeitos((prev) =>
      prev.map((l) => (l.numero === numero ? { ...l, [campo]: valor } : l))
    );
  };

  const adicionarLeito = () => {
    const proximo = leitos.length + 1;
    setLeitos((prev) => [...prev, criarLeito(proximo)]);
    setExpandidos((prev) => ({ ...prev, [proximo]: true }));
    setAbaPorLeito((prev) => ({ ...prev, [proximo]: "id" }));
  };

  const removerLeito = (numero: number) => {
    setLeitos((prev) => prev.filter((l) => l.numero !== numero));
  };

  const limparFormulario = () => {
    const nums = utiId ? getNumerosLeitosParaUti(utiId) : [];
    setLeitos(nums.map((n) => criarLeito(n)));
    setExpandidos({});
    setAbaPorLeito({});
    setSalvo(false);
  };

  const salvar = () => {
    setSalvo(true);
    setTimeout(() => setSalvo(false), 3000);
  };

  const leitosComAlgumaInfo = leitos.filter(
    (l) =>
      l.pacienteNome.trim() ||
      l.satO2 ||
      l.fc ||
      l.suporte ||
      temDadosClinicosCore(l)
  ).length;

  const leitosCadastrados = leitos.filter(
    (s) => statusCadastroLeito(s) === "cadastrado"
  ).length;

  const passo1Ok = Boolean(data && turno);
  const passo2Ok = leitosComAlgumaInfo > 0;

  const abasConfig: { id: AbaLeito; label: string; Icon: typeof User }[] = [
    { id: "id", label: "Identificação", Icon: User },
    { id: "resp", label: "Respiração", Icon: Wind },
    { id: "lab", label: "Exames", Icon: FlaskConical },
    { id: "estado", label: "Estado", Icon: Stethoscope },
  ];

  const steps = [
    { n: 1, title: "Contexto", ok: passo1Ok },
    { n: 2, title: "Leitos", ok: passo2Ok },
    { n: 3, title: "Salvar", ok: salvo },
  ];

  return (
    <div className="max-w-5xl space-y-8 pb-4">
      {/* Título + ações */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3 min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
            Plantão
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Dados por leito
          </h1>
          <p className="text-sm text-slate-500 max-w-md leading-relaxed">
            Escolha a UTI e o turno. Leitos vêm do cadastro (ou numeração padrão). Pacientes cadastrados
            aparecem como sugestão no nome.
          </p>
          <p className="text-xs text-slate-400">
            <span className="font-medium text-slate-600">{leitosCadastrados}</span> completos
            <span className="mx-1.5 text-slate-300">·</span>
            <span className="font-medium text-slate-600">{leitosComAlgumaInfo}</span> com algum dado
            <span className="mx-1.5 text-slate-300">·</span>
            {leitos.length} leitos
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={limparFormulario}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 ring-1 ring-slate-200/90 transition-colors hover:bg-slate-50"
          >
            <RotateCcw size={15} strokeWidth={1.75} />
            Limpar
          </button>
          <button
            type="button"
            onClick={salvar}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-teal-600/20 transition-colors hover:bg-teal-500"
          >
            {salvo ? <CheckCircle2 size={15} strokeWidth={1.75} /> : <Save size={15} strokeWidth={1.75} />}
            {salvo ? "Salvo" : "Salvar"}
          </button>
        </div>
      </div>

      {/* Esteira — linha do tempo discreta */}
      <div
        className="flex w-full max-w-md items-center sm:max-w-lg"
        aria-label="Progresso do plantão"
      >
        {steps.map((step, i) => (
          <Fragment key={step.n}>
            <div className="flex flex-col items-center gap-1">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                  step.ok
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white text-slate-400 ring-1 ring-slate-200"
                }`}
              >
                {step.n}
              </span>
              <span
                className={`text-[11px] font-medium sm:text-xs ${
                  step.ok ? "text-slate-800" : "text-slate-400"
                }`}
              >
                {step.title}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`mx-2 h-0.5 min-w-[2rem] flex-1 rounded-full sm:mx-3 ${
                  steps[i].ok ? "bg-slate-800/25" : "bg-slate-200"
                }`}
                aria-hidden
              />
            )}
          </Fragment>
        ))}
      </div>

      {/* Contexto do plantão */}
      <section className="rounded-2xl bg-white p-6 shadow-sm shadow-slate-900/[0.04] ring-1 ring-slate-100">
        <h2 className="text-sm font-medium text-slate-900">Contexto do turno</h2>
        <p className="mt-0.5 text-xs text-slate-500">UTI, data, turno e fisioterapeuta.</p>
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="mb-1.5 block text-xs font-medium text-slate-500">UTI</label>
            <select
              value={utiId}
              onChange={(e) => setUtiId(e.target.value)}
              className={inField}
              disabled={utisDisponiveis.length === 0}
            >
              {utisDisponiveis.length === 0 ? (
                <option value="">Nenhuma UTI disponível</option>
              ) : (
                utisDisponiveis.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nomeAbrev} — {u.nome}
                  </option>
                ))
              )}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Data</label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className={inField}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Turno</label>
            <select
              value={turno}
              onChange={(e) => setTurno(e.target.value as Turno)}
              className={inField}
            >
              <option value="Matutino">Matutino · 07–13h</option>
              <option value="Vespertino">Vespertino · 13–19h</option>
              <option value="Noturno">Noturno · 19–07h</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">
              Fisioterapeuta
            </label>
            <select
              value={fisioterapeutaId}
              onChange={(e) => setFisioterapeutaId(e.target.value)}
              className={inField}
            >
              <option value="">Selecionar…</option>
              {getFisioterapeutasLista()
                .filter((f) => f.status === "Ativo")
                .map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nome}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {turno && (
          <p
            className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-medium ${turnoTone[turno]}`}
          >
            {turno}
          </p>
        )}
      </section>

      {/* Leitos */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-sm font-medium text-slate-900">Leitos</h2>
            <p className="text-xs text-slate-500 mt-0.5">Abra um leito e avance pelas abas.</p>
          </div>
          <button
            type="button"
            onClick={adicionarLeito}
            className="inline-flex items-center gap-2 self-start rounded-xl px-3 py-2 text-sm font-medium text-teal-700 ring-1 ring-teal-200/80 transition-colors hover:bg-teal-50 sm:self-auto"
          >
            <Plus size={16} strokeWidth={1.75} />
            Adicionar leito
          </button>
        </div>

        {leitos.map((leito) => {
          const isExpanded = expandidos[leito.numero] ?? false;
          const nomePaciente = leito.pacienteNome.trim();
          const status = statusCadastroLeito(leito);
          const badge = badgeStatus[status];
          const temDados =
            Boolean(nomePaciente) ||
            Boolean(leito.satO2 || leito.fc || leito.suporte);
          const abaAtiva = abaPorLeito[leito.numero] ?? "id";

          return (
            <div
              key={leito.numero}
              className={`overflow-hidden rounded-2xl bg-white shadow-sm shadow-slate-900/[0.03] ring-1 transition-shadow ${
                status === "cadastrado"
                  ? "ring-teal-200/60"
                  : status === "identificado"
                    ? "ring-amber-200/50"
                    : "ring-slate-100"
              }`}
            >
              <button
                type="button"
                onClick={() => toggleLeito(leito.numero)}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-50/80"
              >
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      status === "cadastrado"
                        ? "bg-teal-50 text-teal-700"
                        : status === "identificado"
                          ? "bg-amber-50 text-amber-800"
                          : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <BedDouble size={18} strokeWidth={1.5} />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1 text-left">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">
                        Leito {leito.numero}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
                      <span
                        className={`truncate text-sm ${
                          nomePaciente ? "font-medium text-slate-800" : "text-slate-400"
                        }`}
                        title={nomePaciente || undefined}
                      >
                        {nomePaciente || "Nome do paciente"}
                      </span>
                      {temDados && (
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
                          {leito.satO2 && (
                            <span>
                              SatO₂ <b className="text-slate-700">{leito.satO2}%</b>
                            </span>
                          )}
                          {leito.fc && (
                            <span>
                              FC <b className="text-slate-700">{leito.fc}</b>
                            </span>
                          )}
                          {leito.suporte && (
                            <span>
                              <b className="text-slate-700">{leito.suporte}</b>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {leito.numero > 10 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removerLeito(leito.numero);
                      }}
                      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={16} strokeWidth={1.5} />
                    </button>
                  )}
                  {isExpanded ? (
                    <ChevronUp size={18} className="text-slate-400" strokeWidth={1.5} />
                  ) : (
                    <ChevronDown size={18} className="text-slate-400" strokeWidth={1.5} />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-slate-100 px-5 pb-5 pt-4">
                  <div className="mb-5 flex rounded-xl bg-slate-100/90 p-1">
                    {abasConfig.map(({ id, label, Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setAbaLeito(leito.numero, id)}
                        className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[11px] font-medium transition-all sm:gap-2 sm:px-3 sm:text-xs ${
                          abaAtiva === id
                            ? "bg-white text-slate-900 shadow-sm shadow-slate-900/5"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <Icon size={14} strokeWidth={1.75} className="hidden shrink-0 sm:block" />
                        <span className="truncate">{label}</span>
                      </button>
                    ))}
                  </div>

                  {abaAtiva === "id" && (
                    <div className="space-y-3">
                      <label className="mb-1.5 block text-xs font-medium text-slate-500">
                        Nome completo
                      </label>
                      <datalist id={`cadastro-pacientes-nomes-${leito.numero}`}>
                        {pacientesCadastro.map((p) => (
                          <option key={p.id} value={p.nome} />
                        ))}
                      </datalist>
                      <input
                        type="text"
                        value={leito.pacienteNome}
                        list={`cadastro-pacientes-nomes-${leito.numero}`}
                        onChange={(e) =>
                          atualizarLeito(leito.numero, "pacienteNome", e.target.value)
                        }
                        placeholder="Digite ou escolha do cadastro"
                        className={inField}
                      />
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Com nome, o status do leito avança para em andamento até os demais dados
                        estarem preenchidos.                         O nome na lista de sugestões vem do{" "}
                        <strong>Cadastro → Pacientes (FOR.017)</strong> após{" "}
                        <strong>Concluir admissão</strong>.
                      </p>
                    </div>
                  )}

                  {abaAtiva === "resp" && (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-500">
                          SatO₂ (%)
                        </label>
                        <input
                          type="number"
                          value={leito.satO2}
                          onChange={(e) => atualizarLeito(leito.numero, "satO2", e.target.value)}
                          placeholder="Ex: 96"
                          min={0}
                          max={100}
                          className={inField}
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-500">
                          FC (bpm)
                        </label>
                        <input
                          type="number"
                          value={leito.fc}
                          onChange={(e) => atualizarLeito(leito.numero, "fc", e.target.value)}
                          placeholder="Ex: 78"
                          min={0}
                          className={inField}
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-500">
                          Suporte
                        </label>
                        <input
                          type="text"
                          value={leito.suporte}
                          onChange={(e) => atualizarLeito(leito.numero, "suporte", e.target.value)}
                          placeholder="VM, VNI, O₂…"
                          className={inField}
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-500">
                          Complacência
                        </label>
                        <input
                          type="text"
                          value={leito.complacencia}
                          onChange={(e) =>
                            atualizarLeito(leito.numero, "complacencia", e.target.value)
                          }
                          placeholder="Ex: 35"
                          className={inField}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="mb-1.5 block text-xs font-medium text-slate-500">
                          Parâmetros
                        </label>
                        <input
                          type="text"
                          value={leito.parametros}
                          onChange={(e) =>
                            atualizarLeito(leito.numero, "parametros", e.target.value)
                          }
                          placeholder="FiO₂, PEEP, Vt…"
                          className={inField}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="mb-1.5 block text-xs font-medium text-slate-500">
                          Sedação
                        </label>
                        <input
                          type="text"
                          value={leito.sedacao}
                          onChange={(e) => atualizarLeito(leito.numero, "sedacao", e.target.value)}
                          placeholder="Droga e dose"
                          className={inField}
                        />
                      </div>
                    </div>
                  )}

                  {abaAtiva === "lab" && (
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-sm font-medium text-slate-900">Hemograma</h3>
                        <p className="mt-0.5 text-xs text-slate-500">Valores do SPData</p>
                        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                          <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-500">
                              Hemoglobina (g/dL)
                            </label>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={leito.hemoglobina}
                              onChange={(e) =>
                                atualizarLeito(leito.numero, "hemoglobina", e.target.value)
                              }
                              placeholder="Ex: 10,2"
                              className={inField}
                            />
                            <FieldHint>Ref. usual adulto ~ 12–16 (varia com sexo/lab)</FieldHint>
                          </div>
                          <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-500">
                              Hematócrito (%)
                            </label>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={leito.hematocrito}
                              onChange={(e) =>
                                atualizarLeito(leito.numero, "hematocrito", e.target.value)
                              }
                              placeholder="Ex: 31"
                              className={inField}
                            />
                            <FieldHint>Ref. usual ~ 36–48%</FieldHint>
                          </div>
                          <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-500">
                              Leucócitos (/mm³)
                            </label>
                            <input
                              type="text"
                              value={leito.leucocitos}
                              onChange={(e) =>
                                atualizarLeito(leito.numero, "leucocitos", e.target.value)
                              }
                              placeholder="Ex: 12.400"
                              className={inField}
                            />
                            <FieldHint>Ref. usual ~ 4.000–11.000</FieldHint>
                          </div>
                          <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-500">
                              Plaquetas (/mm³)
                            </label>
                            <input
                              type="text"
                              value={leito.plaquetas}
                              onChange={(e) =>
                                atualizarLeito(leito.numero, "plaquetas", e.target.value)
                              }
                              placeholder="Ex: 180.000"
                              className={inField}
                            />
                            <FieldHint>Ref. usual ~ 150.000–400.000</FieldHint>
                          </div>
                        </div>
                        <div className="mt-5">
                          <label className="mb-1.5 block text-xs font-medium text-slate-500">
                            Outros parâmetros
                          </label>
                          <textarea
                            value={leito.exameHemogramaSpdata}
                            onChange={(e) =>
                              atualizarLeito(leito.numero, "exameHemogramaSpdata", e.target.value)
                            }
                            placeholder="Outros parâmetros do SPData…"
                            rows={2}
                            className={inArea}
                          />
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-slate-900">Gasometria arterial</h3>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Referências usuais ao lado de cada campo.
                        </p>
                        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                          <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-500">
                              pH
                            </label>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={leito.gasoPh}
                              onChange={(e) => atualizarLeito(leito.numero, "gasoPh", e.target.value)}
                              placeholder="Ex: 7,40"
                              className={inField}
                            />
                            <FieldHint>Ref. 7,35 – 7,45</FieldHint>
                          </div>
                          <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-500">
                              PaCO₂ (mmHg)
                            </label>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={leito.gasoPaco2}
                              onChange={(e) =>
                                atualizarLeito(leito.numero, "gasoPaco2", e.target.value)
                              }
                              placeholder="Ex: 40"
                              className={inField}
                            />
                            <FieldHint>Ref. 35 – 45 (componente respiratório)</FieldHint>
                          </div>
                          <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-500">
                              PaO₂ (mmHg)
                            </label>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={leito.gasoPao2}
                              onChange={(e) =>
                                atualizarLeito(leito.numero, "gasoPao2", e.target.value)
                              }
                              placeholder="Ex: 85"
                              className={inField}
                            />
                            <FieldHint>Ref. 80 – 100 (oxigenação)</FieldHint>
                          </div>
                          <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-500">
                              HCO₃⁻ (mEq/L)
                            </label>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={leito.gasoHco3}
                              onChange={(e) =>
                                atualizarLeito(leito.numero, "gasoHco3", e.target.value)
                              }
                              placeholder="Ex: 24"
                              className={inField}
                            />
                            <FieldHint>Ref. 22 – 26 (componente metabólico)</FieldHint>
                          </div>
                          <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-500">
                              BE (mmol/L)
                            </label>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={leito.gasoBe}
                              onChange={(e) => atualizarLeito(leito.numero, "gasoBe", e.target.value)}
                              placeholder="Ex: 0"
                              className={inField}
                            />
                            <FieldHint>Ref. −2 a +2 (excesso de base)</FieldHint>
                          </div>
                          <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-500">
                              SaO₂ (%)
                            </label>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={leito.gasoSao2}
                              onChange={(e) =>
                                atualizarLeito(leito.numero, "gasoSao2", e.target.value)
                              }
                              placeholder="Ex: 97"
                              className={inField}
                            />
                            <FieldHint>Ref. maior que 95%</FieldHint>
                          </div>
                        </div>
                        <div className="mt-5">
                          <label className="mb-1.5 block text-xs font-medium text-slate-500">
                            Outros (lactato, COHb…)
                          </label>
                          <textarea
                            value={leito.exameGasometriaArterialSpdata}
                            onChange={(e) =>
                              atualizarLeito(
                                leito.numero,
                                "exameGasometriaArterialSpdata",
                                e.target.value
                              )
                            }
                            placeholder="Lactato, COHb, outros…"
                            rows={2}
                            className={inArea}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {abaAtiva === "estado" && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-500">
                          Estado geral
                        </label>
                        <select
                          value={leito.estadoGeral}
                          onChange={(e) =>
                            atualizarLeito(leito.numero, "estadoGeral", e.target.value)
                          }
                          className={inField}
                        >
                          <option value="">Selecione</option>
                          <option value="Estável">Estável</option>
                          <option value="Regular">Regular</option>
                          <option value="Grave">Grave</option>
                          <option value="Crítico">Crítico</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="mb-1.5 block text-xs font-medium text-slate-500">
                          Observações
                        </label>
                        <textarea
                          value={leito.obs}
                          onChange={(e) => atualizarLeito(leito.numero, "obs", e.target.value)}
                          placeholder="Anotações adicionais do plantão…"
                          rows={3}
                          className={`${inField} resize-none`}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-4 border-t border-slate-100 pt-8 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="order-2 text-xs text-slate-400 sm:order-1">
          Revise os leitos e salve o plantão do turno.
        </p>
        <div className="order-1 flex flex-col gap-2 sm:order-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={limparFormulario}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 ring-1 ring-slate-200/90 transition-colors hover:bg-slate-50"
          >
            <RotateCcw size={15} strokeWidth={1.75} />
            Limpar tudo
          </button>
          <button
            type="button"
            onClick={salvar}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm shadow-teal-600/20 transition-colors hover:bg-teal-500"
          >
            {salvo ? <CheckCircle2 size={15} strokeWidth={1.75} /> : <Save size={15} strokeWidth={1.75} />}
            {salvo ? "Salvo" : "Salvar plantão"}
          </button>
        </div>
      </div>
    </div>
  );
}
