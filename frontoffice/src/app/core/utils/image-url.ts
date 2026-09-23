import { environment } from '../../../environments/environment';

export function resolveImageUrl(path: string | null | undefined): string {
  if (!path) {
    return '/images/placeholder.svg';
  }
  if (path.startsWith('http')) {
    return path;
  }
  return `${environment.assetsBaseUrl}${path}`;
}
