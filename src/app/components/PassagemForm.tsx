import { useState, useCallback, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link, Navigate } from "react-router";
import {
  ChevronLeft, ChevronDown, ChevronRight, Save, Send, RotateCcw,
  Copy, CheckCircle2, AlertTriangle, User, BedDouble
} from "lucide-react";
import { mockUTIs } from "../store";
import { getFisioterapeutasLista } from "../data/fisioterapeutasCadastroStore";
import {
  getPassagens, addPassagem, updatePassagem,
  getUltimaPassagemEnviada,
} from "../data/passagensStore";
import { useAuth } from "../context/AuthContext";
import { todosUsuarios, podeCriarPassagem } from "../data/usuarios";
import { LeitoPassagem, PassagemPlantao, TurnoPassagem } from "../types";
import { indicadoresLeitoVazio } from "../data/passagemLeitoMerge";
import { enqueueWhatsAppResumoPassagem } from "../integrations/whatsappQueue";

// ===== TIPOS DE RESPIRAÇÃO =====
const TIPOS_RESP = [
  { label: "RE/AA", color: "bg-green-100 text-green-700 border-green-300" },
  { label: "VM/TOT/VCV", color: "bg-blue-100 text-blue-700 border-blue-300" },
  { label: "VM/TOT/PSV", color: "bg-blue-100 text-blue-700 border-blue-300" },
  { label: "VM/TOT/PCV", color: "bg-blue-100 text-blue-700 border-blue-300" },
  { label: "VM/TRAQ/VCV", color: "bg-indigo-100 text-indigo-700 border-indigo-300" },
  { label: "VM/TRAQ/PSV", color: "bg-indigo-100 text-indigo-700 border-indigo-300" },
  { label: "VNI", color: "bg-cyan-100 text-cyan-700 border-cyan-300" },
  { label: "O2/CN", color: "bg-teal-100 text-teal-700 border-teal-300" },
  { label: "O2/MASC", color: "bg-teal-100 text-teal-700 border-teal-300" },
  { label: "O2/ALTO FLUXO", color: "bg-teal-100 text-teal-700 border-teal-300" },
];

