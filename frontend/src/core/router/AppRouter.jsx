import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "@/core/router/ProtectedRoute";
import { lazy, Suspense } from "react";

const LoginPage = lazy(() =>
  import("@/modules/auth/page/LoginPage").then((module) => ({
    default: module.LoginPage,
  })),
);
const RegisterPage = lazy(() =>
  import("@/modules/auth/page/RegisterPage").then((module) => ({
    default: module.RegisterPage,
  })),
);

const DashboardLayout = lazy(() =>
  import("@/modules/dashboard/layout/DashboardLayout").then((m) => ({
    default: m.DashboardLayout,
  })),
);
const ActivityPage = lazy(() =>
  import("@/modules/dashboard/pages/ActivityPage").then((m) => ({
    default: m.ActivityPage,
  })),
);

function NotFound() {
  return (
    <main>
      <h1 className="">Página no encontrada</h1>
      <Navigate to="/login" replace />
    </main>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<p>Cargando...</p>}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="actividad" element={<ActivityPage />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
