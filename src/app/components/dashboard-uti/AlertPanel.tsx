import type { AlertaIndicador } from "../../domain/indicadoresUti";
import { AlertTriangle } from "lucide-react";

const severidadeClass: Record<AlertaIndicador["severidade"], string> = {
  ok: "border-slate-200 bg-slate-50 text-slate-700",
  alerta: "border-amber-200 bg-amber-50 text-amber-900",
  critico: "border-red-200 bg-red-50 text-red-900",
};

export function AlertPanel(props: { alertas: AlertaIndicador[]; titulo?: string }) {
  if (!props.alertas.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
        Nenhum alerta automático para o período e filtros selecionados.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
      <div className="flex items-center gap-2 text-slate-800 font-medium text-sm">
        <AlertTriangle size={16} className="text-amber-500" />
        {props.titulo ?? "Alertas"}
      </div>
      <ul className="space-y-2">
        {props.alertas.map((a) => (
          <li
            key={a.id}
            className={`rounded-lg border px-3 py-2 text-sm ${severidadeClass[a.severidade]}`}
          >
            <p className="font-medium">{a.titulo}</p>
            <p className="text-xs mt-0.5 opacity-90">{a.detalhe}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
