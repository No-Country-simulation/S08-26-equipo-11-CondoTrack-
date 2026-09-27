const apiUrl = import.meta.env.VITE_API_URL;

export const appConfig = {
  apiUrl: apiUrl ?? "http://localhost:3000/api",
  // TODO: quitar cuando el backend entregue GET /auth/me (previsto la próxima semana).
  mockAuth: import.meta.env.VITE_MOCK_AUTH === "true",
};
