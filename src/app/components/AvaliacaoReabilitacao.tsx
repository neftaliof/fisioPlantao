import { useState, useEffect } from "react";
import { ClipboardCheck } from "lucide-react";
import {
  loadMetasTerapeuticasGlobal,
  formatDataBR,
  NUM_METAS_INSTITUCIONAIS,
  diasDesdeUltimaRevalidacaoMetas,
  metasInstitucionaisForaDoPrazo,
  DIAS_REVALIDACAO_METAS_INSTITUCIONAIS,
} from "../data/metasTerapeuticasStore";
import type { MetasTerapeuticasCadastroGlobal } from "../types";

function reloadCfg(): MetasTerapeuticasCadastroGlobal {
  return loadMetasTerapeuticasGlobal();
}

export function AvaliacaoReabilitacao() {
  const [cfg, setCfg] = useState<MetasTerapeuticasCadastroGlobal>(reloadCfg);

  useEffect(() => {
    const onStorage = () => setCfg(reloadCfg());
    const onCustom = () => setCfg(reloadCfg());
    window.addEventListener("storage", onStorage);
    window.addEventListener("fisioplantao-metas-updated", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("fisioplantao-metas-updated", onCustom);
    };
  }, []);

  const metas = cfg.metas.slice(0, NUM_METAS_INSTITUCIONAIS);
  const algumaPreenchida = metas.some((m) => m.texto.trim() || m.ateData);
  const diasRev = diasDesdeUltimaRevalidacaoMetas(cfg);
  const foraPrazo = metasInstitucionaisForaDoPrazo(cfg);
  const ultima = new Date(cfg.ultimaRevalidacaoMetas || cfg.updatedAt);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-slate-800 text-xl font-semibold flex items-center gap-2">
          <ClipboardCheck className="text-teal-600" size={24} />
          Avaliação de reabilitação
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Metas terapêuticas de referência cadastradas pela administração — somente leitura. A administração
          revalida este cadastro a cada {DIAS_REVALIDACAO_METAS_INSTITUCIONAIS} dias.
        </p>
      </div>

      {algumaPreenchida && (
        <div
          className={`rounded-lg border px-3 py-2 text-xs ${
            foraPrazo
              ? "bg-amber-50 border-amber-200 text-amber-900"
              : "bg-slate-100 border-slate-200 text-slate-700"
          }`}
        >
          Última revalidação administrativa: {ultima.toLocaleString("pt-BR")} ({diasRev} dia(s)).{" "}
          {foraPrazo ? (
            <strong>Equipe administrativa: revisar e salvar metas.</strong>
          ) : (
            "Conteúdo vigente conforme calendário institucional."
          )}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-slate-50/90 p-4 sm:p-5 space-y-3">
        <h2 className="text-xs font-semibold text-slate-800">Metas terapêuticas</h2>

        {!algumaPreenchida ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white/60 px-4 py-8 text-center text-sm text-slate-500">
            Ainda não há metas cadastradas. Peça à administração para preencher em{" "}
            <strong className="text-slate-700">Painel → Metas terapêuticas</strong> (acesso admin).
          </div>
        ) : (
          <div className="space-y-2">
            {metas.map((meta, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row gap-3 sm:items-stretch border border-slate-200/80 rounded-lg p-3 bg-white shadow-sm"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                    Meta {i + 1}
                  </span>
                  <p className="text-sm text-slate-800 mt-1 whitespace-pre-wrap min-h-[1.25rem]">
                    {meta.texto.trim() || (
                      <span className="text-slate-400 italic">Sem descrição</span>
                    )}
                  </p>
                </div>
                <div className="sm:w-40 flex-shrink-0 sm:border-l sm:border-slate-100 sm:pl-4 flex flex-col justify-center">
                  <span className="text-[11px] font-medium text-slate-500">Até dia</span>
                  <p className="text-sm text-slate-800 mt-1 tabular-nums">
                    {formatDataBR(meta.ateData)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {cfg.atualizadoPorNome && algumaPreenchida && (
          <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-200/80">
            Referência atualizada por {cfg.atualizadoPorNome} em{" "}
            {new Date(cfg.updatedAt).toLocaleString("pt-BR")}.
          </p>
        )}
      </div>
    </div>
  );
}
