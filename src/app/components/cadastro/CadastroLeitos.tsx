import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { mockUTIs } from "../../store";
import type { UTI } from "../../types";
import {
  listarLeitosPorUti,
  adicionarLeitoCadastro,
  removerLeitoCadastro,
  listarLeitosCadastro,
} from "../../data/leitosCadastroStore";

const utis: UTI[] = mockUTIs.filter((u) => u.tipo === "uti");

const inField =
  "w-full rounded-xl bg-slate-50 px-3 py-2 text-sm ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30";

export function CadastroLeitos() {
  const [utiId, setUtiId] = useState(utis[0]?.id ?? "");
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const leitos = useMemo(() => {
    void tick;
    return listarLeitosPorUti(utiId);
  }, [utiId, tick]);

  const utiAtual = mockUTIs.find((u) => u.id === utiId);
  const [numeroStr, setNumeroStr] = useState("");
  const [rotulo, setRotulo] = useState("");

  const adicionar = () => {
    const numero = Number.parseInt(numeroStr, 10);
    if (!Number.isFinite(numero) || numero < 1) {
      window.alert("Informe um número de leito válido.");
      return;
    }
    const dup = listarLeitosCadastro().some(
      (l) => l.utiId === utiId && l.numero === numero && l.ativo
    );
    if (dup) {
      window.alert("Este número de leito já está cadastrado nesta UTI.");
      return;
    }
    adicionarLeitoCadastro({ utiId, numero, rotulo: rotulo.trim() });
    setNumeroStr("");
    setRotulo("");
    refresh();
  };

  const excluir = (id: string) => {
    if (!window.confirm("Remover este leito da base?")) return;
    removerLeitoCadastro(id);
    refresh();
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <Link
          to="/cadastro"
          className="inline-flex items-center gap-1 text-sm text-teal-700 hover:text-teal-900"
        >
          <ArrowLeft size={16} /> Voltar ao cadastro
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Leitos por UTI</h1>
        <p className="mt-1 text-sm text-slate-500">
          Se não cadastrar nenhum leito aqui, a <strong>Coleta por leito</strong> usa automaticamente 1
          até o total configurado na UTI ({utiAtual?.totalLeitos ?? 10} leitos em{" "}
          {utiAtual?.nome ?? "—"}).
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="text-xs font-medium text-slate-500">Unidade</label>
        <select
          className={`mt-1 max-w-md ${inField}`}
          value={utiId}
          onChange={(e) => setUtiId(e.target.value)}
        >
          {utis.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-medium text-slate-900">Incluir leito</h2>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="w-28">
            <label className="text-xs font-medium text-slate-500">Número *</label>
            <input
              className={`mt-1 ${inField}`}
              type="number"
              min={1}
              value={numeroStr}
              onChange={(e) => setNumeroStr(e.target.value)}
              placeholder="Ex: 5"
            />
          </div>
          <div className="flex-1 min-w-[12rem]">
            <label className="text-xs font-medium text-slate-500">Rótulo (opcional)</label>
            <input
              className={`mt-1 ${inField}`}
              value={rotulo}
              onChange={(e) => setRotulo(e.target.value)}
              placeholder="Ex: Box isolamento"
            />
          </div>
          <button
            type="button"
            onClick={adicionar}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-700"
          >
            <Plus size={18} /> Adicionar
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {leitos.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">
            Nenhum leito cadastrado para esta UTI — será usada a numeração padrão 1…N.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Leito</th>
                <th className="px-4 py-3">Rótulo</th>
                <th className="px-4 py-3 w-20" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leitos.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-medium tabular-nums text-slate-900">{l.numero}</td>
                  <td className="px-4 py-3 text-slate-600">{l.rotulo || "—"}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => excluir(l.id)}
                      className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                      title="Remover"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
