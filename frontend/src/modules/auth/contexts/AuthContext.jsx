import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import PropTypes from "prop-types";
import loginService, {
  getCurrentUser,
  googleAuthUrl,
  persistBearerFromUrl,
  updateCurrentUser,
} from "@/modules/auth/services/authService";

const AuthContext = createContext(null);

const readCachedUser = () => {
  try {
    return JSON.parse(localStorage.getItem("ct_user") ?? "null");
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readCachedUser);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    setLoading(true);

    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);

      if (currentUser) {
        localStorage.setItem("ct_user", JSON.stringify(currentUser));
      } else {
        localStorage.removeItem("ct_user");
      }

      return currentUser;
    } catch (error) {
      setUser(null);
      localStorage.removeItem("ct_user");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Valida si ya hay una sesión activa (token guardado o cookie de Google)
    // consultando al backend, ya que la cookie de Google es httpOnly.
    persistBearerFromUrl();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- restauración de sesión al montar
    refreshSession().catch(() => null);
  }, [refreshSession]);

  const login = async (email, password) => {
    setLoading(true);

    try {
      const { user: userFromLogin } = await loginService(email, password);

      // El backend puede no tener /auth/me implementado todavía. Si falla,
      // usamos el usuario que devolvió el login como fallback.
      let currentUser;
      try {
        currentUser = await getCurrentUser();
      } catch {
        currentUser = userFromLogin;
      }

      setUser(currentUser);
      return currentUser;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profile) => {
    setLoading(true);

    try {
      const updatedUser = await updateCurrentUser(profile);
      setUser(updatedUser);
      return updatedUser;
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

  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        loginWithGoogle,
        updateProfile,
        logout,
        refreshSession,
      }}
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
