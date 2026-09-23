export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

export type UploadKind = 'image' | 'pdf';

export function acceptFor(kind: UploadKind): string {
  return kind === 'pdf' ? 'application/pdf' : IMAGE_TYPES.join(',');
}

/** Returns an error message, or null when the file can be uploaded. */
export function validateUpload(file: File, kind: UploadKind): string | null {
  const allowed = kind === 'pdf' ? ['application/pdf'] : IMAGE_TYPES;
  if (!allowed.includes(file.type)) {
    return kind === 'pdf' ? 'Seuls les fichiers PDF sont acceptés.' : 'Formats acceptés : JPG, PNG, WEBP, GIF ou SVG.';
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return 'Fichier trop volumineux (20 Mo maximum).';
  }
  return null;
}
