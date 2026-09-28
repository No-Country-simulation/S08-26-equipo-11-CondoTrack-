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
  logoutService,
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

  const refreshSession = useCallback(async (force = false) => {
    setLoading(true);

    try {
      const currentUser = await getCurrentUser(force);
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
    const tokenFromUrl = persistBearerFromUrl();
    const hasToken = Boolean(tokenFromUrl || localStorage.getItem("ct_token"));

    // Sin token no hay sesión que validar: evitamos el GET /auth/me
    // que el backend responde con 401 y solo mete ruido en consola.
    if (!hasToken) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- estado inicial sin sesión al montar
      setLoading(false);
      return;
    }

    refreshSession().catch(() => null);
  }, [refreshSession]);

  const login = async (email, password) => {
    setLoading(true);

    try {
      const { user: userFromLogin } = await loginService(email, password);

      // El backend puede no tener /auth/me implementado todavía. Si falla
      // o devuelve null, usamos el usuario que devolvió el login como
      // fallback (getCurrentUser no lanza: retorna cacheado).
      let currentUser;
      try {
        currentUser = (await getCurrentUser()) ?? userFromLogin;
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

      // El PATCH /me responde sin roles/edificios/unidades:
      // se conservan los de la sesión para no perder permisos.
      const mergedUser = {
        ...updatedUser,
        roles: updatedUser.roles ?? user?.roles ?? [],
        role: updatedUser.role ?? user?.role,
        buildings: updatedUser.buildings ?? user?.buildings ?? [],
        units: updatedUser.units ?? user?.units ?? [],
      };

      setUser(mergedUser);

      try {
        localStorage.setItem("ct_user", JSON.stringify(mergedUser));
      } catch {
        // ignore
      }

      return mergedUser;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = () => {
    window.location.href = googleAuthUrl;
  };

  const logout = async () => {
    await logoutService();
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
