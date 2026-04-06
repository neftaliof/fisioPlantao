import { getPassagens, updatePassagem, addPassagem } from "../data/passagensStore";
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  ChevronLeft, CheckCircle2, Clock, AlertCircle, User,
  Calendar, BedDouble, Copy, FileText, History
} from "lucide-react";
import { mockUTIs } from "../store";
import { useAuth } from "../context/AuthContext";
import { podeValidarPassagem, podeCriarPassagem } from "../data/usuarios";
import { LeitoPassagem, PassagemPlantao } from "../types";

const respBadge: Record<string, string> = {
  "RE/AA": "bg-green-100 text-green-700",
  "VM/TOT/VCV": "bg-blue-100 text-blue-700",
  "VM/TOT/PSV": "bg-blue-100 text-blue-700",
  "VM/TOT/PCV": "bg-blue-100 text-blue-700",
  "VM/TRAQ/VCV": "bg-indigo-100 text-indigo-700",
  "VM/TRAQ/PSV": "bg-indigo-100 text-indigo-700",
  "VNI": "bg-cyan-100 text-cyan-700",
  "O2/CN": "bg-teal-100 text-teal-700",
  "O2/MASC": "bg-teal-100 text-teal-700",
  "O2/ALTO FLUXO": "bg-teal-100 text-teal-700",
};

const flagColors: Record<string, string> = {
  ALTA: "bg-emerald-100 text-emerald-700",
  PALIATIVO: "bg-purple-100 text-purple-700",
  PCR: "bg-red-100 text-red-700",
  "AGUARDANDO LEITO": "bg-orange-100 text-orange-700",
  ISOLAMENTO: "bg-yellow-100 text-yellow-700",
  "IOT RECENTE": "bg-blue-100 text-blue-700",
};

function turnoLabel(turno: string) {
  const map: Record<string, string> = {
    "Diurno/Manhã": "☀️ Manhã",
    "Diurno/Tarde": "🌤 Tarde",
    Noturno: "🌙 Noturno",
  };
  return map[turno] ?? turno;
}

