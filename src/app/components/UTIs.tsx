import { useNavigate } from "react-router";
import {
  Building2, Users, CheckCircle2, Clock, AlertCircle,
  Plus, ChevronRight, MapPin, Lock, Baby, Activity, ClipboardList
} from "lucide-react";
import { mockUTIs } from "../store";
import { getPassagensByUTI } from "../data/passagensStore";
import { useAuth } from "../context/AuthContext";
import { UTI } from "../types";

// ─── helpers ───────────────────────────────────────────────────────
function turnoLabel(turno: string) {
  const map: Record<string, string> = {
    "Diurno/Manhã": "☀️ Manhã",
    "Diurno/Tarde": "🌤 Tarde",
    Noturno: "🌙 Noturno",
  };
  return map[turno] ?? turno;
}

const equipeLabel: Record<string, string> = {
  adulto: "Equipe Adulto",
  pediatrico: "Equipe Pediátrica",
  enfermaria: "Enfermaria",
};

const equipeIcon: Record<string, React.ReactNode> = {
  adulto: <Activity size={14} className="text-teal-500" />,
  pediatrico: <Baby size={14} className="text-violet-500" />,
  enfermaria: <ClipboardList size={14} className="text-amber-500" />,
};

// Header color per equipe
const equipeHeaderBg: Record<string, string> = {
  adulto: "bg-teal-800",
  pediatrico: "bg-violet-800",
  enfermaria: "bg-amber-700",
};

const equipeBarColor: Record<string, string> = {
  adulto: "bg-teal-400",
  pediatrico: "bg-violet-400",
  enfermaria: "bg-amber-300",
};

const equipeBorderColor: Record<string, string> = {
  adulto: "border-teal-200",
  pediatrico: "border-violet-200",
  enfermaria: "border-amber-200",
};

// ─── Card de setor ─────────────────────────────────────────────────
interface SetorCardProps {
  uti: UTI;
  canCreate: boolean;
  onVerHistorico: () => void;
  onNovaPassagem: () => void;
  onContinuarRascunho: (id: string) => void;
}

