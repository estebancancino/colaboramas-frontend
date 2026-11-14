import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "../../src/hooks/useUser";
import { useAuth } from "../../src/hooks/useAuth";
import { getHomeRoute, getRoleNames } from "../../src/utils/roles";

export default function RoleRouter() {
  const router = useRouter();
  const { user } = useUser();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    console.log("[RoleRouter] Render:", { loading, isAuthenticated, user });

    if (loading) return;

    if (!isAuthenticated) {
      console.log("[RoleRouter] Not authenticated → redirect to login");
      router.replace("/auth/login");
      return;
    }

    if (!user) {
      console.log("[RoleRouter] User not loaded yet...");
      return;
    }

    // Antes funcionaba por casualidad (buscaba "ACADEMICO" dentro del JSON del rol)
    const home = getHomeRoute(user.roles);
    console.log("[RoleRouter] Roles:", getRoleNames(user.roles), "→", home);
    router.replace(home);
  }, [user, isAuthenticated, loading]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F6F6F6" }}>
      <ActivityIndicator size="large" color="#6B31E8" />
    </View>
  );
}
