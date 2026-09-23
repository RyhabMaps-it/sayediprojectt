export interface Color {
  id: number;
  name: string;
  code: string;
  imageUrl?: string | null;
}

export interface ColorRequest {
  name: string;
  code: string;
  imageUrl?: string | null;
}