function SetorCard({ uti, canCreate, onVerHistorico, onNovaPassagem, onContinuarRascunho }: SetorCardProps) {
  const passagens = getPassagensByUTI(uti.id);
  const ultima = passagens[0] ?? null;
  const rascunho = passagens.find((p) => p.status === "rascunho");
  const ocupados = ultima ? ultima.leitos.filter((l) => !l.vago).length : 0;
  const emVM = ultima ? ultima.leitos.filter((l) => l.tipoRespiracao.startsWith("VM")).length : 0;
  const paliativos = ultima ? ultima.leitos.filter((l) => l.flags.includes("PALIATIVO")).length : 0;
  const ehEnfermaria = uti.tipo === "enfermaria";

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden hover:shadow-md transition-shadow ${equipeBorderColor[uti.equipe]}`}>
      {/* Header */}
      <div className={`${equipeHeaderBg[uti.equipe]} px-5 py-4`}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-white text-base">{uti.nome}</h2>
            <div className="flex items-center gap-1 mt-1">
              <MapPin size={11} className="text-white/50" />
              <span className="text-white/50 text-xs">{uti.localizacao}</span>
            </div>
          </div>
          {!ehEnfermaria && (
            <div className="text-right">
              <span className="text-2xl text-white">{ocupados}</span>
              <span className="text-white/50 text-xs">/{uti.totalLeitos}</span>
              <p className="text-white/50 text-xs">leitos ocupados</p>
            </div>
          )}
          {ehEnfermaria && (
            <div className="text-right">
              <p className="text-white/50 text-xs mt-1">Sem plantão de fisio</p>
            </div>
          )}
        </div>

        {!ehEnfermaria && (
          <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full ${equipeBarColor[uti.equipe]} rounded-full transition-all`}
              style={{ width: `${ocupados > 0 ? (ocupados / uti.totalLeitos) * 100 : 0}%` }}
            />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-3">
        {/* Badges */}
        {!ehEnfermaria && (
          <div className="flex flex-wrap gap-2 min-h-[24px]">
            {emVM > 0 && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                🫁 VM: {emVM}
              </span>
            )}
            {paliativos > 0 && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                🕊 Paliativo: {paliativos}
              </span>
            )}
            {ocupados === 0 && !ultima && (
              <span className="text-xs text-slate-300 italic">Sem passagem registrada</span>
            )}
          </div>
        )}

        {/* Última passagem */}
        {ultima && !ehEnfermaria && (
          <div className="border border-slate-100 rounded-xl p-3 space-y-1.5">
            <p className="text-xs text-slate-400 uppercase tracking-wide">Última passagem</p>
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm text-slate-700">
                  {new Date(ultima.data + "T00:00:00").toLocaleDateString("pt-BR")} · {turnoLabel(ultima.turno)}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{ultima.fisioterapeutaNome}</p>
              </div>
              {ultima.status === "validada" && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 size={10} /> Validada
                </span>
              )}
              {ultima.status === "enviada" && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  <Clock size={10} /> Aguard. validação
                </span>
              )}
              {ultima.status === "rascunho" && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                  <AlertCircle size={10} /> Rascunho
                </span>
              )}
            </div>
          </div>
        )}

        {/* Enfermaria: info simples */}
        {ehEnfermaria && (
          <div className="text-center py-3">
            <p className="text-xs text-slate-400">
              Gerenciada por Joyce
            </p>
            <p className="text-xs text-slate-300 mt-1">{uti.totalLeitos} leitos · Sem equipe de fisioterapia</p>
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={onVerHistorico}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Ver histórico <ChevronRight size={14} />
          </button>
          {canCreate && !ehEnfermaria && (
            <button
              onClick={() => rascunho ? onContinuarRascunho(rascunho.id) : onNovaPassagem()}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm text-white transition-colors ${
                rascunho ? "bg-amber-500 hover:bg-amber-600" : `${equipeHeaderBg[uti.equipe]} hover:opacity-90`
              }`}
            >
              {rascunho ? (
                <><Clock size={14} /> Continuar rascunho</>
              ) : (
                <><Plus size={14} /> Nova passagem</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ───────────────────────────────────────────
export function UTIs() {
  const navigate = useNavigate();
  const { user, temAcesso } = useAuth();

  // Filtra setores por acesso
  const setoresVisiveis = mockUTIs.filter((u) => temAcesso(u.id));

  // Agrupa por equipe
  const grupos: Record<string, UTI[]> = {};
  for (const uti of setoresVisiveis) {
    if (!grupos[uti.equipe]) grupos[uti.equipe] = [];
    grupos[uti.equipe].push(uti);
  }

  const canCreate =
    user?.role === "fisioterapeuta" ||
    user?.role === "coordenador" ||
    user?.role === "admin";

  const isAdmin = user?.role === "admin";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Building2 size={18} className="text-slate-500" />
          <h1 className="text-slate-800">Passagem de Plantão</h1>
        </div>
        <p className="text-slate-400 text-xs mt-1">
          Santa Casa de Anápolis · {isAdmin ? "Visão geral — todos os setores" : `Seus setores: ${setoresVisiveis.map(u => u.nomeAbrev).join(", ")}`}
        </p>
      </div>

      {setoresVisiveis.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Lock size={32} className="text-slate-300" />
          <p className="text-slate-400">Você não tem acesso a nenhum setor.</p>
        </div>
      )}

      {/* Grupos por equipe */}
      {Object.entries(grupos).map(([equipe, utis]) => (
        <div key={equipe} className="space-y-3">
          {/* Separador de equipe */}
          <div className="flex items-center gap-2">
            {equipeIcon[equipe]}
            <h2 className="text-slate-600 text-sm">{equipeLabel[equipe]}</h2>
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs text-slate-400">{utis.length} setor{utis.length > 1 ? "es" : ""}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {utis.map((uti) => (
              <SetorCard
                key={uti.id}
                uti={uti}
                canCreate={canCreate}
                onVerHistorico={() => navigate(`/utis/${uti.id}`)}
                onNovaPassagem={() => navigate(`/utis/${uti.id}/nova-passagem`)}
                onContinuarRascunho={(id) => navigate(`/utis/${uti.id}/passagem/${id}/editar`)}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Setores bloqueados (só visible para admin, para ter consciência do que não aparece para outros) */}
      {isAdmin && (
        <div className="mt-4 bg-slate-50 rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users size={14} className="text-slate-400" />
            <p className="text-xs text-slate-500 uppercase tracking-wide">Resumo de acesso por equipe</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-teal-50 border border-teal-100">
              <p className="text-teal-700">🏥 Equipe Adulto</p>
              <p className="text-teal-600 mt-1">UTI Adulto 01 + UTI Adulto 02</p>
              <p className="text-teal-400 mt-1">Coord: Katiuscia · 8 fisios</p>
            </div>
            <div className="p-3 rounded-lg bg-violet-50 border border-violet-100">
              <p className="text-violet-700">👶 Equipe Pediátrica</p>
              <p className="text-violet-600 mt-1">UTI Neo Natal + UTI Pediátrica</p>
              <p className="text-violet-400 mt-1">Coord: Rafaela · 4 fisios</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
              <p className="text-amber-700">📋 Enfermaria</p>
              <p className="text-amber-600 mt-1">Sem plantão de fisioterapia</p>
              <p className="text-amber-400 mt-1">Admin: Joyce</p>
            </div>
          </div>
        </div>
      )}

      {/* Fluxo de passagem */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
        <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">Fluxo da passagem de plantão</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { n: 1, color: "bg-teal-100 text-teal-700", title: "Fisioterapeuta preenche", desc: "Coleta dados de cada leito e envia" },
            { n: 2, color: "bg-violet-100 text-violet-700", title: "Coordenação valida", desc: "Katiuscia (adulto) ou Rafaela (pedi) aprovam" },
            { n: 3, color: "bg-amber-100 text-amber-700", title: "Dolores visualiza", desc: "Admin acompanha todos os setores" },
          ].map((step) => (
            <div key={step.n} className="flex items-start gap-2">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${step.color}`}>
                <span className="text-xs font-bold">{step.n}</span>
              </div>
              <div>
                <p className="text-xs text-slate-700">{step.title}</p>
                <p className="text-xs text-slate-400">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
