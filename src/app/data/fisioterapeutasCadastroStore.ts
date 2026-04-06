import type { Fisioterapeuta } from "../types";
import { mockFisioterapeutas } from "../store";

const STORAGE_KEY = "fisioplantao_fisioterapeutas_cadastro_v1";

const mockById = new Map(mockFisioterapeutas.map((f) => [f.id, f]));

/** Lista para formulários e passagens — inclui alterações feitas em Cadastro. */
export function getFisioterapeutasLista(): Fisioterapeuta[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return mockFisioterapeutas;
    const data = JSON.parse(raw) as Fisioterapeuta[];
    return data.map((f) => ({
      ...f,
      foto: mockById.get(f.id)?.foto ?? f.foto,
    }));
  } catch {
    return mockFisioterapeutas;
  }
}

export function setFisioterapeutasLista(list: Fisioterapeuta[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}
