-- Fase 2: esquema de referência alinhado a passagens e indicadores UTI.
-- Executar na base PostgreSQL (ou adaptar tipos) quando existir API real.

CREATE TABLE IF NOT EXISTS pacientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  data_nascimento DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS registros_plantao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passagem_id TEXT NOT NULL UNIQUE,
  unidade_id TEXT NOT NULL,
  data_ref DATE NOT NULL,
  turno TEXT NOT NULL,
  status TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_registros_plantao_unidade_data
  ON registros_plantao (unidade_id, data_ref);

CREATE TABLE IF NOT EXISTS indicadores_diarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unidade_id TEXT NOT NULL,
  data_ref DATE NOT NULL,
  agregados JSONB NOT NULL,
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (unidade_id, data_ref)
);

CREATE TABLE IF NOT EXISTS indicadores_mensais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unidade_id TEXT NOT NULL,
  ano SMALLINT NOT NULL,
  mes SMALLINT NOT NULL,
  agregados JSONB NOT NULL,
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (unidade_id, ano, mes)
);

-- Worker/trigger: após INSERT/UPDATE em registros_plantao, recalcular indicadores_diarios
-- para (unidade_id, data_ref) e agregar indicadores_mensais.
