import { useState, useEffect, type ReactNode } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  FileText,
  Menu,
  X,
  LogOut,
  ChevronDown,
  ChevronRight,
  Building2,
  BarChart3,
  UserRound,
  Library,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { LogoSantaCasa } from "./LogoSantaCasa";
import { Saudacao } from "./Saudacao";
import { UserAvatar } from "./UserAvatar";

type RoleNav = "admin" | "coordenador" | "admin_setor" | "fisioterapeuta";

interface NavItem {
  label: string;
  icon: ReactNode;
  to?: string;
  children?: { label: string; to: string }[];
  /** Se definido, o item só aparece para estes perfis */
  roles?: RoleNav[];
}

interface NavSection {
  title: string;
  hint?: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "Plantão",
    hint: "Ordem do turno",
    items: [
      {
        label: "Coleta por leito",
        icon: <UserRound size={18} />,
        to: "/plantao/dados-leito",
      },
      {
        label: "Passagem de Plantão",
        icon: <Building2 size={18} />,
        to: "/utis",
      },
      {
        label: "Histórico de Plantões",
        icon: <ClipboardList size={18} />,
        to: "/plantoes",
      },
    ],
  },
  {
    title: "Cadastro",
    hint: "Bases reutilizáveis",
    items: [
      {
        label: "Cadastro",
        icon: <Library size={18} />,
        children: [
          { label: "Visão geral", to: "/cadastro" },
          { label: "Pacientes — admissão (FOR.017)", to: "/cadastro/pacientes" },
          { label: "Leitos por UTI", to: "/cadastro/leitos" },
          { label: "Fisioterapeutas", to: "/cadastro/fisioterapeutas" },
        ],
      },
    ],
  },
  {
    title: "Visão geral",
    items: [
      {
        label: "Dashboard",
        icon: <LayoutDashboard size={18} />,
        to: "/",
      },
      {
        label: "Indicadores UTI",
        icon: <BarChart3 size={18} />,
        to: "/indicadores-uti",
        roles: ["admin", "coordenador", "admin_setor", "fisioterapeuta"],
      },
    ],
  },
  {
    title: "Formulários",
    items: [
      {
        label: "Formulários",
        icon: <FileText size={18} />,
        children: [
          { label: "Controle Diário UTI", to: "/formularios/controle-diario" },
          { label: "Evolução (SCMA.FIS.FOR.001)", to: "/formularios/evolucao" },
          { label: "Bundle PAV (SCMA.SCIH.FOR.021)", to: "/formularios/bundle-pav" },
          {
            label: "Página 4 — Coleta / admissão (FOR.017)",
            to: "/formularios/pagina-4",
          },
          {
            label: "Avaliação de reabilitação",
            to: "/formularios/avaliacao-reabilitacao",
          },
        ],
      },
    ],
  },
];

function NavItemComponent({ item }: { item: NavItem }) {
  const location = useLocation();
  const isChildActive = item.children?.some((c) =>
    location.pathname.startsWith(c.to)
  );
  const [open, setOpen] = useState(!!isChildActive);

  // Abre automaticamente se algum filho está ativo (ex: após refresh)
  useEffect(() => {
    if (isChildActive) setOpen(true);
  }, [isChildActive]);

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-all ${
            isChildActive
              ? "bg-teal-600/35 text-white shadow-inner shadow-teal-950/20"
              : "text-teal-100/80 hover:bg-white/10 hover:text-white"
          }`}
        >
          <div className="flex items-center gap-3">
            {item.icon}
            <span className="text-sm">{item.label}</span>
          </div>
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        {open && (
          <div className="ml-2 mt-1 space-y-0.5 border-l border-teal-500/25 py-1 pl-3">
            {item.children.map((child) => (
              <NavLink
                key={child.to}
                to={child.to}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2 text-[13px] transition-all ${
                    isActive
                      ? "bg-emerald-500/90 font-medium text-white shadow-sm shadow-emerald-950/20"
                      : "text-teal-100/75 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                {child.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.to!}
      end={item.to === "/"}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-all ${
          isActive
            ? "bg-white font-medium text-teal-900 shadow-md shadow-teal-950/15 ring-1 ring-white/20"
            : "text-teal-100/85 hover:bg-white/10 hover:text-white"
        }`
      }
    >
      {item.icon}
      {item.label}
    </NavLink>
  );
}

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Redireciona para login se não autenticado
  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-[#f0fdfa]">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-[17rem] flex-col transition-transform duration-300 lg:static ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{
          background:
            "linear-gradient(180deg, #115e59 0%, #0f766e 50%, #0a3d39 100%)",
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center border-b border-teal-500/20 px-4 pb-4 pt-5">
          <div className="flex items-center gap-2 w-full">
            <div className="flex-1 flex items-center justify-center">
              <LogoSantaCasa variant="light" size={140} />
            </div>
            <button
              className="mt-1 self-start text-teal-200/70 hover:text-white lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {navSections.map((section) => {
            const items = section.items.filter(
              (item) =>
                !item.roles || item.roles.includes(user.role as RoleNav)
            );
            if (items.length === 0) return null;
            return (
              <div key={section.title}>
                <div className="mb-2 px-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-teal-200/70">
                    {section.title}
                  </p>
                  {section.hint && (
                    <p className="mt-0.5 text-[11px] leading-snug text-teal-300/55">
                      {section.hint}
                    </p>
                  )}
                </div>
                <div className="space-y-0.5">
                  {items.map((item) => (
                    <NavItemComponent key={item.label + section.title} item={item} />
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        {/* User info */}
        <div className="border-t border-teal-500/20 px-3 py-4">
          <div className="flex items-center gap-3 rounded-xl bg-teal-950/25 px-2 py-2 ring-1 ring-teal-400/15">
            <UserAvatar
              nome={user.nome}
              foto={user.foto}
              userId={user.id}
              size="sm"
              imgClassName="border-2 border-teal-400"
              className="border-2 border-teal-400"
            />
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-white">{user?.nome ?? "Usuário"}</p>
              <p className="text-xs text-teal-200/70">{user?.cargo ?? ""}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-teal-200/60 transition-colors hover:text-red-300"
              title="Sair"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-4 border-b border-teal-100/80 bg-white/95 px-4 py-3 shadow-sm shadow-teal-900/[0.04] backdrop-blur-sm">
          <button
            className="lg:hidden text-slate-500 hover:text-slate-800"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>

          {/* Saudação + frase motivadora */}
          <div className="flex-1 min-w-0">
            <Saudacao nome={user?.nome} />
          </div>

          {/* Data — destaque com degradê (Anápolis / hoje) */}
          <div className="hidden shrink-0 flex-col items-end sm:flex">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-600/90">
              Anápolis
            </span>
            <time
              dateTime={new Date().toISOString().slice(0, 10)}
              className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-700 bg-clip-text text-center text-sm font-semibold capitalize leading-tight text-transparent"
            >
              {new Date().toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </time>
            <span className="mt-0.5 text-[10px] font-medium text-slate-400">Hoje</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}