function LeitoViewCard({ leito }: { leito: LeitoPassagem }) {
  const [expanded, setExpanded] = useState(!leito.vago);

  if (leito.vago) {
    return (
      <div className="border border-dashed border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
          <span className="text-slate-400 text-sm font-bold">
            {leito.numero < 10 ? `0${leito.numero}` : leito.numero}
          </span>
        </div>
        <span className="text-slate-300 text-sm italic">VAGO</span>
        {leito.historicoAdmissao && (
          <span className="text-slate-400 text-xs">{leito.historicoAdmissao}</span>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-xl border overflow-hidden ${
      leito.flags?.includes("PALIATIVO")
        ? "border-purple-200"
        : leito.flags?.includes("ALTA")
        ? "border-emerald-200"
        : "border-slate-200"
    } bg-white`}>
      {/* Header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-bold">
            {leito.numero < 10 ? `0${leito.numero}` : leito.numero}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-700 text-sm">
              {leito.pacienteNome}
              {leito.pacienteIdade ? `, ${leito.pacienteIdade}a` : ""}
            </span>
            {leito.tipoRespiracao && (
              <span className={`text-xs px-2 py-0.5 rounded ${respBadge[leito.tipoRespiracao] ?? "bg-slate-100 text-slate-600"}`}>
                {leito.tipoRespiracao}
              </span>
            )}
            {leito.flags?.map((f) => (
              <span key={f} className={`text-xs px-2 py-0.5 rounded ${flagColors[f] ?? "bg-slate-100 text-slate-600"}`}>
                {f}
              </span>
            ))}
          </div>
          {leito.diagnostico && (
            <p className="text-xs text-slate-400 mt-0.5 truncate">{leito.diagnostico}</p>
          )}
        </div>
        <span className="text-slate-400 text-xs">{expanded ? "▲" : "▼"}</span>
      </button>

      {/* Corpo */}
      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-slate-100 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <p className="text-slate-400">Admissão</p>
              <p className="text-slate-700">{leito.dataAdmissao || "—"}</p>
            </div>
            <div>
              <p className="text-slate-400">CNT QUALI-FISIO DF</p>
              <p className="text-slate-700">{leito.cntQualiFisioDf || "—"}</p>
            </div>
            <div>
              <p className="text-slate-400">Av. Funcional</p>
              <p className="text-slate-700">{leito.avaliacaoFuncional || "—"}</p>
            </div>
            <div>
              <p className="text-slate-400">Reavaliação</p>
              <p className="text-slate-700">{leito.reavaliacaoFuncional || "—"}</p>
            </div>
          </div>

          {leito.comorbidades && (
            <div className="text-xs">
              <p className="text-slate-400">Comorbidades</p>
              <p className="text-slate-700">{leito.comorbidades}</p>
            </div>
          )}

          {leito.historicoAdmissao && (
            <div className="text-xs">
              <p className="text-slate-400">Admissão (histórico)</p>
              <p className="text-slate-700 whitespace-pre-line">{leito.historicoAdmissao}</p>
            </div>
          )}

          {!leito.vago && (
            <div className="p-3 bg-violet-50/80 rounded-lg border border-violet-100 text-xs space-y-2">
              <p className="text-violet-800 font-medium">Indicadores estruturados</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                <div>
                  <span className="text-violet-500">VM</span>
                  <p className="text-slate-700">
                    {leito.pacienteEmVm ? `Sim${leito.tempoVmDias != null ? ` · ${leito.tempoVmDias} d` : ""}` : "Não"}
                  </p>
                </div>
                <div>
                  <span className="text-violet-500">Extubação</span>
                  <p className="text-slate-700">
                    {leito.extubado
                      ? `Sim${leito.extubacaoAcidental ? " · acidental" : ""}${leito.reintubacao48h ? " · reIOT≤48h" : ""}`
                      : "Não"}
                  </p>
                </div>
                <div>
                  <span className="text-violet-500">Delirium / mobilidade / PAV</span>
                  <p className="text-slate-700">
                    {leito.delirium ? "Delirium · " : ""}
                    {leito.mobilizado ? "Mobilizado · " : ""}
                    {leito.pavConfirmado ? "PAV ok" : "PAV não"}
                  </p>
                </div>
              </div>
              {leito.pacienteEmVm && (
                <p className="text-slate-600">
                  Bundle:{" "}
                  {[
                    leito.bundleCabeceiraElevada && "cabeceira",
                    leito.bundleHigieneOral && "higiene",
                    leito.bundleAspiracao && "aspiração",
                    leito.bundleSedacaoControlada && "sedação",
                  ]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </p>
              )}
            </div>
          )}

          {(leito.iot || leito.parametrosVentilatorios) && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-xs space-y-1">
              {leito.iot && (
                <div>
                  <span className="text-blue-400">IOT: </span>
                  <span className="text-blue-800">{leito.iot}</span>
                </div>
              )}
              {leito.parametrosVentilatorios && (
                <div>
                  <span className="text-blue-400">Parâmetros: </span>
                  <span className="text-blue-800">{leito.parametrosVentilatorios}</span>
                </div>
              )}
            </div>
          )}

          {leito.anamneseConduta && (
            <div className="text-xs">
              <p className="text-slate-400 mb-1">Anamnese e Conduta</p>
              <p className="text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                {leito.anamneseConduta}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function PassagemView() {
  const { utiId, passagemId } = useParams<{ utiId: string; passagemId: string }>();
  const navigate = useNavigate();
  const { user, temAcesso } = useAuth();

  const [passagem, setPassagem] = useState<PassagemPlantao | null>(() => {
    return getPassagens().find((p) => p.id === passagemId) ?? null;
  });
  const [validando, setValidando] = useState(false);

  useEffect(() => {
    const p = getPassagens().find((x) => x.id === passagemId);
    setPassagem(p ?? null);
  }, [passagemId]);

  const uti = mockUTIs.find((u) => u.id === utiId);

  if (!utiId || !passagemId) {
    return <div className="text-slate-500 p-8 text-center">Passagem não encontrada.</div>;
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

  if (!passagem || !uti) {
    return <div className="text-slate-500 p-8 text-center">Passagem não encontrada.</div>;
  }

  if (passagem.utiId !== utiId) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-slate-600">Este registro não pertence a este setor.</p>
        <button type="button" onClick={() => navigate("/utis")} className="text-teal-600 hover:text-teal-800 text-sm">
          ← Voltar para UTIs
        </button>
      </div>
    );
  }

  const canValidate = podeValidarPassagem(user, utiId);
  const canCreate = podeCriarPassagem(user, utiId);

  const handleValidar = () => {
    setValidando(true);
    setTimeout(() => {
      const updated = updatePassagem(passagem.id, {
        status: "validada",
        validadoPor: user?.nome,
        validadoEm: new Date().toISOString(),
      });
      const nova = updated.find((p) => p.id === passagem.id);
      if (nova) setPassagem(nova);
      setValidando(false);
    }, 700);
  };

  const handleNovaVersao = () => {
    const novaId = `pass-${utiId}-${Date.now()}`;
    const nova: PassagemPlantao = {
      ...passagem,
      id: novaId,
      versao: passagem.versao + 1,
      passagemAnteriorId: passagem.id,
      data: new Date().toISOString().split("T")[0],
      status: "rascunho",
      fisioterapeutaId: user?.id ?? "",
      fisioterapeutaNome: user?.nome ?? "",
      preenchidoPorId: user?.id ?? "",
      preenchidoPorNome: user?.nome ?? "",
      validadoPor: undefined,
      validadoEm: undefined,
      enviadaEm: undefined,
      leitos: passagem.leitos.map((l) => ({ ...l, anamneseConduta: "" })),
      createdAt: new Date().toISOString(),
    };
    addPassagem(nova);
    navigate(`/utis/${utiId}/passagem/${novaId}/editar`);
  };

  const dataFmt = new Date(passagem.data + "T00:00:00").toLocaleDateString("pt-BR", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });

  const ocupados = passagem.leitos.filter((l) => !l.vago).length;
  const emVM = passagem.leitos.filter((l) => !l.vago && l.pacienteEmVm).length;

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link to="/utis" className="flex items-center gap-1 text-slate-400 hover:text-slate-600">
          <ChevronLeft size={14} /> UTIs
        </Link>
        <span className="text-slate-300">/</span>
        <Link to={`/utis/${utiId}`} className="text-slate-400 hover:text-slate-600">
          {uti.nome}
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-600">Passagem</span>
      </div>

      {/* Header */}
      <div className="bg-slate-800 rounded-xl p-5 text-white">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-white text-base">{uti.nome}</h1>
              <span className="text-slate-400 text-sm">·</span>
              <span className="text-slate-300 text-sm">{turnoLabel(passagem.turno)}</span>
              {passagem.versao > 1 && (
                <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-slate-300">
                  v{passagem.versao}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-slate-300 text-sm">
              <Calendar size={13} />
              <span className="capitalize">{dataFmt}</span>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <User size={11} /> Plantonista: {passagem.fisioterapeutaNome}
              </span>
              {passagem.preenchidoPorNome !== passagem.fisioterapeutaNome && (
                <span>Preenchido por: {passagem.preenchidoPorNome}</span>
              )}
              <span className="flex items-center gap-1">
                <BedDouble size={11} /> {ocupados}/{uti.totalLeitos} ocupados · VM: {emVM}
              </span>
            </div>
          </div>

          {/* Status + ações */}
          <div className="flex flex-col items-start sm:items-end gap-2">
            {passagem.status === "validada" && (
              <div className="flex items-center gap-1.5 text-emerald-400 text-sm">
                <CheckCircle2 size={14} />
                <span>Validada por {passagem.validadoPor}</span>
              </div>
            )}
            {passagem.status === "enviada" && (
              <div className="flex items-center gap-1.5 text-amber-400 text-sm">
                <Clock size={14} />
                <span>Aguardando validação</span>
              </div>
            )}
            {passagem.status === "rascunho" && (
              <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                <AlertCircle size={14} />
                <span>Rascunho</span>
              </div>
            )}

            <div className="flex gap-2">
              {canValidate && passagem.status === "enviada" && (
                <button
                  onClick={handleValidar}
                  disabled={validando}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition-colors disabled:opacity-60"
                >
                  {validando ? (
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <CheckCircle2 size={13} />
                  )}
                  Validar passagem
                </button>
              )}
              {canCreate && passagem.status !== "rascunho" && (
                <button
                  onClick={handleNovaVersao}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white/10 text-white rounded-lg text-sm hover:bg-white/20 transition-colors"
                >
                  <Copy size={13} />
                  Nova versão
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Versioning chain */}
        {passagem.passagemAnteriorId && (
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
            <History size={12} className="text-slate-400" />
            <span className="text-xs text-slate-400">
              Baseada na versão anterior ·{" "}
              <button
                onClick={() => navigate(`/utis/${utiId}/passagem/${passagem.passagemAnteriorId}`)}
                className="text-teal-400 hover:text-teal-300 underline"
              >
                Ver passagem anterior
              </button>
            </span>
          </div>
        )}
      </div>

      {/* Leitos */}
      <div className="space-y-2">
        {passagem.leitos.map((leito) => (
          <LeitoViewCard key={leito.numero} leito={leito} />
        ))}
      </div>

      {/* Observações gerais */}
      {passagem.observacoesGerais && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={14} className="text-slate-400" />
            <p className="text-sm text-slate-600">Observações gerais</p>
          </div>
          <p className="text-sm text-slate-700 whitespace-pre-line">{passagem.observacoesGerais}</p>
        </div>
      )}

      {/* Rodapé */}
      <div className="text-xs text-slate-400 flex flex-wrap gap-3 pb-8">
        {passagem.enviadaEm && (
          <span>Enviada em: {new Date(passagem.enviadaEm).toLocaleString("pt-BR")}</span>
        )}
        {passagem.validadoEm && (
          <span>Validada em: {new Date(passagem.validadoEm).toLocaleString("pt-BR")}</span>
        )}
      </div>
    </div>
  );
}