/**
 * Event image upload: validation and Vercel Blob upload.
 * Used by POST /api/upload/event-image.
 */

export const EVENT_IMAGE = {
  /** Max size in bytes (4MB; Vercel serverless body limit is 4.5MB) */
  MAX_SIZE: 4 * 1024 * 1024,
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const,
} as const

export function validateEventImageFile(file: File): { ok: true } | { ok: false; error: string } {
  if (!EVENT_IMAGE.ALLOWED_TYPES.includes(file.type as (typeof EVENT_IMAGE.ALLOWED_TYPES)[number])) {
    return {
      ok: false,
      error: 'Type de fichier non autorisé (JPEG, PNG, WebP, GIF uniquement)',
    }
  }
  if (file.size > EVENT_IMAGE.MAX_SIZE) {
    return {
      ok: false,
      error: 'Fichier trop volumineux (max 4 Mo)',
    }
  }
  return { ok: true }
}
