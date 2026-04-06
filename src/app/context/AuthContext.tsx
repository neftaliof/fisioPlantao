import { createContext, useContext, useState, ReactNode } from "react";
import { todosUsuarios } from "../data/usuarios";

// Re-exporta UserRole do lugar centralizado para não criar dependência circular
export type { UserRole } from "../data/usuarios";
import type { UserRole } from "../data/usuarios";

export interface AuthUser {
  id: string;
  nome: string;
  cargo: string;
  foto?: string;
  role: UserRole;
  equipe: string;
  /** Lista de IDs de setores que o usuário pode acessar.
   *  role="admin" ignora este campo — o componente deve checar role antes. */
  setoresAcesso: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  login: (usuario: string, senha: string) => boolean;
  loginById: (id: string, senha: string) => boolean;
  logout: () => void;
  /** Retorna true se o usuário logado tem acesso ao setor informado */
  temAcesso: (setorId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const SESSION_VERSION = "v3"; // bump to force re-login when user structure changes
const SESSION_VERSION_KEY = "fisioplantao_session_version";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      // Verifica versão da sessão — se mudou, força novo login
      const savedVersion = sessionStorage.getItem(SESSION_VERSION_KEY);
      if (savedVersion !== SESSION_VERSION) {
        sessionStorage.removeItem("fisioplantao_user");
        sessionStorage.setItem(SESSION_VERSION_KEY, SESSION_VERSION);
        return null;
      }
      const saved = sessionStorage.getItem("fisioplantao_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const loginById = (id: string, senha: string): boolean => {
    const entry = todosUsuarios.find((u) => u.id === id);
    if (entry && entry.senha === senha) {
      const authUser: AuthUser = {
        id: entry.id,
        nome: entry.nome,
        cargo: entry.cargo,
        foto: entry.foto,
        role: entry.role,
        equipe: entry.equipe,
        setoresAcesso: entry.setoresAcesso,
      };
      setUser(authUser);
      try {
        sessionStorage.setItem("fisioplantao_user", JSON.stringify(authUser));
      } catch {
        // ignore
      }
      return true;
    }
    return false;
  };

  const login = (usuario: string, senha: string): boolean => {
    return loginById(usuario, senha);
  };

  const logout = () => {
    setUser(null);
    try {
      sessionStorage.removeItem("fisioplantao_user");
    } catch {
      // ignore
    }
  };

  const temAcesso = (setorId: string): boolean => {
    if (!user) return false;
    if (user.role === "admin") return true;
    return user.setoresAcesso.includes(setorId);
  };

  return (
    <AuthContext.Provider value={{ user, login, loginById, logout, temAcesso }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}