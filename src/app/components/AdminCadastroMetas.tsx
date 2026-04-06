import { useState, useCallback } from "react";
import { Navigate, useNavigate } from "react-router";
import { Save, RotateCcw, CheckCircle2, Target, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import type { MetaTerapeuticaInstitucional, MetasTerapeuticasCadastroGlobal } from "../types";
import {
  loadMetasTerapeuticasGlobal,
  saveMetasTerapeuticasGlobal,
  emptyMetasGlobal,
  NUM_METAS_INSTITUCIONAIS,
  formatDataBR,
  diasDesdeUltimaRevalidacaoMetas,
  metasInstitucionaisForaDoPrazo,
  DIAS_REVALIDACAO_METAS_INSTITUCIONAIS,
} from "../data/metasTerapeuticasStore";

const inputCls =
  "w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400";
const labelCls = "text-xs font-medium text-slate-600 block mb-1";

export function AdminCadastroMetas() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cfg, setCfg] = useState<MetasTerapeuticasCadastroGlobal>(() =>
    loadMetasTerapeuticasGlobal()
  );
  const [salvo, setSalvo] = useState(false);

  const patchMeta = useCallback((i: number, p: Partial<MetaTerapeuticaInstitucional>) => {
    setCfg((prev) => ({
      ...prev,
      metas: prev.metas.map((m, j) => (j === i ? { ...m, ...p } : m)),
    }));
  }, []);

  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  const diasDesdeRev = diasDesdeUltimaRevalidacaoMetas(cfg);
  const foraDoPrazo = metasInstitucionaisForaDoPrazo(cfg);
  const ultimaRev = new Date(cfg.ultimaRevalidacaoMetas || cfg.updatedAt);
  const limiteSugerido = new Date(ultimaRev);
  limiteSugerido.setDate(limiteSugerido.getDate() + DIAS_REVALIDACAO_METAS_INSTITUCIONAIS);
  const limiteIso = limiteSugerido.toISOString().slice(0, 10);

  const salvar = () => {
    saveMetasTerapeuticasGlobal({
      ...cfg,
      atualizadoPorId: user.id,
      atualizadoPorNome: user.nome,
    });
    setCfg(loadMetasTerapeuticasGlobal());
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2500);
  };

  const limpar = () => {
    if (!confirm("Limpar todas as metas? Esta ação não pode ser desfeita.")) return;
    setCfg({
      ...emptyMetasGlobal(),
      atualizadoPorId: user.id,
      atualizadoPorNome: user.nome,
    });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <button
        type="button"
        onClick={() => navigate("/")}
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft size={16} />
        Voltar ao painel
      </button>

      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
            <Target className="text-violet-700" size={22} />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-800">Metas terapêuticas</h1>
            <p className="text-sm text-slate-500 mt-1">
              Cadastro institucional (referência para toda a equipe). O que você salvar aqui aparece na
              página <strong className="text-slate-700">Avaliação de reabilitação</strong> apenas para
              consulta, sem edição.
            </p>
            {cfg.updatedAt && cfg.atualizadoPorNome && (
              <p className="text-xs text-slate-400 mt-2">
                Última atualização:{" "}
                {new Date(cfg.updatedAt).toLocaleString("pt-BR")} — {cfg.atualizadoPorNome}
              </p>
            )}
          </div>
        </div>

        <div
          className={`mt-4 rounded-lg border px-3 py-2.5 text-xs leading-relaxed ${
            foraDoPrazo
              ? "bg-amber-50 border-amber-300 text-amber-950"
              : "bg-sky-50 border-sky-200 text-sky-950"
          }`}
        >
          <p className="font-semibold">
            Revalidação das metas: a cada {DIAS_REVALIDACAO_METAS_INSTITUCIONAIS} dias
          </p>
          <p className="mt-1">
            Última revalidação (ao salvar):{" "}
            {ultimaRev.toLocaleString("pt-BR")} — há <strong>{diasDesdeRev}</strong> dia(s).
          </p>
          <p className="mt-0.5">
            {foraDoPrazo ? (
              <>
                <strong>Prazo sugerido ultrapassado.</strong> Revise as metas e clique em «Salvar metas»
                para registrar nova revalidação.
              </>
            ) : (
              <>
                Próximo limite sugerido para revisão: <strong>{formatDataBR(limiteIso)}</strong>.
              </>
            )}
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <h2 className="text-xs font-semibold text-slate-800 border-b border-slate-100 pb-2">
            Metas terapêuticas
          </h2>
          {cfg.metas.slice(0, NUM_METAS_INSTITUCIONAIS).map((meta, i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row gap-3 sm:items-end border border-slate-100 rounded-xl p-3 bg-slate-50/80"
            >
              <div className="flex-1 min-w-0">
                <label className={labelCls}>Meta {i + 1}</label>
                <input
                  className={inputCls}
                  value={meta.texto}
                  onChange={(e) => patchMeta(i, { texto: e.target.value })}
                  placeholder="Descrição da meta"
                />
              </div>
              <div className="w-full sm:w-44 flex-shrink-0">
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

        <div className="mt-6 flex flex-wrap gap-2 justify-end">
          <button
            type="button"
            onClick={limpar}
            className="inline-flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50"
          >
            <RotateCcw size={14} />
            Limpar tudo
          </button>
          <button
            type="button"
            onClick={salvar}
            className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm hover:bg-violet-700"
          >
            {salvo ? <CheckCircle2 size={14} /> : <Save size={14} />}
            {salvo ? "Salvo" : "Salvar metas"}
          </button>
        </div>
      </div>
    </div>
  );
}
