import type { KpiVariant } from "../../domain/indicadoresUti";

const variantStyles: Record<KpiVariant, string> = {
  ok: "border-emerald-200 bg-emerald-50/60",
  alerta: "border-amber-200 bg-amber-50/60",
  critico: "border-red-200 bg-red-50/60",
};

const dotStyles: Record<KpiVariant, string> = {
  ok: "bg-emerald-500",
  alerta: "bg-amber-500",
  critico: "bg-red-500",
};

export function KpiCard(props: {
  titulo: string;
  valor: string;
  subtitulo?: string;
  variant: KpiVariant;
}) {
  return (
    <div
      className={`rounded-xl border p-4 shadow-sm ${variantStyles[props.variant]}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">
          {props.titulo}
        </p>
        <span
          className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${dotStyles[props.variant]}`}
          title={props.variant}
        />
      </div>
      <p className="text-2xl font-semibold text-slate-900 mt-2 tabular-nums">
        {props.valor}
      </p>
      {props.subtitulo && (
        <p className="text-[11px] text-slate-500 mt-1">{props.subtitulo}</p>
      )}
    </div>
  );
}
