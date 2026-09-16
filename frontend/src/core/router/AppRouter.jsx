import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "@/modules/auth/page/LoginPage";
import ProtectedRoute from "@/core/router/ProtectedRoute";
import { useAuth } from "@/modules/auth/contexts/AuthContext";

function Dashboard() {
  const { logout } = useAuth();

  return (
    <main>
      <h1>Dashboard</h1>
      <p>Esta ruta está protegida.</p>
      <button type="button" onClick={logout}>
        Cerrar sesión
      </button>
    </main>
  );
}

function NotFound() {
  return (
    <main>
      <h1>Página no encontrada</h1>
      <Navigate to="/login" replace />
    </main>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
