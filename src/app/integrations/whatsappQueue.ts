import type { PassagemPlantao } from "../types";
import { flagWhatsAppPosSave } from "./featureFlags";

const QUEUE_KEY = "fisioplantao_whatsapp_fila_stub";

export type WhatsAppFilaItem = {
  id: string;
  criadoEm: string;
  tipo: "passagem_enviada";
  passagemId: string;
  utiId: string;
  resumo: string;
};

export function lerFilaWhatsAppStub(): WhatsAppFilaItem[] {
  try {
    const r = localStorage.getItem(QUEUE_KEY);
    return r ? (JSON.parse(r) as WhatsAppFilaItem[]) : [];
  } catch {
    return [];
  }
}

function gravarFila(items: WhatsAppFilaItem[]) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

/** Enfileira resumo pós-envio (stub local). Integração real: worker + API Meta. */
export function enqueueWhatsAppResumoPassagem(passagem: PassagemPlantao): void {
  if (!flagWhatsAppPosSave()) return;
  const ocupados = passagem.leitos.filter((l) => !l.vago).length;
  const emVm = passagem.leitos.filter((l) => !l.vago && l.pacienteEmVm).length;
  const resumo = `Passagem ${passagem.data} · ${passagem.turno} · ${ocupados} ocupados · ${emVm} em VM · id=${passagem.id}`;
  const item: WhatsAppFilaItem = {
    id: `wa-${passagem.id}-${Date.now()}`,
    criadoEm: new Date().toISOString(),
    tipo: "passagem_enviada",
    passagemId: passagem.id,
    utiId: passagem.utiId,
    resumo,
  };
  gravarFila([item, ...lerFilaWhatsAppStub()].slice(0, 50));
}
