// ==============================================================================
// DENCKER PAN — UTILIDADES TRIBUTARIAS SIAT (Impuestos Nacionales de Bolivia)
// Conforme a la RND 102100000011 del Servicio de Impuestos Nacionales (SIN)
// ==============================================================================

import { FacturaEmitida, FacturacionSiatConfig } from "@/types";

/**
 * Convierte un monto numérico a su expresión literal en Bolivianos
 * Formato oficial: "Son: Cuarenta y Cinco 50/100 Bolivianos"
 */
export function convertirNumeroALiteral(monto: number): string {
  if (isNaN(monto) || monto < 0) return "Son: Cero 00/100 Bolivianos";

  const entero = Math.floor(monto);
  const centavos = Math.round((monto - entero) * 100);
  const centavosStr = centavos.toString().padStart(2, "0");

  if (entero === 0) {
    return `Son: Cero ${centavosStr}/100 Bolivianos`;
  }

  const UNIDADES = [
    "",
    "Un",
    "Dos",
    "Tres",
    "Cuatro",
    "Cinco",
    "Seis",
    "Siete",
    "Ocho",
    "Nueve",
  ];
  const DECENAS = [
    "",
    "Diez",
    "Veinte",
    "Treinta",
    "Cuarenta",
    "Cincuenta",
    "Sesenta",
    "Setenta",
    "Ochenta",
    "Noventa",
  ];
  const ESPECIALES: Record<number, string> = {
    11: "Once",
    12: "Doce",
    13: "Trece",
    14: "Catorce",
    15: "Quince",
    16: "Dieciséis",
    17: "Diecisiete",
    18: "Dieciocho",
    19: "Diecinueve",
    21: "Veintiún",
    22: "Veintidós",
    23: "Veintitrés",
    24: "Veinticuatro",
    25: "Veinticinco",
    26: "Veintiséis",
    27: "Veintisiete",
    28: "Veintiocho",
    29: "Veintinueve",
  };
  const CENTENAS = [
    "",
    "Ciento",
    "Doscientos",
    "Trescientos",
    "Cuatrocientos",
    "Quinientos",
    "Seiscientos",
    "Setecientos",
    "Ochocientos",
    "Novecientos",
  ];

  function convertirCentenas(n: number): string {
    if (n === 100) return "Cien";
    const c = Math.floor(n / 100);
    const d = Math.floor((n % 100) / 10);
    const u = n % 10;
    const du = n % 100;

    let res = "";
    if (c > 0) res += CENTENAS[c] + " ";

    if (ESPECIALES[du]) {
      res += ESPECIALES[du];
    } else {
      if (d > 0) {
        res += DECENAS[d];
        if (u > 0) res += " y " + UNIDADES[u];
      } else if (u > 0) {
        res += UNIDADES[u];
      }
    }
    return res.trim();
  }

  function convertirMiles(n: number): string {
    if (n < 1000) return convertirCentenas(n);
    const miles = Math.floor(n / 1000);
    const resto = n % 1000;
    let res = "";
    if (miles === 1) {
      res = "Mil";
    } else {
      res = convertirCentenas(miles) + " Mil";
    }
    if (resto > 0) {
      res += " " + convertirCentenas(resto);
    }
    return res.trim();
  }

  const literalEntero = convertirMiles(entero);
  return `Son: ${literalEntero} ${centavosStr}/100 Bolivianos`;
}

/**
 * Algoritmo Módulo 11 oficial del SIN Bolivia para generación de CUF
 */
export function calcularDigitoModulo11(cadena: string): number {
  let mult = 2;
  let suma = 0;
  for (let i = cadena.length - 1; i >= 0; i--) {
    suma += parseInt(cadena[i], 10) * mult;
    mult = mult < 9 ? mult + 1 : 2;
  }
  const mod = suma % 11;
  if (mod === 0) return 0;
  if (mod === 1) return 1;
  return 11 - mod;
}

/**
 * Convierte un número grande o cadena decimal a Base 16 Hexadecimal en mayúsculas
 */
function decimalToHex(strDecimal: string): string {
  let hex = "";
  let num = BigInt(strDecimal);
  const zero = BigInt(0);
  const sixteen = BigInt(16);
  while (num > zero) {
    const rem = num % sixteen;
    hex = rem.toString(16).toUpperCase() + hex;
    num = num / sixteen;
  }
  return hex || "0";
}

/**
 * Genera el CUF (Código Único de Factura) reglamentario del SIN
 */
