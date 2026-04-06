import { Sun, Sunset, Moon, MapPin } from "lucide-react";

// Lembretes do dia a dia do fisioterapeuta/hospital
// Rotacionam a cada hora para variar ao longo do plantão
const lembretes = [
  { emoji: "💧", texto: "Já tomou água hoje? Hidratação é essencial no plantão!" },
  { emoji: "🍎", texto: "Lembrou de comer? Um profissional bem nutrido cuida melhor." },
  { emoji: "🧴", texto: "Higienizou as mãos antes de entrar no leito?" },
  { emoji: "🧘", texto: "Respire fundo. Você está fazendo um trabalho incrível." },
  { emoji: "🩺", texto: "Checou os equipamentos antes de iniciar o plantão?" },
  { emoji: "💊", texto: "Registrou todos os atendimentos? Documentação salva vidas." },
  { emoji: "👟", texto: "Seus pés agradecem uma pausa — cuide de quem cuida!" },
  { emoji: "🌡️", texto: "Temperatura do ambiente adequada para o paciente?" },
  { emoji: "📋", texto: "Prontuário em dia? Anotações precisas são parte do cuidado." },
  { emoji: "🤲", texto: "Barreira de proteção usada? Segurança em primeiro lugar." },
  { emoji: "💤", texto: "Descansou bem antes do plantão? Seu bem-estar importa." },
  { emoji: "🫀", texto: "Lembrou de avaliar a SpO₂ e a frequência cardíaca?" },
  { emoji: "🏃", texto: "Já fez alongamento hoje? Sua coluna agradece!" },
  { emoji: "☕", texto: "Cafezinho tomado? Energia para continuar o plantão!" },
  { emoji: "📱", texto: "Celular no silencioso? Foco total no paciente." },
  { emoji: "🫁", texto: "Ventilação mecânica ajustada? Parâmetros conferidos?" },
  { emoji: "🧤", texto: "EPI completo? Luva, máscara e avental em uso correto?" },
  { emoji: "💬", texto: "Passou as informações para o próximo plantão?" },
  { emoji: "🌿", texto: "Pequenas pausas aumentam a produtividade. Respire!" },
  { emoji: "🏥", texto: "Cada paciente que você atende é uma história de recuperação." },
];

const frasesPorPeriodo = {
  manha: [
    "Cada amanhecer traz uma nova chance de cuidar com excelência.",
    "O turno matutino dá o tom do dia — vamos com tudo!",
    "A reabilitação começa no primeiro atendimento do dia.",
    "Bom plantão! A sua dedicação faz toda a diferença.",
    "Energia renovada, pacientes que esperam por você. Vamos lá!",
  ],
  tarde: [
    "A tarde pede foco e constância — você está indo muito bem!",
    "Meio caminho andado. Continue com a mesma dedicação!",
    "A fisioterapia transforma vidas. Cada atendimento importa.",
    "Bom plantão vespertino! Você é essencial aqui.",
    "O cuidado não para — e nem você. Parabéns pela entrega!",
  ],
  noite: [
    "O plantão noturno é silencioso, mas absolutamente essencial.",
    "A noite também precisa de cuidado — e você está à altura.",
    "Enquanto a cidade descansa, você cuida. Isso é vocação.",
    "Plantão noturno: a coragem de cuidar quando mais ninguém vê.",
    "Obrigado por estar aqui na madrugada. Isso é dedicação real.",
  ],
};

function getPeriodo(): "manha" | "tarde" | "noite" {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "manha";
  if (h >= 12 && h < 18) return "tarde";
  return "noite";
}

function getSaudacao(periodo: "manha" | "tarde" | "noite") {
  if (periodo === "manha") return "Bom dia";
  if (periodo === "tarde") return "Boa tarde";
  return "Boa noite";
}

function getFrase(periodo: "manha" | "tarde" | "noite"): string {
  const lista = frasesPorPeriodo[periodo];
  const idx = new Date().getDate() % lista.length;
  return lista[idx];
}

function getLembrete() {
  const idx = new Date().getHours() % lembretes.length;
  return lembretes[idx];
}

interface SaudacaoProps {
  nome?: string;
}

export function Saudacao({ nome }: SaudacaoProps) {
  const periodo = getPeriodo();
  const saudacao = getSaudacao(periodo);
  const frase = getFrase(periodo);
  const lembrete = getLembrete();

  const primeiroNome = nome ? nome.split(" ")[0] : null;

  const Icon =
    periodo === "manha" ? Sun : periodo === "tarde" ? Sunset : Moon;

  const iconColor =
    periodo === "manha"
      ? "text-amber-400"
      : periodo === "tarde"
        ? "text-orange-400"
        : "text-indigo-400";

  const cidade = "Santa Casa · Anápolis";
  const segmentoTicker = [
    frase,
    `${lembrete.emoji} ${lembrete.texto}`,
    `${cidade} — Fisioplantão`,
    "Cuidado e reabilitação com excelência",
  ].join("  ·  ");

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2 lg:flex-row lg:items-center lg:gap-4">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className={`flex-shrink-0 ${iconColor}`}>
          <Icon size={20} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium leading-tight text-slate-800">
            {saudacao}
            {primeiroNome ? `, ${primeiroNome}!` : "!"}
          </p>
          <p className="hidden truncate text-xs leading-tight text-slate-500 md:block lg:hidden">
            {frase}
          </p>
        </div>
      </div>

      <div className="hidden h-8 w-px flex-shrink-0 bg-gradient-to-b from-transparent via-teal-200 to-transparent lg:block" />

      {/* Faixa com texto em movimento (marquee) — desktop */}
      <div className="relative hidden min-w-0 flex-1 overflow-hidden rounded-xl py-1.5 pl-1 pr-1 ring-1 ring-teal-100/90 md:block md:bg-gradient-to-r md:from-teal-50/90 md:via-cyan-50/50 md:to-emerald-50/80">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-teal-50/95 to-transparent md:from-teal-50/95" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-emerald-50/95 to-transparent md:from-emerald-50/95" />
        <div className="flex w-max animate-header-marquee">
          <span className="flex items-center gap-2 whitespace-nowrap px-3 text-xs font-medium text-teal-900/85">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-teal-600" aria-hidden />
            {segmentoTicker}
          </span>
          <span className="flex items-center gap-2 whitespace-nowrap px-3 text-xs font-medium text-teal-900/85">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-teal-600" aria-hidden />
            {segmentoTicker}
          </span>
        </div>
      </div>

      {/* Mobile: uma linha estática compacta */}
      <p className="truncate pl-8 text-[11px] leading-snug text-slate-500 sm:pl-0 md:hidden">
        {lembrete.emoji} {lembrete.texto}
      </p>
    </div>
  );
}
