/**
 * Dencker Pan — Utilidad de Geocerca GPS y Cálculo de Distancias
 * Fórmula Haversine de precisión para control de asistencia por radio de metros
 */

import { GeocercaConfig, TipoMarcadoAsistencia, EstadoPuntualidad } from "@/types";

// Configuración por defecto: Dencker Pan en Av. Daniel Salamanca, Cochabamba
export const DEFAULT_GEOCERCA_CONFIG: GeocercaConfig = {
  local_nombre: "Dencker Pan — Casa Matriz",
  direccion: "Av. Daniel Salamanca, Cochabamba, Bolivia",
  latitud: -17.38953,
  longitud: -66.15682,
  radio_metros: 60, // 60 metros de radio de tolerancia perimetral
  hora_inicio_turno_manana: "07:00",
  hora_inicio_turno_tarde: "14:30",
  tolerancia_minutos: 15,
  bloquear_fuera_de_radio: true,
};

/**
 * Calcula la distancia en metros entre dos puntos geográficos (Haversine)
 */
export function calcularDistanciaMetros(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Radio de la Tierra en metros
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Obtiene la posición GPS actual del navegador con alta precisión
 */
export async function getGPSPosition(): Promise<{
  lat: number;
  lon: number;
  accuracy: number;
}> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      return reject(new Error("La geolocalización no está soportada en este navegador."));
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy || 0),
        });
      },
      (err) => {
        let msg = "No se pudo obtener la ubicación GPS.";
        if (err.code === 1) {
          msg = "Permiso de ubicación denegado. Por favor, habilita el GPS en tu navegador o celular.";
        } else if (err.code === 2) {
          msg = "Posición no disponible. Asegúrate de tener encendido el GPS.";
        } else if (err.code === 3) {
          msg = "Tiempo de espera agotado buscando señal GPS.";
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 10000,
      }
    );
  });
}

/**
 * Determina el estado de puntualidad comparando la hora actual con el turno
 */
export function evaluarPuntualidad(
  horaActualStr: string, // "HH:MM"
  tipo: TipoMarcadoAsistencia,
  config: GeocercaConfig
): EstadoPuntualidad {
  if (tipo === "salida") {
    return "salida_puntual";
  }

  if (tipo === "almuerzo_inicio" || tipo === "almuerzo_fin") {
    return "a_tiempo";
  }

  // Comparar con turno de mañana o tarde
  const [hActual, mActual] = horaActualStr.split(":").map(Number);
  const minutosActuales = hActual * 60 + mActual;

  const [hManana, mManana] = config.hora_inicio_turno_manana.split(":").map(Number);
  const minutosManana = hManana * 60 + mManana;

  const [hTarde, mTarde] = config.hora_inicio_turno_tarde.split(":").map(Number);
  const minutosTarde = hTarde * 60 + mTarde;

  // Determinar turno más cercano
  const difManana = Math.abs(minutosActuales - minutosManana);
  const difTarde = Math.abs(minutosActuales - minutosTarde);

  const minutosTurno = difManana <= difTarde ? minutosManana : minutosTarde;
  const limiteConTolerancia = minutosTurno + config.tolerancia_minutos;

  if (minutosActuales <= limiteConTolerancia) {
    return "a_tiempo";
  } else {
    return "tardanza";
  }
}

