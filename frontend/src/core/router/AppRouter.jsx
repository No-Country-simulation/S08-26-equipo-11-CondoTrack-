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

const AccessPage = lazy(() =>
  import("@/modules/access/pages/AccessPage").then((m) => ({
    default: m.AccessPage,
  })),
);

const DeliveriesPage = lazy(() =>
  import("@/modules/deliveries/pages/DeliveriesPage").then((m) => ({
    default: m.DeliveriesPage,
  })),
);
const ReservationsPage = lazy(() =>
  import("@/modules/reservations/pages/ReservationsPage").then((m) => ({
    default: m.ReservationsPage,
  })),
);
const MovesPage = lazy(() =>
  import("@/modules/moves/pages/MovesPage").then((m) => ({
    default: m.MovesPage,
  })),
);

const MaintenancePage = lazy(() =>
  import("@/modules/maintenance/pages/MaintenancePage").then((m) => ({
    default: m.MaintenancePage,
  })),
);

const IncidentsPage = lazy(() =>
  import("@/modules/incidents/pages/IncidentsPage").then((m) => ({
    default: m.IncidentsPage,
  })),
);
const CommunicationsPage = lazy(() =>
  import("@/modules/notifications/pages/CommunicationsPage").then((m) => ({
    default: m.CommunicationsPage,
  })),
);

const BuildingsPage = lazy(() =>
  import("@/modules/buildings/pages/BuildingsPage").then((m) => ({
    default: m.BuildingsPage,
  })),
);

const BuildingDetailPage = lazy(() =>
  import("@/modules/buildings/pages/BuildingDetailPage").then((m) => ({
    default: m.BuildingDetailPage,
  })),
);

const DashboardHomePage = lazy(() =>
  import("@/modules/dashboard/pages/DashboardHomePage").then((m) => ({
    default: m.DashboardHomePage,
  })),
);

const RoleSelectorPage = lazy(() =>
  import("@/modules/home/pages/RoleSelectorPage").then((m) => ({
    default: m.RoleSelectorPage,
  })),
);

const CompleteProfilePage = lazy(() =>
  import("@/modules/auth/page/CompleteProfilePage").then((m) => ({
    default: m.CompleteProfilePage,
  })),
);

const AuthCallback = lazy(() =>
  import("@/modules/auth/page/AuthCallback").then((m) => ({
    default: m.AuthCallback,
  })),
);

function Unauthorized() {
  return (
    <main style={{ padding: "2rem", textAlign: "center" }}>
      <h1>No autorizado</h1>
      <p>No tenés permiso para ver esta página.</p>
      <a href="/inicio">Volver al inicio</a>
    </main>
  );
}

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
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route
            path="/perfil/completar"
            element={
              <ProtectedRoute allowIncompleteProfile>
                <CompleteProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inicio"
            element={
              <ProtectedRoute>
                <RoleSelectorPage />
              </ProtectedRoute>
            }
          />
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
            <Route path="accesos" element={<AccessPage />} />
            <Route path="deliveries" element={<DeliveriesPage />} />
            <Route path="reservas" element={<ReservationsPage />} />
            <Route path="mudanzas" element={<MovesPage />} />
            <Route path="mantenimiento" element={<MaintenancePage />} />
            <Route path="incidentes" element={<IncidentsPage />} />
            <Route path="comunicaciones" element={<CommunicationsPage />} />
            <Route path="edificios" element={<BuildingsPage />} />
            <Route
              path="edificios/:buildingId"
              element={<BuildingDetailPage />}
            />
            <Route index element={<DashboardHomePage />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
