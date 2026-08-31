import type { UserNormalizado } from "../context/auth/types/authTypes";

export function nombreDeUsuario(user?: UserNormalizado | null) {
  const nombres = user?.nombres?.trim() || user?.nombre?.trim() || "";
  const apellidos = user?.apellidos?.trim() || "";
  const completo = `${nombres} ${apellidos}`.trim();
  if (completo) return completo;
  if (user?.email) return user.email.split("@")[0];
  return "usuario";
}

export function primerNombre(user?: UserNormalizado | null) {
  return nombreDeUsuario(user).split(/\s+/)[0] || "usuario";
}

export function inicialesDeUsuario(user?: UserNormalizado | null) {
  const nombre = nombreDeUsuario(user);
  const partes = nombre.split(/\s+/).filter(Boolean);
  if (partes.length >= 2) {
    return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
  }
  return nombre.slice(0, 2).toUpperCase();
}

export function etiquetaPerfil(perfil?: string | null) {
  switch (perfil?.toLowerCase()) {
    case "administrador":
      return "Administrador";
    case "admin_sistema":
      return "Admin de centro";
    case "funcionario":
      return "Funcionario";
    case "aprendiz":
      return "Aprendiz";
    default:
      return perfil || "Usuario";
  }
}
