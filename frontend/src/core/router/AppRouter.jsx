import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "@/core/router/ProtectedRoute";
import { ROLES } from "@/modules/auth/constants/roles";
import { lazy, Suspense } from "react";
import Loading from "@/shared/components/Loading";
import NotFound from "@/shared/components/NotFound";

const LoginPage = lazy(() =>
  import("@/modules/auth/page/LoginPage").then((module) => ({
    default: module.LoginPage,
  })),
);

const CreateUserPage = lazy(() =>
  import("@/modules/users/pages/CreateUserPage").then((module) => ({
    default: module.CreateUserPage,
  })),
);

const UsuariosPage = lazy(() =>
  import("@/modules/users/pages/UsuariosPage").then((module) => ({
    default: module.UsuariosPage,
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

const UnitDetailPage = lazy(() =>
  import("@/modules/units/pages/UnitDetailPage").then((m) => ({
    default: m.UnitDetailPage,
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
    <NotFound
      message="No tienes permisos para acceder a esta página."
      homePath="/inicio"
    />
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
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
              <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="residentes" element={<ResidentsPage />} />
            <Route path="actividad" element={<ActivityPage />} />
            <Route path="personal" element={<StaffPage />} />
            <Route
              path="usuarios"
              element={
                <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
                  <UsuariosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="usuarios/nuevo"
              element={
                <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
                  <CreateUserPage />
                </ProtectedRoute>
              }
            />
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
            <Route
              path="edificios/:buildingId/unidades/:unitId"
              element={<UnitDetailPage />}
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
