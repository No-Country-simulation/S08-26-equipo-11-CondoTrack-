import httpClient from "@/core/api/httpClient";
import { appConfig } from "@/core/config/env";

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
    // El backend devuelve `roles` (array); el frontend usa `role` (singular).
    role:
      user.role ??
      user.rol ??
      profile.role ??
      user.roles?.[0] ??
      profile.roles?.[0],
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
  const response = await httpClient.post("/auth/login", { email, password });
  const token = extractToken(response);

  if (token) {
    localStorage.setItem("ct_token", token);
  }

  // El backend puede no tener /auth/me implementado todavía. Si falla
  // o devuelve null, usamos el usuario que viene en la respuesta de
  // login como fallback (getCurrentUser no lanza: retorna cacheado).
  let user;
  try {
    user = (await getCurrentUser()) ?? normalizeUser(response.data);
  } catch {
    user = normalizeUser(response.data);
  }

  persistUser(user);


  return { user, token };
};

// Alta pública: el backend crea al usuario con rol RESIDENT vinculado al
// buildingId indicado. Los demás roles los asigna un SUPER_ADMIN/ADMIN.
export const registerService = async ({
  nombre,
  apellido,
  tipoDocumento,
  documento,
  telefono,
  email,
  password,
  buildingId,
}) => {
  const response = await httpClient.post("/auth/register", {
    firstName: nombre?.trim(),
    lastName: apellido?.trim(),
    documentType: tipoDocumento,
    documentNumber: String(documento ?? "").trim(),
    phone: telefono?.trim(),
    email: email?.trim(),
    password,
    buildingId: buildingId?.trim(),
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

export const logoutService = async () => {
  // Best effort: avisa al backend para que invalide la sesión
  // (necesario cuando la sesión vive en cookie httpOnly de Google).
  try {
    await httpClient.post("/auth/logout");
  } catch {
    // ignore: igual limpiamos la sesión local abajo
  }

  localStorage.removeItem("ct_token");
  localStorage.removeItem("ct_user");
};

export const getCurrentUser = async (force = false) => {
  // Sin token no hay sesión que validar: evitamos el GET /auth/me
  // que el backend responde con 401 y solo mete ruido en consola.
  // `force` se usa en el callback de Google, donde la sesión puede
  // venir por cookie httpOnly (withCredentials) sin token en la URL.
  if (!force && !localStorage.getItem("ct_token")) {
    return getCachedUser();
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
  const response = await httpClient.patch("/auth/me", {
    phone: profile.telefono,
    documentType: profile.tipoDocumento,
    documentNumber: profile.documento,
  });
  return normalizeUser(response.data);
};
export default loginService;