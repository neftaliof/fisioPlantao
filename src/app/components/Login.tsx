import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, ChevronLeft, ShieldCheck, Star, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { todosUsuarios, type UsuarioLogin } from "../data/usuarios";
import { LogoSantaCasa } from "./LogoSantaCasa";
import { UserAvatar } from "./UserAvatar";

type Etapa = "perfil" | "senha";
type RoleTab = "admin" | "coordenador" | "fisioterapeuta";

const roleConfig = {
  admin: {
    label: "Administração",
    icon: ShieldCheck,
    cor: "teal",
    descricao: "Acesso total ao sistema",
    badge: "bg-teal-100 text-teal-700",
    ring: "ring-teal-400",
    btn: "bg-teal-600 hover:bg-teal-700",
    tab: "border-teal-500 text-teal-600",
  },
  coordenador: {
    label: "Coordenação",
    icon: Star,
    cor: "violet",
    descricao: "Gestão de plantões e equipe",
    badge: "bg-violet-100 text-violet-700",
    ring: "ring-violet-400",
    btn: "bg-violet-600 hover:bg-violet-700",
    tab: "border-violet-500 text-violet-600",
  },
  fisioterapeuta: {
    label: "Fisioterapeuta",
    icon: User,
    cor: "sky",
    descricao: "Registro de atendimentos",
    badge: "bg-sky-100 text-sky-700",
    ring: "ring-sky-400",
    btn: "bg-sky-600 hover:bg-sky-700",
    tab: "border-sky-500 text-sky-600",
  },
};

// Mapeia admin_setor para a aba "coordenador" no login
function getRoleTab(role: string): RoleTab {
  if (role === "admin") return "admin";
  if (role === "coordenador" || role === "admin_setor") return "coordenador";
  return "fisioterapeuta";
}

