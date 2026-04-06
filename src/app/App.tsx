import { RouterProvider } from "react-router";
import { router } from "./routes";

// AuthProvider está dentro do AuthRoot no routes.tsx
// Não duplicar aqui para evitar conflito de contexto
export default function App() {
  return <RouterProvider router={router} />;
}