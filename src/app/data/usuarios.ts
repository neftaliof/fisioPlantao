// Tipo definido aqui diretamente — evita dependência circular com AuthContext
export type UserRole = "admin" | "coordenador" | "admin_setor" | "fisioterapeuta";

// Equipes de trabalho
export type EquipeUsuario = "adulto" | "pediatrico" | "enfermaria" | "geral";

import {
  fotoDolores,
  fotoKatiuscia,
  fotoBruna,
  fotoFelipe,
  fotoHelen,
  fotoJoyce,
  fotoMarissa,
  fotoNeliton,
  fotoDenise,
  fotoSarah,
  fotoRavilla,
  fotoJoaoVitor,
  fotoFernanda,
  fotoElisangela,
  fotoRafaelaRezende,
} from "./fotosEquipe";

export interface UsuarioLogin {
  id: string;
  nome: string;
  senha: string;
  foto?: string;
  /** Contacto (opcional; exibido no login quando existir) */
  telefone?: string;
  role: UserRole;
  cargo: string;
  equipe: EquipeUsuario;
  /** IDs dos setores que este usuário pode visualizar e preencher.
   *  role="admin" ignora este campo e vê tudo. */
  setoresAcesso: string[];
}

// ===================================================================
// SETORES IDs (para referência centralizada)
// ===================================================================
export const SETORES = {
  UTI_01:   "uti-01",
  UTI_02:   "uti-02",
  UTI_NEO:  "uti-neo",
  UTI_PED:  "uti-ped",
  ENFERMARIA: "enfermaria",
} as const;

const ACESSO_ADULTO      = [SETORES.UTI_01, SETORES.UTI_02];
const ACESSO_PEDIATRICO  = [SETORES.UTI_NEO, SETORES.UTI_PED];
const ACESSO_TUDO        = [...ACESSO_ADULTO, ...ACESSO_PEDIATRICO, SETORES.ENFERMARIA];

// ===================================================================
// USUÁRIOS
// ===================================================================
export const todosUsuarios: UsuarioLogin[] = [
  // ── ADMINISTRAÇÃO GERAL ──────────────────────────────────────────
  {
    id: "dolores",
    nome: "Dolores",
    senha: "admin123",
    foto: fotoDolores,
    role: "admin",
    cargo: "Administradora Geral",
    equipe: "geral",
    setoresAcesso: ACESSO_TUDO,
  },
  // ── COORDENAÇÃO EQUIPE ADULTO ─────────────────────────────────────
  {
    id: "katiuscia",
    nome: "Katiuscia",
    senha: "coord123",
    foto: fotoKatiuscia,
    role: "coordenador",
    cargo: "Coordenadora – Eq. Adulto",
    equipe: "adulto",
    setoresAcesso: ACESSO_ADULTO,
  },
  // ── ADMINISTRAÇÃO UTI Neo + Pediátrica ────────────────────────────
  {
    id: "rafaela",
    nome: "Rafaela Rezende",
    senha: "rafaela123",
    foto: fotoRafaelaRezende,
    telefone: "+55 62 9184-6467",
    role: "admin",
    cargo: "Administradora Geral",
    equipe: "geral",
    setoresAcesso: ACESSO_TUDO,
  },
  {
    id: "joyce",
    nome: "Joyce",
    senha: "joyce123",
    foto: fotoJoyce,
    role: "admin",
    cargo: "Administradora Geral",
    equipe: "geral",
    setoresAcesso: ACESSO_TUDO,
  },

  // ── EQUIPE ADULTO (UTI 01 + 02) ──────────────────────────────────
  { id: "bruna",      nome: "Bruna Martins",    senha: "fisio123", foto: fotoBruna,      role: "fisioterapeuta", cargo: "Fisioterapeuta", equipe: "adulto",    setoresAcesso: ACESSO_ADULTO },
  { id: "felipe",     nome: "Felipe",            senha: "fisio123", foto: fotoFelipe,     role: "fisioterapeuta", cargo: "Fisioterapeuta", equipe: "adulto",    setoresAcesso: ACESSO_ADULTO },
  { id: "helen",      nome: "Helen Araújo",      senha: "fisio123", foto: fotoHelen,      role: "fisioterapeuta", cargo: "Fisioterapeuta", equipe: "adulto",    setoresAcesso: ACESSO_ADULTO },
  { id: "marissa",    nome: "Marissa Campos",    senha: "fisio123", foto: fotoMarissa,    role: "fisioterapeuta", cargo: "Fisioterapeuta", equipe: "adulto",    setoresAcesso: ACESSO_ADULTO },
  { id: "neliton",    nome: "Neliton Junior",    senha: "fisio123", foto: fotoNeliton,    role: "fisioterapeuta", cargo: "Fisioterapeuta", equipe: "adulto",    setoresAcesso: ACESSO_ADULTO },
  { id: "denise",     nome: "Denise",            senha: "fisio123", foto: fotoDenise,     role: "fisioterapeuta", cargo: "Fisioterapeuta", equipe: "adulto",    setoresAcesso: ACESSO_ADULTO },
  { id: "sarah",      nome: "Sarah Bueno",       senha: "fisio123", foto: fotoSarah,      role: "fisioterapeuta", cargo: "Fisioterapeuta", equipe: "adulto",    setoresAcesso: ACESSO_ADULTO },

  // ── EQUIPE PEDIÁTRICA (UTI Neo + Pediátrica) ──────────────────────
  { id: "ravilla",    nome: "Ravilla",           senha: "fisio123", foto: fotoRavilla,    role: "fisioterapeuta", cargo: "Fisioterapeuta", equipe: "pediatrico", setoresAcesso: ACESSO_PEDIATRICO },
  { id: "joao",       nome: "João Vitor Leal",   senha: "fisio123", foto: fotoJoaoVitor,  role: "fisioterapeuta", cargo: "Fisioterapeuta", equipe: "pediatrico", setoresAcesso: ACESSO_PEDIATRICO },
  { id: "fernanda",   nome: "Fernanda Leite",    senha: "fisio123", foto: fotoFernanda,   role: "fisioterapeuta", cargo: "Fisioterapeuta", equipe: "pediatrico", setoresAcesso: ACESSO_PEDIATRICO },
  { id: "elisangela", nome: "Elisângela Povoa",  senha: "fisio123", foto: fotoElisangela, role: "fisioterapeuta", cargo: "Fisioterapeuta", equipe: "pediatrico", setoresAcesso: ACESSO_PEDIATRICO },
];

/** Quem pode validar passagem neste setor: admin em qualquer UTI; coordenadora com acesso ao setor; Joyce (admin_setor) só na enfermaria. */
export function podeValidarPassagem(
  user: Pick<UsuarioLogin, "role" | "setoresAcesso"> | null | undefined,
  utiId: string
): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (!user.setoresAcesso.includes(utiId)) return false;
  if (user.role === "coordenador") return true;
  if (user.role === "admin_setor" && utiId === SETORES.ENFERMARIA) return true;
  return false;
}

/** Quem pode abrir formulário de nova passagem / nova versão neste setor. */
export function podeCriarPassagem(
  user: Pick<UsuarioLogin, "role" | "setoresAcesso"> | null | undefined,
  utiId: string
): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (!user.setoresAcesso.includes(utiId)) return false;
  return (
    user.role === "fisioterapeuta" ||
    user.role === "coordenador" ||
    user.role === "admin_setor"
  );
}
