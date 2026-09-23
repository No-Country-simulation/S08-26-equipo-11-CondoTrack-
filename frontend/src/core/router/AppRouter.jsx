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

const ResidentsPage = lazy(() =>
  import("@/modules/residents/pages/ResidentsPage").then((m) => ({
    default: m.ResidentsPage,
  })),
);

const StaffPage = lazy(() =>
  import("@/modules/staff/pages/StaffPage").then((m) => ({
    default: m.StaffPage,
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
            <Route path="residentes" element={<ResidentsPage />} />
            <Route path="actividad" element={<ActivityPage />} />
            <Route path="personal" element={<StaffPage />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
