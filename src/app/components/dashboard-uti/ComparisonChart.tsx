import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { TurnoPassagem } from "../../types";

export type BarraTurno = {
  turno: TurnoPassagem;
  usoVmPct: number | null;
  mobilPct: number | null;
};

export function ComparisonChart(props: { barras: BarraTurno[]; titulo: string }) {
  const data = props.barras.map((b) => ({
    nome:
      b.turno === "Diurno/Manhã"
        ? "Manhã"
        : b.turno === "Diurno/Tarde"
          ? "Tarde"
          : "Noturno",
    usoVmPct: b.usoVmPct != null ? Math.round(b.usoVmPct * 1000) / 10 : 0,
    mobilPct: b.mobilPct != null ? Math.round(b.mobilPct * 1000) / 10 : 0,
  }));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-medium text-slate-800 mb-3">{props.titulo}</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="nome" tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <YAxis
              tick={{ fontSize: 10 }}
              stroke="#94a3b8"
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip formatter={(v: number) => `${v}%`} />
            <Legend
              formatter={(v) => (v === "usoVmPct" ? "Uso VM" : "Mobilidade")}
            />
            <Bar dataKey="usoVmPct" fill="#7c3aed" radius={[4, 4, 0, 0]} name="usoVmPct" />
            <Bar dataKey="mobilPct" fill="#0d9488" radius={[4, 4, 0, 0]} name="mobilPct" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
