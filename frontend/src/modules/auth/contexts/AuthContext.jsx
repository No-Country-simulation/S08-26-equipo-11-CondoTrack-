import { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import loginService, {
  getCurrentUser,
  googleAuthUrl,
} from "@/modules/auth/services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("ct_user") ?? "null"),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Valida si ya hay una sesión activa (token guardado o cookie de Google)
    // consultando al backend, ya que la cookie de Google es httpOnly.
    getCurrentUser()
      .then((currentUser) => {
        setUser(currentUser);
        localStorage.setItem("ct_user", JSON.stringify(currentUser));
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem("ct_user");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await loginService(email, password);
      setUser(data.user);
      localStorage.setItem("ct_user", JSON.stringify(data.user));
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = () => {
    window.location.href = googleAuthUrl;
  };

  const logout = () => {
    localStorage.removeItem("ct_token");
    localStorage.removeItem("ct_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, loginWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