export function generarCufSiat({
  nitEmisor,
  fechaHora,
  sucursal = 0,
  modalidad = 1,
  tipoEmision = 1,
  tipoFactura = 1,
  documentoSector = 1,
  numeroFactura,
  puntoVenta = 0,
}: {
  nitEmisor: string;
  fechaHora: Date;
  sucursal?: number;
  modalidad?: number;
  tipoEmision?: number;
  tipoFactura?: number;
  documentoSector?: number;
  numeroFactura: number;
  puntoVenta?: number;
}): string {
  // Formato fecha: YYYYMMDDHHmmssSSS
  const pad = (n: number, l: number) => n.toString().padStart(l, "0");
  const y = fechaHora.getFullYear();
  const m = pad(fechaHora.getMonth() + 1, 2);
  const d = pad(fechaHora.getDate(), 2);
  const h = pad(fechaHora.getHours(), 2);
  const min = pad(fechaHora.getMinutes(), 2);
  const s = pad(fechaHora.getSeconds(), 2);
  const ms = pad(fechaHora.getMilliseconds(), 3);
  const fechaStr = `${y}${m}${d}${h}${min}${s}${ms}`;

  const nitStr = nitEmisor.replace(/\D/g, "").padStart(13, "0");
  const sucStr = sucursal.toString().padStart(4, "0");
  const modStr = modalidad.toString();
  const emiStr = tipoEmision.toString();
  const facStr = tipoFactura.toString();
  const secStr = documentoSector.toString().padStart(2, "0");
  const nroStr = numeroFactura.toString().padStart(10, "0");
  const posStr = puntoVenta.toString().padStart(4, "0");

  const baseNumerica = `${nitStr}${fechaStr}${sucStr}${modStr}${emiStr}${facStr}${secStr}${nroStr}${posStr}`;
  const digitoVerificador = calcularDigitoModulo11(baseNumerica);
  const cadenaConDv = `${baseNumerica}${digitoVerificador}`;

  return decimalToHex(cadenaConDv);
}

/**
 * Genera el QR reglamentario del SIN o utiliza el link de la contadora
 */
export function generarUrlQrSiat({
  config,
  factura,
}: {
  config: FacturacionSiatConfig;
  factura: {
    numeroFactura: number;
    cuf: string;
    fechaEmision: string;
    montoTotal: number;
    clienteNitCi: string;
  };
}): string {
  // Si la contadora proporcionó un enlace base personalizado, lo usamos
  const baseUrl = config.linkContadora?.trim() || config.linkImpuestos?.trim() || "https://siat.impuestos.gob.bo/consulta/QR";

  const nitEmisor = config.nitEmisor.replace(/\D/g, "");
  const cuf = factura.cuf;
  const nro = factura.numeroFactura;
  const t = 1; // online

  if (baseUrl.includes("?")) {
    return `${baseUrl}&nit=${nitEmisor}&cuf=${cuf}&numero=${nro}&t=${t}`;
  }
  return `${baseUrl}?nit=${nitEmisor}&cuf=${cuf}&numero=${nro}&t=${t}`;
}

/**
 * Parsea el link o token que la contadora envía periódicamente
 */
export function parsearLinkContadora(input: string): Partial<FacturacionSiatConfig> {
  const result: Partial<FacturacionSiatConfig> = {
    linkContadora: input.trim(),
  };

  try {
    if (input.includes("http://") || input.includes("https://")) {
      const url = new URL(input);
      const nit = url.searchParams.get("nit");
      const cuf = url.searchParams.get("cuf") || url.searchParams.get("cufd");
      const punto = url.searchParams.get("punto") || url.searchParams.get("pv");

      if (nit) result.nitEmisor = nit;
      if (cuf) result.cufd = cuf;
      if (punto) result.codigoPuntoVenta = parseInt(punto, 10);
      result.linkImpuestos = input.trim();
    } else if (input.length > 20) {
      // Es un token alfanumérico directo de la contadora
      result.tokenSiat = input.trim();
      result.cufd = input.trim();
    }
  } catch {
    // Si no es URL estándar, se guarda como enlace o token textual
    result.tokenSiat = input.trim();
  }

  return result;
}

/**
 * Exporta el Libro de Ventas IVA oficial (Formato LCV del SIN Bolivia) en CSV
 * para enviar a la contadora a fin de mes
 */
export function exportarLibroVentasCsv(facturas: FacturaEmitida[], config: FacturacionSiatConfig): string {
  const headers = [
    "N°",
    "FECHA DE LA FACTURA",
    "N° DE LA FACTURA",
    "N° DE AUTORIZACIÓN / CUF",
    "ESTADO",
    "NIT / CI CLIENTE",
    "COMPLEMENTO",
    "NOMBRE O RAZÓN SOCIAL",
    "IMPORTE TOTAL DE LA VENTA",
    "IMPORTE ICE",
    "IMPORTE IEHD",
    "IMPORTE IPJ",
    "TASAS",
    "OTRO NO SUJETO A DF",
    "EXPORTACIONES Y OPERACIONES EXENTAS",
    "VENTAS GRAVADAS TASA CERO",
    "SUBTOTAL",
    "DESCUENTOS / BONIFICACIONES",
    "IMPORTE BASE PARA DÉBITO FISCAL",
    "DÉBITO FISCAL",
    "CÓDIGO DE CONTROL",
  ];

  const rows = facturas.map((f, idx) => {
    const fecha = new Date(f.fechaEmision);
    const fechaFormateada = `${fecha.getDate().toString().padStart(2, "0")}/${(fecha.getMonth() + 1).toString().padStart(2, "0")}/${fecha.getFullYear()}`;
    const total = f.montoTotal.toFixed(2);
    const debitoFiscal = (f.montoTotal * 0.13).toFixed(2);
    const estado = f.estado === "anulada" ? "A" : "V";

    return [
      idx + 1,
      fechaFormateada,
      f.numeroFactura,
      f.cuf,
      estado,
      f.clienteNitCi,
      f.clienteComplemento || "",
      `"${f.clienteNombre.replace(/"/g, '""')}"`,
      total,
      "0.00",
      "0.00",
      "0.00",
      "0.00",
      "0.00",
      "0.00",
      "0.00",
      total,
      "0.00",
      total,
      debitoFiscal,
      f.codigoControl || "0",
    ].join(";");
  });

  return [headers.join(";"), ...rows].join("\r\n");
}
