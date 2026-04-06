import { useState } from "react";
import { Link } from "react-router";
import { Plus, Pencil, Trash2, ArrowLeft, Save } from "lucide-react";
import type { PacienteCadastrado } from "../../types";
import {
  listarPacientesCadastro,
  adicionarPacienteCadastro,
  atualizarPacienteCadastro,
  removerPacienteCadastro,
} from "../../data/pacientesCadastroStore";

const inField =
  "w-full rounded-xl bg-slate-50 px-3 py-2 text-sm ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30";

export function CadastroPacientes() {
  const [lista, setLista] = useState<PacienteCadastrado[]>(() => listarPacientesCadastro());
  const [modal, setModal] = useState<PacienteCadastrado | null | "novo">(null);
  const [nome, setNome] = useState("");
  const [prontuario, setProntuario] = useState("");
  const [observacao, setObservacao] = useState("");

  const refresh = () => setLista(listarPacientesCadastro());

  const abrirNovo = () => {
    setNome("");
    setProntuario("");
    setObservacao("");
    setModal("novo");
  };

  const abrirEditar = (p: PacienteCadastrado) => {
    setModal(p);
    setNome(p.nome);
    setProntuario(p.prontuario);
    setObservacao(p.observacao);
  };

  const salvar = () => {
    if (!nome.trim()) return;
    if (modal === "novo") {
      adicionarPacienteCadastro({
        nome: nome.trim(),
        prontuario: prontuario.trim(),
        observacao: observacao.trim(),
      });
    } else if (modal && modal !== "novo") {
      atualizarPacienteCadastro(modal.id, {
        nome: nome.trim(),
        prontuario: prontuario.trim(),
        observacao: observacao.trim(),
      });
    }
    setModal(null);
    refresh();
  };

  const excluir = (id: string) => {
    if (!window.confirm("Remover este paciente da base de cadastro?")) return;
    removerPacienteCadastro(id);
    refresh();
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/cadastro"
            className="inline-flex items-center gap-1 text-sm text-teal-700 hover:text-teal-900"
          >
            <ArrowLeft size={16} /> Voltar ao cadastro
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">Pacientes cadastrados</h1>
          <p className="mt-1 text-sm text-slate-500">
            Sugestões de nome ao preencher a coleta por leito (pode digitar livremente mesmo sem cadastro).
          </p>
        </div>
        <button
          type="button"
          onClick={abrirNovo}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-teal-700"
        >
          <Plus size={18} /> Novo paciente
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {lista.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">
            Nenhum paciente cadastrado ainda.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Prontuário</th>
                <th className="px-4 py-3 hidden md:table-cell">Obs.</th>
                <th className="px-4 py-3 w-24" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lista.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-medium text-slate-900">{p.nome}</td>
                  <td className="px-4 py-3 text-slate-600">{p.prontuario || "—"}</td>
                  <td className="px-4 py-3 text-slate-500 hidden md:table-cell max-w-xs truncate">
                    {p.observacao || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <button
                        type="button"
                        onClick={() => abrirEditar(p)}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-teal-700"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => excluir(p.id)}
                        className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">
              {modal === "novo" ? "Novo paciente" : "Editar paciente"}
            </h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-500">Nome completo *</label>
                <input className={`mt-1 ${inField}`} value={nome} onChange={(e) => setNome(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Prontuário</label>
                <input
                  className={`mt-1 ${inField}`}
                  value={prontuario}
                  onChange={(e) => setProntuario(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Observação</label>
                <textarea
                  className={`mt-1 min-h-[4rem] ${inField}`}
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-xl px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={salvar}
                disabled={!nome.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                <Save size={16} /> Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
