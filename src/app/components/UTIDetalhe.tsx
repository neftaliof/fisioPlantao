import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  ChevronLeft, Plus, CheckCircle2, Clock, AlertCircle,
  Eye, User, Calendar, BedDouble, Activity, Copy
} from "lucide-react";
import { mockUTIs } from "../store";
import { getPassagensByUTI, addPassagem, updatePassagem, getUltimaPassagemEnviada } from "../data/passagensStore";
import { useAuth } from "../context/AuthContext";
import { podeValidarPassagem, podeCriarPassagem } from "../data/usuarios";
import { PassagemPlantao, LeitoPassagem, TurnoPassagem } from "../types";

const flagColors: Record<string, string> = {
  ALTA: "bg-emerald-100 text-emerald-700",
  PALIATIVO: "bg-purple-100 text-purple-700",
  PCR: "bg-red-100 text-red-700",
  "AGUARDANDO LEITO": "bg-orange-100 text-orange-700",
  ISOLAMENTO: "bg-yellow-100 text-yellow-700",
};

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
};

function turnoLabel(turno: string) {
  const map: Record<string, string> = {
    "Diurno/Manhã": "☀️ Manhã",
    "Diurno/Tarde": "🌤 Tarde",
    Noturno: "🌙 Noturno",
  };
  return map[turno] ?? turno;
}

function StatusBadge({ status }: { status: string }) {
  if (status === "validada")
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 size={10} /> Validada
      </span>
    );
  if (status === "enviada")
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
        <Clock size={10} /> Aguardando validação
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
      <AlertCircle size={10} /> Rascunho
    </span>
  );
}

