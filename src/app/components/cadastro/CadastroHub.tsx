import { Link } from "react-router";
import { UserPlus, BedDouble, Users } from "lucide-react";

const cards = [
  {
    to: "/cadastro/pacientes",
    title: "Pacientes",
    desc: "Cadastre nomes e prontuário para reutilizar na coleta por leito.",
    icon: UserPlus,
    accent: "from-teal-50 to-white ring-teal-100",
  },
  {
    to: "/cadastro/leitos",
    title: "Leitos",
    desc: "Defina números de leito por UTI; a coleta do turno usa esta base.",
    icon: BedDouble,
    accent: "from-cyan-50 to-white ring-cyan-100",
  },
  {
    to: "/cadastro/fisioterapeutas",
    title: "Fisioterapeutas",
    desc: "Equipe, turno e contactos — aparecem nos formulários e passagens.",
    icon: Users,
    accent: "from-emerald-50 to-white ring-emerald-100",
  },
];

export function CadastroHub() {
  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Cadastro</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Bases do plantão</h1>
        <p className="mt-2 max-w-xl text-sm text-slate-500 leading-relaxed">
          Cadastre primeiro pacientes, leitos da UTI e profissionais. Depois use esses dados em{" "}
          <strong>Coleta por leito</strong>, passagens e restantes telas.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ to, title, desc, icon: Icon, accent }) => (
          <Link
            key={to}
            to={to}
            className={`group flex flex-col rounded-2xl bg-gradient-to-br p-5 shadow-sm ring-1 transition hover:shadow-md ${accent}`}
          >
            <Icon
              className="h-9 w-9 text-teal-600 opacity-90 group-hover:scale-105 transition-transform"
              strokeWidth={1.5}
            />
            <h2 className="mt-4 text-base font-semibold text-slate-900">{title}</h2>
            <p className="mt-1.5 flex-1 text-sm text-slate-600 leading-relaxed">{desc}</p>
            <span className="mt-4 text-sm font-medium text-teal-700 group-hover:underline">
              Abrir →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
