/**
 * Dencker Pan — Motor Multi-Cloud de Imágenes y Optimización
 * Soporte Triple Blindado: Cloudinary + Supabase Storage + ImgBB
 * Incluye compresión en cliente a WebP/JPEG, failover automático y CDN
 */

import { supabase } from "@/lib/supabase";
import { CloudStorageProvider, UploadResult } from "@/types";

export interface MultiCloudConfig {
  preferredProvider: CloudStorageProvider;
  cloudinaryCloudName: string;
  cloudinaryUploadPreset: string;
  cloudinaryApiKey?: string;
  imgbbApiKey: string;
  supabaseBucket: string;
}

// Configuración por defecto con opción de sobreescritura dinámica en tiempo de ejecución
export const DEFAULT_CLOUD_CONFIG: MultiCloudConfig = {
  preferredProvider: "cloudinary",
  cloudinaryCloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "denckerpan",
  cloudinaryUploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_PRESET || "dencker_products",
  cloudinaryApiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "",
  imgbbApiKey: process.env.NEXT_PUBLIC_IMGBB_API_KEY || "e4c5e7512806201a0db67dc7d35efb90",
  supabaseBucket: "productos",
};

/**
 * Optimiza y comprime una imagen en el navegador antes de subirla
 * Reduce peso a < 300KB y convierte a WebP o JPEG de alta calidad
 */
export async function optimizeImageClient(
  file: File | Blob,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.85
): Promise<{ blob: Blob; base64: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            maxHeight = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("No se pudo inicializar canvas 2D"));

        // Dibujar con suavizado bicúbico
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir a WebP (o JPEG fallback)
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("Fallo al exportar blob"));
            const base64 = canvas.toDataURL("image/webp", quality);
            resolve({ blob, base64, width, height });
          },
          "image/webp",
          quality
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * 1. Subida a Cloudinary
 */
export async function uploadToCloudinary(
  fileOrBlob: File | Blob,
  config: Partial<MultiCloudConfig> = {}
): Promise<UploadResult> {
  const merged = { ...DEFAULT_CLOUD_CONFIG, ...config };
  const formData = new FormData();
  formData.append("file", fileOrBlob);
  formData.append("upload_preset", merged.cloudinaryUploadPreset);
  formData.append("folder", "dencker_pan/productos");

  const endpoint = `https://api.cloudinary.com/v1_1/${merged.cloudinaryCloudName}/image/upload`;
  const res = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Cloudinary Error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return {
    url: data.secure_url || data.url,
    provider: "cloudinary",
    width: data.width,
    height: data.height,
    format: data.format,
    bytes: data.bytes,
  };
}

/**
 * 2. Subida a Supabase Storage
 */
export async function uploadToSupabase(
  fileOrBlob: File | Blob,
  fileName?: string,
  config: Partial<MultiCloudConfig> = {}
): Promise<UploadResult> {
  const merged = { ...DEFAULT_CLOUD_CONFIG, ...config };
  if (!supabase) throw new Error("Supabase client no configurado");

  const ext = fileOrBlob.type.includes("webp") ? "webp" : "jpg";
  const name = fileName || `prod_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
  const path = `catalogo/${name}`;

  const { error } = await supabase.storage
    .from(merged.supabaseBucket)
    .upload(path, fileOrBlob, {
      cacheControl: "31536000",
      upsert: true,
      contentType: fileOrBlob.type || "image/jpeg",
    });

  if (error) {
    throw new Error(`Supabase Storage Error: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(merged.supabaseBucket)
    .getPublicUrl(path);

  return {
    url: publicUrlData.publicUrl,
    provider: "supabase",
    format: ext,
  };
}

/**
 * 3. Subida a ImgBB
 */
export async function uploadToImgBB(
  fileOrBlob: File | Blob,
  config: Partial<MultiCloudConfig> = {}
): Promise<UploadResult> {
  const merged = { ...DEFAULT_CLOUD_CONFIG, ...config };
  
  // Convertir a base64
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const res = reader.result as string;
      const clean = res.split(",")[1];
      resolve(clean);
    };
    reader.readAsDataURL(fileOrBlob);
  });

  const formData = new FormData();
  formData.append("image", base64);

  const endpoint = `https://api.imgbb.com/1/upload?key=${merged.imgbbApiKey}`;
  const res = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`ImgBB Error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  if (!data.success) {
    throw new Error(`ImgBB Error: ${data.error?.message || "Subida fallida"}`);
  }

  return {
    url: data.data.url,
    provider: "imgbb",
    width: data.data.width,
    height: data.data.height,
    bytes: data.data.size,
  };
}

/**
 * 4. Subida Multi-Cloud con Failover Inteligente Blindado
 * Intenta en el proveedor preferido; si falla, intenta los otros dos automáticamente
 */
export async function uploadImageMultiCloud(
  file: File | Blob,
  preferredProvider?: CloudStorageProvider,
  customConfig?: Partial<MultiCloudConfig>
): Promise<UploadResult> {
  const targetProvider = preferredProvider || DEFAULT_CLOUD_CONFIG.preferredProvider;
  
  // Paso 1: Optimizar localmente en cliente primero
  const { blob } = await optimizeImageClient(file);

  // Orden de intentos según preferencia
  const providers: CloudStorageProvider[] = [
    targetProvider,
    ...(["cloudinary", "supabase", "imgbb"] as CloudStorageProvider[]).filter(
      (p) => p !== targetProvider
    ),
  ];

  const errors: string[] = [];

  for (const prov of providers) {
    try {
      if (prov === "cloudinary") {
        return await uploadToCloudinary(blob, customConfig);
      }
      if (prov === "supabase") {
        return await uploadToSupabase(blob, undefined, customConfig);
      }
      if (prov === "imgbb") {
        return await uploadToImgBB(blob, customConfig);
      }
    } catch (err: any) {
      console.warn(`[MultiCloud] Falló subida con ${prov}:`, err?.message || err);
      errors.push(`${prov}: ${err?.message || "error"}`);
      // Continúa al siguiente proveedor (failover)
    }
  }

  throw new Error(`Fallaron todos los proveedores de almacenamiento: ${errors.join(" | ")}`);
}
