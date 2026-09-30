import { Outlet, useLocation } from "react-router-dom";
import { ReceptionSidebar } from "@/modules/reception/components/ReceptionSidebar";
import { TopBar } from "@/shared/components/TopBar";

const PAGE_META = {
  "/recepcion": { title: "Accesos", subtitle: "Registro de ingresos y egresos en tiempo real" },
  "/recepcion/deliveries": { title: "Deliveries", subtitle: "Correspondencia y paquetes recibidos" },
};

export const ReceptionLayout = () => {
  const { pathname } = useLocation();
  const { title, subtitle } = PAGE_META[pathname] || PAGE_META["/recepcion"];

  return (
    <div className="ct-app-shell">
      <ReceptionSidebar />
      <div className="ct-main">
        <TopBar title={title} subtitle={subtitle} />
        <Outlet />
      </div>
    </div>
  );
};
