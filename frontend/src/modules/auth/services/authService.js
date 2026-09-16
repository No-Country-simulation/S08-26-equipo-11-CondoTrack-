import httpClient from "@/core/api/httpClient";

const loginService = async (email, password) => {
  const response = await httpClient.post("/auth/login", { email, password });
  const { token } = response.data;

  if (token) {
    localStorage.setItem("ct_token", token);
  }

  return response.data;
};

export default loginService;
