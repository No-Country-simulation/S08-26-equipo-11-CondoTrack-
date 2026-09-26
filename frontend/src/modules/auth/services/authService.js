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
  telefono: "1122334455",
  documento: "30123456",
  tipoDocumento: "DNI",
  codigoPostal: "1000",
  perfilCompleto: true,
};

const toPublicUser = (user) => {
  const publicUser = { ...user };
  delete publicUser.password;
  return publicUser;
};

export const isProfileComplete = (user) => {
  if (user?.perfilCompleto === true) {
    return true;
  }

  return ["telefono", "tipoDocumento", "documento"].every(
    (field) => String(user?.[field] ?? "").trim().length > 0,
  );
};

const normalizeUser = (payload) => {
  const body = payload?.data ?? payload ?? {};
  const user = body?.user ?? body ?? {};
  const profile = user.profile ?? user.perfil ?? {};

  return toPublicUser({
    ...user,
    ...profile,
    nombre: user.nombre ?? user.firstName ?? profile.nombre ?? profile.firstName,
    apellido:
      user.apellido ?? user.lastName ?? profile.apellido ?? profile.lastName,
    telefono: user.telefono ?? user.phone ?? profile.telefono ?? profile.phone,
    documento:
      user.documento ??
      user.documentNumber ??
      user.dni ??
      profile.documento ??
      profile.documentNumber ??
      profile.dni,
    tipoDocumento:
      user.tipoDocumento ??
      user.documentType ??
      profile.tipoDocumento ??
      profile.documentType,
    codigoPostal:
      user.codigoPostal ??
      user.codigo_postal ??
      user.postalCode ??
      profile.codigoPostal ??
      profile.codigo_postal ??
      profile.postalCode,
    perfilCompleto:
      user.perfilCompleto ?? user.profileComplete ?? profile.perfilCompleto,
  });
};

const extractToken = (response) => {
  const body = response?.data ?? {};
  const payload = body?.data ?? body;
  const token =
    payload?.token ??
    payload?.accessToken ??
    payload?.access_token ??
    response?.headers?.authorization;

  return typeof token === "string"
    ? token.replace(/^Bearer\s+/i, "").trim()
    : null;
};

const mockLogin = async (email, password) => {
  if (email !== MOCK_USER.email || password !== MOCK_USER.password) {
    throw new Error("Credenciales inválidas");
  }

  const token = "mock-token";
  localStorage.setItem("ct_token", token);

  const user = normalizeUser(toPublicUser(MOCK_USER));
  persistUser(user);
  return { user, token };
};

const persistUser = (user) => {
  if (!user) return;
  try {
    localStorage.setItem("ct_user", JSON.stringify(user));
  } catch {
    // ignore
  }
};

const getCachedUser = () => {
  try {
    const raw = localStorage.getItem("ct_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const loginService = async (email, password) => {
  if (appConfig.mockAuth) {
    return mockLogin(email, password);
  }

  const response = await httpClient.post("/auth/login", { email, password });
  const token = extractToken(response);

  if (token) {
    localStorage.setItem("ct_token", token);
  }

  // El backend puede no tener /auth/me implementado todavía. Si falla,
  // usamos el usuario que viene en la respuesta de login como fallback.
  let user;
  try {
    user = await getCurrentUser();
  } catch {
    user = normalizeUser(response.data);
  }

  persistUser(user);
  return { user, token };
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

export const persistBearerFromUrl = () => {
  const url = new URL(window.location.href);
  const hashParams = new URLSearchParams(url.hash.replace(/^#\??/, ""));
  const tokenParam = ["token", "access_token", "bearer"].find(
    (param) => url.searchParams.has(param) || hashParams.has(param),
  );

  if (!tokenParam) {
    return null;
  }

  const rawToken =
    url.searchParams.get(tokenParam) ?? hashParams.get(tokenParam) ?? "";
  const token = rawToken.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    return null;
  }

  localStorage.setItem("ct_token", token);
  url.searchParams.delete(tokenParam);
  hashParams.delete(tokenParam);
  url.hash = hashParams.toString();
  window.history.replaceState({}, document.title, url.toString());

  return token;
};

// URL a la que se redirige el navegador para iniciar el flujo de Google OAuth.
export const googleAuthUrl = `${appConfig.apiUrl}/auth/google`;

export const getCurrentUser = async () => {
  if (appConfig.mockAuth) {
    return normalizeUser(toPublicUser(MOCK_USER));
  }

  try {
    const response = await httpClient.get("/auth/me");
    const user = normalizeUser(response.data);
    persistUser(user);
    return user;
  } catch {
    // El backend puede no tener /auth/me implementado todavía.
    // Usamos el usuario cacheado del último login como fallback.
    return getCachedUser();
  }
};

export const updateCurrentUser = async (profile) => {
  if (appConfig.mockAuth) {
    return { ...toPublicUser(MOCK_USER), ...profile };
  }

  const response = await httpClient.patch("/auth/me", {
    phone: profile.telefono,
    documentType: profile.tipoDocumento,
    documentNumber: profile.documento,
  });
  return normalizeUser(response.data);
};
export default loginService;