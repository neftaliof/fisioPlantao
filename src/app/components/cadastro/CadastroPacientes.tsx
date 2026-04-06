import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router";
import { ArrowLeft, FileText, ExternalLink, Info } from "lucide-react";
import { listarPacientesCadastro } from "../../data/pacientesCadastroStore";

export function CadastroPacientes() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const refresh = () => setTick((t) => t + 1);
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);

  const lista = useMemo(() => {
    void tick;
    return listarPacientesCadastro().slice().sort((a, b) =>
      a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
    );
  }, [tick]);

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <Link
          to="/cadastro"
          className="inline-flex items-center gap-1 text-sm text-teal-700 hover:text-teal-900"
        >
          <ArrowLeft size={16} /> Voltar ao cadastro
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Pacientes — admissão (FOR.017)</h1>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-2xl">
          O registo do paciente na aplicação é feito <strong>exclusivamente</strong> na ficha{" "}
          <strong>Página 4 — Coleta / admissão</strong>, alinhada ao impresso institucional: identificação,
          convênio, dados clínicos de admissão, avaliação ventilatória, funcionalidade, complicações e, na
          alta, o destino. Use <strong>Concluir admissão</strong> para fechar a entrada e gravar o paciente
          na base reutilizada noutras telas (ex.: sugestões na coleta por leito).
        </p>
      </div>

      <div className="flex flex-wrap items-start gap-3 rounded-xl border border-teal-200 bg-teal-50/60 px-4 py-3 text-sm text-teal-950">
        <Info size={20} className="shrink-0 mt-0.5 text-teal-700" />
        <p>
          Não há cadastro rápido nesta página. Abra o formulário completo em{" "}
          <strong>Formulários → Página 4</strong> ou no botão abaixo.
        </p>
      </div>

      <Link
        to="/formularios/pagina-4"
        className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border-2 border-teal-500 bg-white p-6 shadow-sm hover:bg-teal-50/40 transition-colors"
      >
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white">
          <FileText size={28} strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-slate-900">Abrir ficha de admissão</h2>
          <p className="mt-1 text-sm text-slate-600">
            <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">/formularios/pagina-4</code> —
            preencha a admissão e clique em <strong>Concluir admissão</strong> para registar o paciente.
          </p>
        </div>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-teal-700 sm:shrink-0">
          Ir ao formulário <ExternalLink size={16} />
        </span>
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-4 py-3 bg-slate-50">
          <h3 className="text-sm font-semibold text-slate-800">Pacientes já registados (após admissão)</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Lista derivada de fichas com admissão concluída — apenas consulta.
          </p>
        </div>
        {lista.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">
            Ainda não há pacientes na base. Conclua uma admissão na Página 4.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Nascimento</th>
                  <th className="px-4 py-3">Internação mensal nº</th>
                  <th className="px-4 py-3 hidden md:table-cell">Admissão concluída</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lista.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-medium text-slate-900">{p.nome}</td>
                    <td className="px-4 py-3 text-slate-600 tabular-nums">
                      {p.dataNascimento
                        ? new Date(p.dataNascimento + "T12:00:00").toLocaleDateString("pt-BR")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{p.prontuario || "—"}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell">
                      {p.admissaoConcluidaEm
                        ? new Date(p.admissaoConcluidaEm).toLocaleString("pt-BR")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
