# FisioPlantão

Aplicação web para **fisioterapia em UTI**: registo de **passagens de plantão** por unidade e turno, estado dos **leitos**, formulários institucionais associados e um **painel de indicadores** (uso de ventilação mecânica, mobilidade, bundle em VM, PAV, delirium, entre outros). ;; Pensada para apoio operacional e leitura agregada por **perfil** (equipa clínica vs. coordenação); os dados podem persistir no **navegador** (localStorage) enquanto não houver API dedicada.

**Stack:** Vite, React, TypeScript, Tailwind. **Código:** [github.com/neftaliof/fisioPlantao](https://github.com/neftaliof/fisioPlantao) · **Versão:** `package.json`.

## Desenvolvimento

```bash
npm install
npm run dev
npm run test
npm run build
```

## Insights (Ollama)

No ecrã **Indicadores UTI**, quem tem permissão pode usar **Gerar insights**: os KPIs e alertas já calculados são enviados ao modelo; a resposta é um texto em markdown para leitura no painel. **Não substitui** critérios clínicos nem decisões da instituição; convém **validar** com os números dos gráficos e cartões. Mais contexto no painel, em **“Sobre os insights (IA)”**.

**Variáveis de ambiente** (`VITE_`):

| Variável | Função |
|----------|--------|
| `VITE_FEATURE_OLLAMA_INSIGHTS` | `true` para mostrar o bloco de insights. |
| `VITE_OLLAMA_URL` | URL base do Ollama ou proxy (ex. `http://localhost:11434`). |
| `VITE_OLLAMA_MODEL` | Opcional (ex. `llama3.2`). |

Em produção, definir com a equipa de **TI** onde o modelo corre, **logs** e **proteção de dados**.

## Dados de exemplo (local)

Para preencher rapidamente passagens e indicadores no **localStorage**, o painel administrativo pode expor a opção de **carregar dados de exemplo** quando `VITE_FEATURE_DEMO_SEED=true` na build; em desenvolvimento a opção costuma estar disponível por defeito.
