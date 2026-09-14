export const PERFIL_ADMIN_SISTEMA = "admin_sistema";

export function esAdminSistema(perfil?: string | null) {
  return perfil === PERFIL_ADMIN_SISTEMA;
}

export function esFuncionario(perfil?: string | null) {
  return perfil?.toLowerCase() === "funcionario";
}

export function esAprendiz(perfil?: string | null) {
  return perfil?.toLowerCase() === "aprendiz";
}

export function esAdministradorRed(perfil?: string | null) {
  return perfil?.toLowerCase() === "administrador";
}

export function esColaborador(perfil?: string | null) {
  return perfil?.toLowerCase() === "colaborador";
}

/** Funcionario o admin_sistema: viven en UN centro. */
export function esRolDeCentro(perfil?: string | null) {
  return esAdminSistema(perfil) || esFuncionario(perfil) || esColaborador(perfil);
}

/** Mismo panel visual para red, centro, funcionario y aprendiz. */
export function usaTemaAdmin(perfil?: string | null) {
  return esAdministradorRed(perfil) || esRolDeCentro(perfil) || esAprendiz(perfil);
}
