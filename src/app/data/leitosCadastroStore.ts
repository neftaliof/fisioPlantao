import type { LeitoCadastrado } from "../types";
import { mockUTIs } from "../store";

const STORAGE_KEY = "fisioplantao_leitos_cadastro_v1";

export function listarLeitosCadastro(): LeitoCadastrado[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LeitoCadastrado[];
  } catch {
    return [];
  }
}

function salvar(lista: LeitoCadastrado[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
  } catch {
    /* ignore */
  }
}

export function listarLeitosPorUti(utiId: string): LeitoCadastrado[] {
  return listarLeitosCadastro()
    .filter((l) => l.utiId === utiId && l.ativo)
    .sort((a, b) => a.numero - b.numero);
}

/** Números de leito a usar na coleta do turno: cadastro se houver, senão 1..totalLeitos da UTI. */
export function getNumerosLeitosParaUti(utiId: string): number[] {
  const cad = listarLeitosPorUti(utiId);
  if (cad.length > 0) return cad.map((l) => l.numero);
  const uti = mockUTIs.find((u) => u.id === utiId);
  const n = uti?.totalLeitos ?? 10;
  return Array.from({ length: n }, (_, i) => i + 1);
}

export function adicionarLeitoCadastro(
  dados: Omit<LeitoCadastrado, "id" | "createdAt" | "ativo"> & { ativo?: boolean }
): LeitoCadastrado {
  const row: LeitoCadastrado = {
    utiId: dados.utiId,
    numero: dados.numero,
    rotulo: dados.rotulo ?? "",
    ativo: dados.ativo ?? true,
    id: `leito-${dados.utiId}-${dados.numero}-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  salvar([...listarLeitosCadastro(), row]);
  return row;
}

export function atualizarLeitoCadastro(
  id: string,
  patch: Partial<Pick<LeitoCadastrado, "rotulo" | "ativo" | "numero">>
): void {
  const lista = listarLeitosCadastro();
  salvar(lista.map((l) => (l.id === id ? { ...l, ...patch } : l)));
}

export function removerLeitoCadastro(id: string): void {
  salvar(listarLeitosCadastro().filter((l) => l.id !== id));
}