export function Login() {
  const navigate = useNavigate();
  const { loginById, user } = useAuth();

  // Se já estiver logado, abre no cadastro de dados do paciente (primeira tela)
  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const [activeTab, setActiveTab] = useState<RoleTab>("fisioterapeuta");
  const [selecionado, setSelecionado] = useState<UsuarioLogin | null>(null);
  const [etapa, setEtapa] = useState<Etapa>("perfil");
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const senhaRef = useRef<HTMLInputElement>(null);

  const usuariosDaTab = todosUsuarios.filter((u) => getRoleTab(u.role) === activeTab);

  useEffect(() => {
    if (etapa === "senha") {
      setTimeout(() => senhaRef.current?.focus(), 100);
    }
  }, [etapa]);

  const handleSelecionarPerfil = (u: UsuarioLogin) => {
    setSelecionado(u);
    setSenha("");
    setErro("");
    setEtapa("senha");
  };

  const handleVoltar = () => {
    setEtapa("perfil");
    setSelecionado(null);
    setSenha("");
    setErro("");
  };

  const handleEntrar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selecionado) return;
    setErro("");
    setLoading(true);
    setTimeout(() => {
      const ok = loginById(selecionado.id, senha);
      if (ok) {
        navigate("/");
      } else {
        setErro("Senha incorreta. Tente novamente.");
        setSenha("");
        senhaRef.current?.focus();
      }
      setLoading(false);
    }, 700);
  };

  // Adaptação: roleConfig lookup seguro para admin_setor
  const getRoleCfg = (role: string) => roleConfig[getRoleTab(role)];
  const cfg = roleConfig[activeTab];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-6 flex flex-col items-center">
        <LogoSantaCasa variant="light" size={130} />
      </div>

      {/* Card principal */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* ── ETAPA 1: Seleção de perfil ── */}
        {etapa === "perfil" && (
          <>
            {/* Tabs de perfil */}
            <div className="flex border-b border-slate-100">
              {(Object.keys(roleConfig) as RoleTab[]).map((role) => {
                const rc = roleConfig[role];
                const Icon = rc.icon;
                const isActive = activeTab === role;
                return (
                  <button
                    key={role}
                    onClick={() => setActiveTab(role)}
                    className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 text-xs transition-all border-b-2 ${
                      isActive
                        ? rc.tab + " bg-slate-50"
                        : "border-transparent text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    <Icon size={16} />
                    <span className="leading-tight text-center">{rc.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Corpo */}
            <div className="p-5">
              <p className="text-slate-500 text-xs mb-4 text-center">
                Selecione seu perfil para continuar
              </p>

              {/* Grid de cards de usuário */}
              <div className={`grid gap-3 ${usuariosDaTab.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                {usuariosDaTab.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleSelecionarPerfil(u)}
                    className={`group flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-slate-100 hover:border-${getRoleCfg(u.role).cor}-300 hover:bg-${getRoleCfg(u.role).cor}-50 transition-all active:scale-95`}
                  >
                    {/* Foto */}
                    <div className={`w-16 h-16 rounded-full overflow-hidden ring-2 ring-slate-200 group-hover:${getRoleCfg(u.role).ring} transition-all flex-shrink-0`}>
                      <UserAvatar
                        nome={u.nome}
                        foto={u.foto}
                        userId={u.id}
                        size="xl"
                        className="w-full h-full min-w-full min-h-full"
                      />
                    </div>
                    {/* Nome */}
                    <div className="text-center">
                      <p className="text-slate-800 text-sm leading-tight">
                        {u.nome}
                      </p>
                      <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${getRoleCfg(u.role).badge}`}>
                        {u.cargo}
                      </span>
                      {u.telefone && (
                        <p className="text-[10px] text-slate-400 mt-1 tabular-nums">{u.telefone}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── ETAPA 2: Confirmação de senha ── */}
        {etapa === "senha" && selecionado && (
          <div className="p-6">
            {/* Botão voltar */}
            <button
              onClick={handleVoltar}
              className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm mb-5 transition-colors"
            >
              <ChevronLeft size={16} />
              Trocar perfil
            </button>

            {/* Perfil selecionado */}
            <div className="flex flex-col items-center mb-6">
              <div className={`w-20 h-20 rounded-full overflow-hidden ring-4 ${getRoleCfg(selecionado.role).ring} mb-3`}>
                <UserAvatar
                  nome={selecionado.nome}
                  foto={selecionado.foto}
                  userId={selecionado.id}
                  size="2xl"
                  className="w-full h-full min-w-full min-h-full"
                />
              </div>
              <p className="text-slate-800 text-base leading-tight">{selecionado.nome}</p>
              <span className={`inline-block mt-1 text-xs px-2.5 py-0.5 rounded-full ${getRoleCfg(selecionado.role).badge}`}>
                {selecionado.cargo}
              </span>
              {selecionado.telefone && (
                <p className="text-xs text-slate-500 mt-1 tabular-nums">{selecionado.telefone}</p>
              )}
            </div>

            {/* Formulário de senha */}
            <form onSubmit={handleEntrar} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1.5">Senha</label>
                <div className="relative">
                  <input
                    ref={senhaRef}
                    type={showSenha ? "text" : "password"}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Digite sua senha"
                    className="w-full pl-4 pr-10 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-teal-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSenha(!showSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {erro && (
                <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                  {erro}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !senha}
                className={`w-full text-white py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm ${getRoleCfg(selecionado.role).btn}`}
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : null}
                {loading ? "Entrando..." : "Entrar no sistema"}
              </button>
            </form>

            {/* Dica de senha */}
            <p className="text-center text-xs text-slate-300 mt-4">
              {selecionado.role === "admin" &&
                (selecionado.id === "dolores"
                  ? "Senha: admin123"
                  : selecionado.id === "rafaela"
                    ? "Senha: rafaela123"
                    : selecionado.id === "joyce"
                      ? "Senha: joyce123"
                      : "Senha: (credencial de administrador)")}
              {selecionado.role === "coordenador" && "Senha: coord123"}
              {selecionado.role === "admin_setor" && `Senha: ${selecionado.id}123`}
              {selecionado.role === "fisioterapeuta" && "Senha: fisio123"}
            </p>
          </div>
        )}
      </div>

      <p className="mt-6 text-slate-500 text-xs text-center">
        FisioPlantão · Santa Casa de Anápolis
      </p>
    </div>
  );
}