import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AdminSidebar } from "@/modules/dashboard/components/AdminSidebar";
import { TopBar } from "@/shared/components/TopBar";
import { useBuildings } from "@/modules/buildings/context/BuildingsContext";

const pageMetaFor = (pathname, building, buildingsCount) => {
  if (pathname.startsWith("/dashboard/edificios/")) {
    return { title: "Edificios", subtitle: "Vista detallada del edificio" };
  }

  const meta = {
    "/dashboard": {
      title: "Dashboard",
      subtitle: `${building.name} · Vista general de operaciones`,
    },
    "/dashboard/edificios": {
      title: "Edificios",
      subtitle: `${buildingsCount} edificios administrados`,
    },
    "/dashboard/residentes": {
      title: "Residentes",
      subtitle: `${building.name} · ${Math.round(building.units * 0.8)} residentes activos`,
    },
    "/dashboard/personal": {
      title: "Personal",
      subtitle: `${building.name} · Recepción y mantenimiento`,
    },
    "/dashboard/accesos": {
      title: "Accesos",
      subtitle: `${building.name} · Registro en tiempo real`,
    },
    "/dashboard/deliveries": {
      title: "Deliveries",
      subtitle: `${building.name} · Correspondencia y paquetes`,
    },
    "/dashboard/reservas": {
      title: "Reservas",
      subtitle: `${building.name} · Espacios comunes`,
    },
    "/dashboard/mudanzas": {
      title: "Mudanzas",
      subtitle: `${building.name} · Solicitudes de entrada y salida`,
    },
    "/dashboard/mantenimiento": {
      title: "Mantenimiento",
      subtitle: `${building.name} · Solicitudes y seguimiento`,
    },
    "/dashboard/incidentes": {
      title: "Incidentes",
      subtitle: `${building.name} · Casos abiertos`,
    },
    "/dashboard/comunicaciones": {
      title: "Comunicaciones",
      subtitle: "Avisos enviados a residentes",
    },
    "/dashboard/actividad": {
      title: "Actividad",
      subtitle: "Historial de acciones de todos los edificios",
    },
  };
  return meta[pathname] || { title: "Dashboard", subtitle: building.name };
};

export const DashboardLayout = () => {
  const [selectedBuildingId, setSelectedBuildingId] = useState(1);
  const { buildings, getBuildingById } = useBuildings();
  const building = getBuildingById(selectedBuildingId);
  const { pathname } = useLocation();
  const { title, subtitle } = pageMetaFor(pathname, building, buildings.length);

  return (
    <div className="ct-app-shell">
      <AdminSidebar
        selectedBuildingId={selectedBuildingId}
        onBuildingChange={setSelectedBuildingId}
      />
      <div className="ct-main">
        <TopBar title={title} subtitle={subtitle} />
        <Outlet context={{ building }} />
      </div>
    </div>
  );
};
