import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "@/modules/auth/contexts/AuthContext";
import { isProfileComplete } from "@/modules/auth/services/authService";
import Loading from "@/shared/components/Loading";

function ProtectedRoute({
  children,
  allowedRoles,
  allowIncompleteProfile = false,
}) {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowIncompleteProfile && !isProfileComplete(user)) {
    return <Navigate to="/perfil/completar" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
  allowIncompleteProfile: PropTypes.bool,
};

export default ProtectedRoute;
