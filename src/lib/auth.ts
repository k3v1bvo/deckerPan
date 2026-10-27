"use client";

import { StaffRole, UsuarioStaff } from "@/types";
import { useSystemStore } from "@/store";

export type { StaffRole, UsuarioStaff };

export interface StaffUser {
  id: string;
  role: StaffRole;
  nombre: string;
  pin: string;
  cargo: string;
}

export interface StaffSession {
  user: StaffUser;
  loggedAt: string;
}

export const STAFF_USERS: Record<StaffRole, StaffUser> = {
  admin: {
    id: "user-admin",
    role: "admin",
    nombre: "Gerencia Dencker Pan",
    pin: "2024",
    cargo: "Administrador General",
  },
  mesero: {
    id: "user-mesero",
    role: "mesero",
    nombre: "Mateo Arce",
    pin: "1111",
    cargo: "Mesero de Salón & Terraza",
  },
  cocina: {
    id: "user-cocina",
    role: "cocina",
    nombre: "Rodrigo Morales",
    pin: "2222",
    cargo: "Jefe de Horno & Barismo",
  },
  caja: {
    id: "user-caja",
    role: "caja",
    nombre: "Valeria Quiroga",
    pin: "3333",
    cargo: "Cajera de Turno & POS",
  },
};

const STORAGE_KEY = "dencker_staff_session";

export function getStaffSession(): StaffSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveStaffSession(role: StaffRole, specificUser?: StaffUser): StaffSession {
  const user = specificUser || STAFF_USERS[role];
  const session: StaffSession = {
    user,
    loggedAt: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }
  return session;
}

export function clearStaffSession(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/**
 * Busca dinámicamente un usuario colaborador por su PIN de 4 dígitos.
 * Revisa primero el store activo de cuentas creadas por el Admin.
 */
export function findStaffUserByPin(pin: string): StaffUser | null {
  const p = pin.trim();

  // 1. PIN maestro de Gerencia
  if (p === "2024" || p === "2026" || p === "9900") {
    return STAFF_USERS.admin;
  }

  // 2. Consulta en el store reactivo de colaboradores
  try {
    const staffList = useSystemStore.getState().usuariosStaff;
    if (staffList && staffList.length > 0) {
      const match = staffList.find((u) => u.activo && u.pin.trim() === p);
      if (match) {
        return {
          id: match.id,
          role: match.role,
          nombre: match.nombre,
          pin: match.pin,
          cargo: match.cargo,
        };
      }
    }
  } catch {
    // Si el store aún no inicializó en SSR
  }

  // 3. Fallbacks de respaldo iniciales
  if (p === "1111" || p === "1122") return STAFF_USERS.mesero;
  if (p === "2222" || p === "3344") return STAFF_USERS.cocina;
  if (p === "3333" || p === "5566") return STAFF_USERS.caja;

  return null;
}

export function checkPinForRole(role: StaffRole, pin: string): boolean {
  const p = pin.trim();

  // El PIN maestro de Gerencia permite el acceso a cualquier estación operativa
  if (p === "2024" || p === "2026" || p === "9900") return true;

  // Busca el usuario por su PIN
  const user = findStaffUserByPin(p);
  if (!user) return false;

  // Los administradores tienen acceso universal a cualquier estación
  if (user.role === "admin") return true;

  // Usuarios estándar solo pueden entrar a su rol asignado
  return user.role === role;
}

export function resolveRoleForPin(targetRole: StaffRole, pin: string): StaffRole {
  const user = findStaffUserByPin(pin);
  if (user) {
    return user.role;
  }
  const p = pin.trim();
  if (p === "2024" || p === "2026" || p === "9900") {
    return "admin";
  }
  return targetRole;
}
