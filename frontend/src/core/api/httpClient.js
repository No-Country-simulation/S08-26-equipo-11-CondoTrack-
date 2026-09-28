import axios from "axios";

import { appConfig } from "@/core/config/env";

const httpClient = axios.create({
  baseURL: appConfig.apiUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },

});

httpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("ct_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url ?? "";

    const isAuthRequest = /^\/auth\/(login|me|logout|register)/.test(
      requestUrl,
    );

    const isAuthPage = [
      "/login",
      "/auth/callback",
    ].includes(window.location.pathname);

    if (
      error.response?.status === 401 &&
      !isAuthRequest &&
      !isAuthPage
    ) {
      console.warn(
        "No autorizado. Redirigiendo a la página de inicio de sesión.",
      );

      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default httpClient;
