export interface Catalogue {
  id: number;
  title: string;
  fileUrl: string;
  coverImageUrl?: string | null;
}

export interface CatalogueRequest {
  title: string;
  fileUrl: string;
  coverImageUrl?: string | null;
}
