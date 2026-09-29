import { Outlet, useLocation } from "react-router-dom";
import { ResidentSidebar } from "@/modules/resident/components/ResidentSidebar";
import { TopBar } from "@/shared/components/TopBar";
import { useCurrentResident } from "@/modules/resident/hooks/useCurrentResident";

export const ResidentLayout = () => {
  const current = useCurrentResident();
  const { pathname } = useLocation();

  const PAGE_META = {
    "/portal": { title: "Inicio", subtitle: `Unidad ${current.unit} · ${current.building}` },
    "/portal/visitas": { title: "Visitas & QR", subtitle: "Autorizaciones y código de acceso" },
    "/portal/deliveries": { title: "Mis deliveries", subtitle: "Paquetes y correspondencia en portería" },
    "/portal/reservas": { title: "Reservas", subtitle: `Espacios comunes · ${current.building}` },
    "/portal/mudanzas": { title: "Mudanzas", subtitle: "Solicitá y seguí tus mudanzas" },
    "/portal/solicitudes": { title: "Solicitudes", subtitle: "Mantenimiento e incidentes" },
    "/portal/unidad": { title: "Mi unidad", subtitle: `${current.unit} · ${current.building}` },
  };
  const { title, subtitle } = PAGE_META[pathname] || PAGE_META["/portal"];

  return (
    <div className="ct-app-shell">
      <ResidentSidebar />
      <div className="ct-main">
        <TopBar title={title} subtitle={subtitle} />
        <Outlet />
      </div>
    </div>
  );
};
