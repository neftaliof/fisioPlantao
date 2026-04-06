import { useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Check,
  UserPlus,
  Phone,
  IdCard,
  Save,
} from "lucide-react";
import { Fisioterapeuta, Turno } from "../types";
import {
  getFisioterapeutasLista,
  setFisioterapeutasLista,
} from "../data/fisioterapeutasCadastroStore";
import { UserAvatar } from "./UserAvatar";

const turnoColors: Record<string, string> = {
  Matutino: "bg-amber-100 text-amber-800",
  Vespertino: "bg-blue-100 text-blue-800",
  Noturno: "bg-indigo-100 text-indigo-800",
};

const turnoIcons: Record<string, string> = {
  Matutino: "🌅",
  Vespertino: "🌤️",
  Noturno: "🌙",
};

const emptyForm: Omit<Fisioterapeuta, "id" | "createdAt"> = {
  nome: "",
  coren: "",
  telefone: "",
  email: "",
  turno: "Matutino",
  status: "Ativo",
};

export function Fisioterapeutas() {
  const [lista, setLista] = useState<Fisioterapeuta[]>(() => getFisioterapeutasLista());
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Fisioterapeuta | null>(null);
  const [form, setForm] = useState<Omit<Fisioterapeuta, "id" | "createdAt">>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const filtrados = lista
    .filter(
      (f) =>
        f.nome.toLowerCase().includes(search.toLowerCase()) ||
        f.coren.toLowerCase().includes(search.toLowerCase()) ||
        f.turno.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" }));

  const abrirNovo = () => {
    setEditando(null);
    setForm(emptyForm);
    setSaved(false);
    setModalOpen(true);
  };

  const abrirEdicao = (f: Fisioterapeuta) => {
    setEditando(f);
    setForm({
      nome: f.nome,
      coren: f.coren,
      telefone: f.telefone,
      email: f.email,
      turno: f.turno,
      status: f.status,
      foto: f.foto,
    });
    setSaved(false);
    setModalOpen(true);
  };

  const salvar = () => {
    if (!form.nome.trim() || !form.coren.trim()) return;
    let next: Fisioterapeuta[];
    if (editando) {
      next = lista.map((f) => (f.id === editando.id ? { ...f, ...form } : f));
    } else {
      const novo: Fisioterapeuta = {
        ...form,
        id: String(Date.now()),
        createdAt: new Date().toISOString().split("T")[0],
      };
      next = [...lista, novo];
    }
    setLista(next);
    setFisioterapeutasLista(next);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setModalOpen(false);
    }, 900);
  };

  const excluir = (id: string) => {
    const next = lista.filter((f) => f.id !== id);
    setLista(next);
    setFisioterapeutasLista(next);
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-slate-800">Fisioterapeutas</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {lista.filter((f) => f.status === "Ativo").length} ativos ·{" "}
            {lista.filter((f) => f.status === "Inativo").length} inativos
          </p>
        </div>
        <button
          onClick={abrirNovo}
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors text-sm"
        >
          <Plus size={16} />
          Novo Fisioterapeuta
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          placeholder="Buscar por nome, CREFITO ou turno..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
        />
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtrados.length === 0 && (
          <div className="col-span-full text-center py-16 text-slate-400">
            Nenhum fisioterapeuta encontrado
          </div>
        )}
        {filtrados.map((f) => (
          <div
            key={f.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col items-center text-center hover:border-teal-300 hover:shadow-md transition-all"
          >
            {/* Foto — sem nome sobreposto */}
            <div className="relative mb-3">
              <UserAvatar
                foto={f.foto}
                nome={f.nome}
                userId={f.id}
                size="lg"
                imgClassName="border-2 border-white shadow-sm"
                className="border-2 border-white shadow-sm"
                alt=""
              />
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  f.status === "Ativo" ? "bg-emerald-400" : "bg-slate-300"
                }`}
              />
            </div>

            {/* Nome abaixo da foto */}
            <p className="font-medium text-slate-800 text-sm leading-tight">{f.nome}</p>

            {/* Turno */}
            <span
              className={`mt-1.5 text-xs px-2.5 py-0.5 rounded-full font-medium ${turnoColors[f.turno]}`}
            >
              {turnoIcons[f.turno]} {f.turno}
            </span>

            {/* Contatos */}
            <div className="mt-3 w-full space-y-1.5 text-xs text-slate-500">
              <div className="flex items-center gap-2 justify-center">
                <Phone size={11} className="text-slate-400" />
                <span>{f.telefone}</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <IdCard size={11} className="text-slate-400" />
                <span className="font-mono">{f.coren}</span>
              </div>
            </div>

            {/* Ações */}
            <div className="mt-4 flex gap-2 w-full">
              <button
                onClick={() => abrirEdicao(f)}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-700 transition-all"
              >
                <Pencil size={12} />
                Editar
              </button>
              <button
                onClick={() => setDeleteConfirm(f.id)}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all"
              >
                <Trash2 size={12} />
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ===== MODAL EDITAR / NOVO ===== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <UserPlus size={18} className="text-teal-600" />
                <h2 className="text-slate-800">
                  {editando ? "Editar Fisioterapeuta" : "Novo Fisioterapeuta"}
                </h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Preview do avatar na edição (foto ou iniciais) */}
            {editando && (
              <div className="flex flex-col items-center pt-6 pb-2 gap-2">
                <div className="relative">
                  <UserAvatar
                    nome={editando.nome}
                    foto={editando.foto}
                    userId={editando.id}
                    size="2xl"
                    imgClassName="border-4 border-teal-100 shadow-md"
                    className="border-4 border-teal-100 shadow-md"
                    alt=""
                  />
                  <span
                    className={`absolute bottom-0.5 right-0.5 w-5 h-5 rounded-full border-2 border-white ${
                      form.status === "Ativo" ? "bg-emerald-400" : "bg-slate-300"
                    }`}
                  />
                </div>
                <p className="text-sm text-slate-500">{editando.nome}</p>
              </div>
            )}

            {/* Campos do formulário */}
            <div className="p-5 space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-sm text-slate-600 mb-1">
                  Nome completo *
                </label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  placeholder="Ex: Ana Paula Souza"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition-shadow"
                />
              </div>

              {/* CREFITO */}
              <div>
                <label className="block text-sm text-slate-600 mb-1">
                  CREFITO *
                </label>
                <input
                  type="text"
                  value={form.coren}
                  onChange={(e) => setForm({ ...form, coren: e.target.value })}
                  placeholder="Ex: CREFITO-9/12345-F"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition-shadow"
                />
              </div>

              {/* Telefone + Turno */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={form.telefone}
                    onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                    placeholder="+55 62 99999-9999"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">
                    Turno *
                  </label>
                  <select
                    value={form.turno}
                    onChange={(e) =>
                      setForm({ ...form, turno: e.target.value as Turno })
                    }
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white transition-shadow"
                  >
                    <option value="Matutino">🌅 Matutino</option>
                    <option value="Vespertino">🌤️ Vespertino</option>
                    <option value="Noturno">🌙 Noturno</option>
                  </select>
                </div>
              </div>

              {/* E-mail */}
              <div>
                <label className="block text-sm text-slate-600 mb-1">E-mail</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@exemplo.com"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition-shadow"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm text-slate-600 mb-2">Status</label>
                <div className="flex gap-3">
                  {(["Ativo", "Inativo"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm({ ...form, status: s })}
                      className={`flex-1 py-2 rounded-lg text-sm border transition-all ${
                        form.status === s
                          ? s === "Ativo"
                            ? "bg-emerald-50 border-emerald-400 text-emerald-700"
                            : "bg-slate-100 border-slate-400 text-slate-700"
                          : "border-slate-200 text-slate-400 hover:bg-slate-50"
                      }`}
                    >
                      {s === "Ativo" ? "● Ativo" : "○ Inativo"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-3 p-5 pt-0">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={salvar}
                disabled={!form.nome.trim() || !form.coren.trim() || saved}
                className={`flex-1 py-2.5 rounded-lg text-sm transition-all flex items-center justify-center gap-2 ${
                  saved
                    ? "bg-emerald-500 text-white"
                    : "bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                }`}
              >
                {saved ? (
                  <>
                    <Check size={14} />
                    Salvo!
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    {editando ? "Salvar alterações" : "Cadastrar"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmar exclusão */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-red-600" />
            </div>
            <h2 className="text-slate-800 mb-2">Confirmar exclusão</h2>
            <p className="text-sm text-slate-500 mb-6">
              Tem certeza que deseja excluir este fisioterapeuta? Esta ação não
              pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => excluir(deleteConfirm)}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
