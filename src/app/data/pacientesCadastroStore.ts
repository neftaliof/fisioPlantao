import type { PacienteCadastrado } from "../types";

const STORAGE_KEY = "fisioplantao_pacientes_cadastro_v1";

export function listarPacientesCadastro(): PacienteCadastrado[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PacienteCadastrado[];
  } catch {
    return [];
  }
}

function salvar(lista: PacienteCadastrado[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
  } catch {
    /* ignore */
  }
}

export function adicionarPacienteCadastro(
  dados: Omit<PacienteCadastrado, "id" | "createdAt">
): PacienteCadastrado {
  const row: PacienteCadastrado = {
    ...dados,
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
