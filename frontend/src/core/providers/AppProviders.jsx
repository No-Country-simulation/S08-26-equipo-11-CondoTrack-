import PropTypes from "prop-types";
import { AuthProvider } from "@/modules/auth/contexts/AuthContext";
import { ActivityLogProvider } from "@/core/activity/ActivityLogContext";
import { NotificationsProvider } from "@/modules/notifications/context/NotificationsContext";
import { BuildingsProvider } from "@/modules/buildings/context/BuildingsContext";
import { UnitsProvider } from "@/modules/units/context/UnitsContext";
import { AmenitiesProvider } from "@/modules/amenities/context/AmenitiesContext";
import { ResidentsProvider } from "@/modules/residents/context/ResidentsContext";

// El orden importa: cada provider puede usar los hooks de los anteriores
// (ActivityLog y Notifications son la base que consumen casi todos los demás).
const PROVIDERS = [
  AuthProvider,
  ActivityLogProvider,
  NotificationsProvider,
  BuildingsProvider,
  UnitsProvider,
  AmenitiesProvider,
  ResidentsProvider,
];

export function AppProviders({ children }) {
  return PROVIDERS.reduceRight(
    (acc, Provider) => <Provider>{acc}</Provider>,
    children,
  );
}

AppProviders.propTypes = {
  children: PropTypes.node.isRequired,
};
