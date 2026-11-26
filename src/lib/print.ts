// ==============================================================================
// DENCKER PAN — MOTOR DE IMPRESIÓN PROFESIONAL AISLADO (Tickets 80mm, Arqueos, QRs)
// Aísla estrictamente el documento objetivo en un Portal Dedicado (#dencker-print-portal)
// Oculta completamente la página web, barra de navegación, menús y fondos durante la impresión.
// Compatible al 100% con impresoras térmicas (80mm/58mm), impresoras láser, PDF y móviles.
// ==============================================================================

export interface PrintOptions {
  pageType?: "thermal" | "letter" | "a4" | "carpas";
  title?: string;
  closeAfterPrint?: boolean;
}

/**
 * Obtiene o crea el portal dedicado de impresión en el body del documento.
 */
function getOrCreatePrintPortal(): HTMLElement {
  let portal = document.getElementById("dencker-print-portal");
  if (!portal) {
    portal = document.createElement("div");
    portal.id = "dencker-print-portal";
    portal.className = "dencker-print-portal";
    document.body.appendChild(portal);
  }
  return portal;
}

/**
 * Genera las reglas CSS necesarias según el tipo de documento para inyectar en impresión.
 */
function getStylesForPageType(pageType: "thermal" | "letter" | "a4" | "carpas"): string {
  if (pageType === "thermal") {
    return `
      @page {
        size: 80mm auto;
        margin: 0;
      }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        color: #000000 !important;
        font-family: 'Courier New', Courier, monospace !important;
        font-size: 11px !important;
        line-height: 1.35 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      body {
        width: 74mm !important;
        max-width: 80mm !important;
        margin: 0 auto !important;
        padding: 3mm 2mm !important;
      }
      #dencker-print-portal {
        display: block !important;
        visibility: visible !important;
        width: 74mm !important;
        max-width: 80mm !important;
        margin: 0 auto !important;
        padding: 0 !important;
        background: #ffffff !important;
        color: #000000 !important;
      }
      .ticket-container, .ticket-termico, .ticket-80mm {
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        box-shadow: none !important;
        background: #ffffff !important;
        color: #000000 !important;
      }
      img {
        max-width: 65% !important;
        height: auto !important;
        margin: 0 auto 4px auto !important;
        display: block !important;
        filter: grayscale(100%) contrast(150%) !important;
      }
      svg {
        display: block !important;
        margin: 0 auto !important;
        max-width: 100% !important;
      }
      .border-dashed {
        border-top: 1px dashed #000000 !important;
      }
      .border-double {
        border-top: 3px double #000000 !important;
      }
      .border-solid {
        border-top: 1px solid #000000 !important;
      }
      .coupon-box {
        border: 1.5px dashed #000000 !important;
        padding: 6px !important;
        margin: 8px 0 !important;
        text-align: center !important;
        border-radius: 4px !important;
      }
      .tip-box {
        border: 1px dashed #333333 !important;
        padding: 6px !important;
        margin: 6px 0 !important;
        border-radius: 4px !important;
      }
      .seal-badge {
        border: 1px solid #000000 !important;
        padding: 2px 6px !important;
        border-radius: 4px !important;
        display: inline-block !important;
      }
      table {
        width: 100% !important;
        border-collapse: collapse !important;
      }
      th, td {
        padding: 2px 0 !important;
        font-size: 11px !important;
      }
      .font-mono {
        font-family: 'Courier New', Courier, monospace !important;
      }
      .font-serif {
        font-family: Georgia, 'Times New Roman', serif !important;
      }
      .font-sans {
        font-family: system-ui, -apple-system, sans-serif !important;
      }
      .text-center { text-align: center !important; }
      .text-right { text-align: right !important; }
      .text-left { text-align: left !important; }
      .font-bold, .font-black { font-weight: bold !important; }
      .font-semibold { font-weight: 600 !important; }
      .font-medium { font-weight: 500 !important; }
      .font-normal { font-weight: normal !important; }
      .italic { font-style: italic !important; }
      .uppercase { text-transform: uppercase !important; }
      .capitalize { text-transform: capitalize !important; }
      .tracking-tight { letter-spacing: -0.025em !important; }
      .tracking-wide { letter-spacing: 0.025em !important; }
      .tracking-wider { letter-spacing: 0.05em !important; }
      .tracking-widest { letter-spacing: 0.1em !important; }
      .leading-none { line-height: 1 !important; }
      .leading-tight { line-height: 1.25 !important; }
      .text-lg { font-size: 16px !important; }
      .text-base { font-size: 14px !important; }
      .text-sm { font-size: 12px !important; }
      .text-xs { font-size: 10.5px !important; }
      .text-\\[11px\\] { font-size: 11px !important; }
      .text-\\[10px\\] { font-size: 10px !important; }
      .text-\\[9px\\] { font-size: 9px !important; }
      .text-\\[8px\\] { font-size: 8px !important; }
      .flex { display: flex !important; }
      .inline-flex { display: inline-flex !important; }
      .justify-between { justify-content: space-between !important; }
      .justify-center { justify-content: center !important; }
      .items-center { align-items: center !important; }
      .items-start { align-items: flex-start !important; }
      .flex-col { flex-direction: column !important; }
      .flex-1 { flex: 1 1 0% !important; }
      .shrink-0 { flex-shrink: 0 !important; }
      .gap-0\\.5 { gap: 2px !important; }
      .gap-1 { gap: 4px !important; }
      .gap-1\\.5 { gap: 6px !important; }
      .gap-2 { gap: 8px !important; }
      .gap-3 { gap: 12px !important; }
      .p-1 { padding: 4px !important; }
      .p-1\\.5 { padding: 6px !important; }
      .p-2 { padding: 8px !important; }
      .py-0\\.5 { padding-top: 2px !important; padding-bottom: 2px !important; }
      .py-1 { padding-top: 3px !important; padding-bottom: 3px !important; }
      .py-1\\.5 { padding-top: 5px !important; padding-bottom: 5px !important; }
      .py-2 { padding-top: 6px !important; padding-bottom: 6px !important; }
      .px-1 { padding-left: 4px !important; padding-right: 4px !important; }
      .px-2 { padding-left: 8px !important; padding-right: 8px !important; }
      .px-2\\.5 { padding-left: 10px !important; padding-right: 10px !important; }
      .px-3 { padding-left: 12px !important; padding-right: 12px !important; }
      .pt-1 { padding-top: 4px !important; }
      .pt-2 { padding-top: 6px !important; }
      .pt-3 { padding-top: 10px !important; }
      .pt-4 { padding-top: 14px !important; }
      .pb-1 { padding-bottom: 4px !important; }
      .pb-2 { padding-bottom: 6px !important; }
      .pb-3 { padding-bottom: 10px !important; }
      .mt-1 { margin-top: 4px !important; }
      .mt-2 { margin-top: 6px !important; }
      .mt-3 { margin-top: 10px !important; }
      .mb-1 { margin-bottom: 4px !important; }
      .mb-2 { margin-bottom: 6px !important; }
      .w-full { width: 100% !important; }
      .rounded { border-radius: 4px !important; }
      .rounded-md { border-radius: 6px !important; }
      .rounded-lg { border-radius: 8px !important; }
      .rounded-full { border-radius: 9999px !important; }
      .break-all { word-break: break-all !important; }
    `;
  }

  if (pageType === "letter" || pageType === "a4") {
    return `
      @page {
        size: letter portrait;
        margin: 10mm 12mm;
      }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        color: #1a1a1a !important;
        font-family: system-ui, -apple-system, sans-serif !important;
        font-size: 11.5px !important;
        line-height: 1.45 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      #dencker-print-portal {
        display: block !important;
        visibility: visible !important;
        width: 100% !important;
        padding: 10px !important;
        background: #ffffff !important;
      }
      .report-header {
        border-bottom: 2.5px solid #1e130c !important;
        padding-bottom: 10px !important;
        margin-bottom: 14px !important;
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
      }
      table {
        width: 100% !important;
        border-collapse: collapse !important;
        margin-top: 10px !important;
        margin-bottom: 15px !important;
      }
      th {
        background-color: #f4ede3 !important;
        color: #1e130c !important;
        border: 1px solid #dcd1c4 !important;
        padding: 6px 8px !important;
        font-size: 10.5px !important;
        font-weight: bold !important;
        text-align: left !important;
        text-transform: uppercase !important;
      }
      td {
        border: 1px solid #e8e0d5 !important;
        padding: 5px 8px !important;
        font-size: 11px !important;
      }
      tr:nth-child(even) td {
        background-color: #fbf9f6 !important;
      }
      .bento-grid {
        display: grid !important;
        grid-template-columns: repeat(4, 1fr) !important;
        gap: 10px !important;
        margin-bottom: 15px !important;
      }
      .bento-item {
        border: 1px solid #dcd1c4 !important;
        border-radius: 8px !important;
        padding: 8px 10px !important;
        background-color: #faf7f2 !important;
      }
      .signatures-box {
        margin-top: 35px !important;
        display: flex !important;
        justify-content: space-around !important;
        padding-top: 20px !important;
        page-break-inside: avoid !important;
      }
      .sig-line {
        border-top: 1px solid #333 !important;
        width: 200px !important;
        text-align: center !important;
        padding-top: 4px !important;
        font-size: 10px !important;
      }
    `;
  }

  // Carpas QR para Mesas
  return `
    @page {
      size: A4 portrait;
      margin: 8mm;
    }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      color: #1e130c !important;
      font-family: system-ui, -apple-system, sans-serif !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    #dencker-print-portal {
      display: block !important;
      visibility: visible !important;
      width: 100% !important;
      padding: 4mm !important;
      background: #ffffff !important;
    }
    .grid-carpas, #qrs-mesas-imprimibles {
      display: grid !important;
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 12mm !important;
    }
    .carpa-card {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      border: 2px dashed #991b24 !important;
      border-radius: 16px !important;
      padding: 16px !important;
      text-align: center !important;
      background-color: #ffffff !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: space-between !important;
    }
    .cut-line {
      width: 100% !important;
      border-top: 1px dashed #94a3b8 !important;
      margin: 8px 0 !important;
      position: relative !important;
    }
    .cut-line::after {
      content: "✂ Doblar o cortar por aquí" !important;
      font-size: 8px !important;
      color: #64748b !important;
      background: #fff !important;
      padding: 0 4px !important;
      position: relative !important;
      top: -6px !important;
    }
  `;
}

