import { useRouter } from "expo-router";
import { useAuth } from "./useAuth";

export const useLogout = () => {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Borra token, usuario y header Authorization
      await signOut();

      // navegar al login reseteando stack
      router.replace("/auth/login");
    } catch (e) {
      console.error("Error al cerrar sesión:", e);
    }
  };

  return { handleLogout };
};
