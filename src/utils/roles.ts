// /auth/me y /admin/users devuelven los roles como objetos ({ id, roleName, permissionEntities });
// estas funciones aceptan también strings para no depender de la forma exacta.

export const ASSIGNABLE_ROLES = ["ACADEMICO", "COMUNICADOR", "ADMIN"] as const;
export type RoleName = (typeof ASSIGNABLE_ROLES)[number];

const roleToName = (role: unknown): string => {
  if (!role) return "";
  if (typeof role === "string") return role.toUpperCase();
  if (typeof role === "object") {
    const r = role as Record<string, unknown>;
    const name = r.roleName ?? r.name;
    return name ? String(name).toUpperCase() : "";
  }
  return String(role).toUpperCase();
};

/** Nombres de rol en mayúsculas, p. ej. ["ACADEMICO"]. */
export const getRoleNames = (roles: unknown): string[] =>
  (Array.isArray(roles) ? roles : [roles]).map(roleToName).filter(Boolean);

/** Primer rol del usuario (los usuarios tienen un solo rol). */
export const getPrimaryRole = (roles: unknown): string => getRoleNames(roles)[0] ?? "";

/** Pantalla de inicio según el rol. */
export const getHomeRoute = (roles: unknown) => {
  const names = getRoleNames(roles);
  if (names.includes("ADMIN")) return "/admin" as const;
  if (names.includes("ACADEMICO")) return "/academico" as const;
  if (names.includes("COMUNICADOR")) return "/comunicador" as const;
  return "/auth/login" as const;
};
