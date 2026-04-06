import { Outlet } from "react-router";
import { AuthProvider } from "../context/AuthContext";

/**
 * Componente raiz que garante o AuthProvider dentro da árvore do router,
 * independente de como o preview renderiza as rotas.
 */
export function AuthRoot() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}
