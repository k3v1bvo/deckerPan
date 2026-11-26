// ==============================================================================
// DENCKER PAN — MOTOR DE IMPRESIÓN PROFESIONAL (Tickets Térmicos, Reportes y QRs)
// Aísla el documento objetivo en un contexto limpio (sin menús, fondos ni botones)
// Compatible con impresoras térmicas de 80mm/58mm, impresoras láser y PDF
// ==============================================================================

export interface PrintOptions {
  pageType?: "thermal" | "letter" | "a4" | "carpas";
  title?: string;
  closeAfterPrint?: boolean;
}

/**
 * Imprime un elemento específico del DOM de forma aislada y profesional
 * mediante un iframe temporal, evitando que se imprima la página web completa.
 */
export function printElementById(elementId: string, options: PrintOptions = {}) {
  if (typeof window === "undefined") return;

  const { pageType = "thermal", title = "Dencker Pan" } = options;
  const sourceElement = document.getElementById(elementId);

  if (!sourceElement) {
    console.warn(`[Dencker Print] No se encontró el elemento con ID "${elementId}". Ejecutando fallback window.print()`);
    window.print();
    return;
  }

  // Clonar el nodo para no alterar el DOM interactivo
  const clone = sourceElement.cloneNode(true) as HTMLElement;

  // Remover botones, barras de scroll y elementos marcados como no imprimibles
  const elementsToRemove = clone.querySelectorAll(
    "button, input, select, textarea, .no-print, [data-no-print='true']"
  );
  elementsToRemove.forEach((el) => el.remove());

  // Crear iframe invisible para aislar completamente el contexto de impresión
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "none";
  iframe.style.visibility = "hidden";
  iframe.title = title;
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  // Estilos CSS dedicados según el tipo de documento
  let pageStyles = "";

  if (pageType === "thermal") {
    pageStyles = `
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
        padding: 4mm 2.5mm !important;
      }
      .ticket-container {
        width: 100% !important;
        box-sizing: border-box !important;
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
      .text-center { text-align: center !important; }
      .text-right { text-align: right !important; }
      .text-left { text-align: left !important; }
      .font-bold, .font-black { font-weight: bold !important; }
      .font-normal { font-weight: normal !important; }
      .text-base { font-size: 14px !important; }
      .text-sm { font-size: 12px !important; }
      .text-xs { font-size: 10px !important; }
      .text-\\[10px\\] { font-size: 10px !important; }
      .text-\\[9px\\] { font-size: 9px !important; }
      .text-\\[8px\\] { font-size: 8px !important; }
      .flex { display: flex !important; }
      .justify-between { justify-content: space-between !important; }
      .items-center { align-items: center !important; }
      .flex-col { flex-direction: column !important; }
      .gap-1 { gap: 4px !important; }
      .gap-2 { gap: 8px !important; }
      .py-1 { padding-top: 3px !important; padding-bottom: 3px !important; }
      .pt-2 { padding-top: 6px !important; }
      .pb-2 { padding-bottom: 6px !important; }
      .mt-2 { margin-top: 6px !important; }
      .mb-2 { margin-bottom: 6px !important; }
    `;
  } else if (pageType === "letter" || pageType === "a4") {
    pageStyles = `
      @page {
        size: letter portrait;
        margin: 12mm 15mm;
      }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        color: #1a1a1a !important;
        font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
        font-size: 11.5px !important;
        line-height: 1.45 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      body {
        padding: 10px !important;
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
  } else if (pageType === "carpas") {
    pageStyles = `
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
      .grid-carpas {
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

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>
          ${pageStyles}
        </style>
      </head>
      <body>
        <div class="ticket-container">
          ${clone.innerHTML}
        </div>
      </body>
    </html>
  `);
  doc.close();

  // Esperar a que carguen imágenes / fuentes antes de disparar el diálogo
  const images = doc.getElementsByTagName("img");
  let loadedCount = 0;
  const totalImages = images.length;

  const triggerPrint = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.error("[Dencker Print] Error al imprimir desde iframe:", e);
      window.print();
    } finally {
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1500);
    }
  };

  if (totalImages === 0) {
    setTimeout(triggerPrint, 120);
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
      setTimeout(triggerPrint, 120);
    } else {
      // Timeout de seguridad en caso de que alguna imagen tarde
      setTimeout(triggerPrint, 600);
    }
  }
}
