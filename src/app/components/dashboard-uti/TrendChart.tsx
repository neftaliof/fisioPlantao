import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export type PontoSerie = {
  data: string;
  taxaUsoVm: number | null;
  taxaMobilidade: number | null;
};

export function TrendChart(props: { pontos: PontoSerie[]; titulo: string }) {
  const data = props.pontos.map((p) => ({
    ...p,
    usoVmPct: p.taxaUsoVm != null ? Math.round(p.taxaUsoVm * 1000) / 10 : null,
    mobilPct: p.taxaMobilidade != null ? Math.round(p.taxaMobilidade * 1000) / 10 : null,
  }));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-medium text-slate-800 mb-3">{props.titulo}</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="data" tick={{ fontSize: 10 }} stroke="#94a3b8" />
            <YAxis
              tick={{ fontSize: 10 }}
              stroke="#94a3b8"
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              formatter={(value: number | undefined, name: string) => [
                value != null ? `${value}%` : "—",
                name === "usoVmPct" ? "Uso VM" : "Mobilidade",
              ]}
              labelFormatter={(l) => `Data: ${l}`}
            />
            <Legend
              formatter={(v) => (v === "usoVmPct" ? "Uso VM (%)" : "Mobilidade (%)")}
            />
            <Line
              type="monotone"
              dataKey="usoVmPct"
              stroke="#7c3aed"
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="mobilPct"
              stroke="#0d9488"
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