// ===== FLAGS =====
const FLAGS_OPCOES = [
  { label: "ALTA", color: "bg-emerald-100 text-emerald-700 border-emerald-300" },
  { label: "PALIATIVO", color: "bg-purple-100 text-purple-700 border-purple-300" },
  { label: "PCR", color: "bg-red-100 text-red-700 border-red-300" },
  { label: "AGUARDANDO LEITO", color: "bg-orange-100 text-orange-700 border-orange-300" },
  { label: "ISOLAMENTO", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  { label: "IOT RECENTE", color: "bg-blue-100 text-blue-700 border-blue-300" },
];

function criarLeitoVago(numero: number): LeitoPassagem {
  return {
    numero,
    vago: true,
    pacienteNome: "",
    dataAdmissao: "",
    diagnostico: "",
    comorbidades: "",
    historicoAdmissao: "",
    statusFuncional: "",
    cntQualiFisioDf: "",
    avaliacaoFuncional: "",
    reavaliacaoFuncional: "",
    tipoRespiracao: "",
    iot: "",
    parametrosVentilatorios: "",
    anamneseConduta: "",
    flags: [],
    ...indicadoresLeitoVazio,
  };
}

// ===== CARD DE LEITO =====
interface LeitoCardProps {
  leito: LeitoPassagem;
  expanded: boolean;
  onToggle: () => void;
  onUpdate: (campo: keyof LeitoPassagem, valor: unknown) => void;
  readonly?: boolean;
}

function ToggleRow({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className={`flex items-center gap-2 text-xs ${
        disabled ? "text-slate-300 cursor-not-allowed" : "text-slate-600 cursor-pointer"
      }`}
    >
      <input
        type="checkbox"
        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}

function LeitoCard({ leito, expanded, onToggle, onUpdate, readonly }: LeitoCardProps) {
  const temVM = leito.tipoRespiracao.startsWith("VM");

  const toggleFlag = (flag: string) => {
    const current = leito.flags ?? [];
    const novo = current.includes(flag)
      ? current.filter((f) => f !== flag)
      : [...current, flag];
    onUpdate("flags", novo);
  };

  return (
    <div
      className={`rounded-xl border overflow-hidden transition-all ${
        leito.vago
          ? "border-dashed border-slate-200 bg-slate-50/50"
          : leito.flags?.includes("PALIATIVO")
          ? "border-purple-200 bg-purple-50/20"
          : leito.flags?.includes("ALTA")
          ? "border-emerald-200 bg-emerald-50/20"
          : "border-slate-200 bg-white"
      }`}
    >
      {/* Cabeçalho do leito */}
      <div
        className={`flex items-center gap-3 px-4 py-3 cursor-pointer select-none ${
          leito.vago ? "hover:bg-slate-100/50" : "hover:bg-slate-50"
        } transition-colors`}
        onClick={onToggle}
      >
        {/* Número */}
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold ${
            leito.vago ? "bg-slate-200 text-slate-400" : "bg-teal-600 text-white"
          }`}
        >
          {leito.numero < 10 ? `0${leito.numero}` : leito.numero}
        </div>

        {/* Nome / VAGO */}
        <div className="flex-1 min-w-0">
          {leito.vago ? (
            <span className="text-slate-400 text-sm italic">VAGO</span>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-700 text-sm truncate">
                {leito.pacienteNome || "Paciente sem nome"}
                {leito.pacienteIdade ? `, ${leito.pacienteIdade}a` : ""}
              </span>
              {leito.tipoRespiracao && (
                <span className={`text-xs px-1.5 py-0.5 rounded border ${
                  TIPOS_RESP.find((t) => t.label === leito.tipoRespiracao)?.color ??
                  "bg-slate-100 text-slate-600 border-slate-200"
                }`}>
                  {leito.tipoRespiracao}
                </span>
              )}
              {leito.flags?.map((f) => (
                <span
                  key={f}
                  className={`text-xs px-1.5 py-0.5 rounded border ${
                    FLAGS_OPCOES.find((fo) => fo.label === f)?.color ??
                    "bg-slate-100 text-slate-600 border-slate-200"
                  }`}
                >
                  {f}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Toggle vago */}
        {!readonly && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdate("vago", !leito.vago);
              if (leito.vago) {
                // Expande quando marca como ocupado
              }
            }}
            className={`text-xs px-2 py-1 rounded-md border transition-colors flex-shrink-0 ${
              leito.vago
                ? "border-teal-300 text-teal-600 hover:bg-teal-50"
                : "border-slate-200 text-slate-400 hover:bg-slate-50"
            }`}
          >
            {leito.vago ? "Admitir" : "Vago"}
          </button>
        )}

        {/* Expand icon */}
        <div className="text-slate-400 flex-shrink-0">
          {expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
        </div>
      </div>

      {/* Corpo expandido */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 space-y-4 border-t border-slate-100">
          {/* Identificação */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs text-slate-400 mb-1">Nome completo</label>
              <input
                type="text"
                value={leito.pacienteNome}
                onChange={(e) => onUpdate("pacienteNome", e.target.value)}
                placeholder="Nome do paciente"
                disabled={readonly}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Idade</label>
              <input
                type="number"
                value={leito.pacienteIdade ?? ""}
                onChange={(e) => onUpdate("pacienteIdade", e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Anos"
                min={0}
                max={130}
                disabled={readonly}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Data de admissão</label>
              <input
                type="text"
                value={leito.dataAdmissao}
                onChange={(e) => onUpdate("dataAdmissao", e.target.value)}
                placeholder="dd/mm/aaaa"
                disabled={readonly}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
          </div>

          {/* Diagnóstico + Comorbidades */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Diagnóstico</label>
              <input
                type="text"
                value={leito.diagnostico}
                onChange={(e) => onUpdate("diagnostico", e.target.value)}
                placeholder="Diagnóstico principal"
                disabled={readonly}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Comorbidades</label>
              <input
                type="text"
                value={leito.comorbidades}
                onChange={(e) => onUpdate("comorbidades", e.target.value)}
                placeholder="HAS, DM2, etc."
                disabled={readonly}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
          </div>

          {/* Admissão */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Admissão (histórico)</label>
            <textarea
              value={leito.historicoAdmissao}
              onChange={(e) => onUpdate("historicoAdmissao", e.target.value)}
              placeholder="Proveniente de... com histórico de..."
              rows={2}
              disabled={readonly}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>

          {/* Funcional */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs text-slate-400 mb-1">Status funcional</label>
              <input
                type="text"
                value={leito.statusFuncional}
                onChange={(e) => onUpdate("statusFuncional", e.target.value)}
                placeholder="—"
                disabled={readonly}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">CNT QUALI-FISIO DF</label>
              <input
                type="text"
                value={leito.cntQualiFisioDf}
                onChange={(e) => onUpdate("cntQualiFisioDf", e.target.value)}
                placeholder="1–8"
                disabled={readonly}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Avaliação funcional</label>
              <input
                type="text"
                value={leito.avaliacaoFuncional}
                onChange={(e) => onUpdate("avaliacaoFuncional", e.target.value)}
                placeholder="dd/mm"
                disabled={readonly}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Reavaliação funcional</label>
              <input
                type="text"
                value={leito.reavaliacaoFuncional}
                onChange={(e) => onUpdate("reavaliacaoFuncional", e.target.value)}
                placeholder="dd/mm ou 24/48h"
                disabled={readonly}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
          </div>

          {/* Tipo de respiração */}
          <div>
            <label className="block text-xs text-slate-400 mb-2">Tipo de respiração</label>
            <div className="flex flex-wrap gap-1.5">
              {TIPOS_RESP.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  disabled={readonly}
                  onClick={() =>
                    onUpdate("tipoRespiracao", leito.tipoRespiracao === t.label ? "" : t.label)
                  }
                  className={`text-xs px-2.5 py-1 rounded-md border transition-all ${
                    leito.tipoRespiracao === t.label
                      ? t.color + " ring-2 ring-offset-1 ring-current"
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-400 disabled:cursor-default"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* IOT + Parâmetros (apenas se VM) */}
          {(temVM || leito.iot || leito.parametrosVentilatorios) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
              <div>
                <label className="block text-xs text-blue-500 mb-1">IOT</label>
                <input
                  type="text"
                  value={leito.iot ?? ""}
                  onChange={(e) => onUpdate("iot", e.target.value)}
                  placeholder="IOT dd/mm, TOT n°..."
                  disabled={readonly}
                  className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white disabled:bg-slate-50"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-blue-500 mb-1">Parâmetros ventilatórios</label>
                <input
                  type="text"
                  value={leito.parametrosVentilatorios ?? ""}
                  onChange={(e) => onUpdate("parametrosVentilatorios", e.target.value)}
                  placeholder="VC, FR, PEEP, FiO2, SpO2..."
                  disabled={readonly}
                  className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white disabled:bg-slate-50"
                />
              </div>
            </div>
          )}

          {/* Indicadores estruturados (KPIs) — apenas leito ocupado */}
          {!leito.vago && (
            <div className="rounded-lg border border-violet-100 bg-violet-50/40 p-3 space-y-3">
              <p className="text-xs font-medium text-violet-900">Indicadores UTI (estruturados)</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <p className="text-[11px] uppercase tracking-wide text-violet-600/80">Ventilação</p>
                  <ToggleRow
                    label="Paciente em ventilação mecânica"
                    checked={leito.pacienteEmVm}
                    disabled={readonly}
                    onChange={(v) => {
                      onUpdate("pacienteEmVm", v);
                      if (!v) onUpdate("tempoVmDias", undefined);
                    }}
                  />
                  {leito.pacienteEmVm && (
                    <div>
                      <label className="block text-[11px] text-violet-600 mb-1">
                        Tempo em VM (dias) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={0.5}
                        value={leito.tempoVmDias ?? ""}
                        onChange={(e) =>
                          onUpdate(
                            "tempoVmDias",
                            e.target.value === "" ? undefined : parseFloat(e.target.value)
                          )
                        }
                        disabled={readonly}
                        placeholder="Obrigatório se em VM"
                        className="w-full px-3 py-2 border border-violet-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 disabled:bg-slate-50"
                      />
                    </div>
                  )}
                  <ToggleRow
                    label="Extubado (neste plantão)"
                    checked={leito.extubado}
                    disabled={readonly}
                    onChange={(v) => onUpdate("extubado", v)}
                  />
                  <ToggleRow
                    label="Extubação acidental"
                    checked={leito.extubacaoAcidental}
                    disabled={readonly || !leito.extubado}
                    onChange={(v) => onUpdate("extubacaoAcidental", v)}
                  />
                  <ToggleRow
                    label="Reintubação em ≤48h"
                    checked={leito.reintubacao48h}
                    disabled={readonly}
                    onChange={(v) => onUpdate("reintubacao48h", v)}
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-[11px] uppercase tracking-wide text-violet-600/80">Neurológico / mobilidade / PAV</p>
                  <ToggleRow
                    label="Delirium identificado"
                    checked={leito.delirium}
                    disabled={readonly}
                    onChange={(v) => onUpdate("delirium", v)}
                  />
                  <ToggleRow
                    label="Mobilizado (intervenção registrada)"
                    checked={leito.mobilizado}
                    disabled={readonly}
                    onChange={(v) => onUpdate("mobilizado", v)}
                  />
                  <ToggleRow
                    label="PAV confirmado (critério clínico)"
                    checked={leito.pavConfirmado}
                    disabled={readonly}
                    onChange={(v) => onUpdate("pavConfirmado", v)}
                  />
                  <p className="text-[11px] text-violet-600 pt-1">Bundle PAV (VM)</p>
                  <div className="grid grid-cols-1 gap-1.5 pl-0.5">
                    <ToggleRow
                      label="Cabeceira elevada"
                      checked={leito.bundleCabeceiraElevada}
                      disabled={readonly || !leito.pacienteEmVm}
                      onChange={(v) => onUpdate("bundleCabeceiraElevada", v)}
                    />
                    <ToggleRow
                      label="Higiene oral"
                      checked={leito.bundleHigieneOral}
                      disabled={readonly || !leito.pacienteEmVm}
                      onChange={(v) => onUpdate("bundleHigieneOral", v)}
                    />
                    <ToggleRow
                      label="Aspiração"
                      checked={leito.bundleAspiracao}
                      disabled={readonly || !leito.pacienteEmVm}
                      onChange={(v) => onUpdate("bundleAspiracao", v)}
                    />
                    <ToggleRow
                      label="Sedação controlada / alvo"
                      checked={leito.bundleSedacaoControlada}
                      disabled={readonly || !leito.pacienteEmVm}
                      onChange={(v) => onUpdate("bundleSedacaoControlada", v)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Flags */}
          <div>
            <label className="block text-xs text-slate-400 mb-2">Marcadores</label>
            <div className="flex flex-wrap gap-1.5">
              {FLAGS_OPCOES.map((fo) => {
                const ativo = leito.flags?.includes(fo.label);
                return (
                  <button
                    key={fo.label}
                    type="button"
                    disabled={readonly}
                    onClick={() => toggleFlag(fo.label)}
                    className={`text-xs px-2.5 py-1 rounded-md border transition-all ${
                      ativo
                        ? fo.color + " ring-2 ring-offset-1 ring-current"
                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-400 disabled:cursor-default"
                    }`}
                  >
                    {fo.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Anamnese e Conduta */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Anamnese e Conduta
              {!readonly && (
                <span className="text-slate-300 ml-1">(campo obrigatório)</span>
              )}
            </label>
            <textarea
              value={leito.anamneseConduta}
              onChange={(e) => onUpdate("anamneseConduta", e.target.value)}
              placeholder="Descreva o quadro clínico atual, condutas realizadas, intercorrências..."
              rows={4}
              disabled={readonly}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ===== COMPONENTE PRINCIPAL =====
export function PassagemForm() {
  const { utiId, passagemId } = useParams<{ utiId: string; passagemId?: string }>();
  const navigate = useNavigate();
  const { user, temAcesso } = useAuth();

  const uti = mockUTIs.find((u) => u.id === utiId);

  const existingForEdit =
    passagemId && utiId ? getPassagens().find((p) => p.id === passagemId) : undefined;

  // Carrega somente rascunho; passagem enviada/validada redireciona para visualização
  const [passagem, setPassagem] = useState<PassagemPlantao>(() => {
    if (passagemId && utiId) {
      const existing = getPassagens().find((p) => p.id === passagemId);
      if (existing && existing.status === "rascunho") return existing;
    }
    const leitosN = mockUTIs.find((u) => u.id === utiId)?.totalLeitos ?? 10;
    return {
      id: `pass-${utiId}-${Date.now()}`,
      utiId: utiId!,
      versao: 1,
      data: new Date().toISOString().split("T")[0],
      turno: "Diurno/Manhã",
      fisioterapeutaId: user?.id ?? "",
      fisioterapeutaNome: user?.nome ?? "",
      preenchidoPorId: user?.id ?? "",
      preenchidoPorNome: user?.nome ?? "",
      status: "rascunho",
      leitos: Array.from({ length: leitosN }, (_, i) => criarLeitoVago(i + 1)),
      createdAt: new Date().toISOString(),
    };
  });

  const [expandedLeitos, setExpandedLeitos] = useState<Set<number>>(() => {
    // Expande automaticamente leitos com paciente
    const ocupados = passagem.leitos
      .filter((l) => !l.vago)
      .map((l) => l.numero);
    return new Set(ocupados);
  });

  const [autoSaved, setAutoSaved] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [enviada, setEnviada] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);

  const opcoesResponsavel = useMemo(() => {
    if (!uti) return [] as { id: string; nome: string }[];
    if (uti.tipo === "enfermaria") {
      return todosUsuarios
        .filter(
          (u) =>
            u.setoresAcesso.includes("enfermaria") &&
            (u.role === "admin" || u.role === "coordenador" || u.role === "admin_setor")
        )
        .map((u) => ({ id: u.id, nome: u.nome }));
    }
    return getFisioterapeutasLista()
      .filter((f) => f.equipe === uti.equipe || user?.role === "admin")
      .map((f) => ({ id: f.id, nome: f.nome }));
  }, [uti, user?.role]);

  const salvarRascunho = useCallback(
    (feedback = true) => {
      if (passagem.status !== "rascunho") return;
      const passagens = getPassagens();
      const existe = passagens.find((p) => p.id === passagem.id);
      if (existe) {
        updatePassagem(passagem.id, passagem);
      } else {
        addPassagem(passagem);
      }
      if (feedback) {
        setAutoSaved(true);
        setTimeout(() => setAutoSaved(false), 2000);
      }
    },
    [passagem]
  );

  // Auto-save a cada 30s (somente rascunho)
  useEffect(() => {
    if (passagem.status !== "rascunho") return;
    const interval = setInterval(() => {
      salvarRascunho(false);
    }, 30000);
    return () => clearInterval(interval);
  }, [passagem, salvarRascunho]);

  const copiarDaUltima = () => {
    const ultima = getUltimaPassagemEnviada(utiId!);
    if (!ultima) return;
    setPassagem((prev) => ({
      ...prev,
      leitos: ultima.leitos.map((l) => ({
        ...l,
        anamneseConduta: "", // limpa só a conduta
      })),
    }));
    // Expande leitos com paciente
    const ocupados = ultima.leitos.filter((l) => !l.vago).map((l) => l.numero);
    setExpandedLeitos(new Set(ocupados));
  };

  const handleLeitoUpdate = (numero: number, campo: keyof LeitoPassagem, valor: unknown) => {
    setPassagem((prev) => ({
      ...prev,
      leitos: prev.leitos.map((l) => {
        if (l.numero !== numero) return l;
        let next: LeitoPassagem = { ...l, [campo]: valor } as LeitoPassagem;
        if (campo === "vago" && valor === true) {
          next = { ...next, ...indicadoresLeitoVazio, vago: true };
        }
        if (campo === "pacienteEmVm" && !valor) {
          next = { ...next, tempoVmDias: undefined };
        }
        return next;
      }),
    }));
    if (campo === "vago" && valor === false) {
      setExpandedLeitos((prev) => new Set([...prev, numero]));
    }
  };

  const toggleLeito = (numero: number) => {
    setExpandedLeitos((prev) => {
      const next = new Set(prev);
      if (next.has(numero)) next.delete(numero);
      else next.add(numero);
      return next;
    });
  };

  const handleEnviar = () => {
    setErroEnvio(null);
    const faltamTempoVm = passagem.leitos.filter(
      (l) =>
        !l.vago &&
        l.pacienteEmVm &&
        (l.tempoVmDias === undefined || !Number.isFinite(l.tempoVmDias) || l.tempoVmDias < 0)
    );
    if (faltamTempoVm.length) {
      setErroEnvio(
        `Preencha o tempo em VM (dias) para o(s) leito(s): ${faltamTempoVm.map((l) => l.numero).join(", ")}.`
      );
      setExpandedLeitos((prev) => {
        const n = new Set(prev);
        faltamTempoVm.forEach((l) => n.add(l.numero));
        return n;
      });
      return;
    }
    const semConduta = passagem.leitos.filter((l) => !l.vago && !String(l.anamneseConduta).trim());
    if (semConduta.length) {
      setErroEnvio("Anamnese e conduta são obrigatórias para todos os leitos ocupados.");
      return;
    }

    setEnviando(true);
    setTimeout(() => {
      const updated: PassagemPlantao = {
        ...passagem,
        status: "enviada",
        enviadaEm: new Date().toISOString(),
      };
      const passagens = getPassagens();
      const existe = passagens.find((p) => p.id === passagem.id);
      if (existe) {
        updatePassagem(passagem.id, updated);
      } else {
        addPassagem(updated);
      }
      enqueueWhatsAppResumoPassagem(updated);
      setEnviando(false);
      setEnviada(true);
      setTimeout(() => navigate(`/utis/${utiId}`), 1500);
    }, 800);
  };

  if (!utiId || !uti) {
    return <div className="text-slate-500 p-8 text-center">UTI não encontrada.</div>;
  }

  if (!temAcesso(utiId)) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
          <span className="text-2xl">🔒</span>
        </div>
        <p className="text-slate-600">Você não tem acesso a este setor.</p>
        <button type="button" onClick={() => navigate("/utis")} className="text-teal-600 hover:text-teal-800 text-sm">
          ← Voltar para meus setores
        </button>
      </div>
    );
  }

  if (!podeCriarPassagem(user, utiId)) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
          <span className="text-2xl">🔒</span>
        </div>
        <p className="text-slate-600">Você não tem permissão para criar ou editar passagens neste setor.</p>
        <button type="button" onClick={() => navigate("/utis")} className="text-teal-600 hover:text-teal-800 text-sm">
          ← Voltar para meus setores
        </button>
      </div>
    );
  }

  if (passagemId && existingForEdit && existingForEdit.utiId !== utiId) {
    return <Navigate to="/utis" replace />;
  }
  if (passagemId && existingForEdit && existingForEdit.status !== "rascunho") {
    return <Navigate to={`/utis/${utiId}/passagem/${passagemId}`} replace />;
  }
  if (passagemId && !existingForEdit) {
    return <Navigate to={`/utis/${utiId}`} replace />;
  }

  const ocupados = passagem.leitos.filter((l) => !l.vago).length;
  const emVM = passagem.leitos.filter((l) => !l.vago && l.pacienteEmVm).length;

  if (enviada) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
          <CheckCircle2 size={32} className="text-emerald-600" />
        </div>
        <p className="text-slate-700 text-lg">Passagem enviada com sucesso!</p>
        <p className="text-slate-400 text-sm">Aguardando validação da coordenação.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link to="/utis" className="flex items-center gap-1 text-slate-400 hover:text-slate-600 text-sm">
          <ChevronLeft size={14} /> UTIs
        </Link>
        <span className="text-slate-300">/</span>
        <Link to={`/utis/${utiId}`} className="text-slate-400 hover:text-slate-600 text-sm">
          {uti.nome}
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-600 text-sm">Nova passagem</span>
      </div>

      {/* Header fixo */}
      <div className="bg-slate-800 rounded-xl p-4 text-white sticky top-0 z-10 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <BedDouble size={16} className="text-teal-400" />
              <h1 className="text-white text-base">{uti.nome} – Passagem de Plantão</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {/* Data */}
              <input
                type="date"
                value={passagem.data}
                onChange={(e) => setPassagem((p) => ({ ...p, data: e.target.value }))}
                className="px-2 py-1 rounded bg-white/10 text-white text-sm border border-white/20 focus:outline-none focus:ring-1 focus:ring-teal-400"
              />
              {/* Turno */}
              <select
                value={passagem.turno}
                onChange={(e) => setPassagem((p) => ({ ...p, turno: e.target.value as TurnoPassagem }))}
                className="px-2 py-1 rounded bg-white/10 text-white text-sm border border-white/20 focus:outline-none focus:ring-1 focus:ring-teal-400"
              >
                <option value="Diurno/Manhã">☀️ Diurno/Manhã</option>
                <option value="Diurno/Tarde">🌤 Diurno/Tarde</option>
                <option value="Noturno">🌙 Noturno</option>
              </select>
              {/* Plantonista (UTI) ou responsável (enfermaria) */}
              <div className="flex items-center gap-1.5">
                <User size={13} className="text-slate-400" />
                <span className="text-slate-400 text-xs whitespace-nowrap hidden sm:inline">
                  {uti.tipo === "enfermaria" ? "Responsável:" : "Plantonista:"}
                </span>
                <select
                  value={passagem.fisioterapeutaId}
                  onChange={(e) => {
                    const opt = opcoesResponsavel.find((fi) => fi.id === e.target.value);
                    setPassagem((p) => ({
                      ...p,
                      fisioterapeutaId: e.target.value,
                      fisioterapeutaNome: opt?.nome ?? e.target.value,
                    }));
                  }}
                  className="px-2 py-1 rounded bg-white/10 text-white text-sm border border-white/20 focus:outline-none focus:ring-1 focus:ring-teal-400"
                >
                  {opcoesResponsavel.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Stats rápidos */}
          <div className="flex items-center gap-4 text-center">
            <div>
              <p className="text-2xl text-white">{ocupados}</p>
              <p className="text-xs text-slate-400">ocupados</p>
            </div>
            <div>
              <p className="text-2xl text-teal-400">{emVM}</p>
              <p className="text-xs text-slate-400">em VM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de ações */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={copiarDaUltima}
          className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
          title="Copia todos os dados da última passagem. Apenas a conduta é apagada para ser reescrita."
        >
          <Copy size={14} />
          Copiar da última passagem
        </button>
        <button
          onClick={() => setExpandedLeitos(new Set(passagem.leitos.map((l) => l.numero)))}
          className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Expandir todos
        </button>
        <button
          onClick={() => setExpandedLeitos(new Set())}
          className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Recolher todos
        </button>

        <div className="flex-1" />

        {/* Auto-save feedback */}
        {autoSaved && (
          <span className="flex items-center gap-1 text-xs text-emerald-600">
            <CheckCircle2 size={12} /> Salvo
          </span>
        )}

        <button
          onClick={() => salvarRascunho(true)}
          className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <Save size={14} />
          Salvar rascunho
        </button>
      </div>

      {erroEnvio && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-800">
          <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
          <span>{erroEnvio}</span>
        </div>
      )}

      {/* Aviso de imutabilidade */}
      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
        <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">
          Após enviar, esta passagem <strong>não poderá ser editada</strong>. Para corrigir, uma nova versão deverá ser criada, mantendo o histórico completo.
        </p>
      </div>

      {/* Leitos */}
      <div className="space-y-2">
        {passagem.leitos.map((leito) => (
          <LeitoCard
            key={leito.numero}
            leito={leito}
            expanded={expandedLeitos.has(leito.numero)}
            onToggle={() => toggleLeito(leito.numero)}
            onUpdate={(campo, valor) => handleLeitoUpdate(leito.numero, campo, valor)}
          />
        ))}
      </div>

      {/* Observações gerais */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <label className="block text-sm text-slate-600 mb-2">Observações gerais do plantão</label>
        <textarea
          value={passagem.observacoesGerais ?? ""}
          onChange={(e) => setPassagem((p) => ({ ...p, observacoesGerais: e.target.value }))}
          placeholder="Intercorrências gerais, recados para o próximo turno..."
          rows={3}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
        />
      </div>

      {/* Preenchido por */}
      <div className="flex items-center gap-2 text-xs text-slate-400 px-1">
        <User size={12} />
        <span>Preenchido por <strong className="text-slate-600">{user?.nome}</strong> em {new Date().toLocaleString("pt-BR")}</span>
      </div>

      {/* Botões de envio */}
      <div className="flex justify-end gap-3 pb-8">
        <button
          onClick={() => navigate(`/utis/${utiId}`)}
          className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <ChevronLeft size={14} />
          Voltar
        </button>
        <button
          onClick={() => salvarRascunho(true)}
          className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <Save size={14} />
          Salvar rascunho
        </button>
        <button
          onClick={handleEnviar}
          disabled={enviando}
          className="flex items-center gap-2 bg-teal-600 text-white px-6 py-2.5 rounded-lg hover:bg-teal-700 transition-colors text-sm disabled:opacity-60"
        >
          {enviando ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send size={14} />
          )}
          {enviando ? "Enviando..." : "Enviar passagem"}
        </button>
      </div>
    </div>
  );
}