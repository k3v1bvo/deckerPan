// ==========================================
// DENCKER PAN — IMGBB IMAGE UPLOAD SERVICE
// ==========================================

const IMGBB_KEYS = [
  'b049b0990069aec5dfec445cff31a63a',
  '471638ad84d836135f96a835dc638435',
];

export interface ImgBBUploadResponse {
  success: boolean;
  url?: string;
  displayUrl?: string;
  deleteUrl?: string;
  error?: string;
}

/**
 * Sube una imagen a ImgBB usando FormData con fallback automático entre las API Keys provistas.
 * @param file Archivo File o Blob de la imagen
 * @param name Nombre opcional para el archivo
 */
export async function uploadImageToImgBB(file: File | Blob, name?: string): Promise<ImgBBUploadResponse> {
  for (const apiKey of IMGBB_KEYS) {
    try {
      const formData = new FormData();
      formData.append('image', file);
      if (name) {
        formData.append('name', name);
      }

      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data && data.success && data.data) {
        return {
          success: true,
          url: data.data.url,
          displayUrl: data.data.display_url,
          deleteUrl: data.data.delete_url,
        };
      } else {
        console.warn(`ImgBB upload failed with key ${apiKey.substring(0, 6)}...:`, data?.error?.message);
      }
    } catch (err: unknown) {
      console.error(`ImgBB fetch error with key:`, err);
    }
  }

  return {
    success: false,
    error: 'No se pudo subir la imagen a ImgBB. Revisa tu conexión o límite de la API.',
  };
}

/**
 * Sube una imagen en formato Base64 a ImgBB
 */
export async function uploadBase64ToImgBB(base64Data: string, name?: string): Promise<ImgBBUploadResponse> {
  const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');

  for (const apiKey of IMGBB_KEYS) {
    try {
      const formData = new FormData();
      formData.append('image', cleanBase64);
      if (name) {
        formData.append('name', name);
      }

      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data && data.success && data.data) {
        return {
          success: true,
          url: data.data.url,
          displayUrl: data.data.display_url,
          deleteUrl: data.data.delete_url,
        };
      }
    } catch (err: unknown) {
      console.error(`ImgBB Base64 upload error:`, err);
    }
  }

  return {
    success: false,
    error: 'Error al subir la imagen en Base64 a ImgBB.',
  };
}
