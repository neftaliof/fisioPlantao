/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OLLAMA_URL?: string;
  readonly VITE_OLLAMA_MODEL?: string;
  readonly VITE_FEATURE_OLLAMA_INSIGHTS?: string;
  readonly VITE_FEATURE_WHATSAPP_POS_SAVE?: string;
  readonly VITE_FEATURE_DEMO_SEED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
