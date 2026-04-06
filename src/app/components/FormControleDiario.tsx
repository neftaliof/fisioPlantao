import { useState } from "react";
import {
  Save,
  Plus,
  Trash2,
  RotateCcw,
  CheckCircle2,
  ClipboardList,
  AlertTriangle,
  BedDouble,
} from "lucide-react";
import { LeitoControleDiario, Ocorrencia } from "../types";
import { getFisioterapeutasLista } from "../data/fisioterapeutasCadastroStore";

const criarLeito = (numero: number): LeitoControleDiario => ({
  numero,
  da: "",
  paciente: "",
  patologia: "",
  vm: false,
  masc: false,
  tenda: false,
  cn: false,
  aa: false,
  m: false,
  v: false,
  n: false,
});

const criarOcorrencia = (): Ocorrencia => ({
  leito: "",
  hora: "",
  ocorrido: "",
});

function CheckboxCell({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <td className="px-2 py-2 text-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 accent-teal-600 cursor-pointer"
      />
    </td>
  );
}

export function FormControleDiario() {
  const hoje = new Date().toISOString().split("T")[0];
  const [data, setData] = useState(hoje);
  const [leitos, setLeitos] = useState<LeitoControleDiario[]>(
    Array.from({ length: 10 }, (_, i) => criarLeito(i + 1))
  );
  const [plantonistas, setPlantonistas] = useState({
    matutino: { nome: "", atendimentos: "" },
    vespertino: { nome: "", atendimentos: "" },
    noturno: { nome: "", atendimentos: "" },
  });
  const [transferencias, setTransferencias] = useState("");
  const [obitos, setObitos] = useState("");
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([criarOcorrencia()]);
  const [salvo, setSalvo] = useState(false);

  const atualizarLeito = (
    numero: number,
    campo: keyof LeitoControleDiario,
    valor: string | boolean
  ) => {
    setLeitos((prev) =>
      prev.map((l) => (l.numero === numero ? { ...l, [campo]: valor } : l))
    );
  };

  const adicionarLeito = () => {
    const proximo = leitos.length + 1;
    setLeitos((prev) => [...prev, criarLeito(proximo)]);
  };

  const removerLeito = (numero: number) => {
    if (leitos.length <= 1) return;
    setLeitos((prev) => prev.filter((l) => l.numero !== numero));
  };

  const adicionarOcorrencia = () => {
    setOcorrencias((prev) => [...prev, criarOcorrencia()]);
  };

  const atualizarOcorrencia = (
    i: number,
    campo: keyof Ocorrencia,
    valor: string
  ) => {
    setOcorrencias((prev) =>
      prev.map((oc, idx) => (idx === i ? { ...oc, [campo]: valor } : oc))
    );
  };

  const removerOcorrencia = (i: number) => {
    setOcorrencias((prev) => prev.filter((_, idx) => idx !== i));
  };

  const salvar = () => {
    setSalvo(true);
    setTimeout(() => setSalvo(false), 3000);
  };

  const limpar = () => {
    setLeitos(Array.from({ length: 10 }, (_, i) => criarLeito(i + 1)));
    setPlantonistas({
      matutino: { nome: "", atendimentos: "" },
      vespertino: { nome: "", atendimentos: "" },
      noturno: { nome: "", atendimentos: "" },
    });
    setTransferencias("");
    setObitos("");
    setOcorrencias([criarOcorrencia()]);
    setSalvo(false);
  };

  const fisiosAtivos = getFisioterapeutasLista().filter((f) => f.status === "Ativo");
  const totalAtendimentos =
    (parseInt(plantonistas.matutino.atendimentos) || 0) +
    (parseInt(plantonistas.vespertino.atendimentos) || 0) +
    (parseInt(plantonistas.noturno.atendimentos) || 0);

  return (
    <div className="space-y-5 max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList size={18} className="text-slate-500" />
            <h1 className="text-slate-800">Controle Diário Fisioterapia – UTI Adulto</h1>
          </div>
          <p className="text-slate-400 text-xs mt-1 font-mono">
            SCMA.FIS.FOR.008 · Rev. 1 · Elaborado: 13/02/2025
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={limpar}
            className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RotateCcw size={14} />
            Limpar
          </button>
          <button
            onClick={salvar}
            className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors text-sm"
          >
            {salvo ? <CheckCircle2 size={14} /> : <Save size={14} />}
            {salvo ? "Salvo!" : "Salvar"}
          </button>
        </div>
      </div>

      {/* Cabeçalho do formulário */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">SC</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700">SANTA CASA DE ANÁPOLIS</p>
              <p className="text-xs text-slate-400">UTI ADULTO</p>
            </div>
          </div>
          <div className="flex-1" />
          <div>
            <label className="block text-xs text-slate-500 mb-1">Data</label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>
        </div>
      </div>

      {/* Tabela de leitos */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BedDouble size={16} className="text-slate-500" />
            <h2 className="text-slate-700">Leitos</h2>
          </div>
          <button
            onClick={adicionarLeito}
            className="flex items-center gap-1.5 text-xs text-teal-600 hover:text-teal-800 transition-colors"
          >
            <Plus size={13} />
            Adicionar leito
          </button>
        </div>

        {/* Tabela scrollável */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-3 py-2.5 text-left text-xs text-slate-500 font-medium w-16">Leito</th>
                <th className="px-2 py-2.5 text-left text-xs text-slate-500 font-medium w-16">D.A</th>
                <th className="px-2 py-2.5 text-left text-xs text-slate-500 font-medium min-w-[140px]">Paciente</th>
                <th className="px-2 py-2.5 text-left text-xs text-slate-500 font-medium min-w-[120px]">Patologia</th>
                <th className="px-2 py-2.5 text-center text-xs text-slate-500 font-medium">VM</th>
                <th className="px-2 py-2.5 text-center text-xs text-slate-500 font-medium">MASC</th>
                <th className="px-2 py-2.5 text-center text-xs text-slate-500 font-medium">TENDA</th>
                <th className="px-2 py-2.5 text-center text-xs text-slate-500 font-medium">C.N.</th>
                <th className="px-2 py-2.5 text-center text-xs text-slate-500 font-medium">A.A.</th>
                <th className="px-2 py-2.5 text-center text-xs text-teal-600 font-medium">M</th>
                <th className="px-2 py-2.5 text-center text-xs text-blue-600 font-medium">V</th>
                <th className="px-2 py-2.5 text-center text-xs text-indigo-600 font-medium">N</th>
                <th className="px-2 py-2.5 text-center text-xs text-slate-400 font-medium w-8"></th>
              </tr>
            </thead>
            <tbody>
              {leitos.map((leito) => (
                <tr
                  key={leito.numero}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-3 py-2">
                    <div className="w-7 h-7 rounded-md bg-teal-50 flex items-center justify-center">
                      <span className="text-xs font-medium text-teal-700">{leito.numero}</span>
                    </div>
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="text"
                      value={leito.da}
                      onChange={(e) => atualizarLeito(leito.numero, "da", e.target.value)}
                      className="w-14 px-2 py-1 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-teal-400"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="text"
                      value={leito.paciente}
                      onChange={(e) => atualizarLeito(leito.numero, "paciente", e.target.value)}
                      placeholder="Nome do paciente"
                      className="w-full px-2 py-1 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-teal-400"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="text"
                      value={leito.patologia}
                      onChange={(e) => atualizarLeito(leito.numero, "patologia", e.target.value)}
                      placeholder="Diagnóstico"
                      className="w-full px-2 py-1 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-teal-400"
                    />
                  </td>
                  <CheckboxCell
                    checked={leito.vm}
                    onChange={(v) => atualizarLeito(leito.numero, "vm", v)}
                  />
                  <CheckboxCell
                    checked={leito.masc}
                    onChange={(v) => atualizarLeito(leito.numero, "masc", v)}
                  />
                  <CheckboxCell
                    checked={leito.tenda}
                    onChange={(v) => atualizarLeito(leito.numero, "tenda", v)}
                  />
                  <CheckboxCell
                    checked={leito.cn}
                    onChange={(v) => atualizarLeito(leito.numero, "cn", v)}
                  />
                  <CheckboxCell
                    checked={leito.aa}
                    onChange={(v) => atualizarLeito(leito.numero, "aa", v)}
                  />
                  <td className="px-2 py-2 text-center bg-amber-50/30">
                    <input
                      type="checkbox"
                      checked={leito.m}
                      onChange={(e) => atualizarLeito(leito.numero, "m", e.target.checked)}
                      className="w-4 h-4 accent-amber-500 cursor-pointer"
                    />
                  </td>
                  <td className="px-2 py-2 text-center bg-blue-50/30">
                    <input
                      type="checkbox"
                      checked={leito.v}
                      onChange={(e) => atualizarLeito(leito.numero, "v", e.target.checked)}
                      className="w-4 h-4 accent-blue-500 cursor-pointer"
                    />
                  </td>
                  <td className="px-2 py-2 text-center bg-indigo-50/30">
                    <input
                      type="checkbox"
                      checked={leito.n}
                      onChange={(e) => atualizarLeito(leito.numero, "n", e.target.checked)}
                      className="w-4 h-4 accent-indigo-500 cursor-pointer"
                    />
                  </td>
                  <td className="px-2 py-2 text-center">
                    {leito.numero > 10 && (
                      <button
                        onClick={() => removerLeito(leito.numero)}
                        className="text-slate-300 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legenda M/V/N */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-amber-200 rounded-sm inline-block" />
            M = Matutino
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-blue-200 rounded-sm inline-block" />
            V = Vespertino
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-indigo-200 rounded-sm inline-block" />
            N = Noturno
          </span>
          <span className="ml-2">VM = Ventilação Mecânica · MASC = Máscara · C.N. = Cateter Nasal</span>
        </div>
      </div>

      {/* Plantonistas */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-slate-700 mb-4">Plantonistas</h2>
        <div className="space-y-3">
          {[
            { turno: "Matutino", key: "matutino" as const, emoji: "🌅", cor: "amber" },
            { turno: "Vespertino", key: "vespertino" as const, emoji: "🌤️", cor: "blue" },
            { turno: "Noturno", key: "noturno" as const, emoji: "🌙", cor: "indigo" },
          ].map(({ turno, key, emoji }) => (
            <div key={key} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              <div className="flex items-center gap-2">
                <span>{emoji}</span>
                <span className="text-sm text-slate-600 font-medium">{turno}</span>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Plantonista</label>
                <select
                  value={plantonistas[key].nome}
                  onChange={(e) =>
                    setPlantonistas((prev) => ({
                      ...prev,
                      [key]: { ...prev[key], nome: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
                >
                  <option value="">Selecione...</option>
                  {fisiosAtivos.map((f) => (
                    <option key={f.id} value={f.nome}>
                      {f.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Nº de Atendimentos</label>
                <input
                  type="number"
                  value={plantonistas[key].atendimentos}
                  onChange={(e) =>
                    setPlantonistas((prev) => ({
                      ...prev,
                      [key]: { ...prev[key], atendimentos: e.target.value },
                    }))
                  }
                  placeholder="0"
                  min={0}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Totais */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Transferências</label>
            <input
              type="number"
              value={transferencias}
              onChange={(e) => setTransferencias(e.target.value)}
              placeholder="0"
              min={0}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Óbitos</label>
            <input
              type="number"
              value={obitos}
              onChange={(e) => setObitos(e.target.value)}
              placeholder="0"
              min={0}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>
          <div className="flex items-end">
            <div className="w-full px-4 py-2.5 bg-teal-50 rounded-lg border border-teal-200 text-center">
              <p className="text-xs text-teal-600">Total de Atendimentos</p>
              <p className="text-xl font-semibold text-teal-700">{totalAtendimentos}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ocorrências */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" />
            <h2 className="text-slate-700">Ocorrências</h2>
          </div>
          <button
            onClick={adicionarOcorrencia}
            className="flex items-center gap-1.5 text-xs text-teal-600 hover:text-teal-800 transition-colors"
          >
            <Plus size={13} />
            Adicionar
          </button>
        </div>

        <div className="space-y-3">
          {/* Cabeçalho */}
          <div className="hidden sm:grid grid-cols-12 gap-2 px-2">
            <span className="col-span-2 text-xs text-slate-400">Leito</span>
            <span className="col-span-2 text-xs text-slate-400">Hora</span>
            <span className="col-span-7 text-xs text-slate-400">Ocorrido</span>
            <span className="col-span-1" />
          </div>
          {ocorrencias.map((oc, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-start">
              <div className="col-span-6 sm:col-span-2">
                <input
                  type="text"
                  value={oc.leito}
                  onChange={(e) => atualizarOcorrencia(i, "leito", e.target.value)}
                  placeholder="Leito"
                  className="w-full px-2 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
              <div className="col-span-6 sm:col-span-2">
                <input
                  type="time"
                  value={oc.hora}
                  onChange={(e) => atualizarOcorrencia(i, "hora", e.target.value)}
                  className="w-full px-2 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
              <div className="col-span-11 sm:col-span-7">
                <input
                  type="text"
                  value={oc.ocorrido}
                  onChange={(e) => atualizarOcorrencia(i, "ocorrido", e.target.value)}
                  placeholder="Descreva o ocorrido..."
                  className="w-full px-2 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
              <div className="col-span-1 flex items-center justify-center pt-2">
                {ocorrencias.length > 1 && (
                  <button
                    onClick={() => removerOcorrencia(i)}
                    className="text-slate-300 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ação final */}
      <div className="flex justify-end gap-3 pb-6">
        <button
          onClick={limpar}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <RotateCcw size={14} />
          Limpar formulário
        </button>
        <button
          onClick={salvar}
          className="flex items-center gap-2 bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors text-sm"
        >
          {salvo ? <CheckCircle2 size={14} /> : <Save size={14} />}
          {salvo ? "Formulário salvo!" : "Salvar Formulário"}
        </button>
      </div>
    </div>
  );
}
