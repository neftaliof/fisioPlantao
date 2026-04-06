import { useNavigate } from "react-router";
import { CalendarDays, Clock, User, BedDouble, ArrowRight, Plus } from "lucide-react";
import { mockControleDiario, mockPlantaoDadosPaciente, mockFisioterapeutas } from "../store";

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

export function Plantoes() {
  const navigate = useNavigate();

  const getFisio = (id: string) =>
    mockFisioterapeutas.find((f) => f.id === id)?.nome || "—";

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-slate-800">Histórico de Plantões</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Registros de plantões e controles diários
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors text-sm"
          >
            <Plus size={16} />
            Novo Plantão
          </button>
        </div>
      </div>

      {/* Controles Diários */}
      <div>
        <h2 className="text-slate-600 mb-3">Controles Diários (SCMA.FIS.FOR.008)</h2>
        <div className="space-y-3">
          {mockControleDiario.map((cd) => {
            const leitosOcupados = cd.leitos.filter((l) => l.paciente).length;
            const totalAtend =
              (parseInt(cd.plantonistas.matutino.atendimentos) || 0) +
              (parseInt(cd.plantonistas.vespertino.atendimentos) || 0) +
              (parseInt(cd.plantonistas.noturno.atendimentos) || 0);

            return (
              <div
                key={cd.id}
                className="bg-white rounded-xl border border-slate-200 p-4 hover:border-teal-300 transition-all cursor-pointer"
                onClick={() => navigate("/formularios/controle-diario")}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <CalendarDays size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">
                        {new Date(cd.data + "T12:00:00").toLocaleDateString("pt-BR", {
                          weekday: "long",
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-slate-400 font-mono">SCMA.FIS.FOR.008</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <BedDouble size={14} className="text-slate-400" />
                      <span>{leitosOcupados} leitos</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <User size={14} className="text-slate-400" />
                      <span>{totalAtend} atendimentos</span>
                    </div>
                    {parseInt(cd.obitos) > 0 && (
                      <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                        {cd.obitos} óbito(s)
                      </span>
                    )}
                    {parseInt(cd.transferencias) > 0 && (
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        {cd.transferencias} transferência(s)
                      </span>
                    )}
                  </div>

                  <ArrowRight size={16} className="text-slate-400 hidden sm:block" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Plantões Dados do Paciente */}
      <div>
        <h2 className="text-slate-600 mb-3">Dados do Paciente por Leito</h2>
        <div className="space-y-3">
          {mockPlantaoDadosPaciente.map((pd) => {
            const leitosPreenchidos = pd.leitos.filter((l) => {
              const nome = l.pacienteNome?.trim();
              if (!nome) return false;
              return Boolean(
                l.satO2 ||
                  l.fc ||
                  l.suporte ||
                  l.estadoGeral ||
                  l.hemoglobina?.trim() ||
                  l.hematocrito?.trim() ||
                  l.leucocitos?.trim() ||
                  l.plaquetas?.trim() ||
                  l.gasoPh?.trim() ||
                  l.gasoPaco2?.trim() ||
                  l.gasoPao2?.trim() ||
                  l.gasoHco3?.trim() ||
                  l.gasoBe?.trim() ||
                  l.gasoSao2?.trim() ||
                  l.exameHemogramaSpdata?.trim() ||
                  l.exameGasometriaArterialSpdata?.trim()
              );
            }).length;

            return (
              <div
                key={pd.id}
                className="bg-white rounded-xl border border-slate-200 p-4 hover:border-teal-300 transition-all cursor-pointer"
                onClick={() => navigate("/")}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                      <Clock size={18} className="text-teal-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">
                        {new Date(pd.data + "T12:00:00").toLocaleDateString("pt-BR", {
                          weekday: "long",
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-slate-400">{getFisio(pd.fisioterapeutaId)}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${turnoColors[pd.turno]}`}
                    >
                      {turnoIcons[pd.turno]} {pd.turno}
                    </span>
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <BedDouble size={14} className="text-slate-400" />
                      <span>{leitosPreenchidos} leitos</span>
                    </div>
                  </div>

                  <ArrowRight size={16} className="text-slate-400 hidden sm:block" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
