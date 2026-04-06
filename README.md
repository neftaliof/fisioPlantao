# Fisioplantão (POC)

Aplicação front-end (Vite + React) para plantão, passagens de UTI e indicadores.

**Versão npm:** `0.1.0` (ver `package.json`). **Tag da entrega demo:** `v0.1.0-cliente` (`git checkout v0.1.0-cliente`). **Repositório:** [github.com/neftaliof/fisioPlantao](https://github.com/neftaliof/fisioPlantao) — branch `main`.

## Desenvolvimento

```bash
npm install
npm run dev
npm run test
npm run build
```

## Insights com IA (Ollama)

No ecrã **Indicadores UTI**, perfis autorizados podem gerar um texto de apoio com o botão **Gerar insights**. O fluxo é:

1. O utilizador define período, unidade e filtros.
2. A aplicação calcula KPIs e alertas como de costume.
3. Esses dados (agregados + textos de alerta) são enviados num único pedido ao Ollama.
4. O modelo devolve markdown para leitura no painel.

**Variáveis de ambiente (Vite, prefixo `VITE_`):**

| Variável | Função |
|----------|--------|
| `VITE_FEATURE_OLLAMA_INSIGHTS` | Definir `true` para mostrar o bloco de insights. |
| `VITE_OLLAMA_URL` | URL base do Ollama ou proxy (ex. `http://localhost:11434`), sem barra final duplicada. |
| `VITE_OLLAMA_MODEL` | Opcional; modelo usado no corpo do pedido (ex. `llama3.2`). |

**Texto para cliente / clínica (comunicar assim):**

- A IA **resume** números e alertas **que já estão no sistema**; não acede a doentes nem a bases externas por si só.
- **Não substitui** julgamento clínico nem regras internas; convém **confirmar** os valores no quadro e nos gráficos.
- Em ambientes em produção, acordar **onde o modelo corre** (servidor próprio vs. nuvem), **retenção de logs** e **RGPD** com a equipa de TI/jurídico.

Detalhe adicional para utilizadores finais: ver **“Sobre os insights (IA)”** no próprio painel de Indicadores UTI.

## Dados de demonstração

O painel admin pode incluir **Carregar dados de demonstração** quando `VITE_FEATURE_DEMO_SEED=true` em build de produção (em desenvolvimento costuma estar disponível por defeito). Isto substitui passagens e indicadores no `localStorage` do navegador.
