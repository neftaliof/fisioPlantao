import type { PacienteCadastrado } from "../types";
import { chavePacientePagina4 } from "./pagina4Store";

const STORAGE_KEY = "fisioplantao_pacientes_cadastro_v1";

function normalizarLista(raw: unknown): PacienteCadastrado[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((p) => {
    const x = p as PacienteCadastrado;
    return {
      ...x,
      dataNascimento: typeof x.dataNascimento === "string" ? x.dataNascimento : "",
    };
  });
}

export function listarPacientesCadastro(): PacienteCadastrado[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return normalizarLista(JSON.parse(raw));
  } catch {
    return [];
  }
}

/**
 * Registo oficial do paciente para o resto da app — apenas após concluir admissão na Página 4 (FOR.017).
 */
export function upsertPacienteAdmissaoPagina4(form: {
  paciente: string;
  dataNascimento: string;
  internacaoMensalNum: string;
  dataAdmissao: string;
  procedencia: string;
  admissaoConcluidaEm: string;
}): void {
  const k = chavePacientePagina4(form.paciente, form.dataNascimento);
  if (!k) return;
  const lista = listarPacientesCadastro();
  const idx = lista.findIndex((p) => {
    const pk = chavePacientePagina4(p.nome, p.dataNascimento ?? "");
    return pk !== null && pk === k;
  });
  const obsParts = [
    form.procedencia.trim() ? `Proc.: ${form.procedencia.trim()}` : "",
    form.dataAdmissao.trim() ? `Adm.: ${form.dataAdmissao.trim()}` : "",
    "FOR.017 — admissão concluída",
  ].filter(Boolean);
  const row: PacienteCadastrado = {
    id: idx >= 0 ? lista[idx]!.id : `pac-for017-${Date.now()}`,
    nome: form.paciente.trim(),
    dataNascimento: form.dataNascimento.trim(),
    prontuario: form.internacaoMensalNum.trim(),
    observacao: obsParts.join(" · "),
    createdAt: idx >= 0 ? lista[idx]!.createdAt : new Date().toISOString(),
    admissaoConcluidaEm: form.admissaoConcluidaEm,
  };
  const next = idx >= 0 ? lista.map((p, i) => (i === idx ? row : p)) : [...lista, row];
  salvar(next);
}

function salvar(lista: PacienteCadastrado[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
  } catch {
    /* ignore */
  }
}

/** @deprecated Cadastro manual descontinuado — usar FOR.017 / Página 4 (admissão). */
export function adicionarPacienteCadastro(
  dados: Omit<PacienteCadastrado, "id" | "createdAt">
): PacienteCadastrado {
  const row: PacienteCadastrado = {
    ...dados,
    dataNascimento: dados.dataNascimento ?? "",
    id: `pac-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  salvar([...listarPacientesCadastro(), row]);
  return row;
}

export function atualizarPacienteCadastro(
  id: string,
  dados: Partial<Omit<PacienteCadastrado, "id" | "createdAt">>
): void {
  const lista = listarPacientesCadastro();
  salvar(lista.map((p) => (p.id === id ? { ...p, ...dados } : p)));
}

export function removerPacienteCadastro(id: string): void {
  salvar(listarPacientesCadastro().filter((p) => p.id !== id));
}
