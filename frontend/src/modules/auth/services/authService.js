import httpClient from "@/core/api/httpClient";
import { appConfig } from "@/core/config/env";

/**
 * Elimina información sensible antes de guardar el usuario
 * en localStorage.
 */
const toPublicUser = (user) => {
  const publicUser = { ...user };

  delete publicUser.password;

  return publicUser;
};

/**
 * Determina si el perfil del usuario está completo.
 *
 * Prioridad:
 * 1. profileComplete / perfilCompleto enviado por backend.
 * 2. Validación de los campos mínimos del perfil.
 */
export const isProfileComplete = (user) => {
  if (!user) {
    return false;
  }

  if (user.perfilCompleto === true || user.profileComplete === true) {
    return true;
  }

  const telefono = user.telefono ?? user.phone;

  const tipoDocumento = user.tipoDocumento ?? user.documentType;

  const documento = user.documento ?? user.documentNumber ?? user.dni;

  return [telefono, tipoDocumento, documento].every(
    (value) => String(value ?? "").trim().length > 0,
  );
};

/**
 * Los roles del backend pueden venir como:
 *
 * "ADMIN"
 *
 * o:
 *
 * {
 *   roleId,
 *   buildingId,
 *   roleName
 * }
 *
 * El frontend utiliza `role` como string.
 */
const roleName = (entry) =>
  typeof entry === "string" ? entry : (entry?.roleName ?? entry?.name);

/**
 * Normaliza el usuario recibido desde cualquier endpoint
 * de autenticación.
 *
 * Soporta diferentes estructuras:
 *
 * data.user
 * data
 * user.profile
 * user.perfil
 * user.person
 */
const normalizeUser = (payload) => {
  const body = payload?.data ?? payload ?? {};

  const user = body?.user ?? body ?? {};

  /**
   * El backend puede llamar a esta información:
   *
   * profile
   * perfil
   * person
   */
  const profile = user.profile ?? user.perfil ?? user.person ?? {};

  return toPublicUser({
    ...user,
    ...profile,

    /**
     * Nombre
     */
    nombre:
      user.nombre ?? user.firstName ?? profile.nombre ?? profile.firstName,

    /**
     * Apellido
     */
    apellido:
      user.apellido ?? user.lastName ?? profile.apellido ?? profile.lastName,

    /**
     * Teléfono
     */
    telefono: user.telefono ?? user.phone ?? profile.telefono ?? profile.phone,

    /**
     * Documento
     */
    documento:
      user.documento ??
      user.documentNumber ??
      user.dni ??
      profile.documento ??
      profile.documentNumber ??
      profile.dni,

    /**
     * Tipo de documento
     */
    tipoDocumento:
      user.tipoDocumento ??
      user.documentType ??
      profile.tipoDocumento ??
      profile.documentType,

    /**
     * Código postal
     */
    codigoPostal:
      user.codigoPostal ??
      user.codigo_postal ??
      user.postalCode ??
      profile.codigoPostal ??
      profile.codigo_postal ??
      profile.postalCode,

    /**
     * Estado de perfil.
     *
     * Soporta:
     * - perfilCompleto
     * - profileComplete
     * tanto en User como en Person/Profile.
     */
    perfilCompleto:
      user.perfilCompleto ??
      user.profileComplete ??
      profile.perfilCompleto ??
      profile.profileComplete,

    /**
     * El backend devuelve `roles` como array.
     *
     * El frontend utiliza:
     *
     * user.role
     */
    role:
      roleName(user.role) ??
      roleName(user.rol) ??
      roleName(profile.role) ??
      roleName(user.roles?.[0]) ??
      roleName(profile.roles?.[0]),
  });
};

/**
 * Extrae el token de diferentes respuestas posibles
 * del backend.
 */
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

/**
 * Guarda el usuario actual en localStorage.
 */
const persistUser = (user) => {
  if (!user) {
    return;
  }

  try {
    localStorage.setItem("ct_user", JSON.stringify(user));
  } catch {
    // ignore
  }
};

/**
 * Obtiene el usuario guardado localmente.
 */
const getCachedUser = () => {
  try {
    const raw = localStorage.getItem("ct_user");

    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * Login
 */
const loginService = async (email, password) => {
  const response = await httpClient.post("/auth/login", {
    email,
    password,
  });

  const token = extractToken(response);

  if (token) {
    localStorage.setItem("ct_token", token);
  }

  let user;

  try {
    user = (await getCurrentUser()) ?? normalizeUser(response.data);
  } catch {
    user = normalizeUser(response.data);
  }

  persistUser(user);

  return {
    user,
    token,
  };
};

/**
 * Registro público.
 *
 * El backend crea al usuario con rol RESIDENT
 * y lo vincula al edificio.
 */
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

/**
 * Obtiene un token enviado por URL.
 *
 * Compatible con:
 *
 * ?token=...
 * ?access_token=...
 * #token=...
 * #access_token=...
 */
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

/**
 * URL de autenticación con Google.
 */
export const googleAuthUrl = `${appConfig.apiUrl}/auth/google`;

/**
 * Logout
 */
export const logoutService = async () => {
  try {
    await httpClient.post("/auth/logout");
  } catch {
    // ignore
  }

  localStorage.removeItem("ct_token");

  localStorage.removeItem("ct_user");
};

/**
 * Obtiene el usuario actualmente autenticado.
 *
 * `force = true` se utiliza especialmente
 * después de OAuth cuando la sesión puede existir
 * mediante cookie httpOnly.
 */
export const getCurrentUser = async (force = false) => {
  /**
   * Si no existe token, utilizamos el usuario
   * cacheado.
   */
  if (!force && !localStorage.getItem("ct_token")) {
    return getCachedUser();
  }

  try {
    const response = await httpClient.get("/auth/me");

    const user = normalizeUser(response.data);

    persistUser(user);

    return user;
  } catch (error) {
    console.error("GET /auth/me failed:", error);

    /**
     * Si /auth/me falla, usamos el último
     * usuario conocido.
     */
    return getCachedUser();
  }
};

/**
 * Actualiza el perfil del usuario autenticado.
 */
export const updateCurrentUser = async (profile) => {
  const response = await httpClient.patch("/auth/me", {
    ...(profile.nombre?.trim()
      ? {
          firstName: profile.nombre.trim(),
        }
      : {}),

    ...(profile.apellido?.trim()
      ? {
          lastName: profile.apellido.trim(),
        }
      : {}),

    phone: profile.telefono,

    documentType: profile.tipoDocumento,

    documentNumber: profile.documento,
  });

  /**
   * Normalizamos la respuesta.
   */
  const user = normalizeUser(response.data);

  /**
   * MUY IMPORTANTE:
   *
   * Actualizamos también el usuario
   * almacenado localmente.
   */
  persistUser(user);

  return user;
};

export default loginService;