/**
 * Imprime un elemento específico del DOM de forma aislada y profesional
 * mediante el Portal Dedicado (#dencker-print-portal).
 * Garantiza que NUNCA se imprima la página completa ni elementos exteriores.
 */
export function printElementById(elementId: string, options: PrintOptions = {}) {
  if (typeof window === "undefined") return;

  const { pageType = "thermal", title = "Dencker Pan" } = options;
  const sourceElement = document.getElementById(elementId);

  if (!sourceElement) {
    console.warn(`[Dencker Print] No se encontró el elemento con ID "${elementId}". Cancelando impresión para evitar imprimir la página completa.`);
    return;
  }

  // 1. Clonar el elemento objetivo
  const clone = sourceElement.cloneNode(true) as HTMLElement;

  // 2. Limpiar botones, controles de formulario y elementos no imprimibles
  const elementsToRemove = clone.querySelectorAll(
    "button, input, select, textarea, .no-print, [data-no-print='true']"
  );
  elementsToRemove.forEach((el) => el.remove());

  // 3. Montar el contenido limpio en el portal de impresión dedicado
  const portal = getOrCreatePrintPortal();
  portal.innerHTML = "";
  
  const wrapper = document.createElement("div");
  wrapper.className = pageType === "thermal" ? "ticket-container" : "report-container";
  wrapper.appendChild(clone);
  portal.appendChild(wrapper);

  // 4. Inyectar estilos dinámicos de impresión aislada
  const styleId = "dencker-dynamic-print-style";
  let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = styleId;
    document.head.appendChild(styleEl);
  }

  const customPageCss = getStylesForPageType(pageType);
  styleEl.innerHTML = `
    @media screen {
      #dencker-print-portal {
        display: none !important;
        visibility: hidden !important;
      }
    }
    @media print {
      ${customPageCss}
    }
  `;

  // Cambiar el título temporal del documento para el nombre del archivo PDF generado
  const previousTitle = document.title;
  if (title) {
    document.title = title;
  }

  // 5. Activar clase de aislamiento en el body
  document.body.classList.add("is-printing-isolated");

  // 6. Función de limpieza post-impresión
  let cleanedUp = false;
  const cleanup = () => {
    if (cleanedUp) return;
    cleanedUp = true;
    document.body.classList.remove("is-printing-isolated");
    portal.innerHTML = "";
    if (title) {
      document.title = previousTitle;
    }
    if (styleEl && document.head.contains(styleEl)) {
      document.head.removeChild(styleEl);
    }
  };

  window.addEventListener("afterprint", cleanup, { once: true });

  // 7. Esperar carga de imágenes del ticket y disparar impresión limpia
  const images = portal.getElementsByTagName("img");
  let loadedCount = 0;
  const totalImages = images.length;

  const triggerPrint = () => {
    try {
      window.print();
    } catch (e) {
      console.error("[Dencker Print] Error al ejecutar window.print():", e);
    } finally {
      // Timeout de respaldo por si el navegador no dispara onafterprint
      setTimeout(cleanup, 2500);
    }
  };

  if (totalImages === 0) {
    setTimeout(triggerPrint, 80);
  } else {
    for (let i = 0; i < totalImages; i++) {
      if (images[i].complete) {
        loadedCount++;
      } else {
        images[i].onload = () => {
          loadedCount++;
          if (loadedCount >= totalImages) triggerPrint();
        };
        images[i].onerror = () => {
          loadedCount++;
          if (loadedCount >= totalImages) triggerPrint();
        };
      }
    }
    if (loadedCount >= totalImages) {
      setTimeout(triggerPrint, 80);
    } else {
      setTimeout(triggerPrint, 500);
    }
  }
}
