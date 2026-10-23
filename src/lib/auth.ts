"use client";

export type StaffRole = "admin" | "mesero" | "cocina" | "caja";

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
    nombre: "Equipo de Sala",
    pin: "1111",
    cargo: "Mesero de Salón & Terraza",
  },
  cocina: {
    id: "user-cocina",
    role: "cocina",
    nombre: "Jefe de Cocina & Barismo",
    pin: "2222",
    cargo: "Horno & Estaciones KDS",
  },
  caja: {
    id: "user-caja",
    role: "caja",
    nombre: "Cajero de Turno",
    pin: "3333",
    cargo: "Caja POS & Cobros",
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

export function saveStaffSession(role: StaffRole): StaffSession {
  const user = STAFF_USERS[role];
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

export function checkPinForRole(role: StaffRole, pin: string): boolean {
  const target = STAFF_USERS[role];
  return target && target.pin === pin.trim();
}
