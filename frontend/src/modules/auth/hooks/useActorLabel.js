import { useAuth } from "@/modules/auth/contexts/AuthContext";

export const useActorLabel = () => {
  const { user } = useAuth();
  if (!user) return "Sistema";
  const fullName = `${user.nombre ?? ""} ${user.apellido ?? ""}`.trim();
  return fullName || user.email || "Sistema";
};
