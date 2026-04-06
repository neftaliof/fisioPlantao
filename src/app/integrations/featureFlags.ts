/**
 * Feature flags (Vite env). Valores lidos em runtime no browser.
 */
export function flagOllamaInsights(): boolean {
  return import.meta.env.VITE_FEATURE_OLLAMA_INSIGHTS === "true";
}

export function flagWhatsAppPosSave(): boolean {
  return import.meta.env.VITE_FEATURE_WHATSAPP_POS_SAVE === "true";
}

export function getOllamaBaseUrl(): string {
  const u = import.meta.env.VITE_OLLAMA_URL;
  return typeof u === "string" && u.length ? u.replace(/\/$/, "") : "";
}

/**
 * Exibe o botão admin “Carregar dados de demonstração” (substitui passagens/indicadores no localStorage).
 * Em desenvolvimento: ativo por defeito. Em produção: definir `VITE_FEATURE_DEMO_SEED=true` na build.
 */
export function flagPainelDemoSeed(): boolean {
  if (import.meta.env.DEV) return true;
  return import.meta.env.VITE_FEATURE_DEMO_SEED === "true";
}