function LeitorGrid({ leitos }: { leitos: LeitoPassagem[] }) {
  return (
    <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
      {leitos.map((l) => (
        <div
          key={l.numero}
          title={l.vago ? `Leito ${l.numero} – VAGO` : `Leito ${l.numero} – ${l.pacienteNome}`}
          className={`relative rounded-lg p-1.5 text-center cursor-default transition-all ${
            l.vago
              ? "bg-slate-100 border border-dashed border-slate-300"
              : "bg-white border border-slate-200 hover:border-teal-300"
          }`}
        >
          <p className={`text-xs font-medium ${l.vago ? "text-slate-400" : "text-slate-700"}`}>
            {l.numero < 10 ? `0${l.numero}` : l.numero}
          </p>
          {!l.vago && (
            <>
              <p className="text-xs text-slate-500 truncate leading-tight mt-0.5">
                {l.pacienteNome.split(" ")[0]}
              </p>
              {l.tipoRespiracao && (
                <span className={`mt-0.5 inline-block text-xs px-1 rounded ${respBadge[l.tipoRespiracao] ?? "bg-slate-100 text-slate-600"}`}>
                  {l.tipoRespiracao.startsWith("VM") ? "VM" : l.tipoRespiracao === "RE/AA" ? "AA" : l.tipoRespiracao}
                </span>
              )}
              {l.flags.length > 0 && (
                <div className="mt-0.5 flex flex-wrap justify-center gap-0.5">
                  {l.flags.map((f) => (
                    <span key={f} className={`text-xs px-1 rounded-sm ${flagColors[f] ?? "bg-slate-100 text-slate-500"}`}>
                      {f === "AGUARDANDO LEITO" ? "AG" : f.slice(0, 3)}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
          {l.vago && <p className="text-xs text-slate-300 mt-0.5">vago</p>}
        </div>
      ))}
    </div>
  );
}

export function UTIDetalhe() {
  const { utiId } = useParams<{ utiId: string }>();
  const navigate = useNavigate();
  const { user, temAcesso } = useAuth();
  const [passagens, setPassagens] = useState(() => getPassagensByUTI(utiId!));
  const [validando, setValidando] = useState<string | null>(null);

  const uti = mockUTIs.find((u) => u.id === utiId);

  // Controle de acesso
  if (!temAcesso(utiId!)) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
          <span className="text-2xl">🔒</span>
        </div>
        <p className="text-slate-600">Você não tem acesso a este setor.</p>
        <button onClick={() => navigate("/utis")} className="text-teal-600 hover:text-teal-800 text-sm">
          ← Voltar para meus setores
        </button>
      </div>
    );
  }

  if (!uti) return <div className="text-slate-500 p-8 text-center">UTI não encontrada.</div>;

  const canValidate = podeValidarPassagem(user, utiId!);
  const canCreate = podeCriarPassagem(user, utiId!);

  const handleValidar = (id: string) => {
    setValidando(id);
    setTimeout(() => {
      const updated = updatePassagem(id, {
        status: "validada",
        validadoPor: user?.nome,
        validadoEm: new Date().toISOString(),
      });
      setPassagens(updated.filter((p) => p.utiId === utiId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      setValidando(null);
    }, 600);
  };

  const handleNovaVersao = (base: PassagemPlantao) => {
    // Cria nova passagem copiando os dados da última
    const novaId = `pass-${utiId}-${Date.now()}`;
    const nova: PassagemPlantao = {
      ...base,
      id: novaId,
      versao: base.versao + 1,
      passagemAnteriorId: base.id,
      data: new Date().toISOString().split("T")[0],
      status: "rascunho",
      fisioterapeutaId: user?.id ?? "",
      fisioterapeutaNome: user?.nome ?? "",
      preenchidoPorId: user?.id ?? "",
      preenchidoPorNome: user?.nome ?? "",
      validadoPor: undefined,
      validadoEm: undefined,
      enviadaEm: undefined,
      leitos: base.leitos.map((l) => ({ ...l, anamneseConduta: "" })), // limpa conduta
      createdAt: new Date().toISOString(),
    };
    addPassagem(nova);
    navigate(`/utis/${utiId}/passagem/${novaId}/editar`);
  };

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link
          to="/utis"
          className="flex items-center gap-1 text-slate-400 hover:text-slate-600 text-sm transition-colors"
        >
          <ChevronLeft size={15} /> UTIs
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-600 text-sm">{uti.nome}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-slate-800">{uti.nome}</h1>
          <p className="text-slate-400 text-xs mt-0.5">{uti.localizacao} · {uti.totalLeitos} leitos</p>
        </div>
        {canCreate && (
          <button
            onClick={() => navigate(`/utis/${utiId}/nova-passagem`)}
            className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors text-sm"
          >
            <Plus size={14} />
            Nova passagem
          </button>
        )}
      </div>

      {/* Snapshot atual */}
      {passagens[0] && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BedDouble size={15} className="text-slate-500" />
              <span className="text-sm text-slate-600">
                Situação atual dos leitos
              </span>
            </div>
            <span className="text-xs text-slate-400">
              Baseado na última passagem: {new Date(passagens[0].data + "T00:00:00").toLocaleDateString("pt-BR")}
            </span>
          </div>
          <LeitorGrid leitos={passagens[0].leitos} />
          <div className="flex flex-wrap gap-3 pt-1">
            {[
              { label: "VM", color: "bg-blue-100 text-blue-700", count: passagens[0].leitos.filter(l => l.tipoRespiracao.startsWith("VM")).length },
              { label: "RE/AA", color: "bg-green-100 text-green-700", count: passagens[0].leitos.filter(l => l.tipoRespiracao === "RE/AA").length },
              { label: "Paliativo", color: "bg-purple-100 text-purple-700", count: passagens[0].leitos.filter(l => l.flags.includes("PALIATIVO")).length },
              { label: "Alta", color: "bg-emerald-100 text-emerald-700", count: passagens[0].leitos.filter(l => l.flags.includes("ALTA")).length },
              { label: "Vago", color: "bg-slate-100 text-slate-500", count: passagens[0].leitos.filter(l => l.vago).length },
            ].map(({ label, color, count }) => count > 0 && (
              <span key={label} className={`text-xs px-2 py-0.5 rounded-full ${color}`}>
                {label}: {count}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Histórico */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
          <Activity size={15} className="text-slate-500" />
          <h2 className="text-slate-700">Histórico de passagens</h2>
        </div>

        {passagens.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-slate-400 text-sm">Nenhuma passagem registrada para esta UTI.</p>
            {canCreate && (
              <button
                onClick={() => navigate(`/utis/${utiId}/nova-passagem`)}
                className="mt-3 inline-flex items-center gap-1.5 text-teal-600 hover:text-teal-800 text-sm transition-colors"
              >
                <Plus size={14} /> Criar primeira passagem
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {passagens.map((p, idx) => {
              const dataFmt = new Date(p.data + "T00:00:00").toLocaleDateString("pt-BR", {
                weekday: "short", day: "2-digit", month: "short", year: "numeric",
              });
              const ocupados = p.leitos.filter((l) => !l.vago).length;

              return (
                <div key={p.id} className={`px-4 py-4 ${idx === 0 ? "bg-slate-50/50" : ""}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    {/* Info principal */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-slate-700">{dataFmt}</span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-slate-500">{turnoLabel(p.turno)}</span>
                        {p.versao > 1 && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-slate-200 text-slate-600">
                            v{p.versao}
                          </span>
                        )}
                        <StatusBadge status={p.status} />
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <User size={11} /> {p.fisioterapeutaNome}
                        </span>
                        {p.preenchidoPorNome !== p.fisioterapeutaNome && (
                          <span className="text-xs text-slate-400">
                            Preenchido por: {p.preenchidoPorNome}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <BedDouble size={11} /> {ocupados}/{uti.totalLeitos} ocupados
                        </span>
                        {p.validadoPor && (
                          <span className="flex items-center gap-1 text-xs text-emerald-600">
                            <CheckCircle2 size={11} /> Validado por {p.validadoPor}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Validar */}
                      {canValidate && p.status === "enviada" && (
                        <button
                          onClick={() => handleValidar(p.id)}
                          disabled={validando === p.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs hover:bg-emerald-700 transition-colors disabled:opacity-60"
                        >
                          {validando === p.id ? (
                            <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <CheckCircle2 size={12} />
                          )}
                          Validar
                        </button>
                      )}

                      {/* Nova versão (apenas para passagens enviadas/validadas) */}
                      {canCreate && p.status !== "rascunho" && idx === 0 && (
                        <button
                          onClick={() => handleNovaVersao(p)}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs hover:bg-slate-50 transition-colors"
                          title="Copiar dados desta passagem para uma nova"
                        >
                          <Copy size={12} />
                          Nova versão
                        </button>
                      )}

                      {/* Ver */}
                      <button
                        onClick={() =>
                          p.status === "rascunho"
                            ? navigate(`/utis/${utiId}/passagem/${p.id}/editar`)
                            : navigate(`/utis/${utiId}/passagem/${p.id}`)
                        }
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs hover:bg-slate-50 transition-colors"
                      >
                        <Eye size={12} />
                        {p.status === "rascunho" ? "Editar" : "Ver"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}