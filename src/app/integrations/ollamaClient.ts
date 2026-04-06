import { getOllamaBaseUrl, flagOllamaInsights } from "./featureFlags";
import type { IndicadoresAgregados } from "../domain/indicadoresUti";

export type OllamaInsightInput = {
  periodoLabel: string;
  agregados: IndicadoresAgregados;
  alertasTexto: string[];
};

/**
 * Chama Ollama (ou proxy) com KPIs já agregados. Falha graciosa se offline / desligado.
 * Contrato: POST JSON → markdown ou texto.
 */
export async function solicitarInsightsOllama(
  input: OllamaInsightInput
): Promise<{ ok: true; markdown: string } | { ok: false; erro: string }> {
  if (!flagOllamaInsights()) {
    return { ok: false, erro: "Insights Ollama desativados (VITE_FEATURE_OLLAMA_INSIGHTS)." };
  }
  const base = getOllamaBaseUrl();
  if (!base) {
    return { ok: false, erro: "Defina VITE_OLLAMA_URL (ex.: proxy /api/ollama)." };
  }

  const body = {
    model: import.meta.env.VITE_OLLAMA_MODEL ?? "llama3.2",
    prompt: `És um assistente clínico-gestor. Resume em markdown curto (bullet points) estes indicadores de UTI e alertas. Não inventes números.\n\n${JSON.stringify(
      input,
      null,
      2
    )}`,
    stream: false,
  };

  try {
    const res = await fetch(`${base}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      return { ok: false, erro: `HTTP ${res.status}` };
    }
    const data = (await res.json()) as { response?: string };
    const markdown = typeof data.response === "string" ? data.response : "";
    return { ok: true, markdown: markdown || "_Sem resposta._" };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, erro: msg };
  }
}
