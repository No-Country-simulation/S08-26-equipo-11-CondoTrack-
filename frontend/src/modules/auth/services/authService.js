import httpClient from "@/core/api/httpClient";
import { appConfig } from "@/core/config/env";
import { ROLES } from "@/modules/auth/constants/roles";

// TODO: quitar cuando el backend tenga /auth/login listo para probar en local.
// Con VITE_MOCK_AUTH=true se valida contra MOCK_USER en vez de llamar al backend.
const MOCK_USER = {
  id: "mock-1",
  nombre: "Usuario",
  apellido: "Demo",
  email: "demo@condotrack.test",
  password: "Demo1234",
  role: ROLES.SUPER_ADMIN,
};

const toPublicUser = ({ id, nombre, apellido, email, role }) => ({
  id,
  nombre,
  apellido,
  email,
  role,
});

const mockLogin = async (email, password) => {
  if (email !== MOCK_USER.email || password !== MOCK_USER.password) {
    throw new Error("Credenciales inválidas");
  }

  const token = "mock-token";
  localStorage.setItem("ct_token", token);

  return { user: toPublicUser(MOCK_USER), token };
};

const loginService = async (email, password) => {
  if (appConfig.mockAuth) {
    return mockLogin(email, password);
  }

  const response = await httpClient.post("/auth/login", { email, password });
  const { token } = response.data;

  if (token) {
    localStorage.setItem("ct_token", token);
  }

  return response.data;
};

// Alta pública: quien se registra acá es el dueño del edificio (SUPER_ADMIN).
// Los residentes y administradores los da de alta el SUPER_ADMIN desde el dashboard.
export const registerService = async ({
  nombre,
  apellido,
  documento,
  email,
  password,
}) => {
  const response = await httpClient.post("/auth/register", {
    nombre,
    apellido,
    documento,
    email,
    password,
  });

  return response.data;
};

// URL a la que se redirige el navegador para iniciar el flujo de Google OAuth.
// El backend maneja el intercambio con Google y setea la cookie de sesión.
export const googleAuthUrl = `${appConfig.apiUrl}/auth/google`;

// TODO: /auth/me todavía no existe en el backend (llega la próxima semana).
// Mientras tanto, con VITE_MOCK_AUTH=true se devuelve el usuario simulado.
export const getCurrentUser = async () => {
  if (appConfig.mockAuth) {
    return toPublicUser(MOCK_USER);
  }

  const response = await httpClient.get("/auth/me");
  return response.data.user ?? response.data;
};

export default loginService;
